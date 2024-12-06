// Event listener for form submission
document.getElementById("create-gig-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        budget: formData.get('budget'),
        deadline: formData.get('deadline')
    };

    try {
        const response = await fetch('http://localhost:5000/api/v1/gigs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to create gig');
        }

        const result = await response.json();
        alert('Gig created successfully');
        console.log(result.gig);
        // Redirect or clear form if necessary
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
