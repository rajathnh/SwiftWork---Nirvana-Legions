// Fetch the gig ID from the URL (you should pass this ID when linking to this page)
document.addEventListener('DOMContentLoaded', () => {
    const gigId = new URLSearchParams(window.location.search).get('gigId');
    const userId = localStorage.getItem('swiftWork_ID');  // Assuming user ID is stored in localStorage
    const token = 'dummy_auth_token_12345'; // Added dummy token
    fetchGigDetails(gigId, token, userId);
});

// Elements
const submitProposalButton = document.getElementById('submit-proposal-button');
const proposalMessageInput = document.getElementById('proposalMessage');
const bidAmountInput = document.getElementById('bidAmount');

// Function to fetch gig details
async function fetchGigDetails(gigId, token, userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Project not found');
        }

        const gigData = await response.json();
        const gig = gigData.gig;

        // Populate gig details with null checks
        const gigTitleElement = document.getElementById('Project-title');
        const gigDescriptionElement = document.getElementById('Project-description');
        const gigBudgetElement = document.getElementById('Project-budget');
        const gigDeadlineElement = document.getElementById('Project-deadline');

        if (gigTitleElement) gigTitleElement.textContent = `Title: ${gig.title}`;
        if (gigDescriptionElement) gigDescriptionElement.textContent = `Description: ${gig.description}`;
        if (gigBudgetElement) gigBudgetElement.textContent = `Budget: ₹${gig.budget}`;
        if (gigDeadlineElement) gigDeadlineElement.textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;

        // Check if freelancer has already made a proposal
        if (gig.proposals && Array.isArray(gig.proposals)) {
            const existingProposal = gig.proposals.find(proposal => proposal.freelancer._id === userId);
            if (existingProposal) {
                const submitProposalButton = document.getElementById('submit-proposal-button');
                if (submitProposalButton) {
                    submitProposalButton.disabled = true;
                }
                alert("You have already made a proposal for this Project.");
            }
        } else {
            console.warn('No proposals found for this gig.');
        }

    } catch (error) {
        console.error('Error fetching Project details:', error);
        // alert('Error fetching Project details.');
    }
}

// Function to handle proposal submission
async function submitProposal() {
    // Get gigId from URL
    const gigId = new URLSearchParams(window.location.search).get('gigId');
    const userId = localStorage.getItem('swiftWork_ID');
    const token = 'dummy_auth_token_12345'; // Added dummy token here as well

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
            body: JSON.stringify({ gigId, bidAmount, proposalMessage, freelancerId: userId })
        });

        console.log("♨️PROPOSAL CREATE ✨✨💀♨️", JSON.stringify({ gigId, bidAmount, proposalMessage, freelancerId: userId }));

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to submit proposal');
            return;
        }

        const proposalData = await response.json();
        alert('Proposal submitted successfully!');
        submitProposalButton.disabled = true;
    } catch (error) {
        console.log("♨️♨️", error);
        console.error('Error submitting proposal:', error);
        alert('Error submitting proposal.');
    }
}

// Event listener for proposal submission
submitProposalButton.addEventListener('click', submitProposal);