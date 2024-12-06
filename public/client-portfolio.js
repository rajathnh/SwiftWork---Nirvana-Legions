document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const swiftWorkID = urlParams.get('clientId') || localStorage.getItem('swiftWork_ID');

  if (!swiftWorkID) {
      alert('No client ID found. Please log in.');
      window.location.href = 'login.html';
      return;
  }

  const userRole = localStorage.getItem('swiftWork_role');
  const createGigButton = document.getElementById('create-gig-button');
  if (createGigButton) {
      createGigButton.style.display = userRole === 'client' ? 'block' : 'none';
  }

  try {
      const response = await fetch(`http://localhost:5000/api/v1/client/${swiftWorkID}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
      });

      if (!response.ok) {
          if (response.status === 401) {
              alert('Unauthorized access. Please log in again.');
              window.location.href = 'login.html';
              return;
          }
          throw new Error('Failed to fetch client data.');
      }

      const data = await response.json();

      if (data.client) {
          document.getElementById('client-name').textContent = `Name: ${data.client.name}`;
          document.getElementById('client-email').textContent = `Email: ${data.client.email}`;
          const profilePic = document.getElementById('profile-pic');
          if (profilePic) {
              profilePic.src = data.client.profilePic || 'uploads/default.jpg';
          }

          const gigsList = document.getElementById('gigs-list');
          if (gigsList && data.client.gigs && data.client.gigs.length > 0) {
              data.client.gigs.forEach((gig) => {
                  const gigItem = document.createElement('li');
                  const gigLink = document.createElement('a');
                  gigLink.href = `gig-details.html?gigId=${gig._id}`;
                  gigLink.textContent = `${gig.title} - Budget: $${gig.budget}`;
                  gigItem.appendChild(gigLink);
                  gigsList.appendChild(gigItem);
              });
          } else {
              gigsList.innerHTML = '<p>No gigs found for this client.</p>';
          }
      } else {
          alert('Client data not found.');
      }
  } catch (error) {
      console.error('Error fetching client data:', error);
      alert('Error fetching client data.');
  }
});
