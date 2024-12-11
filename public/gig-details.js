document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gigId = urlParams.get('gigId');
    console.log('GigID from URL:', gigId); // Debug log for gigId

    const viewClientBtn = document.getElementById('view-client-btn');
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
        console.log('User Role:', role);
        return role;
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
    
            // Get current user's ID and role
            const currentUserId = localStorage.getItem('swiftWork_ID');
            const userRole = getUserRole();
    
            // Check if gig is assigned
            if (gig.status === 'assigned') {
                const isAuthorizedUser =
                    (userRole === 'client' && gig.client._id === currentUserId) ||
                    (userRole === 'freelancer' && gig.assignedFreelancer._id === currentUserId);
    
                if (isAuthorizedUser) {
                    // Redirect to chat page for authorized users
                    window.location.href = `chat.html?gigId=${gigId}`;
                    return;
                } else {
                    // Show message that gig is already assigned for unauthorized users
                    const gigDetailsContainer = document.getElementById('gig-details-container');
                    if (gigDetailsContainer) {
                        gigDetailsContainer.innerHTML = `
                            <div class="alert alert-info">
                                <h2>Gig Assigned</h2>
                                <p>This gig has already been assigned to a freelancer and is no longer available for proposals.</p>
                            </div>
                        `;
                    }
    
                    // Hide proposal-related elements
                    const makeProposalBtn = document.getElementById('make-proposal-btn');
                    const proposalsListElement = document.getElementById('proposals-list');
    
                    if (makeProposalBtn) makeProposalBtn.style.display = 'none';
                    if (proposalsListElement) proposalsListElement.innerHTML = '';
    
                    return;
                }
            }
    
            // If not redirected, continue with normal gig details rendering
            // Populate gig details
            document.getElementById('gig-title').textContent = gig.title;
            document.getElementById('gig-description').textContent = gig.description;
            document.getElementById('gig-budget').textContent = `Budget: $${gig.budget}`;
            document.getElementById('gig-deadline').textContent = `Deadline: ${new Date(gig.deadline).toLocaleDateString()}`;
    
            // Client Name
            const clientNameElement = document.getElementById('client-name');
            const viewClientBtn = document.getElementById('view-client-btn');
    
            if (gig.client) {
                clientNameElement.textContent = `Client: ${gig.client.name}`;
                viewClientBtn.style.display = 'inline-block'; // Show button
                viewClientBtn.onclick = () => {
                    window.location.href = `client-portfolio.html?clientId=${gig.client._id}`;
                };
            } else {
                console.warn('Client data is missing');
                clientNameElement.textContent = 'Client information not available';
                viewClientBtn.style.display = 'none';
            }
    
            // Display skills required
            const skillsElement = document.getElementById('gig-skills');
            if (gig.skillsRequired && gig.skillsRequired.length > 0) {
                skillsElement.innerHTML = `
                    <strong>Skills Required:</strong> ${gig.skillsRequired.join(', ')}
                `;
            } else {
                skillsElement.innerHTML = '<strong>Skills Required:</strong> None specified';
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
        console.log('Rendering Proposals:', { proposals, userRole, gigStatus: gig.status });
    
        // Clear previous proposals
        const proposalsListElement = document.getElementById('proposals-list');
        if (proposalsListElement) {
            proposalsListElement.innerHTML = '';
        }
    
        if (!proposals || proposals.length === 0) {
            if (proposalsListElement) {
                proposalsListElement.innerHTML = "<p>No proposals yet.</p>";
            }
        } else {
            proposals.forEach(proposal => {
                const proposalElement = document.createElement('li');
                proposalElement.classList.add('proposal');
        
                let proposalContent = `
                    <strong>Bid Amount:</strong> $${proposal.bidAmount} <br>
                    <strong>Proposal Details:</strong> ${proposal.proposalMessage}
                `;
        
                // Add the "Accept Proposal" button if the user is a client and the gig is not assigned
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
        }
    
        // Show Make Proposal button for freelancers
        const makeProposalBtn = document.getElementById('make-proposal-btn');
        if (makeProposalBtn) {
            console.log('Button Visibility Check:', {
                userRole,
                gigStatus: gig.status,
                isVisible: userRole === 'freelancer' && gig.status !== 'assigned'
            });
    
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
    window.acceptProposal = async function (gigId, proposalId, freeLancerID) {
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