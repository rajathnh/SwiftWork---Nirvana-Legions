function addSkillRow(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      
      const input = event.target;
      const tableBody = document.querySelector("#skillsTable tbody");

      // Check if the input has a value
      if (input.value.trim() !== "") {
        // Create a new table row
        const newRow = document.createElement("tr");
        newRow.className = tableBody.childElementCount % 2 === 0 ? "bg-gray-50" : "bg-white"; // Alternating colors

        // Add a single cell with input
        newRow.innerHTML = `
          <td class="p-3 border border-gray-300">
            <input 
              type="text" 
              class="w-full px-2 py-1 border-none outline-none bg-transparent"
              placeholder="Enter a skill and press Enter"
              onkeydown="addSkillRow(event)"
            />
          </td>
        `;

        // Append the new row to the table
        tableBody.appendChild(newRow);

        // Focus the new input field
        newRow.querySelector("input").focus();
      }
    }
  }

  {
    const MAX_IMAGES = 4; // Limit to 4 images
  
    // Handle file selection
    function handleFileSelect(event) {
      const files = event.target.files;
      if (files.length > 0) {
        handleFiles(files);
      }
      setTimeout(() => {
        event.target.value = ""; // Clear the file input to allow re-selection of the same file
      }, 0);
    }
  
    // Handle drag-and-drop
    function handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    }
  
    // Prevent default drag-over behavior
    function handleDragOver(event) {
      event.preventDefault();
    }
  
    // Process uploaded files
    function handleFiles(files) {
      const previewContainer = document.getElementById("previewContainer");
      const dropZoneText = document.getElementById("dropZoneText");
      const existingImages = previewContainer.children.length;
  
      if (existingImages + files.length > MAX_IMAGES) {
        alert(`You can only upload up to ${MAX_IMAGES} images.`);
        return;
      }
  
      Array.from(files).forEach((file, index) => {
        if (existingImages + index >= MAX_IMAGES) return;
  
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imgElement = document.createElement("div");
            imgElement.className =
              "relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300";
            imgElement.innerHTML = `
              <img src="${e.target.result}" alt="Uploaded Image" class="w-full h-full object-cover" />
              <button 
                class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-bl"
                onclick="removeImage(this)"
              >
                &times;
              </button>
            `;
            previewContainer.appendChild(imgElement);
          };
          reader.readAsDataURL(file);
        } else {
          alert("Only image files are allowed.");
        }
      });
  
      // Update drop zone text
      if (previewContainer.children.length > 0) {
        dropZoneText.textContent = "Drag and drop more images, or browse to upload.";
      }
    }
  
    // Remove an image
    function removeImage(button) {
      const imageDiv = button.parentElement;
      imageDiv.remove();
  
      const dropZoneText = document.getElementById("dropZoneText");
      const previewContainer = document.getElementById("previewContainer");
  
      // Reset drop zone text if no images remain
      if (previewContainer.children.length === 0) {
        dropZoneText.textContent = "Drag and drop your images here, or browse.";
      }
    }
  }
  