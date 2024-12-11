// Fetch all available gigs from the backend and display them
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/gigs', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Projects');
        }

        const result = await response.json();
        const gigList = document.getElementById('gig-list');

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
        alert('Error fetching Projects');
    }
});
