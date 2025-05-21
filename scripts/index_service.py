"""
Index Service
-------------
This FastAPI application provides two endpoints:

1. **POST /index**  – kicks off a background indexing run that walks the whole
   workspace (repo root) and writes document chunks into a **local** Chroma
   vector store so no external infrastructure is required.
2. **GET  /index/status** – returns the progress of the current/last run so
   the calling process can display a nice progress bar.

A couple of design decisions mean the service works even inside the very
restricted Codex execution environment:

* It uses [`chromadb.PersistentClient`](https://docs.trychroma.com/) so we do
  **not** need a separate Chroma server process.
* When an OpenAI API key is available **and** the `openai` & `chromadb`
  optional dependencies are present we default to the high-quality
  `text-embedding-3-small` model. Without network access (the default in the
  sandbox) we transparently fall back to a super-cheap deterministic hash
  embedding so the end-to-end flow still keeps working.
* Large or generated folders such as *node_modules*, *vendor*, *dist*, *build*,
  *target*, *.git* … are completely skipped to keep memory footprint small and
  indexing times low.

The whole implementation lives in a **single file** on purpose because that
keeps the integration effort with the existing monorepo low and avoids adding
additional build steps or package definitions.
"""

#
# NOTE:  Logging integration
# --------------------------
# This module can either be executed directly via
#   `python scripts/index_service.py`
# or imported by a production-grade web server such as **uvicorn**:
#   `uvicorn scripts.index_service:app`
#
# When imported, module level code is still executed exactly once which makes
# it the perfect place to configure a global logging setup that
#
# * writes human readable timestamps to a dedicated logfile so long running
#   background indexing operations become traceable, and
# * keeps also writing to *stderr* so container orchestrators such as docker
#   or kubernetes still capture logs in their default setup.
#
# The configuration intentionally lives **inside** the script to avoid adding
# additional dependencies or boiler-plate just for logging.
#
# ────────────────────────────────────────────────────────────────────────────

from __future__ import annotations

# `hashlib` is only required for helper utilities later in the file.
import hashlib
import logging
import os
import subprocess
import threading
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Dict, List

import chromadb
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Embedding utilities
# ---------------------------------------------------------------------------


try:
    # `chromadb` ships optional integration helpers for popular models.
    from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction  # type: ignore

    import openai  # noqa: F401 – import used to detect availability only.

    OPENAI_AVAILABLE = True
except Exception:  # pragma: no cover – any failure means we fall back.
    OpenAIEmbeddingFunction = None  # type: ignore
    OPENAI_AVAILABLE = False


def _create_embedding_function():
    """Return the best embedding backend for the current runtime."""

    # We cannot rely on the module-level *logger* yet because logging is
    # configured a bit further down in the file.  Create a temporary one on
    # the fly so early diagnostic messages are not lost.
    _log = logging.getLogger(__name__)

    # ------------------------------------------------------------------
    # Primary backend – OpenAI embeddings when the package **and** an API key
    # are available.  This is the preferred high-quality option.
    # ------------------------------------------------------------------

    if OPENAI_AVAILABLE and os.environ.get("OPENAI_API_KEY"):
        try:
            from packaging.version import parse as _parse_version  # type: ignore

            if _parse_version(getattr(openai, "__version__", "0")) < _parse_version("1.0.0"):
                model = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
                _log.debug("Using OpenAI embeddings via model '%s'", model)
                return OpenAIEmbeddingFunction(
                    api_key=os.environ["OPENAI_API_KEY"], model_name=model
                )
            else:
                _log.debug(
                    "OpenAI package >=1.0 detected – falling back to hash embeddings because "
                    "chromadb's OpenAIEmbeddingFunction relies on the deprecated <1.0 API"
                )
        except Exception as exc:  # pragma: no cover – robustness first
            _log.debug("Failed to initialise OpenAI embeddings (%s) – falling back", exc)

    # ------------------------------------------------------------------
    # Fallback backend – *deterministic* hash embeddings when network access is
    # disabled or no key is configured.  While the semantic quality is of
    # course drastically lower, the index service – and therefore the whole
    # Codex feature set that relies on it – keeps working which is
    # particularly important inside the default sandbox environment.
    # ------------------------------------------------------------------

    _log.debug("Falling back to deterministic hash embeddings (OpenAI unavailable)")

    def _hash_embed(text: str) -> List[float]:  # noqa: D401 – simple helper
        """Return a reproducible pseudo-embedding for *text*.

        The function uses SHA-1 to create a 20-byte digest which is then split
        into 20 floats in the range 0-1.  The choice is arbitrary – the only
        requirements are determinism and a fixed dimensionality so that the
        vectors can be stored in Chroma without additional metadata.
        """

        digest = hashlib.sha1(text.encode()).digest()
        return [b / 255.0 for b in digest]

    def _embedding_fn(batch):  # type: ignore[override]
        # Accept both the batched form (List[str]) **and** the single-string
        # form because various parts of the code – and external callers – use
        # either convention.
        if isinstance(batch, str):
            return _hash_embed(batch)

        return [_hash_embed(t) for t in batch]

    return _embedding_fn


EmbeddingFunction = _create_embedding_function()
# Emit a single informational line so users can immediately see which backend
# was selected without having to crank log verbosity up to *DEBUG*.
try:
    _backend_name = (
        EmbeddingFunction.__class__.__name__
        if not callable(EmbeddingFunction)
        else getattr(EmbeddingFunction, "__name__", str(EmbeddingFunction))
    )
except Exception:  # pragma: no cover – defensive
    _backend_name = str(EmbeddingFunction)

logging.getLogger(__name__).info("Using embedding backend: %s", _backend_name)

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Workspace roots – primary + optional additional ones
# ---------------------------------------------------------------------------

# The *primary* workspace root (defaults to cwd when not overridden).
PRIMARY_ROOT = Path(os.getenv("CODEX_WORKSPACE", Path.cwd())).resolve()

# Additional workspace paths can be supplied via the *CODEX_EXTRA_PATHS*
# environment variable (path-separator separated list).  This mechanism is
# used by the CLI helper to automatically pull in sibling repositories when
# the user references them in /explain notes (e.g. "backend lives in
# ../workpro-backend").

_extra_env = os.getenv("CODEX_EXTRA_PATHS", "")

EXTRA_ROOTS: list[Path] = []
if _extra_env:
    for token in _extra_env.split(os.pathsep):
        try:
            p = Path(token).expanduser().resolve()
            if p.is_dir() and p != PRIMARY_ROOT:
                EXTRA_ROOTS.append(p)
        except Exception:
            # Ignore bogus paths so a single invalid entry doesn’t break the
            # whole index service start-up.
            continue

# Combined list used throughout the rest of the module.
ROOT_PATHS: list[Path] = [PRIMARY_ROOT, *EXTRA_ROOTS]

# Keep the *old* public name around for backwards compatibility where a single
# path is expected.
ROOT_PATH = PRIMARY_ROOT

# Configure logging as early as possible so all subsequent imports pick up the
# settings.  When the service runs inside the very restricted Codex sandbox,
# **stdout/stderr** are captured by the harness.  We therefore always keep a
# StreamHandler around and **add** a file based handler so users can inspect
# historic runs after the fact.

# Log directory & file can be customised through env variables so the caller
# can redirect output if required.
LOG_DIR = Path(os.getenv("CODEX_LOG_DIR", ROOT_PATH / "logs")).resolve()
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "index_service.log"

# ---------------------------------------------------------------------------
# The default log level is **DEBUG** so that all internal actions become
# visible without any additional configuration which is extremely helpful when
# users want to understand why a (potentially long-running) background
# indexing run appears to be stuck.  Set the *CODEX_LOG_LEVEL* environment
# variable to e.g. *INFO* or *WARNING* to reduce verbosity again.
# ---------------------------------------------------------------------------

LOG_LEVEL = os.getenv("CODEX_LOG_LEVEL", "DEBUG").upper()

# Only configure the root logger *once* – duplicate handlers would otherwise be
# added when `uvicorn`'s autoreload feature reloads the module.
_root_logger = logging.getLogger()
if not any(isinstance(h, RotatingFileHandler) for h in _root_logger.handlers):
    _root_logger.setLevel(LOG_LEVEL)

    # Console – useful during local development and when the sandbox captures
    # container stdout/stderr.
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%Y-%m-%d %H:%M:%S")
    )
    _root_logger.addHandler(console_handler)

    # Rotating file so logs don’t grow without bound.
    file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3)
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s", "%Y-%m-%d %H:%M:%S")
    )
    _root_logger.addHandler(file_handler)


logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Indexing configuration
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Helper utilities (top-level so they can be reused across functions and
# FastAPI lifecycle events)
# ---------------------------------------------------------------------------


from urllib.parse import urlparse


def _derive_collection_name(path: Path) -> str:
    """Return deterministic project specific collection name.

    Mirrors the naming scheme of the JS helper so independent clones don’t
    share state:

        codex_index_<sha1(canonical_path)[:12]>
    """

    digest = hashlib.sha1(str(path).encode()).hexdigest()[:12]
    return f"codex_index_{digest}"


def _ensure_remote_collection() -> "chromadb.Collection | None":  # type: ignore[name-defined]
    """Ensure the project specific collection exists on the remote Chroma instance.

    Returns the Collection object on success or *None* when the connection
    failed.  The helper is intentionally *silent* on errors so callers can
    decide how to proceed (e.g. fallback to embedded DuckDB or raise).
    """

    endpoint = (
        os.environ.get("CHROMA_URL")
        or os.environ.get("CHROMADB_URL")
        or "http://localhost:8000"
    ).rstrip("/")

    try:
        parsed = urlparse(endpoint)
        if parsed.scheme not in {"http", "https"}:
            raise ValueError("Unsupported URL scheme")

        host = parsed.hostname or "localhost"
        port = parsed.port or (443 if parsed.scheme == "https" else 80)

        client_remote = chromadb.HttpClient(host=host, port=port)  # type: ignore[arg-type]

        col = client_remote.get_or_create_collection(_derive_collection_name(PRIMARY_ROOT))

        logger.debug(
            "Ensured remote Chroma collection '%s' (count=%s) at %s",
            col.name if hasattr(col, "name") else "?",
            col.count() if hasattr(col, "count") else "?",
            endpoint,
        )

        return col
    except Exception as exc:
        logger.debug("Unable to ensure remote Chroma collection: %s", exc)
        return None


# (ROOT_PATH already defined above.)

# Folders we never want to index.  We use *contains* checks so nested matches
# are excluded as well (e.g. `foo/node_modules/bar`).
EXCLUDE_DIRS = {
    "node_modules",
    "vendor",
    "dist",
    "build",
    "target",
    ".git",
    "__pycache__",
    ".venv",
    ".direnv",
}

# Bail out early on extremely large files – they are unlikely source code and
# would slow down indexing considerably.
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MiB

# Plain character based chunking keeps dependencies minimal and is good enough
# for most code understanding scenarios.
CHUNK_SIZE = 1_000
CHUNK_OVERLAP = 200

# ---------------------------------------------------------------------------
# Memory/throughput tuning
# ---------------------------------------------------------------------------

# Holding thousands of *large* OpenAI embeddings in memory at once can quickly
# balloon the resident set size of the index service – especially when the
# backing model returns 1-2k dimensional vectors.  Persisting in **smaller
# batches** keeps the peak usage predictable while still retaining reasonable
# throughput.

# A value around 128 results in ~200 kB per batch (128 · 1536 · 8 bytes) for
# 1536-dimensional float64 vectors which is a good compromise between memory
# footprint and API/HTTP overhead.  The exact number can be tuned at runtime
# through an environment variable so power-users can optimise for their
# specific hardware.

BATCH_SIZE = int(os.getenv("CODEX_INDEX_BATCH_SIZE", "4"))

# Emit the configured batch size **early** so users can easily verify the
# runtime setting without digging through *DEBUG* level logs.  The message is
# logged at *INFO* so it shows up even during default verbosity runs.
logger.info("Configured embedding batch size: %d", BATCH_SIZE)

# ---------------------------------------------------------------------------
# Progress tracking helpers
# ---------------------------------------------------------------------------


class IndexProgress(BaseModel):
    status: str = "idle"  # idle | running | completed | error
    processed_files: int = 0
    total_files: int = 0
    processed_chunks: int = 0
    total_chunks: int = 0
    current_file: str | None = None
    started_at: float | None = None
    finished_at: float | None = None
    error: str | None = None

    def asdict(self) -> Dict[str, Any]:
        """FastAPI converts models automatically; sometimes we still want dicts."""

        return self.model_dump()


# Shared, mutable progress instance.  We guard mutations with a lock so the
# HTTP handler and the background thread never step on each other.
_progress = IndexProgress()
_progress_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Helper – path normalisation across multiple workspace roots
# ---------------------------------------------------------------------------


def _relative_to_roots(fp: Path) -> str:
    """Return *fp* relative to the first matching root in *ROOT_PATHS*.

    When *fp* is outside *all* configured roots we fall back to the absolute
    path so callers always receive a meaningful string.
    """

    for root in ROOT_PATHS:
        try:
            return str(fp.relative_to(root))
        except ValueError:
            continue

    return str(fp)


def _update_progress(**kwargs):
    with _progress_lock:
        for k, v in kwargs.items():
            setattr(_progress, k, v)


# ---------------------------------------------------------------------------
# Core indexing helpers
# ---------------------------------------------------------------------------


def _iter_source_files(roots: list[Path]) -> List[Path]:
    """Recursively walk *roots* and return a list of paths to index."""

    out: List[Path] = []

    for root in roots:
        logger.debug("Scanning %s for source files (excluding %s)…", root, sorted(EXCLUDE_DIRS))

        for dirpath, dirnames, filenames in os.walk(root):
            # Prune excluded directories **in-place** so `os.walk` doesn’t even
            # visit them.
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

            for filename in filenames:
                fp = Path(dirpath, filename)

                # Skip obvious non-source files using simple heuristics.
                # 1. Plain *.log files – typically large & irrelevant.
                if fp.suffix.lower() == ".log":
                    continue
                try:
                    if fp.stat().st_size > MAX_FILE_SIZE:
                        continue
                    with open(fp, "rb") as fh:
                        sample = fh.read(2048)
                        if b"\0" in sample:
                            continue  # binary file
                except Exception:
                    # Permission errors or races → skip file.
                    continue

                out.append(fp)

                # Log every 1000th file to avoid excessive logging noise while
                # still providing feedback on very large repositories.
                if len(out) % 1000 == 0:
                    logger.debug(
                        "Discovered %d candidate files so far – latest: %s", len(out), fp
                    )

    logger.debug("Scanning completed – %d files matched across %d roots", len(out), len(roots))
    return out


def _chunk_text(text: str) -> List[str]:
    """Split *text* into overlapping character chunks and return the list.

    A debug log with the resulting chunk count helps to correlate later
    embedding/upsert calls with the original input size.
    """

    chunks: List[str] = []
    start = 0
    total = len(text)
    while start < total:
        end = min(start + CHUNK_SIZE, total)
        chunks.append(text[start:end])
        start = end - CHUNK_OVERLAP  # keep overlap for context
        if start < 0:
            start = 0
    logger.debug("Chunked document into %d pieces", len(chunks))
    return chunks


def _embed_texts(texts: List[str]) -> List[List[float]] | None:
    """Return embedding vectors for *texts*.

    The helper transparently splits larger inputs into **smaller batches** so
    the peak memory usage stays low even for very large files.  Splitting is
    especially important when using high-dimensional models such as
    *text-embedding-3-small* where a single vector already contains >1500
    floats.
    """

    logger.debug(
        "Embedding %d chunks using %s (batch size=%d)",
        len(texts),
        "callable wrapper" if callable(EmbeddingFunction) else type(EmbeddingFunction),
        BATCH_SIZE,
    )

    all_vectors: List[List[float]] = []
    t0 = time.perf_counter()

    # Process the incoming list in reasonably sized windows so we never hold
    # on to more data than necessary.
    for ofs in range(0, len(texts), BATCH_SIZE):
        batch = texts[ofs : ofs + BATCH_SIZE]

        try:
            # Optimistically try the batched form first …
            vectors = EmbeddingFunction(batch)  # type: ignore[arg-type]

            # … but detect helpers that incorrectly return a *single* vector
            # instead of a list.
            if isinstance(vectors, list) and vectors and not isinstance(vectors[0], list):
                raise TypeError
        except Exception:
            # Fallback – call per chunk.
            vectors = [EmbeddingFunction(t) for t in batch]  # type: ignore[arg-type]

        all_vectors.extend(vectors)  # type: ignore[arg-type]

    duration = time.perf_counter() - t0

    if logger.isEnabledFor(logging.DEBUG) and all_vectors:
        logger.debug(
            "Embedding completed in %.2fs (total %d vectors) – first vector preview: %s…",
            duration,
            len(all_vectors),
            all_vectors[0][:5],
        )

    return all_vectors


def _run_indexing():
    """The heavy-lifting background task that performs a full re-index."""

    logger.info(
        "Starting full workspace index run … (roots=%s, exclude=%s)",
        ", ".join(str(p) for p in ROOT_PATHS),
        sorted(EXCLUDE_DIRS),
    )

    _t0 = time.perf_counter()

    _update_progress(
        status="running",
        processed_files=0,
        processed_chunks=0,
        current_file=None,
        error=None,
        started_at=time.time(),
        finished_at=None,
    )

    try:
        files = _iter_source_files(ROOT_PATHS)
        _update_progress(total_files=len(files))

        logger.info(
            "Discovered %s candidate files under %s in %.2fs",
            len(files),
            ROOT_PATH,
            time.perf_counter() - _t0,
        )


        # We no longer perform a **separate** full workspace pass to precount all
        # chunks because loading every single file into memory doubled the total
        # memory footprint during indexing and kept the high-water RSS at the
        # peak value even after the pass completed (Python’s allocator seldom
        # returns large arenas to the OS).  Instead we update *total_chunks*
        # **incrementally** while we are already reading and chunking the file
        # for embedding/upsert below.  This keeps the memory usage tightly
        # bound to the currently processed batch.

        _update_progress(total_chunks=0)

        # ------------------------------------------------------------------
        # Prepare *remote* Chroma collection running on the developer machine.
        # The service now **requires** the remote instance to be reachable at
        # http://localhost:8000 (or CHROMA_URL / CHROMADB_URL) and will raise
        # an explicit error otherwise so that configuration problems become
        # obvious immediately instead of silently falling back to an embedded
        # DuckDB store.
        # ------------------------------------------------------------------

        # Remote collection helper -------------------------------------------------
        remote_collection: "chromadb.Collection | None" = None  # type: ignore[name-defined]

        # ------------------------------------------------------------------
        # Remote Chroma helper ------------------------------------------------

        endpoint = (
            os.environ.get("CHROMA_URL")
            or os.environ.get("CHROMADB_URL")
            or "http://localhost:8000"
        ).rstrip("/")

        logger.debug("Attempting to connect to remote Chroma at %s", endpoint)

        def _start_local_chroma_server(path: str) -> None:  # pragma: no cover – best-effort helper
            """Attempt to spawn a local Chroma server in the background.

            Mirrors the logic used by the JS helper (`explain-memory.ts`) so the Python index
            service works when invoked standalone (e.g. via `curl`) where the CLI hasn’t already
            spun up a Chroma instance.
            """

            # Prevent multiple invocations.
            if getattr(_start_local_chroma_server, "_proc", None):  # type: ignore[attr-defined]
                return

            chroma_data = os.path.expanduser(path)
            os.makedirs(chroma_data, exist_ok=True)

            cmds = [
                ["chroma", "--path", chroma_data],
                ["python", "-m", "chromadb.cli.cli", "--path", chroma_data],
            ]

            for cmd in cmds:
                try:
                    proc = subprocess.Popen(
                        cmd,
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        start_new_session=True,
                    )
                    setattr(_start_local_chroma_server, "_proc", proc)  # type: ignore[attr-defined]
                    logger.info("Spawned local Chroma server via %s", " ".join(cmd))
                    return
                except FileNotFoundError:
                    continue  # try next variant
                except Exception as exc:
                    logger.warning("Failed to spawn Chroma using %s – %s", cmd, exc)

            logger.warning("Unable to spawn a local Chroma server – binary not found")

        def _get_remote_collection() -> "chromadb.Collection | None":  # type: ignore[name-defined]
            """Try to connect to the configured Chroma endpoint and create the index collection."""

            try:
                parsed = urlparse(endpoint)
                if parsed.scheme not in {"http", "https"}:
                    raise ValueError("Unsupported scheme")

                host = parsed.hostname or "localhost"
                port = parsed.port or (443 if parsed.scheme == "https" else 80)

                client_remote = chromadb.HttpClient(host=host, port=port)  # type: ignore[arg-type]

                logger.debug(
                    "Created Chroma HttpClient (host=%s, port=%s) – requesting collection …",
                    host,
                    port,
                )

                col = client_remote.get_or_create_collection(
                    _derive_collection_name(PRIMARY_ROOT)
                )

                logger.debug(
                    "Remote Chroma collection '%s' ready at %s – currently %s items",
                    col.name,  # type: ignore[attr-defined]
                    endpoint,
                    col.count() if hasattr(col, "count") else "?",
                )

                return col
            except Exception as exc:
                logger.debug("Remote Chroma connection attempt failed: %s", exc)
                return None

        # Try once to connect to the remote Chroma instance.
        remote_collection = _get_remote_collection()

        if remote_collection is None:
            raise RuntimeError(
                f"Unable to connect to the remote Chroma server at {endpoint}. "
                "Please make sure it is running (e.g. via `chroma --path <data-dir>`) "
                "before starting the index service."
            )

        # Second pass -> actually store data.
        for idx, fp in enumerate(files, 1):
            _update_progress(current_file=str(fp), processed_files=idx)

            # Calculate frequently used values **once** so they can be reused
            # across the whole file processing pipeline.

            rel_path = _relative_to_roots(fp)
            file_mtime = int(fp.stat().st_mtime)

            # ----------------------------------------------------------------
            # Fast-path – skip files that are already up-to-date
            # ----------------------------------------------------------------

            # We attach the file modification timestamp (*mtime*, second
            # resolution) to every chunk’s metadata so subsequent full index
            # runs can very cheaply decide whether the on-disk version still
            # matches the persisted representation.  When the timestamp of the
            # *first* chunk (chunk_index == 0) matches we consider the **whole**
            # file fresh and therefore skip expensive re-embedding & upsert
            # work.

            try:
                # NOTE: Chroma's filtering syntax expects exactly **one** top-
                # level *operator* such as `$and`, `$or`, `$eq`, … – passing
                # multiple plain field names directly is therefore **invalid**
                # and triggers the somewhat cryptic
                #     "Expected where to have exactly one operator"
                # error.  Wrap the individual equality comparisons in a
                # single `$and` so the query remains semantically equivalent
                # while satisfying the syntax requirements.

                existing = remote_collection.get(
                    where={
                        "$and": [
                            {"path": {"$eq": rel_path}},
                            {"chunk_index": {"$eq": 0}},
                        ]
                    }
                )

                if existing.get("metadatas"):
                    meta0 = existing["metadatas"][0]
                    stored_mtime = meta0.get("mtime")

                    if stored_mtime == file_mtime:
                        # File unchanged – update progress counters and move on.
                        # For accurate progress reporting we roughly estimate the
                        # chunk count using the *character* length because the
                        # UTF-8 on-disk size can differ significantly for files
                        # that contain non-ASCII characters.

                        try:
                            text_len = len(fp.read_text(encoding="utf-8", errors="ignore"))
                        except Exception:
                            text_len = fp.stat().st_size  # fallback → bytes length

                        step = CHUNK_SIZE - CHUNK_OVERLAP
                        n_chunks = (text_len + step - 1) // step if text_len else 0

                        with _progress_lock:
                            _progress.total_chunks += n_chunks
                            _progress.processed_chunks += n_chunks

                        logger.debug("Skipping up-to-date file %s", fp)
                        continue
            except Exception as exc:
                # Any failure (e.g. network hiccup or the first run where the
                # collection is still empty) falls back to the regular slow
                # path so robustness is unaffected.
                logger.debug("Up-to-date check for %s failed (%s) – re-indexing", fp, exc)

            try:
                text = fp.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                logger.warning("Failed to read %s – skipping", fp, exc_info=True)
                continue

            # ----------------------------------------------------------------
            # More memory-efficient, *streaming* chunk processing
            # ----------------------------------------------------------------

            # Remove any previously indexed chunks for the current file **before**
            # we start uploading new ones.  Using a *where* filter keeps the
            # deletion payload tiny no matter how many chunks the file generates –
            # important for very large sources.

            try:
                # See comment above regarding Chroma's filter syntax.  A single
                # equality comparison can be expressed directly via `$eq`.
                remote_collection.delete(where={"path": {"$eq": rel_path}})
            except Exception:
                # Ignore when the file hasn’t been indexed yet.
                pass

            # Pre-calculate a *rough* chunk count so the total work estimate is
            # available early without having to materialise the whole chunk
            # list in memory.  We derive the number directly from the character
            # length – this is exact given the deterministic chunking
            # parameters (size & overlap).

            step = CHUNK_SIZE - CHUNK_OVERLAP
            n_chunks = (len(text) + step - 1) // step if text else 0

            with _progress_lock:
                _progress.total_chunks += n_chunks

            # Stream through the file character data and accumulate exactly
            # `BATCH_SIZE` chunks before we invoke the (potentially network
            # bound) embedding & upsert calls.  This keeps the peak RSS tightly
            # bound to the batch size no matter how large a single source file
            # grows.

            rel_path = _relative_to_roots(fp)

            batch_chunks: List[str] = []
            batch_ids: List[str] = []
            batch_metadatas: List[Dict[str, Any]] = []

            def _flush_batch() -> None:
                """Helper – embed the current batch and upsert it to Chroma."""

                if not batch_chunks:
                    return

                try:
                    embeddings = _embed_texts(batch_chunks)

                    t_remote = time.perf_counter()
                    # Prefer *upsert* when the client supports it so duplicate
                    # IDs get **replaced** transparently.  Older Chroma
                    # versions (<0.4) only expose *add* which raises an error
                    # on duplicates – fall back to the legacy behaviour in
                    # this case so we stay compatible with a wider range of
                    # installations.

                    add_or_upsert = (
                        getattr(remote_collection, "upsert", None) or getattr(remote_collection, "add")
                    )

                    add_or_upsert(
                        ids=list(batch_ids),  # copy because we reuse the lists
                        documents=list(batch_chunks),
                        metadatas=list(batch_metadatas),
                        embeddings=embeddings,
                    )

                    logger.debug(
                        "Persisted %d chunks for %s into remote store in %.2fs",
                        len(batch_chunks),
                        fp,
                        time.perf_counter() - t_remote,
                    )
                except Exception as exc:
                    logger.error("Failed to add batch to remote Chroma – %s", exc)
                    raise

                with _progress_lock:
                    _progress.processed_chunks += len(batch_chunks)

                # Clear the batch lists *in-place* so existing allocations can
                # be reused by the next fill cycle which avoids the small-yet
                # noticeable fragmentation that a fresh list would introduce.
                batch_chunks.clear()
                batch_ids.clear()
                batch_metadatas.clear()

            # Iterate lazily over the character data -------------------------------------------------

            chunk_index = 0
            start = 0
            step = CHUNK_SIZE - CHUNK_OVERLAP

            while start < len(text):
                end = min(start + CHUNK_SIZE, len(text))
                chunk_text = text[start:end]

                batch_chunks.append(chunk_text)
                batch_ids.append(f"{fp}:{chunk_index}")
                batch_metadatas.append({
                    "path": rel_path,
                    "chunk_index": chunk_index,
                    "mtime": file_mtime,
                })

                chunk_index += 1
                start += step

                if len(batch_chunks) >= BATCH_SIZE:
                    _flush_batch()

            # Flush remaining chunks < BATCH_SIZE.
            _flush_batch()

            logger.debug(
                "Indexed %s (%d chunks, progress %d/%d files)",
                fp,
                n_chunks,
                idx,
                len(files),
            )

            # Finished with the (potentially large) `text` buffer → drop it so
            # the memory becomes available for the next file *immediately*.
            del text

        _update_progress(status="completed", finished_at=time.time(), current_file=None)

        logger.info(
            "Indexing completed successfully – %d files, %d chunks (total %.2fs)",
            _progress.processed_files,
            _progress.processed_chunks,
            time.perf_counter() - _t0,
        )

    except Exception as exc:  # noqa: BLE001 – want to capture *any* failure.
        _update_progress(status="error", error=str(exc), finished_at=time.time())
        logger.exception("Indexing run failed with an unexpected error")


# ---------------------------------------------------------------------------
# FastAPI entry-points
# ---------------------------------------------------------------------------


app = FastAPI(title="Codex Index Service", version="0.1.0")

# ---------------------------------------------------------------------------
# Pydantic models for the *search* endpoint
# ---------------------------------------------------------------------------


class SearchRequest(BaseModel):
    """Incoming payload for /search."""

    query: str
    k: int = 6  # number of nearest neighbours to return


class SearchResponse(BaseModel):
    """Outgoing payload for /search."""

    documents: list[str]
    metadatas: list[dict]


# ---------------------------------------------------------------------------
# FastAPI lifecycle hooks
# ---------------------------------------------------------------------------


@app.on_event("startup")
def _on_startup() -> None:  # noqa: D401 – simple hook
    """FastAPI *startup* – verify Chroma collection exists.

    Performing the check at service start provides *immediate* feedback when
    the configured Chroma server is unreachable instead of failing later
    during the first indexing request.
    """

    if _ensure_remote_collection() is None:
        logger.warning(
            "Remote Chroma collection could not be validated during startup – "
            "/index requests will raise until the server becomes reachable."
        )


@app.post("/index")
def start_indexing():
    """Kick off a new indexing run unless one is already running."""

    with _progress_lock:
        if _progress.status == "running":
            logger.warning("Received /index request but an indexing run is already in progress")
            raise HTTPException(status_code=409, detail="Indexing already in progress")

    logger.info("Received /index request – starting background indexing thread")

    threading.Thread(target=_run_indexing, daemon=True).start()
    return {"detail": "Indexing started"}


@app.get("/index/status")
def index_status() -> Dict[str, Any]:
    """Return progress of the current/last indexing run."""

    with _progress_lock:
        status = _progress.asdict()

    logger.debug("Status request served: %s", status)
    return status


# ---------------------------------------------------------------------------
# /search – similarity query helper so external tools (and the Codex CLI) can
# retrieve relevant code chunks **without** talking to Chroma directly.  This
# keeps all interactions funnelled through the single index_service.py
# process and therefore avoids duplicate embedding logic spread across the
# codebase.
# ---------------------------------------------------------------------------


@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:  # noqa: D401 – FastAPI handler
    """Return the *k* most similar code chunks for *req.query*."""

# ------------------------------------------------------------------
# Surface search calls in the *default* log output so users can easily see
# when and how the Codex UI queries the vector store.  We deliberately use
# *INFO* instead of *DEBUG* here as the latter is often filtered out in
# production-like setups (for example when *CODEX_LOG_LEVEL* is set to
# "INFO").
# ------------------------------------------------------------------

    _preview = req.query[:80].replace("\n", "\\n")

    # Keep the old DEBUG entry for detailed troubleshooting …
    logger.debug("/search invoked (query=%s, k=%d)", _preview, req.k)

    # … but add an INFO level line so the event becomes visible even with the
    # more common *INFO* log level.
    logger.info("/search → k=%d, query=%s", req.k, _preview)

    col = _ensure_remote_collection()
    if col is None:
        raise HTTPException(status_code=503, detail="Chroma server is unreachable")

    # Embed the incoming query **locally** so we don't rely on the remote
    # Chroma instance having an embedding function attached.
    vecs = _embed_texts([req.query])
    if not vecs:
        raise HTTPException(status_code=500, detail="Failed to embed query text")

    try:
        res = col.query(
            query_embeddings=vecs,
            n_results=req.k,
            include=["documents", "metadatas"],
        )

        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]

        # Provide visibility into the outcome as well so that the log entry
        # from above forms a clear request/response pair which greatly helps
        # when grepping through historical logs.
        hit_count = len(docs)
        logger.debug("/search produced %d hits", hit_count)
        logger.info("/search ← %d hits", hit_count)

        return SearchResponse(documents=docs, metadatas=metas)
    except Exception as exc:
        logger.error("/search failed – %s", exc)
        raise HTTPException(status_code=500, detail=f"Search failed: {exc}")


# Convenience when executed as `python scripts/index_service.py`.
if __name__ == "__main__":
    # Import **inside** the guard so production environments that embed the
    # service (e.g. through `uvicorn.run(app, …)`) are not forced to pull in
    # `uvicorn` as a hard dependency at *import*-time.  This keeps the
    # footprint small for downstream consumers that rely on their own ASGI
    # server.
    import uvicorn  # Local development helper (not required at runtime)

    # ---------------------------------------------------------------------
    # Runtime environment quirks
    # ---------------------------------------------------------------------
    #
    # Binding to *all* interfaces (0.0.0.0) fails with an EPERM error inside
    # the default Codex sandbox because outbound networking capabilities are
    # fully disabled for security reasons.  A loop-back interface on the
    # other hand is still available so we restrict the listener to 127.0.0.1
    # which is perfectly sufficient for the CLI<->service communication.
    #
    # The port can still be overridden through the standard `PORT` environment
    # variable to avoid clashes with other local services.
    # ---------------------------------------------------------------------

    host = os.getenv("INDEX_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8034"))

    # Default port intentionally differs from Chroma's 8000 to avoid clashes
    # when both services run concurrently.
    uvicorn.run(app, host=host, port=port)
