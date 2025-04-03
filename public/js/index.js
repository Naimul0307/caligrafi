function saveSettings() {
    const font = document.getElementById('fontSelector').value;
    const fontWeight = document.getElementById('fontWeightSelector').value;
    const canvasWidth = document.getElementById('canvasWidth').value;
    const canvasHeight = document.getElementById('canvasHeight').value;
    const fontSize = document.getElementById('fontSize').value;

    // Save settings to localStorage
    localStorage.setItem('selectedFont', font);
    localStorage.setItem('selectedFontWeight', fontWeight);
    localStorage.setItem('canvasWidth', canvasWidth);
    localStorage.setItem('canvasHeight', canvasHeight);
    localStorage.setItem('fontSize', fontSize);

    alert('Settings saved!');
}

// Load saved settings on page load
window.onload = function() {
    const savedFont = localStorage.getItem('selectedFont');
    const savedFontWeight = localStorage.getItem('selectedFontWeight');
    const savedCanvasWidth = localStorage.getItem('canvasWidth');
    const savedCanvasHeight = localStorage.getItem('canvasHeight');
    const savedFontSize = localStorage.getItem('fontSize');

    if (savedFont) document.getElementById('fontSelector').value = savedFont;
    if (savedFontWeight) document.getElementById('fontWeightSelector').value = savedFontWeight;
    if (savedCanvasWidth) document.getElementById('canvasWidth').value = savedCanvasWidth;
    if (savedCanvasHeight) document.getElementById('canvasHeight').value = savedCanvasHeight;
    if (savedFontSize) document.getElementById('fontSize').value = savedFontSize;
};

function redirect() {
    window.location.href = "home.html"; // Redirect to home page
}