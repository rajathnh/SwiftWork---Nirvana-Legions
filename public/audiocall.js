const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const gigId = urlParams.get("gigId");

if (!gigId) {
  alert("No gig ID found. Please select a valid gig.");
  window.location.href = "gig-details.html"; // Redirect if gigId is missing
}

const socket = io(API_BASE_URL); // Connect to the server
const localAudio = document.getElementById("local-audio");
const remoteAudio = document.getElementById("remote-audio");
const endCallButton = document.getElementById("end-call");

let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const constraints = {
  video: false, // Disable video for audio-only calls
  audio: true,
};

// Start the call when the page loads
startCall();

async function startCall() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localAudio.srcObject = localStream;

    peerConnection = new RTCPeerConnection(servers);

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
      remoteAudio.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { gigId, candidate: event.candidate });
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { gigId, offer });
  } catch (error) {
    console.error("Error starting call:", error);
  }
}

// Handle incoming offer
socket.on("offer", async ({ gigId, offer }) => {
  if (!peerConnection) {
    peerConnection = new RTCPeerConnection(servers);

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
      remoteAudio.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { gigId, candidate: event.candidate });
      }
    };
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", { gigId, answer });
});

// Handle incoming answer
socket.on("answer", async ({ gigId, answer }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle incoming ICE candidates
socket.on("ice-candidate", async ({ gigId, candidate }) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding received ICE candidate:", error);
  }
});

// End the call
endCallButton.addEventListener("click", endCall);

function endCall() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }
  localAudio.srcObject = null;
  remoteAudio.srcObject = null;
  window.location.href = `chat.html?gigId=${gigId}`; // Redirect back to the chat room
}