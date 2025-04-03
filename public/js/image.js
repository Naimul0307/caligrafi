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
const imageData = canvas.toDataURL('image/png'); // Convert to base64

fetch('/save-image', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData }),
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        alert('Image saved successfully!');
    } else {
        alert('Failed to save image.');
    }
})
.catch(error => {
    console.error('Error:', error);
});
}

function printImage() {
const canvas = document.getElementById('calligraphyCanvas');
const printWindow = window.open('', '', 'height=600,width=800');
printWindow.document.write('<html><head><title>Print</title></head><body>');
printWindow.document.write('<img src="' + canvas.toDataURL('image/png') + '" width="800" height="500"/>');
printWindow.document.write('</body></html>');
printWindow.document.close();
printWindow.print();
}