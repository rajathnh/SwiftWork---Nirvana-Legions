document.getElementById('submitQuiz').addEventListener('click', function() {
    const quizForm = document.getElementById('quizForm');
    const answers = {
        q1: 'const',             // Declaring a non-reassignable variable
        q2: 'prototype',         // Mechanism for object inheritance
        q3: 'callback',          // Function passed as an argument
        q4: 'async',             // Handling asynchronous operations
        q5: 'promise',           // Object representing async operation
        q6: 'destructuring',     // Extracting values from arrays/objects
        q7: 'spread',            // Expanding elements of an array
        q8: 'closure',           // Function with access to outer scope
        q9: 'hoisting',          // Variable and function declaration behavior
        q10: 'module',           // Encapsulating code in separate files
        q11: 'this',             // Keyword referring to current context
      q12: 'map',               // Transforming array elements
      q13: 'filter',            // Selecting array elements based on condition
      q14: 'reduce',            // Reducing array to single value
      q15: 'async/await',       // Modern async programming syntax
      q16: 'push',              // Adding element to end of array
      q17: 'strict',            // Comparing value and type
      q18: 'symbol',            // Unique primitive data type
      q19: 'generator',         // Function that can be paused and resumed
      q20: 'proxy',             // Intercepting and customizing operations
      q21: 'weakmap',           // Map with weak references
      q22: 'decorator',         // Modifying class or method behavior
      q23: 'nullish',           // Checking for null or undefined
      q24: 'optional-chaining', // Safely accessing nested properties
      q25: 'bigint',            // Representing large integers
      q26: 'reflect',           // Metaprogramming operations
      q27: 'observable',        // Handling streams of data
      q28: 'temporal',          // Advanced date manipulation
      q29: 'set',               // Collection of unique values
      q30: 'arrowfunction'      // Concise function syntax
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
        fetch('http://localhost:5000/api/v1/test/submit-js-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                freelancerId: freelancerId, 
                testName: 'JavaScript Comprehensive', 
                score: score 
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Test result submitted successfully:', data);
            if (data.status === 'success') {
                alert(`Congratulations! You have passed the JavaScript test with a score of ${score}. Badge level: ${data.badge.level}`);
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