document.getElementById('submitQuiz').addEventListener('click', function() {
  const quizForm = document.getElementById('quizForm');
  const answers = {
      q1: 'html',      // What does HTML stand for?
      q2: 'tags',      // HTML documents are structured using what?
      q3: 'head',      // Where do you typically put meta information in an HTML document?
      q4: 'title',     // What tag defines the title of an HTML document?
      q5: 'body',      // Which tag contains the visible page content?
      q6: 'div',       // What tag is used for creating a generic container?
      q7: 'a',         // Which tag is used to create hyperlinks?
      q8: 'img',       // What tag is used to embed images?
      q9: 'ul',        // What tag creates an unordered list?
      q10: 'ol',       // What tag creates an ordered list?
      q11: 'table',    // What tag is used to create a table?
      q12: 'form',     // What tag is used to create an HTML form?
      q13: 'input',    // What tag creates form input fields?
      q14: 'semantic', // What type of HTML elements provide meaning to the content?
      q15: 'false',    // Can HTML be used to create interactive web pages without CSS?
      q16: 'encoding', // Purpose of meta charset tag
      q17: 'contenteditable', // Attribute to make element editable
      q18: 'aria-label', // Accessibility attribute for labeling
      q19: 'details', // HTML5 element for additional details
      q20: 'data', // Attribute for adding custom data
      q21: 'canvas', // HTML5 element for drawing graphics
      q22: 'download', // Attribute for downloadable links
      q23: 'picture', // Element for responsive images
      q24: 'dialog', // HTML5 modal dialog element
      q25: 'template', // HTML5 element for client-side templating
      q26: 'draggable', // Attribute to make element draggable
      q27: 'time', // Semantic HTML5 element for dates and times
      q28: 'mark', // Highlight text in HTML5
      q29: 'figure', // Semantic element for self-contained content
      q30: 'aside'     // Tangentially related content in HTML5
  };

  let score = 0;

  // Loop through the answers and check if they are correct
  for (const question in answers) {
      const selectedAnswer = quizForm.querySelector(`input[name="${question}"]:checked`);
      if (selectedAnswer && selectedAnswer.value === answers[question]) {
          score++;
      }
  }

  // Show the score on the page
  const resultMessage = document.getElementById('resultMessage');
  resultMessage.innerText = `Your score is: ${score}/${Object.keys(answers).length}`;
  
  // Determine passing criteria
  const passingScore = score >= 15; // Advanced level requires 24 or more

  if (passingScore) {
      // Get freelancer ID from localStorage
      const freelancerId = localStorage.getItem('swiftWork_ID');
      
      // Send the score to the backend
      fetch('http://localhost:5000/api/v1/test/submit-html-test', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              freelancerId: freelancerId, 
              testName: 'HTML Comprehensive', 
              score: score 
          }),
      })
      .then(response => response.json())
      .then(data => {
          console.log('Test result submitted successfully:', data);
          if (data.status === 'success') {
              alert(`Congratulations! You have passed the HTML test with a score of ${score}. Badge level: ${data.badge.level}`);
          }
      })
      .catch(error => {
          console.error('Error submitting test result:', error);
          alert('There was an error submitting your test result.');
      });
  } else {
      alert(`Sorry, you did not pass the test. You need to score at least 24 out of 30 to pass. Your score: ${score}`);
  }
});