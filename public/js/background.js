   document.addEventListener("DOMContentLoaded", function () {
     // Fetch image filenames dynamically from the server
     fetch('/get-images')
         .then(response => response.json())
         .then(images => {
             const container = document.getElementById("image-container");

             // Loop through the images and create an image element for each one
             images.forEach(image => {
                 const imgElement = document.createElement("img");
                 imgElement.src = `images/${image}`; // Path to the images folder
                 imgElement.classList.add("image-option");

                 // Event listener for selecting an image
                 imgElement.addEventListener("click", () => {
                     // Remove the 'selected' class from any previously selected image
                     const previouslySelected = document.querySelector(".image-option.selected");
                     if (previouslySelected) {
                         previouslySelected.classList.remove("selected");
                     }

                     // Add the 'selected' class to the clicked image
                     imgElement.classList.add("selected");

                     // Store the selected image in localStorage
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
