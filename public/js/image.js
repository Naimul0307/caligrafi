if (typeof(Yamli) == "object") {
    Yamli.init({
        uiLanguage: "en",
        startMode: "onOrUserDefault",
    });
    Yamli.yamlify('nameInput', {
        settingsPlacement: 'topLeft'
    });
}

const selectedBackground = localStorage.getItem('selectedBackground');

function generateImage() {
    const name = document.getElementById('nameInput').value.trim();
    if (!name) {
        alert("Please enter a name.");
        return;
    }

    // Retrieve saved settings
    const font = localStorage.getItem('selectedFont') || 'DiwaniLetterRegular';
    const fontWeight = localStorage.getItem('selectedFontWeight') || 'normal';
    let fontSize = parseInt(localStorage.getItem('fontSize')) || 50;
    const canvasWidth = parseInt(localStorage.getItem('canvasWidth')) || 800; 
    const canvasHeight = parseInt(localStorage.getItem('canvasHeight')) || 500; 

    const canvas = document.getElementById('calligraphyCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background image handling
    document.fonts.ready.then(() => {
        if (selectedBackground) {
            const bgImage = new Image();
            bgImage.src = selectedBackground;

            bgImage.onload = function () {
                ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
                drawText(ctx, name, font, fontWeight, fontSize, canvas);
            };

            bgImage.onerror = function () {
                alert("Failed to load background image.");
            };
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawText(ctx, name, font, fontWeight, fontSize, canvas);
        }
    });

    // 👇 Hide input and label after generating the image
    document.getElementById('nameInput').style.display = 'none';;
}

function drawText(ctx, text, font, fontWeight, fontSize, canvas) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontColor = localStorage.getItem('imageFontColor') || 'black';
    ctx.fillStyle = fontColor;

    let maxWidth = canvas.width * 0.9;
    let maxHeight = canvas.height * 0.9;
    const minFontSize = 10;
    let lineHeight = fontSize * 1.2;
    let lines = [];

    // Adjust font size based on both height and width constraints
    while (fontSize >= minFontSize) {
        ctx.font = `${fontWeight} ${fontSize}px ${font}`;
        lineHeight = fontSize * 1.2;
        lines = wrapText(ctx, text, maxWidth);
        let textHeight = lines.length * lineHeight;

        const longestLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

        if (textHeight <= maxHeight && longestLineWidth <= maxWidth) {
            break;
        }
        fontSize -= 2;
    }

    let startY = (canvas.height - (lines.length * lineHeight)) / 2 + fontSize / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });

    canvas.style.display = 'block';
    document.getElementById('printBtn').style.display = 'block';
    document.getElementById('generateBtn').style.display = 'none';

    saveImage();
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        let testLine = currentLine ? currentLine + ' ' + word : word;

        // Handle long single words
        if (ctx.measureText(word).width > maxWidth) {
            const splitWord = word.match(/.{1,10}/g); // Break every ~10 chars
            splitWord.forEach((chunk, index) => {
                if (index === 0 && currentLine) {
                    lines.push(currentLine);
                }
                lines.push(chunk);
                currentLine = '';
            });
            continue;
        }

        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function saveImage() {
    return new Promise((resolve, reject) => {
        const canvas = document.getElementById('calligraphyCanvas');
        let width = parseInt(localStorage.getItem('imageWidth')) || canvas.width;
        let height = parseInt(localStorage.getItem('imageHeight')) || canvas.height;
        const quality = parseFloat(localStorage.getItem('imageQuality')) || 1;
        const orientation = localStorage.getItem('imageOrientation') || 'landscape';
        if (orientation === 'portrait' && width > height) {
            [width, height] = [height, width];
        }

        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        exportCanvas.width = width;
        exportCanvas.height = height;
        exportCtx.drawImage(canvas, 0, 0, width, height);

        const imageData = exportCanvas.toDataURL('image/jpeg', quality);

        fetch('/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData }),
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Failed to save image.');
                reject();
            } else {
                localStorage.setItem('latestImageFilename', data.filename);
                resolve(data.filename);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error);
        });
    });
}

function printImage() {
    const imageName = localStorage.getItem('latestImageFilename');
    if (!imageName) {
        alert("No image found to print.");
        return;
    }
    window.electronAPI.printImage(imageName); // ✅ use preload-exposed function
}

window.electronAPI.onRedirectHome(() => {
    window.location.href = '/home.html';
});

// 👇 Add this at the end of the file
window.addEventListener('DOMContentLoaded', () => {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        document.body.style.fontFamily = `'${savedFont}', sans-serif`;
    }
});

