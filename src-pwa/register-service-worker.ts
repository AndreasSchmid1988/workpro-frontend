import { register } from 'register-service-worker';
import { Notify } from 'quasar';

// Poll interval set to 30 seconds
const POLL_INTERVAL = 30 * 1000;

const checkForUpdate = () => {
  console.log('checkForUpdate');
  if ('serviceWorker' in navigator) {
    // @ts-ignore: in the navigator context we have serviceWorker
    navigator.serviceWorker
      .getRegistration()
      .then((registration: { update: () => Promise<any> }) => {
        console.log('trigger registration.update()');
        // Trigger an update check
        if (registration) {
          registration.update().catch((error: any) => {
            console.error('Error during Service Worker update:', error);
          });
        }
      });
  }
};

// Then repeat the check at the specified interval
setInterval(checkForUpdate, POLL_INTERVAL);

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  registrationOptions: { scope: '/' },

  ready(/* registration */) {
    console.log('Service worker is active.');
  },

  registered(/* registration */) {
    console.log('Service worker has been registered.');
  },

  cached(/* registration */) {
    console.log('Content has been cached for offline use.');
  },

  updatefound(/*registration*/) {
    console.log('New content is downloading.');
    /*    const language = self.navigator.language || 'en';
    let reloadMessage = 'New version is available.';
    let refreshLabel = 'refresh';

    if (language.startsWith('de')) {
      reloadMessage = 'Eine neue Version ist verfügbar.';
      refreshLabel = 'aktualisieren';
    }

    Notify.create({
      message: reloadMessage,
      group: false,
      color: 'negative',
      position: 'top',
      timeout: 0,
      icon: 'refresh',
      actions: [
        {
          label: refreshLabel,
          color: 'white',
          handler: () => {
            if (typeof window !== 'undefined') {
              // Perform a hard reload to fetch new content bypassing the cache
              window.location.reload(true);
            }
          },
        },
      ],
    });*/
  },

  updated(registration) {
    console.log('New content is available; please refresh.');

    const language = self.navigator.language || 'en';
    let reloadMessage = 'New version is available.';
    let refreshLabel = 'refresh';

    if (language.startsWith('de')) {
      reloadMessage = 'Eine neue Version ist verfügbar.';
      refreshLabel = 'aktualisieren';
    }

    Notify.create({
      message: reloadMessage,
      group: false,
      color: 'negative',
      position: 'top',
      timeout: 0,
      icon: 'refresh',
      actions: [
        {
          label: refreshLabel,
          color: 'white',

          handler: () => {
            // @ts-ignore: in the Notify context we have window
            if (typeof window !== 'undefined') {
              // Unregister the current service worker to remove the old cache
              registration.unregister().then(() => {
                // Perform a hard reload to fetch new content bypassing the cache
                // @ts-ignore: in the Notify context we have window
                window.location.reload(true);
              });
            }
          },
        },
      ],
    });
  },

  offline() {
    console.log(
      'No internet connection found. App is running in offline mode.'
    );

    const language = self.navigator.language || 'en';
    let offlineMessage = 'No internet connection!';
    let refreshLabel = 'retry';

    if (language.startsWith('de')) {
      offlineMessage = 'Keine Internetverbindung!';
      refreshLabel = 'nochmal versuchen';
    }

    Notify.create({
      group: false,
      message: offlineMessage,
      color: 'negative',
      position: 'top',
      timeout: 0,
      icon: 'refresh',
      actions: [
        {
          label: refreshLabel,
          color: 'white',
          handler: () => {
            // @ts-ignore: in the Notify context we have window
            if (typeof window !== 'undefined') {
              // @ts-ignore: in the Notify context we have window
              window.location.reload();
            }
          },
        },
      ],
    });
  },

  error(err) {
    console.error('Error during service worker registration:', err);
  },
});
