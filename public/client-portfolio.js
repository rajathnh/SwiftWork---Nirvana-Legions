document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    //const clientId = urlParams.get('clientId');
    const swiftWorkID =urlParams.get('clientId')|| localStorage.getItem('swiftWork_ID');
  
    // Check if the client ID exists in localStorage
    if (!swiftWorkID) {
      alert('No client ID found. Please log in.');
      window.location.href = 'login.html';
      return;
    }

    // Simulate role check (assume role is stored in localStorage or fetched from the backend)
    const userRole = localStorage.getItem('swiftWork_role'); // Stored during login

    // Show "Create Gig" button only if the user is a client
    const createGigButton = document.getElementById('create-gig-button');
    if (createGigButton) {
        if (userRole === 'client') {
            createGigButton.style.display = 'block';
        } else {
            createGigButton.style.display = 'none';
            console.log('User is not a client. Hiding Create Gig button.');
        }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/client/${swiftWorkID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Ensure the token is passed
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch client data.');
      }
  
      const data = await response.json();
  
      if (data.client) {
        // Update client name and email
        document.getElementById('client-name').textContent = `Name: ${data.client.name}`;
        document.getElementById('client-email').textContent = `Email: ${data.client.email}`;
  
        // Update profile picture (check if exists)
        const profilePic = document.getElementById('profile-pic');
        if (profilePic) {
            profilePic.src = data.client.profilePic || 'uploads/defaut.jpg'; // Default pic if not available
        }

        // Populate the gigs list (only if gigs exist)
        const gigsList = document.getElementById('gigs-list');
        if (gigsList && data.client.gigs && data.client.gigs.length > 0) {
            data.client.gigs.forEach((gig) => {
                const gigItem = document.createElement('li');
    
                // Add link to gig details
                const gigLink = document.createElement('a');
                gigLink.href = `gig-details.html?gigId=${gig._id}`;
                gigLink.textContent = `${gig.title} - Budget: $${gig.budget}`;
    
                gigItem.appendChild(gigLink);
                gigsList.appendChild(gigItem);
            });
        } else {
            alert('No gigs found for this client.');
        }
      } else {
        alert('Client data not found.');
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      alert('Error fetching client data.');
    }
});
