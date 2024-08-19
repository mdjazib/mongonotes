window.addEventListener('unload', () => {
    navigator.sendBeacon('/destroy');
});