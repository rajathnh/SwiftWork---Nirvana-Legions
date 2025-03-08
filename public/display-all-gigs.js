const API_BASE_URL =
  window.location.hostname === "localhost" // If on localhost
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";
document.addEventListener('DOMContentLoaded', async function() {
    const gigList = document.getElementById('gig-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const budgetFilter = document.getElementById('budget-filter');
    const deadlineSort = document.getElementById('deadline-sort');
    const budgetSort = document.getElementById('budget-sort');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
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

    let allGigs = []; // Store all gigs to enable filtering

    if (!swiftWorkID) {
        console.error("No SwiftWork ID found");
        if (loadingEl) loadingEl.style.display = 'none';
        gigList.innerHTML = '<p class="error-message">No freelancer ID available. Please log in again.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/gigs/${swiftWorkID}/relevant-gigs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error Response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        // Filter gigs to include only those with status: "open"
        allGigs = result.gigs.filter(gig => gig.status === 'open');

        // Hide loading indicator
        if (loadingEl) loadingEl.style.display = 'none';

        // Initial render of gigs
        renderGigs(allGigs);

        // Setup filter and sort event listeners
        setupFilterAndSort();

    } catch (error) {
        console.error("Fetch Error:", error);
        
        // Hide loading indicator
        if (loadingEl) loadingEl.style.display = 'none';
        
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message', 'text-red-500', 'text-center');
        errorMessage.textContent = `Error fetching relevant gigs: ${error.message}. Please try again later.`;
        gigList.appendChild(errorMessage);
    }

    function renderGigs(gigsToRender) {
        // Clear existing gigs
        gigList.innerHTML = '';

        if (gigsToRender.length === 0) {
            gigList.innerHTML = '<p class="text-center">No gigs available.</p>';
            return;
        }

        gigsToRender.forEach(gig => {
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
    }

    function setupFilterAndSort() {
        // Add event listeners for filtering and sorting
        budgetFilter.addEventListener('input', filterAndSortGigs);
        deadlineSort.addEventListener('change', filterAndSortGigs);
        budgetSort.addEventListener('change', filterAndSortGigs);

        // Add reset functionality
        resetFiltersBtn.addEventListener('click', resetFilters);
    }

    function resetFilters() {
        // Reset form elements to default
        budgetFilter.value = '';
        deadlineSort.value = '';
        budgetSort.value = '';

        // Render all gigs
        renderGigs(allGigs);
    }

    function filterAndSortGigs() {
        const maxBudgetValue = budgetFilter.value;
        const deadlineSortValue = deadlineSort.value;
        const budgetSortValue = budgetSort.value;

        // Filter by budget
        let filteredGigs = allGigs.filter(gig => 
            maxBudgetValue === '' || gig.budget <= parseFloat(maxBudgetValue)
        );

        // Sort by deadline
        if (deadlineSortValue === 'nearest') {
            filteredGigs.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        } else if (deadlineSortValue === 'farthest') {
            filteredGigs.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
        }

        // Sort by budget
        if (budgetSortValue === 'low-to-high') {
            filteredGigs.sort((a, b) => a.budget - b.budget);
        } else if (budgetSortValue === 'high-to-low') {
            filteredGigs.sort((a, b) => b.budget - a.budget);
        }

        // Render filtered and sorted gigs
        renderGigs(filteredGigs);
    }
});