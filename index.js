
// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
function urlBase64ToUint8Array(base64String) {
    // eslint-disable-next-line no-mixed-operators
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

navigator.serviceWorker.register('worker.js');

navigator.serviceWorker.ready.then((registration) => {
    const s = registration.pushManager.getSubscription();
    // Use the PushManager to get the user’s subscription to the push service.
    return s.then(async (subscription) => {
        // If a subscription was found, return it.
        if (subscription) { return subscription; }

        // Get the server’s public key
        const response = await fetch('./vapidPublicKey');
        const vapidPublicKey = await response.text();

        // Chrome doesn’t accept the base64-encoded (string) vapidPublicKey yet urlBase64ToUint8Array() is defined in /tools.js
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don’t plan to send notifications that don’t have a visible effect for the user).
        return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
        });
    });
}).then((subscription) => {
    //
    // Send the subscription details to the server using the Fetch API.
    fetch('./register', {
        method: 'post',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            subscription: subscription,
        }),
    });

    document.getElementById('doIt').onclick = function () {
        const payload = document.getElementById('notification-payload').value;
        const delay = document.getElementById('notification-delay').value;
        const ttl = document.getElementById('notification-ttl').value;

        // Ask the server to send the client a notification (for testing purposes, in actual
        // applications the push notification is likely going to be generated by some event in the server).
        const body = JSON.stringify({
            subscription: subscription,
            payload: payload,
            delay: delay,
            ttl: ttl,
        });
        fetch('./sendNotification', {
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            body,
        });
    };
});
