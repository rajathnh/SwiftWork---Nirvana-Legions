// Fetch the swiftWork_ID from localStorage
const swiftWorkID = localStorage.getItem('swiftWork_ID');
console.log(swiftWorkID)
if (swiftWorkID) {
  // Construct the URL to get the client data
  const url = `http://localhost:5000/api/v1/client/${swiftWorkID}`;

  // Fetch the client data from the backend
  fetch(url)
    .then((response) => {
      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Failed to fetch client data.');
      }
      return response.json();
    })
    .then((data) => {
      // Log the data for debugging
      console.log('Client Data:', data);

      // Update the DOM with the client data
      document.getElementById('client-name').textContent = data.name;
      document.getElementById('client-email').textContent = data.email;

      // Check if profilePicPath exists and update the image
      if (data.profilePicPath) {
        const profilePic = document.getElementById('client-profile-pic');
        profilePic.src = `http://localhost:5000/${data.profilePicPath}`; // Adjust path if needed
        profilePic.style.display = 'block'; // Make the image visible
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      // Display error message to the user
      alert('Failed to fetch client data. Please try again.');
    });
} else {
  console.error('swiftWork_ID not found in localStorage.');
  alert('No client ID found. Please register or log in again.');
}
