document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gigId = urlParams.get('gigId');
    const makeProposalBtn = document.getElementById('make-proposal-btn');
    const proposalsListElement = document.getElementById('proposals-list');

    function getUserRole() {
        return localStorage.getItem('swiftWork_role');
    }

    async function fetchGigDetails() {
        try {
            const gigResponse = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            if (!gigResponse.ok) {
                throw new Error('Failed to fetch gig details');
            }

            const data = await gigResponse.json();
            const gig = data.gig;
            const proposals = data.proposals;

            // Update Gig Details
            document.getElementById('gig-title').textContent = gig.title;
            document.getElementById('gig-description').textContent = gig.description;
            document.getElementById('gig-budget').textContent = `Budget: $${gig.budget}`;
            document.getElementById('gig-deadline').textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;
            
            // Client Name
            const clientNameElement = document.getElementById('client-name');
            if (gig.client) {
                clientNameElement.textContent = `Client: ${gig.client.name}`;
            }

            // Handle Proposals Display
            renderProposals(proposals, gig);

        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching gig details. Redirecting...');
            window.location.href = 'display-all-gigs.html';
        }
    }

    function renderProposals(proposals, gig) {
        const userRole = getUserRole();
        proposalsListElement.innerHTML = ''; 

        if (proposals.length === 0) {
            proposalsListElement.innerHTML = "<p>No proposals yet.</p>";
            return;
        }

        proposals.forEach(proposal => {
            const proposalElement = document.createElement('li');
            proposalElement.classList.add('proposal');
            
            let proposalContent = `
                <strong>Bid Amount:</strong> $${proposal.bidAmount} <br>
                <strong>Proposal Details:</strong> ${proposal.proposalMessage}
            `;

            // Add selection button for clients
            if (userRole === 'client' && gig.status !== 'assigned') {
                proposalContent += `
                    <button class="select-proposal-btn" 
                            onclick="acceptProposal('${gig._id}', '${proposal._id}')">
                        Select Proposal
                    </button>
                `;
            }

            proposalElement.innerHTML = proposalContent;
            proposalsListElement.appendChild(proposalElement);
        });

        // Show Make Proposal button for freelancers
        if (userRole === 'freelancer' && gig.status !== 'assigned') {
            makeProposalBtn.style.display = 'inline-block';
            makeProposalBtn.onclick = () => {
                window.location.href = `create-proposal.html?gigId=${gigId}`;
            };
        }
    }

    // Proposal Acceptance Function
    window.acceptProposal = async function(gigId, proposalId) {
        try {
            const response = await fetch('http://localhost:5000/api/v1/gigs/accept-proposal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    gigId: gigId,
                    proposalId: proposalId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Proposal accepted! Redirecting to chat...');
                window.location.href = `chat.html?gigId=${gigId}`;
            } else {
                alert('Error accepting proposal: ' + data.message);
            }
        } catch (error) {
            console.error('Error accepting proposal:', error);
            alert('Error accepting proposal.');
        }
    };

    // Initial fetch
    fetchGigDetails();
});