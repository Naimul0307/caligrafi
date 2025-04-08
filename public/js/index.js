function saveSettings() {
    const font = document.getElementById('fontSelector').value || 'DiwaniLetterRegular';
    const fontWeight = document.getElementById('fontWeightSelector').value;
    const canvasWidth = document.getElementById('canvasWidth').value;
    const canvasHeight = document.getElementById('canvasHeight').value;
    const fontSize = document.getElementById('fontSize').value;
    const imageWidth = document.getElementById('imageWidth').value;
    const imageHeight = document.getElementById('imageHeight').value;
    const imageQuality = document.getElementById('imageQuality').value;
    const orientation = document.getElementById('orientationSelector').value;

    

    localStorage.setItem('selectedFont', font);
    localStorage.setItem('selectedFontWeight', fontWeight);
    localStorage.setItem('canvasWidth', canvasWidth);
    localStorage.setItem('canvasHeight', canvasHeight);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('imageWidth', imageWidth);
    localStorage.setItem('imageHeight', imageHeight);
    localStorage.setItem('imageQuality', imageQuality);
    localStorage.setItem('imageOrientation', orientation);
    alert('Settings saved!');
}

// Load saved settings on page load
window.onload = function() {
    const savedFont = localStorage.getItem('selectedFont') || 'DiwaniLetterRegular';
    const savedFontWeight = localStorage.getItem('selectedFontWeight');
    const savedCanvasWidth = localStorage.getItem('canvasWidth');
    const savedCanvasHeight = localStorage.getItem('canvasHeight');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedImageWidth = localStorage.getItem('imageWidth');
    const savedImageHeight = localStorage.getItem('imageHeight');
    const savedImageQuality = localStorage.getItem('imageQuality');
    const savedOrientation = localStorage.getItem('imageOrientation');

    if (savedFont) document.getElementById('fontSelector').value = savedFont;
    if (savedFontWeight) document.getElementById('fontWeightSelector').value = savedFontWeight;
    if (savedCanvasWidth) document.getElementById('canvasWidth').value = savedCanvasWidth;
    if (savedCanvasHeight) document.getElementById('canvasHeight').value = savedCanvasHeight;
    if (savedFontSize) document.getElementById('fontSize').value = savedFontSize;
    if (savedImageWidth) document.getElementById('imageWidth').value = savedImageWidth;
    if (savedImageHeight) document.getElementById('imageHeight').value = savedImageHeight;
    if (savedImageQuality) document.getElementById('imageQuality').value = savedImageQuality;
    if (savedOrientation) document.getElementById('orientationSelector').value = savedOrientation;
      
};
