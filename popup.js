document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');

    chrome.storage.sync.get(['overlayEnabled'], function (result) {
        toggleButton.textContent = result.overlayEnabled !== false ? 'Kapat' : 'Ac';
    });

    toggleButton.addEventListener('click', function () {
        chrome.storage.sync.get(['overlayEnabled'], function (result) {
            const newState = !(result.overlayEnabled !== false);
            chrome.storage.sync.set({ overlayEnabled: newState }, function () {
                chrome.runtime.sendMessage({ action: "toggleOverlay" });
                toggleButton.textContent = newState ? 'Kapat' : 'Ac';
                location.reload(); // Sayfayı yeniler
            });
        });
    });
});
