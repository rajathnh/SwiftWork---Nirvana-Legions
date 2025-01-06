const API_BASE_URL =
  window.location.hostname === "localhost" // If on localhost
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";
document.getElementById('updateClientForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get client ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const swiftWorkID = urlParams.get("clientId") || localStorage.getItem("swiftWork_ID");

    if (!swiftWorkID) {
        alert("No client ID found. Please log in.");
        window.location.href = "login.html";
        return;
    }

    // Get form data
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    const profilePicInput = document.getElementById('profilePic');

    // Check if form elements exist
    if (!nameInput || !emailInput || !profilePicInput) {
        console.error("Form elements not found!");
        return;
    }

    const formData = new FormData();
    const name = nameInput.value;
    const email = emailInput.value;
    
    const profilePic = profilePicInput.files[0];

    // Append data to formData
    formData.append('name', name);
    formData.append('email', email);
    
    if (profilePic) {
        formData.append('profilePic', profilePic);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/client/${swiftWorkID}`, {
            method: 'PATCH',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            // Handle success
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('errorMessage').classList.add('hidden');
            setTimeout(() => {
                window.location.href = `client-portfolio.html?clientId=${swiftWorkID}`;
            }, 1500); 
        } else {
            // Handle failure
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('successMessage').classList.add('hidden');
        }
        
    } catch (error) {
        // Handle fetch error
        document.getElementById('errorMessage').classList.remove('hidden');
        document.getElementById('successMessage').classList.add('hidden');
        console.error('Error updating profile:', error);
    }
});
