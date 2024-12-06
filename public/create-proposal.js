// Fetch the gig ID from the URL (you should pass this ID when linking to this page)
const gigId = new URLSearchParams(window.location.search).get('gigId');
const userId = localStorage.getItem('userId');  // Assuming user ID is stored in localStorage
const token = localStorage.getItem('authToken'); // Assuming auth token is stored in localStorage

// Elements
const submitProposalButton = document.getElementById('submit-proposal-button');
const proposalMessageInput = document.getElementById('proposalMessage');
const bidAmountInput = document.getElementById('bidAmount');

// Function to fetch gig details
async function fetchGigDetails() {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Gig not found');
        }

        const gigData = await response.json();
        const gig = gigData.gig;

        // Populate gig details
        document.getElementById('gig-title').textContent = `Title: ${gig.title}`;
        document.getElementById('gig-description').textContent = `Description: ${gig.description}`;
        document.getElementById('gig-budget').textContent = `Budget: $${gig.budget}`;
        document.getElementById('gig-deadline').textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;

        // Check if freelancer has already made a proposal
        const existingProposal = gig.proposals.find(proposal => proposal.freelancer._id === userId);
        if (existingProposal) {
            submitProposalButton.disabled = true;
            alert("You have already made a proposal for this gig.");
        }

    } catch (error) {
        console.error('Error fetching gig details:', error);
        alert('Error fetching gig details.');
    }
}

// Function to handle proposal submission
async function submitProposal() {
    const bidAmount = bidAmountInput.value;
    const proposalMessage = proposalMessageInput.value;

    if (!bidAmount || !proposalMessage) {
        alert('Please provide both bid amount and proposal message.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/v1/proposal', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gigId, bidAmount, proposalMessage, userId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to submit proposal');
            return;
        }

        const proposalData = await response.json();
        alert('Proposal submitted successfully!');
        submitProposalButton.disabled = true;
    } catch (error) {
        console.error('Error submitting proposal:', error);
        alert('Error submitting proposal.');
    }
}

// Event listener for proposal submission
submitProposalButton.addEventListener('click', submitProposal);

// Initialize the page
fetchGigDetails();
