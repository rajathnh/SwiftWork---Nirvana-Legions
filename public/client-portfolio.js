document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const swiftWorkID =
    urlParams.get("clientId") || localStorage.getItem("swiftWork_ID");

  if (!swiftWorkID) {
    alert("No client ID found. Please log in.");
    window.location.href = "login.html";
    return;
  }

  const userRole = localStorage.getItem("swiftWork_role");
  const createGigButton = document.getElementById("create-gig-button");
  const editProfileButton = document.getElementById("edit-profile-button");

  // Display the "Create Gig" button only if the user is a client
  if (createGigButton) {
    createGigButton.style.display = userRole === "client" ? "block" : "none";
  }

  // Display the "Edit Profile" button only if the user is a client
  if (editProfileButton) {
    editProfileButton.style.display = userRole === "client" ? "block" : "none";

    // Event listener for the Edit Profile button
    editProfileButton.addEventListener("click", function () {
      // Redirect to the edit profile page with the clientId in the URL
      window.location.href = `client-update.html?clientId=${swiftWorkID}`;
    });
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/client/${swiftWorkID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        alert("Unauthorized access. Please log in again.");
        window.location.href = "login.html";
        return;
      }
      throw new Error("Failed to fetch client data.");
    }

    const data = await response.json();

    if (data.client) {
      document.getElementById(
        "client-name"
      ).innerHTML = `<h3 class="text-3xl font-bold mb-2">${data.client.name}</h3>`;
      document.getElementById(
        "client-email"
      ).innerHTML = `<p class="text-gray-700 text-lg">Email: ${data.client.email}</p>`;

      const profilePic = document.getElementById("profile-pic");
      if (profilePic) {
        profilePic.src = data.client.profilePic || "uploads/default.jpg";
      }

      const gigsContainer = document.getElementById("gigs-container");
      if (gigsContainer && data.client.gigs && data.client.gigs.length > 0) {
        // Categorize gigs by status
        const openGigs = data.client.gigs.filter(
          (gig) => gig.status === "open"
        );
        const assignedGigs = data.client.gigs.filter(
          (gig) => gig.status === "assigned"
        );
        const approvalPendingGigs = data.client.gigs.filter(
          (gig) => gig.status === "approval pending"
        );
        const completedGigs = data.client.gigs.filter(
          (gig) => gig.status === "completed"
        );

        // Helper function to display a gig category
        const displayGigCategory = (categoryTitle, gigs) => {
          const categoryDiv = document.createElement("div");
          categoryDiv.className = "category-section ";

          const heading = document.createElement("h3");
          heading.className = "text-xl font-semibold mb-2 mt-4";
          heading.textContent = categoryTitle;
          categoryDiv.appendChild(heading);

          if (gigs.length > 0) {
            gigs.forEach((gig) => {
              const gigCard = document.createElement("div");

              gigCard.innerHTML = `
               <div class="mt-5 p-6 bg-blue-300 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105">
    <h3 class="text-lg font-bold text-gray-800">${gig.title}</h3>
    <p class="text-gray-700 mt-2">Budget: ₹${gig.budget}</p>
    
    <a href="gig-details.html?gigId=${
      gig._id
    }" class="inline-block bg-blue-500 mt-4 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105">
        View Details
    </a>
    
    ${
      gig.status === "approval pending"
        ? `
        <button 
            onclick="location.href='review-form.html?gigId=${gig._id}'" 
            class="inline-block bg-blue-500 mt-4 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
        >
            Leave a Review
        </button>
    `
        : ""
    }
</div>

              `;
              categoryDiv.appendChild(gigCard);
            });
          } else {
            const noGigsMessage = document.createElement("p");
            noGigsMessage.className = "text-gray-500 mt-4";
            noGigsMessage.textContent = `No gigs available in the ${categoryTitle}.`;
            categoryDiv.appendChild(noGigsMessage);
          }

          gigsContainer.appendChild(categoryDiv);
        };

        // Display categorized gigs
        displayGigCategory("Unassigned Gigs", openGigs);
        displayGigCategory("Assigned Gigs", assignedGigs);
        displayGigCategory("Approval Pending Gigs", approvalPendingGigs);
        displayGigCategory("Completed Gigs", completedGigs);
      } else {
        const noGigsMessage = document.createElement("p");
        noGigsMessage.className = "text-gray-500 mt-4";
        noGigsMessage.textContent = "No gigs found for this client.";
        gigsContainer.appendChild(noGigsMessage);
      }
    }
  } catch (error) {
    console.error(error);
    alert("Failed to fetch client data.");
  }
});
