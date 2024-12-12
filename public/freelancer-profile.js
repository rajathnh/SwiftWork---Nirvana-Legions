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
        await displayFreelancerData(data.freelancer);
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

// Fetch freelancer badges
async function getFreelancerBadges(freelancerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/test/freelancer-badges/${freelancerId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch freelancer badges");
        }
        const data = await response.json();
        return data.badges || [];
    } catch (error) {
        console.error("Error fetching badges:", error);
        return [];
    }
}

// Updated displayFreelancerData function
// Updated displayFreelancerData function
async function displayFreelancerData(freelancer) {
    const badges = await getFreelancerBadges(freelancer._id);

    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
    <div class="mx-auto p-6">
        <div class="flex flex-col lg:flex-row lg:space-x-8">
            <div class="profile-header border border-slate-300 hover:border-slate-400 flex flex-col items-center lg:w-1/3 p-6 rounded-lg shadow-sm mb-6 lg:mb-0">
                <img src="${freelancer.profilePic || 'default-profile.png'}" 
                     alt="Profile Picture" 
                     class="w-32 h-32 rounded-full mx-auto shadow-lg border-2 border-blue-500">
                <h2 class="text-2xl font-bold mt-6 text-center text-white">${freelancer.name || 'No Name Provided'}</h2>
                <p class="text-center text-white mt-4"><strong>Email:</strong> ${freelancer.email || 'Not Provided'}</p>
              
               <div class="w-full">
                    <p class="text-center text-white mt-4">
                        <strong>Skills:</strong> 
                        ${freelancer.skills && freelancer.skills.length ? freelancer.skills.join(', ') : 'No Skills Provided'}
                    </p>
                    
                    ${badges.length > 0 ? `
                    <div class="verified-skills mt-4 w-full bg-blue-50 p-4 rounded-lg">
                        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                            <strong class="block text-blue-600 text-lg">Verified Skills</strong>
                            <button id="addSkillsBtn" class="bg-green-500 h-10 w-42 text-white text-sm py-1 px-3 rounded-lg hover:bg-green-600 transition-colors duration-300 h-">
                                Add Skills
                            </button>
                        </div>
                        <div class="flex flex-wrap justify-center items-center gap-4">
                            ${badges.map(badge => `
                                <div class="badge flex items-center bg-white border border-blue-200 text-black text-xs font-semibold px-3 py-2 rounded-full shadow-sm"> ${badge.name} </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <button id="editProfileBtn" class="btn bg-blue-500 text-white py-2 px-5 rounded-lg lg:mt-10 shadow-md hover:bg-blue-600 transition-colors duration-300 border border-slate-300 hover:border-slate-400">Edit Profile</button>
            </div>

            <div class="bio-portfolio flex-1 space-y-6">
                <div class="bio bg-white p-4 rounded-lg shadow-sm border border-slate-300 hover:border-slate-400">
                    <h3 class="text-lg font-semibold mb-2 text-blue-500">Bio</h3>
                    <p class="text-gray-700">${freelancer.bio || 'No bio provided.'}</p>
                </div>
                <div class="portfolio bg-white p-4 rounded-lg border border-slate-300 hover:border-slate-400 shadow-sm">
                    <h3 class="text-lg font-semibold mb-2 text-blue-500">Portfolio</h3>
                    <div class="images grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        ${displayPortfolioImages(freelancer)}
                    </div>
                </div>
            </div>
        </div>
        <div class="reviews bg-white p-6 border border-slate-300 hover:border-slate-400 rounded-lg shadow-sm mt-6 lg:mt-8">
            <h3 class="text-lg font-semibold mb-2 text-black">Reviews</h3>
            <div class="space-y-4">
                ${displayReviews(freelancer.reviews)}
            </div>
            <p class="text-gray-700 mt-4"><strong>Average Rating:</strong> 
                <span class="text-yellow-500">${freelancer.averageRating || 'N/A'}</span>
            </p>
            <p class="text-gray-700"><strong>Number of Reviews:</strong> ${freelancer.numOfReviews || 0}</p>
        </div>
    </div>`;
    
    // Edit Profile Button Event Listener
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            window.location.href = 'freelancer-update.html'; // Redirect to edit profile
        });
    }
    
    // Add Skills Button Event Listener (only if badges exist)
    const addSkillsBtn = document.getElementById('addSkillsBtn');
    if (addSkillsBtn) {
        addSkillsBtn.addEventListener('click', function () {
            window.location.href = '../tests/allTests.html';
        });
    }
}
// Display portfolio images dynamically
function displayPortfolioImages(freelancer) {
    const images = [freelancer.image1, freelancer.image2, freelancer.image3, freelancer.image4];
    return images
        .filter(image => image && typeof image === 'string' && image.trim() !== '')
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
                    <p class="text-black"><strong>${review.user?.name || 'Anonymous'}</strong> rated <strong>${review.rating || 'N/A'}</strong></p>
                    <p class="text-black"><strong>Title:</strong> ${review.title || 'No Title'}</p>
                    <p class="text-black">${review.comment || 'No Comment Provided'}</p>
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
    if (!proposalsSection) {
        console.error('Proposals section not found');
        return;
    }

    const freelancerId = getFreelancerIdFromLocalStorage();

    // Clear previous content
    proposalsSection.innerHTML = '';

    // Create proposal categories
    const categories = [
        { 
            title: 'Open Projects', 
            filter: proposal => proposal.gig?.status === 'open',
            emptyMessage: 'No open projects available.'
        },
        { 
            title: 'Assigned Projects', 
            filter: proposal => proposal.gig?.status === 'assigned' && proposal.freelancer._id === freelancerId,
            emptyMessage: 'No assigned projects at the moment.'
        },
        { 
            title: 'Approval Pending Projects', 
            filter: proposal => proposal.gig?.status === 'approval pending' && proposal.freelancer._id === freelancerId,
            emptyMessage: 'No projects pending approval.'
        },
        { 
            title: 'Projects Assigned to Others', 
            filter: proposal => proposal.gig?.status === 'assigned' && proposal.freelancer._id !== freelancerId,
            emptyMessage: 'No projects currently assigned to others.'
        },
        { 
            title: 'Completed Projects', 
            filter: proposal => proposal.gig?.status === 'completed' && proposal.freelancer._id === freelancerId,
            emptyMessage: 'No completed projects yet.'
        }
    ];

    // Render each category
    categories.forEach(category => {
        const categoryProposals = proposals.filter(category.filter);
        
        if (categoryProposals.length > 0) {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'gig-category mb-6';

            // Category title
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'text-xl font-semibold mb-4 text-[#EA906C]';
            categoryTitle.textContent = category.title;
            categorySection.appendChild(categoryTitle);

            // Create proposal grid
            const proposalGrid = document.createElement('div');
            proposalGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

            // Render proposals in the category
            categoryProposals.forEach(proposal => {
                const gig = proposal.gig;
                if (!gig) return; // Skip if no gig data

                const proposalCard = document.createElement('div');
                proposalCard.className = 'bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:scale-105 border border-gray-200';
                
                proposalCard.innerHTML = `
                    <div class="flex flex-col h-full">
                        <h4 class="text-lg font-bold mb-2 text-[#2B2A4C]">${gig.title || 'Untitled Project'}</h4>
                        <p class="text-gray-600 mb-4 flex-grow">${gig.description ? gig.description.slice(0, 100) + '...' : 'No description available'}</p>
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-800">Budget:</span>
                                <span class="font-semibold text-black">₹${gig.budget || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800">Deadline:</span>
                                <span class="font-semibold text-black">${gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800">Bid Amount:</span>
                                <span class="font-semibold text-black">₹${proposal.bidAmount || 'N/A'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800">Status:</span>
                                <span class="font-semibold text-[#e56f08]">${gig.status || 'Pending'}</span>
                            </div>
                        </div>
                        <div class="mt-auto flex space-x-4">
                            <a href="gig-details.html?gigId=${gig._id}" class="w-full text-center bg-[#2B2A4C] text-white py-2 rounded-md hover:bg-[#EA906C] transition">
                                View Details
                            </a>
                            ${category.title === 'Assigned Projects' ? `
                                <button onclick="navigateToSubmitProject('${gig._id}')" class="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
                                    Submit Project
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;

                proposalGrid.appendChild(proposalCard);
            });

            categorySection.appendChild(proposalGrid);
            proposalsSection.appendChild(categorySection);
        } else {
            // Create empty state for category with no proposals
            const emptyStateDiv = document.createElement('div');
            emptyStateDiv.className = 'text-center py-6 bg-gray-100 rounded-lg';
            
            const emptyTitle = document.createElement('h3');
            emptyTitle.className = 'text-xl font-semibold mb-2 text-[#EA906C]';
            emptyTitle.textContent = category.title;
            
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'text-gray-600';
            emptyMessage.textContent = category.emptyMessage;
            
            emptyStateDiv.appendChild(emptyTitle);
            emptyStateDiv.appendChild(emptyMessage);
            
            proposalsSection.appendChild(emptyStateDiv);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const viewAllGigsBtn = document.getElementById("view-all-gigs-btn");
  
    // Add event listener to the "View All Gigs" button
    viewAllGigsBtn.addEventListener("click", () => {
      // Redirect to the page that shows all gigs
      window.location.href = "display-all-gigs.html";
  
      // Alternatively, fetch and display gigs dynamically
      // fetchAndDisplayAllGigs();
    });
  });
// Helper function for submitting project
function navigateToSubmitProject(gigId) {
    window.location.href = `submit-project.html?gigId=${gigId}`;
}
// Fetch notifications from the backend
const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/get');
      const notifications = await response.json();
      displayNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
};
  
// Display notifications in the UI
const displayNotifications = (notifications) => {
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = ''; // Clear the existing list
    notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = notification.seen ? 'notification seen' : 'notification';
      notificationItem.innerHTML = `
        <p>${notification.message}</p>
        <button onclick="markAsRead(${notification._id})">Mark as read</button>
      `;
      notificationList.appendChild(notificationItem);
    });
};
  
// Mark notification as read
const markAsRead = async (notificationId) => {
    try {
      
      const response = await fetch(`/api/notifications/mark-as-read/${notificationId}`, {
        method: 'PUT',
      });
      const updatedNotification = await response.json();
      displayNotifications([updatedNotification]);  // Update the UI
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  

// Initialize profile loading on page load
document.addEventListener('DOMContentLoaded', () => {
    const freelancerId = getFreelancerIdFromLocalStorage();
    getFreelancerData(freelancerId);
});


async function getFreelancerBadges(freelancerId) {
    freelancerId = localStorage.getItem('swiftWork_ID')
    try {
        const response = await fetch(`http://localhost:5000/api/v1/test/freelancer-badges/${freelancerId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch freelancer badges");
        }
        const data = await response.json();
        return data.badges || [];
    } catch (error) {
        console.error("Error fetching badges:", error);
        return [];
    }
}