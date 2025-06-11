(function () {
  const savedFont = localStorage.getItem('selectedFont');
  const savedWeight = localStorage.getItem('selectedFontWeight');
  if (savedFont || savedWeight) {
    document.addEventListener("DOMContentLoaded", () => {
      if (savedFont) {
        document.documentElement.style.setProperty('--user-font', savedFont);
        document.body.style.fontFamily = savedFont;
      }
      if (savedWeight) {
        document.body.style.fontWeight = savedWeight;
      }
    });
  }
})();
