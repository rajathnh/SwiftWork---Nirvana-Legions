document.getElementById('submitQuiz').addEventListener('click', function() {
    const quizForm = document.getElementById('quizForm');
    const answers = {
        q1: 'cascadingstylesheet',   // What does CSS stand for?
        q2: 'selector',              // Basic unit for applying styles
        q3: 'inline',                // Highest priority CSS method
        q4: 'external',              // Recommended way to add CSS
        q5: 'universal',             // Selector that matches all elements
        q6: 'class',                 // Selector with a dot prefix
        q7: 'id',                    // Unique identifier selector
        q8: 'specificity',           // How browsers decide which CSS rule to apply
        q9: 'inherit',               // CSS value that takes parent's value
        q10: 'cascade',              // How styles are applied in order of priority
        q11: 'pseudo-class',         // Selects elements in a special state
        q12: 'box-model',            // CSS model describing element layout
        q13: 'margin',               // Space outside element's border
        q14: 'padding',              // Space inside element's border
        q15: 'transform',            // Property for 2D/3D transformations
        q16: 'flex',                 // Flexible container display type
        q17: 'border-radius',        // Rounded corners property
        q18: 'media-query',          // Responsive design technique
        q19: 'grid',                 // Two-dimensional layout system
        q20: 'position',             // How an element is positioned
        q21: 'flexbox',              // One-dimensional layout method
        q22: 'animation',            // CSS property for creating animations
        q23: 'transition',           // Smooth change between states
        q24: 'z-index',              // Stacking order of positioned elements
        q25: 'filter',               // Visual effects on elements
        q26: 'opacity',              // Transparency of an element
        q27: 'gradient',             // Color transition in CSS
        q28: 'variables',            // Custom property in CSS
        q29: 'calc()',               // Mathematical calculations in CSS
        q30: 'percent'               // Percentage of parent width
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