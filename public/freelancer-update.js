document.addEventListener('DOMContentLoaded', function () {
    const updateFreelancerForm = document.getElementById('updateFreelancerForm');
    const urlParams = new URLSearchParams(window.location.search);
    const swiftWorkID = urlParams.get("freelancerId") || localStorage.getItem("swiftWork_ID");

    if (!swiftWorkID) {
        alert("No client ID found. Please log in.");
        window.location.href = "login.html";
        return;
    }

    if (updateFreelancerForm) {
        updateFreelancerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Collect form data
            const formData = new FormData();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const skills = document.getElementById('skills').value;
            const bio = document.getElementById('bio').value;
            const portfolio = document.getElementById('portfolio').value;
            const profilePic = document.getElementById('profilePic').files[0];
            const image1 = document.getElementById('image1').files[0];

            // Only append fields if they are filled
            if (name) formData.append('name', name);
            if (email) formData.append('email', email);
            if (skills) formData.append('skills', skills);
            if (bio) formData.append('bio', bio);
            if (portfolio) formData.append('portfolio', portfolio);
            if (profilePic) formData.append('profilePic', profilePic);
            if (image1) formData.append('image1', image1);

            try {
                const response = await fetch(`http://localhost:5000/api/v1/freelancer/${swiftWorkID}`, {
                    method: 'PATCH',
                    body: formData,
                });

                if (response.ok) {
                    document.getElementById('successMessage').classList.remove('hidden');
                    document.getElementById('errorMessage').classList.add('hidden');
                    // Redirect after a successful update
                    setTimeout(() => {
                        window.location.href = 'freelancer-profile.html'; // Redirect to freelancer profile page
                    }, 2000);
                } else {
                    const error = await response.json();
                    document.getElementById('errorMessage').textContent = `Error: ${error.message}`;
                    document.getElementById('errorMessage').classList.remove('hidden');
                    document.getElementById('successMessage').classList.add('hidden');
                }
            } catch (error) {
                console.error('Error updating freelancer profile:', error);
                document.getElementById('errorMessage').textContent = 'An error occurred. Please try again.';
                document.getElementById('errorMessage').classList.remove('hidden');
                document.getElementById('successMessage').classList.add('hidden');
            }
        });
    }
});
