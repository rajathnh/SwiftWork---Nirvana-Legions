document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const profilePic = document.getElementById('profilePic').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    
    if (profilePic) {
        formData.append('profilePic', profilePic);
    }

    // Send data to backend API
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/register/client', {
            method: 'POST',
            body: formData,
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Failed to register client');
        }

        const result = await response.json(); // Parse the JSON response

        // Handle the successful response
        alert('Registration successful! You can now log in.');
        console.log(result);
        // Redirect to login page after successful registration
        window.location.href = 'http://localhost:5000/login.html';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').classList.remove('hidden');
    }
});
