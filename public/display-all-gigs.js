document.addEventListener('DOMContentLoaded', async function() {
    const gigList = document.getElementById('gig-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // If loading indicator doesn't exist, create it
    if (!loadingIndicator) {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.textContent = 'Loading...';
        gigList.appendChild(indicator);
    }

    // Ensure loading indicator is visible
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) loadingEl.style.display = 'block';

    const urlParams = new URLSearchParams(window.location.search);
    const swiftWorkID = urlParams.get("freelancerId") || localStorage.getItem("swiftWork_ID");
    const authToken = localStorage.getItem('authToken');

    console.log("♨️ Debugging Info:");
    console.log("SwiftWork ID:", swiftWorkID);
    console.log("Auth Token:", authToken ? "Token present" : "No token found");

    if (!swiftWorkID) {
        console.error("No SwiftWork ID found");
        if (loadingEl) loadingEl.style.display = 'none';
        gigList.innerHTML = '<p class="error-message">No freelancer ID available. Please log in again.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${swiftWorkID}/relevant-gigs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'  // Add this
            }
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error Response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log("Received Gigs:", result);

        // Hide loading indicator
        if (loadingEl) loadingEl.style.display = 'none';

        // Filter gigs to include only those with status: "open"
        const openGigs = result.gigs.filter(gig => gig.status === 'open');
        console.log("Open Gigs:", openGigs);

        if (openGigs.length === 0) {
            gigList.innerHTML = '<p class="text-center">No open gigs available.</p>';
            return;
        }

        openGigs.forEach(gig => {
            const gigCard = document.createElement('div');
            gigCard.classList.add('gig-card', 'bg-white', 'p-4', 'rounded-lg', 'shadow-md');

            // Add title (make it clickable to navigate to the gig details page)
            const title = document.createElement('h3');
            const titleLink = document.createElement('a');
            titleLink.textContent = gig.title;
            titleLink.href = `gig-details.html?gigId=${gig._id}`; 
            titleLink.classList.add('gig-title-link', 'text-[#e56f08]', 'font-bold', 'hover:underline');
            title.appendChild(titleLink);
            gigCard.appendChild(title);

            // Add budget
            const budget = document.createElement('p');
            budget.classList.add('gig-budget', 'text-gray-700');
            budget.textContent = `Budget: ₹${gig.budget}`;
            gigCard.appendChild(budget);

            // Add deadline
            const deadline = document.createElement('p');
            deadline.classList.add('gig-deadline', 'text-gray-600');
            deadline.textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;
            gigCard.appendChild(deadline);

            // Append the gig card to the list
            gigList.appendChild(gigCard);
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        
        // Hide loading indicator
        if (loadingEl) loadingEl.style.display = 'none';
        
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message', 'text-red-500', 'text-center');
        errorMessage.textContent = `Error fetching relevant gigs: ${error.message}. Please try again later.`;
        gigList.appendChild(errorMessage);
    }
});