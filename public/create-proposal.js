document.addEventListener('DOMContentLoaded', () => {
    const gigId = new URLSearchParams(window.location.search).get('gigId');
    console.log('Current URL:', window.location.href);
    console.log('Extracted gigId:', gigId);

    if (!gigId) {
        alert('Error: Gig ID is missing from the URL.');
        return; // Stop execution if gigId is missing
    }

    const userId = localStorage.getItem('swiftWork_ID');  // Assuming user ID is stored in localStorage
    const token = localStorage.getItem('authToken'); // Assuming auth token is stored in localStorage
    fetchGigDetails(gigId, token, userId);

    // Initialize event listener for the "Submit Proposal" button after DOM content is loaded
    const submitProposalButton = document.getElementById('submit-proposal-button');
    if (submitProposalButton) {
        submitProposalButton.addEventListener('click', async () => {
            await submitProposal(gigId, token, userId);
        });
    } else {
        console.error('Error: Submit Proposal Button not found.');
    }
});

// Function to fetch gig details
async function fetchGigDetails(gigId, token, userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Fetching gig details for ID:', gigId);
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Project not found');
        }

        const gigData = await response.json();
        console.log('Fetched Gig Data:', gigData);
        
        const gig = gigData.gig;

        // Populate gig details with null checks
        document.getElementById('Project-title').textContent = `Title: ${gig.title || 'N/A'}`;
        document.getElementById('Project-description').textContent = `Description: ${gig.description || 'N/A'}`;
        document.getElementById('Project-budget').textContent = `Budget: ₹${gig.budget || 'N/A'}`;
        document.getElementById('Project-deadline').textContent = `Deadline: ${gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'N/A'}`;

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
        alert('Error fetching Project details.');
    }
}

// Function to handle proposal submission
// Function to handle proposal submission
async function submitProposal(gigId, token, userId) {
    const bidAmountInput = document.getElementById('bidAmount');
    const proposalMessageInput = document.getElementById('proposalMessage');
    const proposalDeadlineInput = document.getElementById('proposalDeadline'); // Get the deadline input
    const submitProposalButton = document.getElementById('submit-proposal-button');

    const bidAmount = bidAmountInput.value;
    const proposalMessage = proposalMessageInput.value;
    const proposalDeadline = proposalDeadlineInput.value; // Get the deadline value

    if (!bidAmount || !proposalMessage || !proposalDeadline) {
        alert('Please provide bid amount, proposal message, and deadline.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/v1/proposal', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gigId, bidAmount, proposalMessage, freelancerId: userId, deadline: proposalDeadline }) // Include the deadline
        });

        console.log("♨️PROPOSAL CREATE ✨✨💀♨️", JSON.stringify({ gigId, bidAmount, proposalMessage, freelancerId: userId, deadline: proposalDeadline }));

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.msg || 'Failed to submit proposal');
            return;
        }

        const proposalData = await response.json();
        alert('Proposal submitted successfully!');

        // Disable the button after submission
        if (submitProposalButton) {
            submitProposalButton.disabled = true;
        }

        // Redirect to the gig details page
        window.location.href = `gig-details.html?gigId=${gigId}`;

    } catch (error) {
        console.error('Error submitting proposal:', error);
        alert('Error submitting proposal.');
    }
}
