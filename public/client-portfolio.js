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
  if (createGigButton) {
    createGigButton.style.display = userRole === "client" ? "block" : "none";
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
      document.getElementById("client-name").innerHTML = `<h3 class="text-3xl font-bold mb-2">${data.client.name}</h3>`;
      document.getElementById("client-email").innerHTML = `<p class="text-gray-700 text-lg">Email: ${data.client.email}</p>`;

      const profilePic = document.getElementById("profile-pic");
      if (profilePic) {
        profilePic.src = data.client.profilePic || "uploads/default.jpg";
      }

      const gigsContainer = document.getElementById("gigs-container");
      if (gigsContainer && data.client.gigs && data.client.gigs.length > 0) {
        // Categorize gigs by status
        const openGigs = data.client.gigs.filter((gig) => gig.status === "open");
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
          if (gigs.length > 0) {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "category-section";

            const heading = document.createElement("h3");
            heading.className = "text-xl font-semibold mb-2 mt-4";
            heading.textContent = categoryTitle;
            categoryDiv.appendChild(heading);

            gigs.forEach((gig) => {
              const gigCard = document.createElement("div");
              gigCard.className = "bg-white p-4 rounded-lg shadow-md w-3/5";

              gigCard.innerHTML = `
                <div>
                  <h3 class="text-lg font-bold">${gig.title}</h3>
                  <p class="text-gray-700">Budget: $${gig.budget}</p>
                  <a href="gig-details.html?gigId=${gig._id}" class="view-details inline-block bg-blue-500 mt-4 text-white px-4 py-2 rounded hover:bg-blue-700">
                    View Details
                  </a>
                  <!-- Review Button -->
                  ${gig.status === 'approval pending' ? `<button onclick="window.location.href='review-form.html?gigId=${gig._id}'" class="review-button bg-green-500 mt-4 text-white px-4 py-2 rounded hover:bg-green-700">
                    Leave a Review
                  </button>` : ''}
                </div>
              `;
              categoryDiv.appendChild(gigCard);
            });

            gigsContainer.appendChild(categoryDiv);
          } else {
            const noGigsMessage = document.createElement("p");
            noGigsMessage.className = "text-gray-500 mt-4";
            noGigsMessage.textContent = `No gigs available in the ${categoryTitle}.`;
            gigsContainer.appendChild(noGigsMessage);
          }
        };

        // Display categorized gigs
        displayGigCategory("Open Gigs", openGigs);
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
