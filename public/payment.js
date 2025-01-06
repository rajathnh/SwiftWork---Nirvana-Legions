document.getElementById('payButton').addEventListener('click', function () {
    // Show loading message while processing
    document.getElementById('loadingMessage').classList.remove('hidden');

    // Simulate payment process (In real scenario, replace with actual payment gateway logic)
    setTimeout(function () {
        // Hide loading message and show confirmation
        document.getElementById('loadingMessage').classList.add('hidden');
        alert('Payment successful! Your funds are escrowed.');
    }, 3000); // Simulating a 3-second delay for payment processing
});
