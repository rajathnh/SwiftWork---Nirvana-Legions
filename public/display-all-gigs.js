document.addEventListener('DOMContentLoaded', async function() {
    const gigList = document.getElementById('gig-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'block';
    
    const urlParams = new URLSearchParams(window.location.search);
    const swiftWorkID = urlParams.get("freelancerId") || localStorage.getItem("swiftWork_ID");
    
    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${swiftWorkID}/relevant-gigs`, { // Use backticks for the URL
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        loadingIndicator.style.display = 'none';

        if (!response.ok) {
            throw new Error('Failed to fetch relevant gigs');
        }

        const result = await response.json();

        // Filter gigs to include only those with status: "open"
        const openGigs = result.gigs.filter(gig => gig.status === 'open');

        openGigs.forEach(gig => {
            const gigCard = document.createElement('div');
            gigCard.classList.add('gig-card');

            // Add title (make it clickable to navigate to the gig details page)
            const title = document.createElement('h3');
            const titleLink = document.createElement('a');
            titleLink.textContent = gig.title;
            titleLink.href = `gig-details.html?gigId=${gig._id}`; // Link to the Gig Details page
            titleLink.classList.add('gig-title-link');
            title.appendChild(titleLink);
            gigCard.appendChild(title);

            // Add budget
            const budget = document.createElement('p');
            budget.classList.add('gig-budget');
            budget.textContent = `Budget: ₹${gig.budget}`;
            gigCard.appendChild(budget);

            // Add deadline
            const deadline = document.createElement('p');
            deadline.classList.add('gig-deadline');
            deadline.textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;
            gigCard.appendChild(deadline);

            // Append the gig card to the list
            gigList.appendChild(gigCard);
        });
    } catch (error) {
        console.error(error);
        loadingIndicator.style.display = 'none';
        const errorMessage = document.createElement('p');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = 'Error fetching relevant gigs. Please try again later.';
        gigList.appendChild(errorMessage);
    }
});
