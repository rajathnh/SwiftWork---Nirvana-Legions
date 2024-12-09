document.addEventListener('DOMContentLoaded', function () {
    const reviewForm = document.getElementById('review-form');
  
    if (reviewForm) {
      reviewForm.addEventListener('submit', async function (event) {
        // Prevent the default form submission (which appends data to the URL)
        event.preventDefault();
        console.log("Form submitted, sending review data...");
  
        // Collect form data
        const formData = {
          gigId: new URLSearchParams(window.location.search).get('gigId'), // Getting gigId from URL
          rating: document.getElementById('rating').value,
          efficiency: document.getElementById('efficiency').value,
          communication: document.getElementById('communication').value,
          qualityOfWork: document.getElementById('qualityOfWork').value,
          timeliness: document.getElementById('timeliness').value,
          title: document.getElementById('title').value,
          comment: document.getElementById('comment').value,
        };
  
        try {
          console.log("♨️FORM DATAAAAA♨️", formData);
          // Send the data to the server via fetch (POST request)
          const response = await fetch('http://localhost:5000/api/v1/review', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(formData), // Send data as JSON body
          });
  
          // Handle response
          if (response.ok) {
            const data = await response.json();
            console.log('Review submitted:', data);
            alert('Review Submitted Successfully')
            window.location.href = 'client-portfolio.html'; // Redirect to client portfolio page

          } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
          }
        } catch (error) {
          console.error('Error submitting review:', error);
          alert('An error occurred. Please try again.');
        }
      });
    }
  });
  