// Function to get freelancer ID from the URL
function getFreelancerIdFromUrl() {
    const urlPath = window.location.pathname;
    const id = urlPath.split('/').pop();  // Get the last part of the URL path
    return id;
}

// Fetching freelancer data from the API
async function getFreelancerData(freelancerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/freelancer/${freelancerId}`);
        const data = await response.json();
        
        if (response.ok) {
            const freelancer = data.freelancer;
            displayFreelancerData(freelancer);
        } else {
            console.error("Error fetching freelancer data:", data.msg);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Display the freelancer data on the profile page
function displayFreelancerData(freelancer) {
    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
        <div class="profile-header">
            <img src="${freelancer.profilePic}" alt="Profile Picture" class="profile-img">
            <h2>${freelancer.name}</h2>
            <p><strong>Email:</strong> ${freelancer.email}</p>
            <p><strong>Skills:</strong> ${freelancer.skills.join(', ')}</p>
        </div>

        <div class="bio">
            <h3>Bio</h3>
            <p>${freelancer.bio}</p>
        </div>

        <div class="portfolio">
            <h3>Portfolio</h3>
            <div class="images">
                <img src="${freelancer.image1}" alt="Portfolio Image 1">
                <img src="${freelancer.image2}" alt="Portfolio Image 2">
                <img src="${freelancer.image3}" alt="Portfolio Image 3">
                <img src="${freelancer.image4}" alt="Portfolio Image 4">
            </div>
        </div>

        <div class="reviews">
            <h3>Reviews</h3>
            ${displayReviews(freelancer.reviews)}
        </div>

        <div class="rating">
            <p><strong>Average Rating:</strong> ${freelancer.averageRating}</p>
            <p><strong>Number of Reviews:</strong> ${freelancer.numOfReviews}</p>
        </div>
    `;
}

// Display the freelancer reviews dynamically
function displayReviews(reviews) {
    if (reviews && reviews.length > 0) {
        return reviews.map(review => {
            return `
                <div class="review">
                    <p><strong>${review.user.name}</strong> rated <strong>${review.rating}</strong></p>
                    <p><strong>Title:</strong> ${review.title}</p>
                    <p>${review.comment}</p>
                </div>
            `;
        }).join('');
    } else {
        return "<p>No reviews yet.</p>";
    }
}

// Get the freelancer ID from the URL
const freelancerId = getFreelancerIdFromUrl();

// Fetch and display the freelancer data based on the extracted ID
getFreelancerData(freelancerId);
