document.getElementById("create-gig-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    console.log(localStorage.getItem('swiftWork_ID')); // Logs user ID for debugging

    const formData = new FormData(this);
    const skillsRaw = formData.get('skillsRequired'); // Get the skills input as raw text
    const skillsArray = skillsRaw.split(',').map(skill => skill.trim()); // Convert to an array
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        budget: formData.get('budget'),
        deadline: formData.get('deadline'),
        skillsRequired: skillsArray,
        client: localStorage.getItem('swiftWork_ID')
    };
    

    try {
        const response = await fetch('http://localhost:5000/api/v1/gigs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Use the token, not the user ID
            },
            
            body: JSON.stringify(data)
            
        });

        if (!response.ok) {
            const errorResponse = await response.json(); // Parse error response for details
            throw new Error(errorResponse.message || 'Failed to create Project');
        }

        const result = await response.json();
        alert('Project created successfully');
        console.log(result.gig);

        // Optional: Redirect or reset form after successful creation
        this.reset(); // Clears the form
        window.location.href = '/client-portfolio.html'; // Redirect to gigs page (adjust as needed)
    } catch (error) {
        alert('Error: ' + error.message);
        console.error('Error details:', error);
    }
});
