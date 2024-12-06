const socket = io('http://localhost:5000'); // Connect to your server

// Assume gigId is available (you can retrieve it from URL params or your app's state)
const gigId = "6742c51a82d4bca8be3d8fff"; // Example gigId, replace it with actual gigId from your app

// Join the chat room based on the gigId
socket.emit('joinRoom', gigId);

// Handle incoming messages
socket.on('receiveMessage', (message) => {
  console.log('Message received:', message);
  displayMessage(message);
});

// Display message in the chat UI
function displayMessage(message) {
  const messageContainer = document.getElementById('messages');
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', message.sender === "freelancer" ? 'sent' : 'received'); // Differentiate sender
    
  // Display text content
  const contentElement = document.createElement('div');
  contentElement.classList.add('content');
  contentElement.innerText = message.text;
  messageElement.appendChild(contentElement);

  // Display attachments
  if (message.attachments && message.attachments.length > 0) {
    const attachmentContainer = document.createElement('div');
    attachmentContainer.classList.add('attachments');
    message.attachments.forEach((attachment) => {
      const previewElement = document.createElement('img');
      previewElement.src = attachment.url;
      previewElement.alt = 'Attachment preview';
      previewElement.classList.add('attachment-preview');
      attachmentContainer.appendChild(previewElement);
    });
    messageElement.appendChild(attachmentContainer);
  }
  
  // Append message to the message container
  messageContainer.appendChild(messageElement);

  // Scroll to the bottom of the messages
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Send a message
document.getElementById('message-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const messageInput = document.getElementById('message-input');
  const messageText = messageInput.value.trim();
  const fileInput = document.getElementById('file-input'); // File input

  if (messageText || fileInput.files.length > 0) {
    sendMessage(messageText, fileInput.files); // Send message with text and attachments
  }

  messageInput.value = ''; // Clear input field
  fileInput.value = ''; // Clear file input
});

// Send a message with optional attachments
function sendMessage(messageText, files) {
  const attachments = [];

  // If there are files, create the attachment objects
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      const formData = new FormData();
      formData.append('attachment', file);  // Assuming your server handles 'attachment' key

      // Send the file to your backend (this can be handled via a separate socket or API call)
      fetch('/api/v1/chat/upload', { 
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data && data.url) {
          attachments.push({ url: data.url, public_id: data.public_id });
          sendActualMessage(messageText, attachments); // Now, send the message with attachments
        }
      })
      .catch(err => console.error('Error uploading file:', err));
    });
  } else {
    sendActualMessage(messageText, attachments); // Send message without attachments
  }
}

// Function to send the actual message after file is uploaded
function sendActualMessage(messageText, attachments) {
  const messageData = {
    gigId: gigId,  // Include gigId with the message
    text: messageText,
    timestamp: new Date().toISOString(),
    sender: "freelancer", // Assuming freelancer sends the message (this should be dynamic)
    attachments: attachments, // Attachments data
  };
  socket.emit('sendMessage', messageData); // Emit message to server
}
