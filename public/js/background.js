document.addEventListener("DOMContentLoaded", function () {
    fetch('/get-images')
        .then(response => response.json())
        .then(images => {
            // If fewer than 2 images, skip background selection page
            if (images.length < 2) {
                if (images.length === 1) {
                    // Save single image as selected background
                    localStorage.setItem('selectedBackground', `images/${images[0]}`);
                } else {
                    // No images available, clear selection
                    localStorage.removeItem('selectedBackground');
                }
                // Redirect directly to image.html
                window.location.href = "image.html";
                return;
            }

            // Otherwise, display images for selection
            const container = document.getElementById("image-container");

            images.forEach(image => {
                const imgElement = document.createElement("img");
                imgElement.src = `images/${image}`;
                imgElement.classList.add("image-option");

                imgElement.addEventListener("click", () => {
                    const previouslySelected = document.querySelector(".image-option.selected");
                    if (previouslySelected) {
                        previouslySelected.classList.remove("selected");
                    }
                    imgElement.classList.add("selected");
                    localStorage.setItem('selectedBackground', `images/${image}`);
                });

                container.appendChild(imgElement);
            });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            alert("Unable to load images.");
        });
});

 // Function to submit the selected background image and navigate to the next page
 function submitBackground() {
     // Ensure background image is selected before proceeding
     if (localStorage.getItem('selectedBackground')) {
         window.location.href = "image.html"; // Redirect to the image generation page
     } else {
         alert("Please select a background image first.");
     }
 }
