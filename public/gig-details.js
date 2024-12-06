document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gigId = urlParams.get('gigId');
    const makeProposalBtn = document.getElementById('make-proposal-btn'); // Ensure this button is in your HTML
    const proposalMessage = document.getElementById('proposal-message'); // Element to display success or error messages

    if (!gigId) {
        alert('Gig ID not found. Redirecting to dashboard...');
        window.location.href = 'display-all-gigs.html';
        return;
    }

    const gigTitleElement = document.getElementById('gig-title');
    const gigDescriptionElement = document.getElementById('gig-description');
    const gigBudgetElement = document.getElementById('gig-budget');
    const gigDeadlineElement = document.getElementById('gig-deadline');
    const clientNameElement = document.getElementById('client-name');
    const viewClientBtn = document.getElementById('view-client-btn');
    const proposalsListElement = document.getElementById('proposals-list');

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

        // Check if the gig is already assigned, and redirect to chat if it is
        if (gig.status === 'assigned') {
            window.location.href = `chat.html?gigId=${gig._id}&freelancerId=${gig.assignedFreelancer}`;
            return;
        }

        // Update gig details on the page
        gigTitleElement.textContent = gig.title;
        gigDescriptionElement.textContent = `Description: ${gig.description}`;
        gigBudgetElement.textContent = `Budget: $${gig.budget}`;
        gigDeadlineElement.textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;

        // Access the client details
        if (gig.client) {
            clientNameElement.textContent = `Client: ${gig.client.name}`;
            viewClientBtn.onclick = () => {
                window.location.href = `client-portfolio.html?clientId=${gig.client._id}`;
            };
        } else {
            console.warn('Client data is missing');
            clientNameElement.textContent = 'Client information not available';
            viewClientBtn.style.display = 'none'; // Hide button if client data is missing
        }

        // Show the "Make Proposal" button only if the user is a freelancer and gig is not assigned
        if (isFreelancer() && gig.status !== 'assigned') {
            makeProposalBtn.style.display = 'inline-block'; // Show the button if the user is a freelancer
            makeProposalBtn.addEventListener('click', function () {
                window.location.href = `create-proposal.html?gigId=${gigId}`;
            });
        } else {
            makeProposalBtn.style.display = 'none'; // Hide the button if not a freelancer or gig is assigned
        }

        // Render proposals dynamically
        if (gig.proposals && gig.proposals.length > 0) {
            gig.proposals.forEach((proposal) => {
                const proposalElement = document.createElement('li');
                proposalElement.classList.add('proposal');
                proposalElement.innerHTML = `
                    <strong>Freelancer:</strong> ${proposal.freelancerName} <br>
                    <strong>Proposal:</strong> ${proposal.details} <br>
                    <button class="accept-proposal-btn" onclick="acceptProposal('${gigId}', '${proposal.freelancerId}')">Accept Proposal</button>
                `;
                proposalsListElement.appendChild(proposalElement);
            });
        } else {
            proposalsListElement.innerHTML = "<p>No proposals yet.</p>";
        }

    } catch (error) {
        console.error('Error fetching gig details:', error);
        alert('Error fetching gig details.');
    }
});

// Function to handle the proposal acceptance
async function acceptProposal(gigId, freelancerId) {
    try {
        const response = await fetch('http://localhost:5000/api/v1/gigs/accept-proposal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
                gigId: gigId,
                freelancerId: freelancerId,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Proposal accepted! Redirecting to chat...');
            // Redirect to the chat page (replace with your actual chat route)
            window.location.href = `chat.html?gigId=${gigId}&freelancerId=${freelancerId}`;
        } else {
            alert('Error accepting proposal: ' + data.message);
        }
    } catch (error) {
        console.error('Error accepting proposal:', error);
        alert('Error accepting proposal.');
    }
}
