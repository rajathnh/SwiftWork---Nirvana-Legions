document.getElementById('submitQuiz').addEventListener('click', function() {
    const quizForm = document.getElementById('quizForm');
    const answers = {
      q1: 'html',      // What does HTML stand for?
      q2: 'a',                             // Which tag is used to create a hyperlink in HTML?
      q3: 'img',                           // What is the correct way to specify an image in HTML?
      q4: 'h1',                            // Which tag is used to define the largest heading?
      q5: 'ol',                            // Which tag is used to create an ordered list?
      q6: 'break',                         // What does the <br> tag do?
      q7: 'tr',                             // Which tag is used to create a table row?
      q8: 'style',                         // Which attribute specifies an inline CSS style?
      q9: 'comment',                       // What is the correct way to create a comment in HTML?
      q10: 'video',  
      q11: 'checkbox',                      // What is the correct HTML for making a checkbox?
      q12: 'id',                             // Which attribute is used to specify a unique identifier for an HTML element?
      q13: 'audio',                          // What is the correct HTML element for playing audio files?
      q14: 'description',                    // What is the purpose of the <alt> attribute in the <img> tag?
      q15: 'footer',                         // Which HTML element is used to specify a footer for a document or section?
      q16: 'encoding',                       // What is the purpose of the <meta charset="UTF-8"> tag?
      q17: 'contenteditable',                // Which attribute is used to make an element editable?
      q18: 'br',                             // What is the correct HTML element for inserting a line break?
      q19: 'ul',                             // Which tag is used to define an unordered list?
      q20: 'target',                      // Attribute for adding custom data
      q21: 'em',                           // What is the correct HTML element to define emphasized text?
      q22: 'form',                         // What is the purpose of the <label> element in HTML?
      q23: 'form',                         // Which tag is used to create a form in HTML?
      q24: 'embed',                        // What does the <iframe> tag do in HTML?
      q25: 'select',                       // Which tag is used to create a dropdown list in HTML?
      q26: 'pageTitle',                    // What is the purpose of the <title> tag in HTML?
      q27: 'comment',                      // Which tag is used to create a comment in HTML?
      q28: 'navigation',                   // What does the <nav> tag represent in HTML?
      q29: 'main',                         // Which tag is used to define the main content of the document?
      q30: 'aside'   
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
                
                // Redirect to the freelancer profile page
                window.location.href = 'http://localhost:5000/freelancer-profile.html'; // Adjust this path based on your profile URL
            }
        })
        .catch(error => {
            console.error('Error submitting test result:', error);
            alert('There was an error submitting your test result.');
        });
    } else {
        alert(`Sorry, you did not pass the test. You need to score at least 24 out of 30 to pass. Your score: ${score}`);
        window.location.href = 'http://localhost:5000/freelancer-profile.html';
        // Adjust this path based on your profile URL
    }
  });
  