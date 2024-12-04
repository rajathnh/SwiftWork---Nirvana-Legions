// Function to get freelancer ID from local storage
function getFreelancerIdFromLocalStorage() {
    const freelancerId = localStorage.getItem('swiftWork_ID');
    if (!freelancerId) {
        alert("Freelancer not logged in. Redirecting to login...");
        window.location.href = "login.html"; // Redirect to login if ID is missing
    }
    return freelancerId;
}

// Fetch freelancer data from the API
async function getFreelancerData(freelancerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/freelancer/${freelancerId}`);
        const data = await response.json();

        if (response.ok) {
            const freelancer = data.freelancer;
            displayFreelancerData(freelancer);
        } else {
            console.error("Error fetching freelancer data:", data.msg || data.error);
            alert("Unable to fetch freelancer data. Please try again later.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching freelancer data. Please try again later.");
    }
}

// Display the freelancer data on the profile page
function displayFreelancerData(freelancer) {
    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
        <div class="profile-header">
            <img src="${freelancer.profilePic || 'default-profile.png'}" alt="Profile Picture" class="profile-img">
            <h2>${freelancer.name || 'No Name Provided'}</h2>
            <p><strong>Email:</strong> ${freelancer.email || 'Not Provided'}</p>
            <p><strong>Skills:</strong> ${freelancer.skills && freelancer.skills.length ? freelancer.skills.join(', ') : 'No Skills Provided'}</p>
        </div>

        <div class="bio">
            <h3>Bio</h3>
            <p>${freelancer.bio || 'No bio provided.'}</p>
        </div>

        <div class="portfolio">
            <h3>Portfolio</h3>
            <div class="images">
                ${displayPortfolioImages(freelancer)}
            </div>
        </div>

        <div class="reviews">
            <h3>Reviews</h3>
            ${displayReviews(freelancer.reviews)}
        </div>

        <div class="rating">
            <p><strong>Average Rating:</strong> ${freelancer.averageRating || 'N/A'}</p>
            <p><strong>Number of Reviews:</strong> ${freelancer.numOfReviews || 0}</p>
        </div>
    `;
}

// Display portfolio images dynamically
function displayPortfolioImages(freelancer) {
    const images = [freelancer.image1, freelancer.image2, freelancer.image3, freelancer.image4];
    return images
        .filter(image => image) // Only display non-null/non-empty images
        .map(image => `<img src="${image}" alt="Portfolio Image" class="portfolio-img">`)
        .join('') || "<p>No portfolio images available.</p>";
}

// Display the freelancer reviews dynamically
function displayReviews(reviews) {
    if (reviews && reviews.length > 0) {
        return reviews.map(review => {
            return `
                <div class="review">
                    <p><strong>${review.user?.name || 'Anonymous'}</strong> rated <strong>${review.rating || 'N/A'}</strong></p>
                    <p><strong>Title:</strong> ${review.title || 'No Title'}</p>
                    <p>${review.comment || 'No Comment Provided'}</p>
                </div>
            `;
        }).join('');
    } else {
        return "<p>No reviews yet.</p>";
    }
}

// Get the freelancer ID from local storage
const freelancerId = getFreelancerIdFromLocalStorage();

// Fetch and display the freelancer data based on the stored ID
getFreelancerData(freelancerId);
