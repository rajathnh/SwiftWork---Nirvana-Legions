document.getElementById('freelancer-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const portfolio = document.getElementById('portfolio').value;
    const bio = document.getElementById('bio').value;
    const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
    
    // Handle image uploads
    const profilePic = document.getElementById('profilePic').files[0];
    const image1 = document.getElementById('image1').files[0];
    const image2 = document.getElementById('image2').files[0];
    const image3 = document.getElementById('image3').files[0];
    const image4 = document.getElementById('image4').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('portfolio', portfolio);
    formData.append('bio', bio);
    formData.append('skills', JSON.stringify(skills));
    
    if (profilePic) formData.append('profilePic', profilePic);
    if (image1) formData.append('image1', image1);
    if (image2) formData.append('image2', image2);
    if (image3) formData.append('image3', image3);
    if (image4) formData.append('image4', image4);

    // Send data to backend API
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/register/freelancer', {
            method: 'POST',
            body: formData,
        });

        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Failed to register freelancer');
        }

        const result = await response.json(); // Parse the JSON response

        // Handle the successful response
        alert('Registration successful!');
        console.log(result);

        // Redirect to login page after successful registration
        window.location.href = "http://localhost:5000/login.html";  // Redirect to login page
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = error.message;
        document.getElementById('error-message').classList.remove('hidden');
    }
});
