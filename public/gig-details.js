document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gigId = urlParams.get('gigId');
    console.log('GigID from URL:', gigId); // Debug log for gigId

    const makeProposalBtn = document.getElementById('make-proposal-btn');
    const proposalsListElement = document.getElementById('proposals-list');

    // Debug function to log all element selections
    function debugElementSelection() {
        const elementsToCheck = [
            'gig-title', 
            'gig-description', 
            'gig-budget', 
            'gig-deadline', 
            'client-name', 
            'proposals-list', 
            'make-proposal-btn'
        ];

        elementsToCheck.forEach(id => {
            const element = document.getElementById(id);
            console.log(`Element ${id}:`, element ? 'Found' : 'Not Found');
        });
    }

    function getUserRole() {
        const role = localStorage.getItem('swiftWork_role');
        console.log('User Role:', role); // Debug log for user role
        return role;
    }

    async function fetchGigDetails() {
        try {
            // Debug: Log authentication token
            const authToken = localStorage.getItem('authToken');
            console.log('Auth Token:', authToken ? 'Present' : 'Missing');

            const gigResponse = await fetch(`http://localhost:5000/api/v1/gigs/${gigId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });
    
            console.log('Fetch Response:', gigResponse); // Debug log for fetch response

            if (!gigResponse.ok) {
                const errorText = await gigResponse.text();
                console.error('Error Response Text:', errorText);
                throw new Error(`Failed to fetch gig details: ${errorText}`);
            }
    
            const data = await gigResponse.json();
            console.log('Fetched Gig Data:', data); // Detailed debug log

            const gig = data.gig;
            const proposals = data.proposals;
    
            // Debug element selection
            debugElementSelection();

            // Get current user's ID and role
            const currentUserId = localStorage.getItem('swiftWork_ID');
            console.log('Current User ID:', currentUserId); // Debug log for user ID
            const userRole = getUserRole();
    
            // Populate gig details with explicit null checks and logging
            const setElementText = (elementId, text) => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = text;
                    console.log(`Set ${elementId} to:`, text);
                } else {
                    console.warn(`Element ${elementId} not found`);
                }
            };

            // Populate gig details
            setElementText('gig-title', gig.title || 'No Title');
            setElementText('gig-description', gig.description || 'No Description');
            setElementText('gig-budget', `Budget: $${gig.budget || 'Not specified'}`);
            setElementText('gig-deadline', `Deadline: ${gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Not set'}`);
            
            // Client Name
            if (gig.client) {
                setElementText('client-name', `Client: ${gig.client.name || 'Unknown Client'}`);
            }
    
            // Handle Proposals Display
            renderProposals(proposals, gig);
    
        } catch (error) {
            console.error('Complete Error Details:', error);
            alert(`Error fetching gig details: ${error.message}`);
            window.location.href = 'display-all-gigs.html';
        }
    }

    function renderProposals(proposals, gig) {
        const userRole = getUserRole();
        console.log('Rendering Proposals. Proposals:', proposals); // Debug log

        // Clear previous proposals
        const proposalsListElement = document.getElementById('proposals-list');
        if (proposalsListElement) {
            proposalsListElement.innerHTML = ''; 
        }

        if (!proposals || proposals.length === 0) {
            if (proposalsListElement) {
                proposalsListElement.innerHTML = "<p>No proposals yet.</p>";
            }
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
                            onclick="acceptProposal('${gig._id}', '${proposal._id}', '${proposal.freelancer._id}')">
                        Select Proposal
                    </button>
                `;
            }

            proposalElement.innerHTML = proposalContent;
            proposalsListElement.appendChild(proposalElement);
        });

        // Show Make Proposal button for freelancers
        const makeProposalBtn = document.getElementById('make-proposal-btn');
        if (makeProposalBtn) {
            if (userRole === 'freelancer' && gig.status !== 'assigned') {
                makeProposalBtn.style.display = 'inline-block';
                makeProposalBtn.onclick = () => {
                    window.location.href = `create-proposal.html?gigId=${gigId}`;
                };
            } else {
                makeProposalBtn.style.display = 'none';
            }
        }
    }

    // Proposal Acceptance Function
    window.acceptProposal = async function(gigId, proposalId, freeLancerID) {
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
                    freeLancerID: freeLancerID
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