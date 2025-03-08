const API_BASE_URL =
  window.location.hostname === "localhost" // If on localhost
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/gigs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Projects");
    }

    const result = await response.json();
    const gigList = document.getElementById("gig-list");
    const budgetFilter = document.getElementById("budget-filter");
    const deadlineSort = document.getElementById("deadline-sort");
    const budgetSort = document.getElementById("budget-sort");
    const resetFiltersBtn = document.getElementById("reset-filters");

    if (!gigList) {
      console.error("Element with id 'gig-list' not found in the DOM");
      return;
    }

    // Filter gigs to include only those with status: "open"
    const allGigs = result.gigs.filter((gig) => gig.status === "open");

    // Initial render of gigs
    renderGigs(allGigs);

    // Setup filter and sort event listeners
    setupFilterAndSort();

    function renderGigs(gigsToRender) {
      // Clear existing gigs
      gigList.innerHTML = "";

      if (gigsToRender.length === 0) {
        gigList.innerHTML = '<p class="text-center">No gigs available.</p>';
        return;
      }

      gigsToRender.forEach((gig) => {
        const gigCard = document.createElement("div");
        gigCard.classList.add("gig-card");

        // Add title
        const title = document.createElement("h3");
        const titleLink = document.createElement("a");
        titleLink.textContent = gig.title;
        titleLink.href = `gig-details.html?gigId=${gig._id}`;
        titleLink.classList.add("gig-title-link");
        title.appendChild(titleLink);
        gigCard.appendChild(title);

        // Add budget
        const budget = document.createElement("p");
        budget.classList.add("gig-budget");
        budget.textContent = `Budget: ₹${gig.budget}`;
        gigCard.appendChild(budget);

        // Add deadline
        const deadline = document.createElement("p");
        deadline.classList.add("gig-deadline");
        deadline.textContent = `Deadline: ${new Date(
          gig.deadline
        ).toLocaleDateString()}`;
        gigCard.appendChild(deadline);

        // Append the gig card to the list
        gigList.appendChild(gigCard);
      });
    }

    function setupFilterAndSort() {
      // Add event listeners for filtering and sorting
      if (budgetFilter)
        budgetFilter.addEventListener("input", filterAndSortGigs);
      if (deadlineSort)
        deadlineSort.addEventListener("change", filterAndSortGigs);
      if (budgetSort) budgetSort.addEventListener("change", filterAndSortGigs);
      if (resetFiltersBtn)
        resetFiltersBtn.addEventListener("click", resetFilters);
    }

    function resetFilters() {
      // Reset form elements to default
      if (budgetFilter) budgetFilter.value = "";
      if (deadlineSort) deadlineSort.value = "";
      if (budgetSort) budgetSort.value = "";

      // Render all gigs
      renderGigs(allGigs);
    }

    function filterAndSortGigs() {
      const maxBudgetValue = budgetFilter ? budgetFilter.value : "";
      const deadlineSortValue = deadlineSort ? deadlineSort.value : "";
      const budgetSortValue = budgetSort ? budgetSort.value : "";

      // Filter by budget
      let filteredGigs = allGigs.filter(
        (gig) =>
          maxBudgetValue === "" || gig.budget <= parseFloat(maxBudgetValue)
      );

      // Sort by deadline
      if (deadlineSortValue === "nearest") {
        filteredGigs.sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        );
      } else if (deadlineSortValue === "farthest") {
        filteredGigs.sort(
          (a, b) => new Date(b.deadline) - new Date(a.deadline)
        );
      }

      // Sort by budget
      if (budgetSortValue === "low-to-high") {
        filteredGigs.sort((a, b) => a.budget - b.budget);
      } else if (budgetSortValue === "high-to-low") {
        filteredGigs.sort((a, b) => b.budget - a.budget);
      }

      // Render filtered and sorted gigs
      renderGigs(filteredGigs);
    }
  } catch (error) {
    console.error("Error fetching Projects:", error);
    alert("Error fetching Projects");
  }
});
