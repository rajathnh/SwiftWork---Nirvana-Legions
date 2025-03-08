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
      feedback.textContent = " ";
    }
  });

  // Function to determine API URL (local or deployed)
  function getApiUrl() {
    const localUrl = "http://localhost:5001/predict";  // Updated port
    const deployedUrl = "https://quicklance.onrender.com/predict";
    
    return window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? localUrl
        : deployedUrl;
}
  // submitDetails function
  async function submitDetails(event) {
    if (event) event.preventDefault();

    console.log("submitDetails function triggered");

    const description = document.getElementById("description").value;
    const deadline = document.getElementById("deadline").value;

    console.log("Description:", description);
    console.log("Deadline:", deadline);

    if (!description || !deadline) {
      alert("Please fill in both description and deadline.");
      return;
    }

    if (description.length < 35) {
      alert("Description must be at least 35 characters long.");
      return;
    }

    const currentDate = new Date();
    const selectedDate = new Date(deadline);
    if (selectedDate <= currentDate) {
      alert("Please select a future date for the deadline.");
      return;
    }

    try {
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "Calculating price...";

      // Dynamically determine the API URL
      const apiUrl = getApiUrl();
      console.log("Using API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, deadline }),
      });

      const data = await response.json();

      if (response.ok) {
        resultDiv.innerHTML = `
            <p class="text-white font-bold">Total Price: INR ${data.totalPrice}</p>
          `;
      } else {
        resultDiv.innerHTML = `<p class="text-red-500">Error: ${data.error}</p>`;
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("result").innerHTML =
        '<p class="text-red-500 font-bold">Something went wrong. Please try again.</p>';
    }
  }
});
