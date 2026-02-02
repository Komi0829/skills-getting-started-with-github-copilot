document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear existing activity options (keep the placeholder at index 0)
      while (activitySelect.options.length > 1) {
        activitySelect.remove(1);
      }

      // helper: get initials from name or email
      function getInitials(text) {
        if (!text) return "";
        // use part before @ for emails, otherwise use words
        const local = text.includes("@") ? text.split("@")[0] : text;
        const parts = local.split(/[\s._-]+/).filter(Boolean);
        if (parts.length === 1) {
          return parts[0].slice(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }

      // Populate activities list (use DOM methods to avoid injecting HTML)
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const h4 = document.createElement("h4");
        h4.textContent = name;
        activityCard.appendChild(h4);

        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        const sched = document.createElement("p");
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        activityCard.appendChild(sched);

        const avail = document.createElement("p");
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        activityCard.appendChild(avail);

        // Participants section (DOM-built)
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        const participantsTitle = document.createElement("strong");
        participantsTitle.textContent = `Participants (${details.participants.length}/${details.max_participants}):`;
        participantsSection.appendChild(participantsTitle);

        const ul = document.createElement("ul");
        ul.className = "participants-list";

        if (!details.participants || details.participants.length === 0) {
          const li = document.createElement("li");
          li.className = "no-participants";
          const row = document.createElement("div");
          row.className = "participant-row";
          const em = document.createElement("em");
          em.textContent = "No participants yet";
          row.appendChild(em);
          li.appendChild(row);
          ul.appendChild(li);
        } else {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            const row = document.createElement("div");
            row.className = "participant-row";
            const avatar = document.createElement("span");
            avatar.className = "avatar";
            avatar.textContent = getInitials(p);
            const nameSpan = document.createElement("span");
            nameSpan.className = "participant-name";
            nameSpan.textContent = p;
            row.appendChild(avatar);
            row.appendChild(nameSpan);
            li.appendChild(row);
            ul.appendChild(li);
          });
        }

        participantsSection.appendChild(ul);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
