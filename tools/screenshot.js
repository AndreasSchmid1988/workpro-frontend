#!/usr/bin/env node
/**
 * Screenshot helper using Puppeteer.
 *
 * Features:
 * 1. Optional auto-login via LOGIN_EMAIL & LOGIN_PASSWORD env vars.
 * 2. Reads APP_FRONTEND_URL (defaults to http://localhost:9200).
 * 3. Usage:
 *      LOGIN_EMAIL=admin@example.com LOGIN_PASSWORD=secret \
 *      APP_FRONTEND_URL=http://localhost:9200 \
 *      node tools/screenshot.js "#/management/products/create" "shots/product.png"
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function loginIfNeeded(page, baseUrl) {
  const email = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;
  if (!email || !password) return;

  // Navigate to login page
  await page.goto(`${baseUrl.replace(/\/$/, '')}/login`, { waitUntil: 'networkidle2' });

  // Basic selectors – adjust if your markup differs
  await page.type('input[type="email"]', email, { delay: 20 });
  await page.type('input[type="password"]', password, { delay: 20 });

  // Click first submit button
  const signInBtn = await page.$('button.q-btn');
  await Promise.all([
    signInBtn.click(),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log('✔ Logged in');
}

async function run() {
  const [,, route = '/', outFile = 'screenshot.png'] = process.argv;

  const baseUrl = (process.env.APP_FRONTEND_URL || 'http://localhost:9200').replace(/\/$/, '');

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();

  // Perform login if credentials provided
  await loginIfNeeded(page, baseUrl);

  // Navigate to target route for screenshot
  const hashRoute = route.startsWith('#') ? route : `#${route.replace(/^\/?/, '')}`;
  const targetUrl = `${baseUrl}/${hashRoute}`;
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  await ensureDir(outFile);
  await page.screenshot({ path: outFile });
  console.log(`✔ Screenshot saved to ${outFile}`);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
