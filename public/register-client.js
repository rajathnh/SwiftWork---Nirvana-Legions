const form = document.querySelector("form");
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-render-app.onrender.com"
    : "http://localhost:5000";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const profilePic = document.getElementById("profilePic").files[0]; // Get the file from the input field

  // Explicitly set the userRole as "Client" in localStorage
  

  // Retrieve the userRole from localStorage
 
  //console.log(userRole);
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  //formData.append("userRole", userRole); // Append userRole from localStorage to FormData
  if (profilePic) {
    formData.append("profilePic", profilePic); // Append profilePic to FormData
  }

  try {
    // Send the FormData to the server, which will automatically handle the file upload
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/register/client`,
      {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      }
    );

    const data = await response.json();
    console.log("♨️♨️ Response Data:", data);

    if (response.ok) {
      // Store the client ID in localStorage for future access
      const userId = data.newClient.id;
      //const userType = data.newClient.userType;
      localStorage.setItem("swiftWork_ID", userId);
      localStorage.setItem('swiftWork_role', 'client');
    
      alert(data.msg); // Show the success message

      // Redirect to client-portfolio.html or any other page after successful signup
      window.location.href = "client-portfolio.html";
    } else {
      alert(data.msg); // Handle errors from the server
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});
