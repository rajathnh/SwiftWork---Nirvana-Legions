document.addEventListener('DOMContentLoaded', () => {
    const freelancersTab = document.getElementById('freelancersTab');
    const clientsTab = document.getElementById('clientsTab');
    const gigsTab = document.getElementById('gigsTab');
    const freelancersSection = document.getElementById('freelancersSection');
    const clientsSection = document.getElementById('clientsSection');
    const gigsSection = document.getElementById('gigsSection');
  
    // Tab switching
    freelancersTab.addEventListener('click', () => {
      showSection(freelancersSection);
      fetchData('/api/vi/admin/getAllFreelancers', renderFreelancers);
    });
  
    clientsTab.addEventListener('click', () => {
      showSection(clientsSection);
      fetchData('/api/vi/admin/getAllClients', renderClients);
    });
  
    gigsTab.addEventListener('click', () => {
      showSection(gigsSection);
      fetchData('/api/vi/admin/getAllGigs', renderGigs);
    });
  
    function showSection(section) {
      [freelancersSection, clientsSection, gigsSection].forEach(sec => {
        sec.classList.add('hidden');
      });
      section.classList.remove('hidden');
    }
  
    async function fetchData(endpoint, callback) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        callback(data);
      } catch (error) {
        console.error('Failed to fetch data:', error.message);
      }
    }
  
    function renderFreelancers(data) {
      const table = document.getElementById('freelancersTable');
      table.innerHTML = data.freelancers
        .map(f => `<tr><td>${f._id}</td><td>${f.name}</td><td>${f.email}</td></tr>`)
        .join('');
    }
  
    function renderClients(data) {
      const table = document.getElementById('clientsTable');
      table.innerHTML = data.clients
        .map(c => `<tr><td>${c._id}</td><td>${c.name}</td><td>${c.email}</td></tr>`)
        .join('');
    }
  
    function renderGigs(data) {
      const table = document.getElementById('gigsTable');
      table.innerHTML = data.gigs
        .map(g => `<tr><td>${g.title}</td><td>${g.description}</td><td>${g.budget}</td></tr>`)
        .join('');
    }
  });
  