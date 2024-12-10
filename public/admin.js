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

  // Placeholder functions for potential modal/detailed view
  window.viewFreelancerDetails = (id) => {
      // Implement modal or detailed view for freelancer
      console.log(`Viewing details for freelancer ${id}`);
  };

  window.viewClientDetails = (id) => {
      // Implement modal or detailed view for client
      console.log(`Viewing details for client ${id}`);
  };

  window.viewGigDetails = (id) => {
      // Implement modal or detailed view for gig
      console.log(`Viewing details for gig ${id}`);
  };
});