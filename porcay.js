const imagesPath = "images/";
var overlayInterval;

// Kaplama uygula
function applyOverlay(thumbnailElement, overlayImageURL) {
    // Yeni bir img elementi oluştur
    const overlayImage = document.createElement("img");
    overlayImage.src = overlayImageURL;
    overlayImage.style.position = "absolute";
    overlayImage.style.top = overlayImage.style.left = "50%";
    overlayImage.style.width = "100%";
    overlayImage.style.transform = "translate(-50%, -50%)"; // Görseli merkezle
    overlayImage.style.zIndex = "1"; // Üstte olmasını sağla
    overlayImage.style.pointerEvents = "none"; // Kullanıcı etkileşimlerini engelle
    thumbnailElement.parentElement.appendChild(overlayImage);
}

// SitWatch'taki küçük resimleri bul
function findThumbnails() {
    // SitWatch'taki video küçük resimlerini seç
    const thumbnailImages = document.querySelectorAll('img.w-full.aspect-video.object-cover');
    return Array.from(thumbnailImages).filter(image => {
        // Daha önce kaplama eklenmiş mi kontrol et
        const hasOverlay = image.parentElement.querySelector("img[style*='translate(-50%, -50%)']");
        return !hasOverlay;
    });
}

// Küçük resimlere kaplama uygula
function applyOverlayToThumbnails() {
    const thumbnailElements = findThumbnails();

    thumbnailElements.forEach((thumbnailElement) => {
        const overlayImageIndex = getRandomImageFromDirectory();
        const overlayImageURL = getImageURL(overlayImageIndex);
        applyOverlay(thumbnailElement, overlayImageURL);
    });
}

// Görselin URL'sini al
function getImageURL(index) {
    return chrome.runtime.getURL(`${imagesPath}${index}.png`);
}

// Görsel var mı kontrol et
async function checkImageExistence(index) {
    const testedURL = getImageURL(index);

    return fetch(testedURL)
        .then(() => true)
        .catch(() => false);
}

// Tekrarsız rastgele görsel seçimi
const size_of_non_repeat = 8;
const last_indexes = Array(size_of_non_repeat);

function getRandomImageFromDirectory() {
    let randomIndex = -1;

    while (last_indexes.includes(randomIndex) || randomIndex < 0) {
        randomIndex = Math.floor(Math.random() * highestImageIndex) + 1;
    }

    last_indexes.shift();
    last_indexes.push(randomIndex);

    return randomIndex;
}

var highestImageIndex;

async function getHighestImageIndex() {
    let i = 4;

    while (await checkImageExistence(i)) {
        i *= 2;
    }

    let min = i <= 4 ? 1 : i / 2;
    let max = i;

    while (min <= max) {
        let mid = Math.floor((min + max) / 2);

        if (await checkImageExistence(mid)) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }

    highestImageIndex = max;
}

getHighestImageIndex().then(() => {
    chrome.storage.sync.get(['overlayEnabled'], function (result) {
        if (result.overlayEnabled !== false) {
            overlayInterval = setInterval(applyOverlayToThumbnails, 100);
            console.log(
                "SitWatch kaplama tamamlandı, " + highestImageIndex + " resimler algılandı."
            );
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.overlayEnabled !== undefined) {
            if (request.overlayEnabled) {
                overlayInterval = setInterval(applyOverlayToThumbnails, 100);
            } else {
                clearInterval(overlayInterval); // Kaplamaları durdur
                location.reload();
            }
        }
    });
});
