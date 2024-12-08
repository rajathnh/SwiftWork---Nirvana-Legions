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
    <div class=" mx-auto p-6 bg-blue-200 rounded-lg shadow-md">
    <!-- Main Flex Container -->
    <div class="flex flex-col lg:flex-row lg:space-x-8">
        <!-- Profile Header -->
       <div class="profile-header lg:w-1/3 bg-white p-6 rounded-lg shadow-sm mb-6 lg:mb-0">
    <img src="${freelancer.profilePic || 'default-profile.png'}" 
         alt="Profile Picture" 
         class="w-32 h-32 rounded-full mx-auto shadow-lg border-2 border-blue-500">
    <h2 class="text-2xl font-bold mt-6 text-center text-gray-800">${freelancer.name || 'No Name Provided'}</h2>
    <p class="text-center text-gray-600 mt-4"><strong>Email:</strong> ${freelancer.email || 'Not Provided'}</p>
    <p class="text-center text-gray-600 mt-4"><strong>Skills:</strong> 
        ${freelancer.skills && freelancer.skills.length ? freelancer.skills.join(', ') : 'No Skills Provided'}
    </p>
</div>


        <!-- Bio + Portfolio Section -->
        <div class="bio-portfolio flex-1 space-y-6">
            <!-- Bio Section -->
            <div class="bio bg-white p-4 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-2 text-blue-500">Bio</h3>
                <p class="text-gray-700">${freelancer.bio || 'No bio provided.'}</p>
            </div>

            <!-- Portfolio Section -->
            <div class="portfolio bg-white p-4 rounded-lg shadow-sm">
                <h3 class="text-lg font-semibold mb-2 text-blue-500">Portfolio</h3>
                <div class="images grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    ${displayPortfolioImages(freelancer)}
                </div>
            </div>
        </div>
    </div>

    <!-- Reviews Section -->
    <div class="reviews bg-white p-6 rounded-lg shadow-sm mt-6 lg:mt-8">
        <h3 class="text-lg font-semibold mb-2 text-blue-500">Reviews</h3>
        <div class="space-y-4">
            ${displayReviews(freelancer.reviews)}
        </div>
        <p class="text-gray-700 mt-4"><strong>Average Rating:</strong> 
            <span class="text-yellow-500">${freelancer.averageRating || 'N/A'}</span>
        </p>
        <p class="text-gray-700"><strong>Number of Reviews:</strong> ${freelancer.numOfReviews || 0}</p>
    </div>
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
        .filter(image => image && typeof image === 'string' && image.trim() !== '') // Filter valid and non-empty strings
        .map(image => `
            <div class="w-full h-40 md:h-48 lg:h-56">
                <img src="${image}" alt="Portfolio Image" 
                    class="portfolio-img w-full h-full object-cover rounded-lg shadow-md">
            </div>
        `)
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
                <a href="${gigLink}" class="proposal-link ">
    <p class="text-xl font-semibold text-gray-800 mb-2"><strong>Gig:</strong> ${gig.title || 'No Title'}</p>
    <p class="text-gray-600 mb-2"><strong>Description:</strong> ${gig.description || 'No Description'}</p>
    <p class="text-gray-800 mb-2"><strong>Budget:</strong> ${gig.budget || 'N/A'}</p>
    <p class="text-gray-800 mb-2"><strong>Deadline:</strong> ${gig.deadline ? new Date(gig.deadline).toDateString() : 'N/A'}</p>
    <p class="text-gray-800 mb-2"><strong>Bid Amount:</strong> ${proposal.bidAmount || 'N/A'}</p>
    <p class="text-gray-800 mb-2"><strong>Proposal Message:</strong> ${proposal.proposalMessage || 'No Message Provided'}</p>
    <p class="text-gray-800 mb-6"><strong>Status:</strong> ${gigStatus}</p>
</a>

<!-- Show the 'Submit Final Project' button if the gig is assigned to this freelancer -->
${gig.assignedFreelancer && gig.assignedFreelancer === getFreelancerIdFromLocalStorage() ? 
    `<button class="submit-project-btn bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300">Submit Final Project</button>` 
    : ''}

            `;
            categoryDiv.appendChild(proposalDiv);
        });

        proposalsSection.appendChild(categoryDiv);
    } else {
        const noGigsMessage = document.createElement('p');
        // noGigsMessage.innerText = `No gigs available in the ${categoryTitle}.`;
        proposalsSection.appendChild(noGigsMessage);
    }
}


// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    const freelancerId = getFreelancerIdFromLocalStorage();
    getFreelancerData(freelancerId);
});
