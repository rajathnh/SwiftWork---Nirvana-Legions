document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gigId = urlParams.get('gigId');
    const makeProposalBtn = document.getElementById('make-proposal-btn'); // Ensure this button is in your HTML
    const proposalMessage = document.getElementById('proposal-message'); // Element to display success or error messages

    if (!gigId) {
        alert('Gig ID not found. Redirecting to dashboard...');
        window.location.href = 'freelancer-dashboard.html';
        return;
    }

    const gigTitleElement = document.getElementById('gig-title');
    const gigDescriptionElement = document.getElementById('gig-description');
    const gigBudgetElement = document.getElementById('gig-budget');
    const gigDeadlineElement = document.getElementById('gig-deadline');
    const clientNameElement = document.getElementById('client-name');
    const viewClientBtn = document.getElementById('view-client-btn');

    // Function to check if the logged-in user is a freelancer
    function isFreelancer() {
        const userRole = localStorage.getItem('swiftWork_role'); // Get role from localStorage
        return userRole === 'freelancer'; // Check if the role is 'freelancer'
    }

    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch gig details.');
        }

        const data = await response.json();
        const gig = data.gig;

        if (!gig) {
            throw new Error('Gig data is undefined.');
        }

        document.getElementById('gig-title').textContent = gig.title;
        document.getElementById('gig-description').textContent = `Description: ${gig.description}`;
        document.getElementById('gig-budget').textContent = `Budget: $${gig.budget}`;
        document.getElementById('gig-deadline').textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;

        // Access the client details
        if (gig.client) {
            document.getElementById('client-name').textContent = `Client: ${gig.client.name}`;
            // Use the correct client ID when navigating
            viewClientBtn.onclick = () => {
                window.location.href = `client-portfolio.html?clientId=${gig.client._id}`;
            };
        } else {
            console.warn('Client data is missing');
            document.getElementById('client-name').textContent = 'Client information not available';
            viewClientBtn.style.display = 'none'; // Hide button if client data is missing
        }

        // Show the "Make Proposal" button only if the user is a freelancer
        if (isFreelancer()) {
            makeProposalBtn.style.display = 'inline-block'; // Show the button if the user is a freelancer
        } else {
            makeProposalBtn.style.display = 'none'; // Hide the button if not a freelancer
        }

        // Redirect to create-proposal.html when the "Make Proposal" button is clicked
        makeProposalBtn.addEventListener('click', function () {
            window.location.href = `create-proposal.html?gigId=${gigId}`;
        });

    } catch (error) {
        console.error('Error fetching gig details:', error);
        alert('Error fetching gig details.');
    }
});
