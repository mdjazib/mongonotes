window.onbeforeunload = async () => {
    await fetch('/destroy', { method: 'GET' });
}