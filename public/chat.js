const API_BASE_URL =
  window.location.hostname === "localhost" // If on localhost
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";
document.addEventListener("DOMContentLoaded", function () {
  // Extract gigId from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const gigId = urlParams.get("gigId");

  if (!gigId) {
    alert("No gig ID found. Please select a valid gig.");
    window.location.href = "gig-details.html"; // Redirect if gigId is missing
    return;
  }

  const socket = io(`${API_BASE_URL}`); // Connect to your server

  // Dynamic sender information from localStorage
  const senderId = localStorage.getItem("swiftWork_ID");
  const senderType = localStorage.getItem("swiftWork_role") || "freelancer"; // Default to 'freelancer' if not set
  console.log(senderId);
  console.log(senderType);
  if (!senderId) {
    alert("User is not logged in. Please log in to continue.");
    window.location.href = "login.html"; // Redirect to login if senderId is missing
    return;
  }

  // Join the chat room using the gigId from the URL
  socket.emit("joinRoom", gigId);

  // Handle incoming messages
  socket.on("receiveMessage", (message) => {
    console.log("Message received:", message);
    displayMessage(message);
  });

  // Fetch chat history when joining the room
  socket.on("chatHistory", (messages) => {
    messages.forEach((message) => {
      displayMessage(message);
    });
  });

  // Display message in the chat UI
  function displayMessage(message) {
    const messageContainer = document.getElementById("messages");

    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "message",
      message.senderType === senderType ? "sent" : "received" // Differentiate sender
    );

    // Display text content
    const contentElement = document.createElement("div");
    contentElement.classList.add("content");
    contentElement.innerText = message.text;
    messageElement.appendChild(contentElement);

    // Display attachments with different file types
    if (message.attachments && message.attachments.length > 0) {
      const attachmentContainer = document.createElement("div");
      attachmentContainer.classList.add("attachments");
      message.attachments.forEach((attachment) => {
        const fileExtension = attachment.url.split(".").pop().toLowerCase();

        let previewElement;
        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          previewElement = document.createElement("img");
          previewElement.src = attachment.url;
          previewElement.alt = "Attachment preview";
          previewElement.classList.add("attachment-preview");
        } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
          previewElement = document.createElement("video");
          previewElement.src = attachment.url;
          previewElement.controls = true;
          previewElement.classList.add("attachment-preview");
        } else {
          previewElement = document.createElement("a");
          previewElement.href = attachment.url;
          previewElement.textContent = "Download attachment";
          previewElement.classList.add("attachment-link");
        }

        attachmentContainer.appendChild(previewElement);
      });
      messageElement.appendChild(attachmentContainer);
    }

    // Append message to the message container
    messageContainer.appendChild(messageElement);

    // Scroll to the bottom of the messages only if near the bottom
    const atBottom = messageContainer.scrollHeight - messageContainer.clientHeight <= messageContainer.scrollTop + 1;
    messageContainer.scrollTop = messageContainer.scrollHeight;

    if (!atBottom) {
      messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
  }

  // Send a message
  document
    .getElementById("message-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const messageInput = document.getElementById("message-input");
      const messageText = messageInput.value.trim();
      const fileInput = document.getElementById("file-input"); // File input

      if (!messageText && fileInput.files.length === 0) {
        alert("Message cannot be empty!");
        return;
      }

      // Upload files and send message
      const attachments = await uploadFiles(fileInput.files);
      if (attachments.length === 0 && !messageText) {
        alert("You must provide either a message or an attachment!");
        return;
      }

      sendActualMessage(messageText, attachments);

      // Clear inputs after sending
      messageInput.value = "";
      fileInput.value = "";
    });

  // Function to upload files and return attachment data
  async function uploadFiles(files) {
    const attachments = [];
    if (files && files.length > 0) {
      // Show loading indicator
      document.getElementById("loading-indicator").style.display = "block";

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file); // Changed to "file" to match the server-side expectation

        try {
          const response = await fetch("/api/v1/chat/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (data && data.url) {
            attachments.push({ url: data.url, public_id: data.public_id });
          } else {
            console.error("Error uploading file:", data);
          }
        } catch (err) {
          console.error("Error uploading file:", err);
        }
      }

      // Hide loading indicator after upload
      document.getElementById("loading-indicator").style.display = "none";
    }
    return attachments;
  }

  // Function to send the actual message
  function sendActualMessage(messageText, attachments) {
    const messageData = {
      gigId: gigId, // Include gigId with the message
      text: messageText,
      timestamp: new Date().toISOString(),
      senderId: senderId, // Sender ID
      senderType: senderType, // Sender type (freelancer/client)
      attachments: attachments, // Attachments data
    };

    console.log("Message Data before emitting:", messageData); // Debug log
    socket.emit("sendMessage", messageData, (response) => {
      if (response.error) {
        console.error("Error sending message:", response.error);
        alert("Failed to send message. Please try again.");
      } else {
        console.log("Message sent successfully");
      }
    });
  }

  // Socket error handling
  socket.on("connect_error", (error) => {
    console.error("Connection failed:", error);
    alert("Connection failed. Please try again later.");
  });
});
