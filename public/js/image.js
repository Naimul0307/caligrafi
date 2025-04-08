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
const font = localStorage.getItem('selectedFont') || 'Diwani';
const fontWeight = localStorage.getItem('selectedFontWeight') || 'normal';
let fontSize = parseInt(localStorage.getItem('fontSize')) || 50; // Default to 50px
const canvasWidth = parseInt(localStorage.getItem('canvasWidth')) || 800; 
const canvasHeight = parseInt(localStorage.getItem('canvasHeight')) || 500; 

const canvas = document.getElementById('calligraphyCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Background image handling
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
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    drawText(ctx, name, font, fontWeight, fontSize, canvas);
}
}

function drawText(ctx, text, font, fontWeight, fontSize, canvas) {
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillStyle = "black";

let maxWidth = canvas.width * 0.9; // 90% of the canvas width
let maxHeight = canvas.height * 0.9; // 90% of the canvas height
let lineHeight = fontSize * 1.2; // Space between lines
let lines = [];

// Adjust font size to fit within max height
while (true) {
    ctx.font = `${fontWeight} ${fontSize}px ${font}`;
    lines = wrapText(ctx, text, maxWidth);
    let textHeight = lines.length * lineHeight;

    if (textHeight <= maxHeight || fontSize <= 10) {
        break;
    }
    fontSize -= 2; // Reduce font size if text is too big
}

// Calculate starting y-position to center the text block
let startY = (canvas.height - (lines.length * lineHeight)) / 2 + fontSize / 2;

// Draw each line
lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
});

// Show canvas and buttons
canvas.style.display = 'block';
document.getElementById('printBtn').style.display = 'block';
document.getElementById('generateBtn').style.display = 'none';

// Save the image automatically
saveImage();
}

function wrapText(ctx, text, maxWidth) {
let words = text.split(' ');
let lines = [];
let currentLine = words[0];

for (let i = 1; i < words.length; i++) {
    let testLine = currentLine + " " + words[i];
    if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
    } else {
        currentLine = testLine;
    }
}
lines.push(currentLine);
return lines;
}

function saveImage() {
    const canvas = document.getElementById('calligraphyCanvas');

    // Get saved export settings
    let width = parseInt(localStorage.getItem('imageWidth')) || canvas.width;
    let height = parseInt(localStorage.getItem('imageHeight')) || canvas.height;
    const quality = parseFloat(localStorage.getItem('imageQuality')) || 1;

    // ✅ Get orientation and adjust width/height if needed
    const orientation = localStorage.getItem('imageOrientation') || 'landscape';
    if (orientation === 'portrait' && width > height) {
        [width, height] = [height, width]; // Swap for portrait
    }

    // Create offscreen canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    exportCanvas.width = width;
    exportCanvas.height = height;

    // Scale original canvas content
    exportCtx.drawImage(canvas, 0, 0, width, height);

    const imageData = exportCanvas.toDataURL('image/jpeg', quality);

    fetch('/save-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Failed to save image.');
        } else {
            // Store the latest filename in localStorage
            localStorage.setItem('latestImageFilename', data.filename);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function printImage() {
    const imageName = localStorage.getItem('latestImageFilename');
    if (!imageName) {
        alert("No image found to print.");
        return;
    }

    const imagePath = `/photo/${imageName}`;

    const printWindow = window.open('', '', 'width=600,height=600');
    const style = `
        @media print {
            @page { 
                margin: 0; 
            }
            body { 
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100vw;
                height: 100vh;
            }
            img { 
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                page-break-inside: avoid;
            }
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: white;
        }
    `;

    printWindow.document.write(`
        <html>
        <head>
            <title>Print Calligraphy</title>
            <style>${style}</style>
        </head>
        <body>
            <img src="${imagePath}" />
            <script>
                window.onload = function () {
                    window.print();
                };

                window.onafterprint = function () {
                    // Close the print window
                    window.close();
                    // Redirect to home.html (absolute path)
                    if (window.opener) {
                        window.opener.location.href = '/home.html'; // Use absolute path
                    } else {
                        // Fallback if opener is not available (for instance, in some popup blockers)
                        window.location.href = '/home.html';
                    }
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}




