document.getElementById('submitQuiz').addEventListener('click', function() {
    const quizForm = document.getElementById('quizForm');
    const answers = {
        q1: 'Cascading Style Sheets',
        q2: '/* Comment */',
        q3: 'background-color',
        q4: '#header',
        q5: 'font-family',
        q6: 'font-weight: bold;',
        q7: 'margin',
        q8: 'p {}',
        q9: 'background-image: url(\'image.jpg\');',
        q10: 'static',
        q11: 'font-size',
        q12: 'padding',
        q13: 'text-align: center;',
        q14: 'display: none;',
        q15: 'color: red;',
        q16: "Control the stacking order of elements",
        q17: "width",
        q18: "display: inline;",
        q19: "padding",
        q20: "color",
        q21: "static",
        q22: "font-family",
        q23: "text-shadow",
        q24: "div p",
        q25: "margin",
        q26: "text-align",
        q27: ".highlight",
        q28: "border: 1px solid black;",
        q29: "display: inline;",
        q30: "To position elements nextto each other"
        // Add all other correct answers for q16 to q30...
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
        fetch('http://localhost:5000/api/v1/test/submit-css-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                freelancerId: freelancerId, 
                testName: 'CSS Comprehensive', 
                score: score 
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Test result submitted successfully:', data);
            if (data.status === 'success') {
                alert(`Congratulations! You have passed the CSS test with a score of ${score}. Badge level: ${data.badge.level}`);
                
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
  