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
        if (!response.ok) {
            throw new Error("Failed to fetch freelancer data");
        }
        const data = await response.json();
        displayFreelancerData(data.freelancer);
        getFreelancerProposals(freelancerId); // Fetch proposals after displaying profile
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching freelancer data. Please try again later.");
    }
}

// Fetch proposals for the freelancer
async function getFreelancerProposals(freelancerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/freelancer/${freelancerId}/proposals`);
        if (!response.ok) {
            throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        displayFreelancerProposals(data.proposals);
    } catch (error) {
        console.error("Error:", error);
        const proposalsSection = document.getElementById('proposals-section');
        if (proposalsSection) {
            proposalsSection.innerHTML = "<p>Error loading proposals. Please try again later.</p>";
        }
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
    document.getElementById('view-all-gigs-btn').addEventListener('click', function () {
        window.location.href = 'display-all-gigs.html';
    });
}

// Display portfolio images dynamically
function displayPortfolioImages(freelancer) {
    const images = [freelancer.image1, freelancer.image2, freelancer.image3, freelancer.image4];
    return images
        .filter(image => image) // Only display non-null/non-empty images
        .map(image => `<img src="${image}" alt="Portfolio Image" class="portfolio-img">`)
        .join('') || "<p>No portfolio images available.</p>";
}

// Display reviews dynamically
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

// Display proposals dynamically
function displayFreelancerProposals(proposals) {
    const proposalsSection = document.getElementById('proposals-section');
    //console.log('Proposals:', proposals);
    // Check if the element exists before attempting to update its innerHTML
    if (!proposalsSection) {
        console.error('Proposals section not found');
        return;
    }

   
    // Get the logged-in freelancer's ID from local storage
    const freelancerId = getFreelancerIdFromLocalStorage();
    console.log('Logged-in freelancer ID:', freelancerId);

    // Categorize gigs based on their status and the assigned freelancer
    const openGigs = proposals.filter(proposal => {
        console.log('Checking open gig proposal:', proposal.gig);
        return proposal.gig?.status === 'open';
    });

    const assignedGigs = proposals.filter(proposal => {
        console.log('Checking assigned gig proposal:', proposal.gig);
        console.log('Assigned freelancer:', proposal.assignedFreelancer);
        return proposal.gig?.status === 'assigned' && proposal.assignedFreelancer === freelancerId;
    });

    const approvalPendingGigs = proposals.filter(proposal => proposal.gig?.status === 'approval pending');
    const assignedToOthersGigs = proposals.filter(proposal => proposal.gig?.status === 'assigned' && proposal.assignedFreelancer !== freelancerId);

    // Clear the section
    proposalsSection.innerHTML = '';

    // Display categorized gigs
    displayGigCategory(proposalsSection, 'Open Gigs', openGigs);
    displayGigCategory(proposalsSection, 'Assigned Gigs', assignedGigs);
    displayGigCategory(proposalsSection, 'Approval Pending Gigs', approvalPendingGigs);
    displayGigCategory(proposalsSection, 'Assigned to Others Gigs', assignedToOthersGigs);
}

// Helper function to display a categorized section
function displayGigCategory(proposalsSection, categoryTitle, gigs) {
    if (gigs.length > 0) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('gig-category');

        const heading = document.createElement('h3');
        heading.innerText = categoryTitle;
        categoryDiv.appendChild(heading);

        gigs.forEach(proposal => {
            const gig = proposal.gig; // Get the gig from the proposal
            const gigLink = `gig-details.html?gigId=${gig._id}`;
            const gigStatus = gig.status || 'Pending';

            // Create a proposal display
            const proposalDiv = document.createElement('div');
            proposalDiv.classList.add('proposal');
            proposalDiv.innerHTML = `
                <a href="${gigLink}" class="proposal-link">
                    <p><strong>Gig:</strong> ${gig.title || 'No Title'}</p>
                    <p><strong>Description:</strong> ${gig.description || 'No Description'}</p>
                    <p><strong>Budget:</strong> ${gig.budget || 'N/A'}</p>
                    <p><strong>Deadline:</strong> ${new Date(gig.deadline).toDateString() || 'N/A'}</p>
                    <p><strong>Bid Amount:</strong> ${proposal.bidAmount || 'N/A'}</p>
                    <p><strong>Proposal Message:</strong> ${proposal.proposalMessage || 'No Message Provided'}</p>
                    <p><strong>Status:</strong> ${gigStatus}</p> <!-- Gig status -->
                </a>

                <!-- Show the 'Submit Final Project' button if the gig is assigned to this freelancer -->
                ${gig.assignedFreelancer && gig.assignedFreelancer === getFreelancerIdFromLocalStorage() ? `
                    <button class="submit-project-btn" onclick="submitProject('${gig._id}')">Submit Final Project</button>
                ` : ''}
            `;
            categoryDiv.appendChild(proposalDiv);
        });

        proposalsSection.appendChild(categoryDiv);
    } else {
        const noGigsMessage = document.createElement('p');
        noGigsMessage.innerText = `No gigs available in the ${categoryTitle}.`;
        proposalsSection.appendChild(noGigsMessage);
    }
}


// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    const freelancerId = getFreelancerIdFromLocalStorage();
    getFreelancerData(freelancerId);
});
