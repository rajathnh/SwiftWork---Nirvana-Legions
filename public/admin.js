document.addEventListener('DOMContentLoaded', () => {
  const freelancersTab = document.getElementById('freelancersTab');
  const clientsTab = document.getElementById('clientsTab');
  const gigsTab = document.getElementById('gigsTab');
  const freelancersSection = document.getElementById('freelancersSection');
  const clientsSection = document.getElementById('clientsSection');
  const gigsSection = document.getElementById('gigsSection');
  const freelancersTable = document.getElementById('freelancersTable');
  const errorContainer = document.createElement('div');
  errorContainer.id = 'errorContainer';
  document.body.insertBefore(errorContainer, document.body.firstChild);

  // Improved error handling function
  function showError(message) {
    errorContainer.innerHTML = `
          <div class="error-message">
              <p>${message}</p>
              <button onclick="this.parentElement.remove()">Close</button>
          </div>
      `;
  }

  window.closeFreelancerDetailsModal = () => {
    const modalContainer = document.getElementById('freelancerDetailsModal');
    if (modalContainer) {
      modalContainer.style.display = 'none';
      modalContainer.innerHTML = ''; // Clear the modal content
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const modalContainer = document.getElementById('freelancerDetailsModal');

    modalContainer.addEventListener('click', (event) => {
      // Close modal if clicked outside the modal content
      if (event.target === modalContainer) {
        closeFreelancerDetailsModal();
      }
    });
  });

  // Tab switching
  freelancersTab.addEventListener('click', async () => {
    console.log("Freelancers Tab Clicked");
    showSection(freelancersSection);

    try {
      console.log("Fetching from endpoint: /api/v1/admin/getAllFreelancers");

      const response = await fetch('/api/v1/admin/getAllFreelancers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Added token authorization
        }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      console.log("Received Freelancer Data:", data);

      // Updated to correctly parse the nested structure
      const freelancers = data.freelancer || [];

      if (freelancers.length === 0) {
        freelancersTable.innerHTML = '<tr><td colspan="6">No freelancers found</td></tr>';
        return;
      }

      freelancersTable.innerHTML = freelancers
        .map(f => `
                  <tr>
                      <td>${f._id || 'N/A'}</td>
                      <td>${f.name || 'Unnamed'}</td>
                      <td>${f.email || 'No email'}</td>
                      <td>
                          <img 
                              src="${f.profilePic || f.image1 || '/uploads/default.jpg'}" 
                              alt="${f.name}" 
                              style="width: 50px; height: 50px; border-radius: 50%;"
                          >
                      </td>
                      <td>
                          <button onclick="viewFreelancerDetails('${f._id}')">View Details</button>
                      </td>
                  </tr>
              `)
        .join('');

    } catch (error) {
      console.error("Fetch error:", error);
      freelancersTable.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
    }
  });

  clientsTab.addEventListener('click', () => {
    showSection(clientsSection);
    fetchData('/api/v1/admin/getAllClients', renderClients);
  });

  gigsTab.addEventListener('click', () => {
    showSection(gigsSection);
    fetchData('/api/v1/admin/getAllGigs', renderGigs);
  });

  function showSection(section) {
    [freelancersSection, clientsSection, gigsSection].forEach(sec => {
      sec.classList.add('hidden');
    });
    section.classList.remove('hidden');
  }

  async function fetchData(endpoint, callback) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      callback(data);
    } catch (error) {
      console.error('Failed to fetch data:', error.message);
      showError(`Unable to load data: ${error.message}`);
    }
  }

  function renderClients(data) {
    const table = document.getElementById('clientsTable');
    const clients = data.clients || (Array.isArray(data) ? data : [data]);

    table.innerHTML = clients
      .map(c => `
              <tr>
                  <td>${c._id}</td>
                  <td>${c.name}</td>
                  <td>${c.email}</td>
                  <td>
                      <button onclick="viewClientDetails('${c._id}')">View Details</button>
                  </td>
              </tr>
          `)
      .join('');
  }

  function renderGigs(data) {
    const table = document.getElementById('gigsTable');
    const gigs = data.gigs || (Array.isArray(data) ? data : [data]);

    table.innerHTML = gigs
      .map(g => `
              <tr>
                  <td>${g.title}</td>
                  <td>${g.description}</td>
                  <td>$${g.budget}</td>
                  <td>${g.status}</td>
                  <td>
                      <button onclick="viewGigDetails('${g._id}')">View Details</button>
                  </td>
              </tr>
          `)
      .join('');
  }

  const modalContainer = document.createElement('div');
  modalContainer.id = 'freelancerDetailsModal';
  modalContainer.style.display = 'none';
  modalContainer.style.position = 'fixed';
  modalContainer.style.zIndex = '1000';
  modalContainer.style.left = '0';
  modalContainer.style.top = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  modalContainer.style.overflow = 'auto';
  modalContainer.style.backgroundColor = 'rgba(0,0,0,0.4)';

  document.body.appendChild(modalContainer);

  async function fetchFreelancerDetails(id) {
    try {
      const response = await fetch(`/api/v1/freelancer/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch freelancer details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching freelancer details:', error);
      return null;
    }
  }

  async function fetchClientDetails(id) {
    try {
      const response = await fetch(`/api/v1/client/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client details:', error);
      return null;
    }
  }

  window.closeClientDetailsModal = () => {
    const modalContainer = document.getElementById('clientDetailsModal');
    if (modalContainer) {
      modalContainer.style.display = 'none';
      modalContainer.innerHTML = ''; // Clear the modal content
    }
  };

  window.closeGigDetailsModal = () => {
    const modalContainer = document.getElementById('gigDetailsModal');
    if (modalContainer) {
        modalContainer.style.display = 'none';
        modalContainer.innerHTML = ''; // Clear the modal content
    }
};

  async function fetchGigDetails(id) {
    try {
        const response = await fetch(`/api/v1/gigs/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch gig details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching gig details:', error);
        return null;
    }
}


  // Placeholder functions for potential modal/detailed view
  window.viewFreelancerDetails = async (id) => {
    try {
      const { freelancer } = await fetchFreelancerDetails(id);

      if (!freelancer) {
        alert('Could not fetch freelancer details');
        return;
      }

      // Ensure reviews is an array, defaulting to empty array if undefined
      const reviews = Array.isArray(freelancer.reviews) ? freelancer.reviews : [];

      // Create modal content
      modalContainer.innerHTML = `
            <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 800px; max-height: 90%; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <h2>Freelancer Details</h2>
                    <button onclick="closeFreelancerDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <div style="display: flex; margin-top: 20px;">
                    <div style="width: 200px; margin-right: 20px;">
                        <img src="${freelancer.profilePic || freelancer.image1 || '/uploads/default.jpg'}" 
                             alt="${freelancer.name}" 
                             style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover;">
                    </div>
                    
                    <div style="flex-grow: 1;">
                        <h3>${freelancer.name}</h3>
                        <p><strong>Email:</strong> ${freelancer.email}</p>
                        <p><strong>Bio:</strong> ${freelancer.bio || 'No bio provided'}</p>
                        <p><strong>Skills:</strong> ${freelancer.skills ? freelancer.skills.join(', ') : 'No skills listed'}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Performance Overview</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px;">Average Rating</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Number of Reviews</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${freelancer.averageRating || 'N/A'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${freelancer.numOfReviews || 0}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Portfolio Images</h4>
                    <div style="display: flex; gap: 10px;">
                        ${['image1', 'image2', 'image3', 'image4']
          .filter(img => freelancer[img] && freelancer[img] !== '/uploads/default.jpg')
          .map(img => `
                                <img src="${freelancer[img]}" 
                                     alt="Portfolio Image" 
                                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                            `).join('')}
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4>Reviews (${reviews.length})</h4>
                    ${reviews.length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">Rating</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Title</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Comment</th>
                            </tr>
                            ${reviews.map(review => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${review.rating || 'N/A'}/5</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${review.title || 'No Title'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${review.comment || 'No Comment'}</td>
                                </tr>
                            `).join('')}
                        </table>
                    ` : '<p>No reviews yet</p>'}
                </div>
            </div>
        `;

      // Show the modal
      modalContainer.style.display = 'block';
    } catch (error) {
      console.error('Error in viewFreelancerDetails:', error);

      // Create an error modal
      modalContainer.innerHTML = `
            <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <h2>Error</h2>
                    <button onclick="closeFreelancerDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <p>An error occurred while fetching freelancer details. Please try again later.</p>
                <p>Error Details: ${error.message}</p>
            </div>
        `;
      modalContainer.style.display = 'block';
    }
  };

  window.viewClientDetails = async (id) => {
    try {
        const { client } = await fetchClientDetails(id);
        
        if (!client) {
            alert('Could not fetch client details');
            return;
        }

        // Ensure gigs is an array, defaulting to empty array if undefined
        const gigs = Array.isArray(client.gigs) ? client.gigs : [];

        // Create modal container if it doesn't exist
        let modalContainer = document.getElementById('clientDetailsModal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'clientDetailsModal';
            modalContainer.style.display = 'none';
            modalContainer.style.position = 'fixed';
            modalContainer.style.zIndex = '1000';
            modalContainer.style.left = '0';
            modalContainer.style.top = '0';
            modalContainer.style.width = '100%';
            modalContainer.style.height = '100%';
            modalContainer.style.overflow = 'auto';
            modalContainer.style.backgroundColor = 'rgba(0,0,0,0.4)';
            document.body.appendChild(modalContainer);

            // Add click outside to close
            modalContainer.addEventListener('click', (event) => {
                if (event.target === modalContainer) {
                    closeClientDetailsModal();
                }
            });
        }

        // Create modal content
        modalContainer.innerHTML = `
            <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 800px; max-height: 90%; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <h2>Client Details</h2>
                    <button onclick="closeClientDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                
                <div style="display: flex; margin-top: 20px;">
                    <div style="width: 200px; margin-right: 20px;">
                        <img src="${client.profilePic || '/uploads/default.jpg'}" 
                             alt="${client.name}" 
                             style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover;">
                    </div>
                    
                    <div style="flex-grow: 1;">
                        <h3>${client.name}</h3>
                        <p><strong>Email:</strong> ${client.email}</p>
                        <p><strong>Client ID:</strong> ${client.id}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Client's Gigs (${gigs.length})</h4>
                    ${gigs.length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">Title</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Budget</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                            </tr>
                            ${gigs.map(gig => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${gig.title || 'Untitled'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${gig.description || 'No description'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">$${gig.budget.toLocaleString() || 'N/A'}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${gig.status || 'Unknown'}</td>
                                </tr>
                            `).join('')}
                        </table>
                    ` : '<p>No gigs found</p>'}
                </div>
            </div>
        `;

        // Show the modal
        modalContainer.style.display = 'block';
    } catch (error) {
        console.error('Error in viewClientDetails:', error);
        
        // Create an error modal
        const modalContainer = document.getElementById('clientDetailsModal');
        modalContainer.innerHTML = `
            <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 600px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                    <h2>Error</h2>
                    <button onclick="closeClientDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <p>An error occurred while fetching client details. Please try again later.</p>
                <p>Error Details: ${error.message}</p>
            </div>
        `;
        modalContainer.style.display = 'block';
    }
};

window.viewGigDetails = async (id) => {
  try {
      const { gig } = await fetchGigDetails(id);
      
      if (!gig) {
          alert('Could not fetch gig details');
          return;
      }

      // Create modal container if it doesn't exist
      let modalContainer = document.getElementById('gigDetailsModal');
      if (!modalContainer) {
          modalContainer = document.createElement('div');
          modalContainer.id = 'gigDetailsModal';
          modalContainer.style.display = 'none';
          modalContainer.style.position = 'fixed';
          modalContainer.style.zIndex = '1000';
          modalContainer.style.left = '0';
          modalContainer.style.top = '0';
          modalContainer.style.width = '100%';
          modalContainer.style.height = '100%';
          modalContainer.style.overflow = 'auto';
          modalContainer.style.backgroundColor = 'rgba(0,0,0,0.4)';
          document.body.appendChild(modalContainer);

          // Add click outside to close
          modalContainer.addEventListener('click', (event) => {
              if (event.target === modalContainer) {
                  closeGigDetailsModal();
              }
          });
      }

      // Create modal content
      modalContainer.innerHTML = `
          <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 800px; max-height: 90%; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                  <h2>Gig Details</h2>
                  <button onclick="closeGigDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
              </div>
              
              <div style="margin-top: 20px;">
                  <h3>${gig.title}</h3>
                  <p><strong>Description:</strong> ${gig.description}</p>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                      <div>
                          <h4>Gig Details</h4>
                          <p><strong>Budget:</strong> $${gig.budget.toLocaleString()}</p>
                          <p><strong>Status:</strong> ${gig.status}</p>
                          <p><strong>Category:</strong> ${gig.category || 'Not specified'}</p>
                      </div>
                      
                      <div>
                          <h4>Client Information</h4>
                          <p><strong>Name:</strong> ${gig.client?.name || 'Not available'}</p>
                          <p><strong>Email:</strong> ${gig.client?.email || 'Not available'}</p>
                      </div>
                  </div>

                  <div style="margin-top: 20px;">
                      <h4>Skills Required</h4>
                      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                          ${gig.skills ? gig.skills.map(skill => 
                              `<span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 5px;">${skill}</span>`
                          ).join('') : 'No specific skills required'}
                      </div>
                  </div>

                  <div style="margin-top: 20px;">
                      <h4>Additional Information</h4>
                      <p><strong>Created At:</strong> ${new Date(gig.createdAt).toLocaleString()}</p>
                      <p><strong>Updated At:</strong> ${new Date(gig.updatedAt).toLocaleString()}</p>
                  </div>

                  ${gig.proposals && gig.proposals.length > 0 ? `
                      <div style="margin-top: 20px;">
                          <h4>Proposals (${gig.proposals.length})</h4>
                          <table style="width: 100%; border-collapse: collapse;">
                              <tr>
                                  <th style="border: 1px solid #ddd; padding: 8px;">Freelancer</th>
                                  <th style="border: 1px solid #ddd; padding: 8px;">Bid Amount</th>
                                  <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                              </tr>
                              ${gig.proposals.map(proposal => `
                                  <tr>
                                      <td style="border: 1px solid #ddd; padding: 8px;">${proposal.freelancer?.name || 'Anonymous'}</td>
                                      <td style="border: 1px solid #ddd; padding: 8px;">$${proposal.bidAmount.toLocaleString()}</td>
                                      <td style="border: 1px solid #ddd; padding: 8px;">${proposal.status}</td>
                                  </tr>
                              `).join('')}
                          </table>
                      </div>
                  ` : ''}
              </div>
          </div>
      `;

      // Show the modal
      modalContainer.style.display = 'block';
  } catch (error) {
      console.error('Error in viewGigDetails:', error);
      
      // Create an error modal
      const modalContainer = document.getElementById('gigDetailsModal');
      modalContainer.innerHTML = `
          <div style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 10px; width: 80%; max-width: 600px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                  <h2>Error</h2>
                  <button onclick="closeGigDetailsModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
              </div>
              <p>An error occurred while fetching gig details. Please try again later.</p>
              <p>Error Details: ${error.message}</p>
          </div>
      `;
      modalContainer.style.display = 'block';
  }
};
});

