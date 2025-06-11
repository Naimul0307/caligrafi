function saveSettings() {
    const font = document.getElementById('fontSelector').value;
    const fontWeight = document.getElementById('fontWeightSelector').value;
    const canvasWidth = document.getElementById('canvasWidth').value;
    const canvasHeight = document.getElementById('canvasHeight').value;
    const fontSize = document.getElementById('fontSize').value;
    const imageWidth = document.getElementById('imageWidth').value;
    const imageHeight = document.getElementById('imageHeight').value;
    const imageQuality = document.getElementById('imageQuality').value;
    const orientation = document.getElementById('orientationSelector').value;
    const imageFontColor = document.getElementById('fontColorInput').value;
    const selectedPrinter = document.getElementById('printerSelector').value;
    const printOrientation = document.getElementById('printOrientationSelector').value;

    localStorage.setItem('selectedFont', font);
    localStorage.setItem('selectedFontWeight', fontWeight);
    localStorage.setItem('canvasWidth', canvasWidth);
    localStorage.setItem('canvasHeight', canvasHeight);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('imageWidth', imageWidth);
    localStorage.setItem('imageHeight', imageHeight);
    localStorage.setItem('imageQuality', imageQuality);
    localStorage.setItem('imageOrientation', orientation);
    localStorage.setItem('imageFontColor', imageFontColor);
    localStorage.setItem('selectedPrinter', selectedPrinter);
    localStorage.setItem('printOrientation', printOrientation);

    alert('Settings saved!');
}

handleBackgroundUpload('bg1', 'preview-bg1', 'bg1', 'landscape1.jpg');
handleBackgroundUpload('bg2', 'preview-bg2', 'bg2', 'landscape2.jpg');
handleBackgroundUpload('bg3', 'preview-bg3', 'bg3', 'portrait1.jpg');
handleBackgroundUpload('bg4', 'preview-bg4', 'bg4', 'portrait2.jpg');

function handleBackgroundUpload(inputId, previewId, storageKey, fileName) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;

        const arrayBuffer = await file.arrayBuffer();
        window.electronAPI.uploadBackgroundImage(arrayBuffer, fileName);

        localStorage.setItem(storageKey, fileName);
        const objectURL = URL.createObjectURL(file);
        preview.src = objectURL;
    });

    // Load stored image on init
    const storedFile = localStorage.getItem(storageKey);
    if (storedFile) {
        preview.src = `../background/${storedFile}`;
    }
}

function handleMultipleImageUpload(inputId, previewContainerId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewContainerId);

    input.addEventListener('change', async () => {
        const files = Array.from(input.files).slice(0, 5); // max 5
        if (!files.length) return;

        const fileBuffersWithNames = await Promise.all(
            files.map(async (file, index) => {
                const overlayName = `overlay${index + 1}.jpg`;
                return {
                    name: overlayName,
                    buffer: await file.arrayBuffer()
                };
            })
        );

        window.electronAPI.uploadImages(fileBuffersWithNames);

        // Save names in localStorage
        const imageNames = fileBuffersWithNames.map(f => f.name);
        localStorage.setItem('uploadedOverlays', JSON.stringify(imageNames));

        // Show thumbnails
        previewContainer.innerHTML = '';
        files.forEach((file, index) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = `overlay${index + 1}`;
            img.style.width = '100px';
            img.style.margin = '5px';
            previewContainer.appendChild(img);
        });
    });

    // Load previously saved images
    const saved = JSON.parse(localStorage.getItem('uploadedOverlays') || '[]');
    if (saved.length) {
        previewContainer.innerHTML = '';
        saved.forEach(name => {
            const img = document.createElement('img');
            img.src = `../images/${name}`;
            img.alt = name;
            img.style.width = '100px';
            img.style.margin = '5px';
            previewContainer.appendChild(img);
        });
    }
}


window.onload = function () {
    document.getElementById('fontSelector').value = localStorage.getItem('selectedFont') || 'DiwaniLetterRegular';
    document.getElementById('fontWeightSelector').value = localStorage.getItem('selectedFontWeight') || 'normal';
    document.getElementById('canvasWidth').value = localStorage.getItem('canvasWidth') || '800';
    document.getElementById('canvasHeight').value = localStorage.getItem('canvasHeight') || '500';
    document.getElementById('fontSize').value = localStorage.getItem('fontSize') || '50';
    document.getElementById('imageWidth').value = localStorage.getItem('imageWidth') || '800';
    document.getElementById('imageHeight').value = localStorage.getItem('imageHeight') || '500';
    document.getElementById('imageQuality').value = localStorage.getItem('imageQuality') || '1';
    document.getElementById('fontColorInput').value = localStorage.getItem('imageFontColor') || '#000000';
    document.getElementById('orientationSelector').value = localStorage.getItem('imageOrientation') || 'landscape';
    document.getElementById('printOrientationSelector').value = localStorage.getItem('printOrientation') || 'landscape';

        
    handleMultipleImageUpload('multiImageInput', 'multiImagePreview');
    
    // ❗ This block must NOT be nested inside another window.onload
    if (window.electronAPI) {
        console.log("📡 Requesting printers...");
        window.electronAPI.getPrinters();

        window.electronAPI.onPrinterList((printers) => {
            console.log("🖨️ Printers received in renderer:", printers);
            const selector = document.getElementById('printerSelector');
            selector.innerHTML = '';

            if (!printers.length) {
                const opt = document.createElement('option');
                opt.textContent = 'No printers found';
                selector.appendChild(opt);
                return;
            }

            printers.forEach(printer => {
                const option = document.createElement('option');
                option.value = printer;
                option.textContent = printer;
                selector.appendChild(option);
            });

            const savedPrinter = localStorage.getItem('selectedPrinter');
            if (savedPrinter) selector.value = savedPrinter;
        });
    }
};



