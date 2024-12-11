document.getElementById('submitQuiz').addEventListener('click', function() {
    const quizForm = document.getElementById('quizForm');
    const answers = {
      q1: 'correct', // Correct answer for question 1
      q2: 'correct', // Correct answer for question 2
      // Add other questions similarly
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
    document.getElementById('resultMessage').innerText = `Your score is: ${score}/${Object.keys(answers).length}`;
  
    // Send the score to the backend (example using fetch)
    fetch('/submitQuizResult', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score: score }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Result submitted successfully:', data);
      if (data.awardedBadge) {
        alert('Congratulations! You have been awarded a badge!');
      }
    })
    .catch(error => {
      console.error('Error submitting result:', error);
    });
  });
  