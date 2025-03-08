document.addEventListener("DOMContentLoaded", function () {
  // Attach event listener to the "Estimate Price" button
  document
    .getElementById("estimateButton")
    .addEventListener("click", submitDetails);

  // Add real-time feedback for description input
  document.getElementById("description").addEventListener("input", function () {
    const description = this.value;
    const feedback = document.getElementById("description-feedback");

    if (description.length < 35) {
      feedback.textContent = `Description must be at least 35 characters long. (${description.length}/35)`;
      feedback.style.color = "red";
    } else {
      feedback.textContent = "  ";
    }
  });

  // submitDetails function
  async function submitDetails(event) {
    // Prevent default behavior if part of a form
    if (event) event.preventDefault();

    // Debugging log
    console.log("submitDetails function triggered");

    // Get values from input elements
    const description = document.getElementById("description").value;
    const deadline = document.getElementById("deadline").value;

    // Debugging logs to confirm values
    console.log("Description:", description);
    console.log("Deadline:", deadline);

    // Validate inputs
    if (!description || !deadline) {
      alert("Please fill in both description and deadline.");
      return;
    }

    // Validate description length (minimum 35 characters)
    if (description.length < 35) {
      alert("Description must be at least 35 characters long.");
      return;
    }

    // Validate deadline to ensure it's a future date
    const currentDate = new Date();
    const selectedDate = new Date(deadline);
    if (selectedDate <= currentDate) {
      alert("Please select a future date for the deadline.");
      return;
    }

    try {
      // Show a loading indicator (optional)
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "Calculating price...";

      // Send data to the backend route
      const response = await fetch("https://quicklance.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, deadline }),
      });

      // Parse the JSON response
      const data = await response.json();

      // Display the result
      if (response.ok) {
        resultDiv.innerHTML = `
            <p class="text-white font-bold">Total Price: INR ${data.totalPrice}</p>
          `;
      } else {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${data.error}</p>`;
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error:", error);
      document.getElementById("result").innerHTML =
        '<p class="text-red-500 font-bold">Something went wrong. Please try again.</p>';
    }
  }
});
