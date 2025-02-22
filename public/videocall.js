const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://swiftwork.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const gigId = urlParams.get("gigId");

if (!gigId) {
    alert("No gig ID found. Please select a valid gig.");
    window.location.href = "gig-details.html";
}

const socket = io(API_BASE_URL); // Connect to server
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let remoteStream;
let peerConnection;
let isOfferer = false; // Determines if user is offerer or answerer

const servers = {
    iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
};

window.onload = () => {
  console.log("🚀 Page Loaded! Starting video call...");
  startCall();
};


const constraints = { video: true, audio: true };

// ✅ Function to Start Call
async function startCall() {
  console.log("🔹 Start Call initiated...");
  try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      console.log("✅ Camera Access Granted:", localStream);
      
      localVideo.srcObject = localStream;
      localVideo.play().catch(e => console.error("❌ Local video play error:", e));

      // 🔹 Fix: Ensure peerConnection is set up before joining the room
      setupPeerConnection();  

      socket.emit("join-room", gigId);
  } catch (error) {
      console.error("❌ Camera Access Error:", error);
      alert("Camera access failed: " + error.message);
  }
}



// ✅ Handle Incoming Offer
socket.on("offer", async ({ offer }) => {
  console.log("🔹 Offer received!");

  if (!peerConnection) setupPeerConnection(); // 🔹 Ensure peerConnection is created

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  console.log("✅ Remote Description Set!");

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log("✅ Answer Created:", answer);

  socket.emit("answer", { gigId, answer });
});


// ✅ Handle Incoming Answer
socket.on("answer", async ({ answer }) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// ✅ Handle ICE Candidates
socket.on("ice-candidate", async ({ candidate }) => {
  console.log("🔹 ICE Candidate Received:", candidate);
  try {
      if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("✅ ICE Candidate Added Successfully!");
      } else {
          console.error("❌ No Peer Connection to Add ICE Candidate!");
      }
  } catch (error) {
      console.error("❌ Error adding received ICE candidate:", error);
  }
});

// ✅ Ensure Offerer Sends an Offer
socket.on("start-offer", async () => {
    console.log("Starting offer...");

    if (!peerConnection) setupPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { gigId, offer });
});

// ✅ Setup Peer Connection
function setupPeerConnection() {
  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  // 🔹 Add all local tracks (video + audio)
  localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
  });

  // 🔹 Receive remote tracks
  peerConnection.ontrack = (event) => {
      console.log("🎥 Remote track received:", event.streams[0]);

      event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
      });

      remoteVideo.srcObject = remoteStream;
      remoteVideo.play().catch(e => console.error("❌ Remote video play error:", e));
  };

  peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
          socket.emit("ice-candidate", { gigId, candidate: event.candidate });
      }
  };
}


// ✅ Mute Audio/Video Controls
document.getElementById("muteAudioBtn").addEventListener("click", () => {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
});

document.getElementById("muteVideoBtn").addEventListener("click", () => {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
});

// ✅ End Call Handling
document.getElementById("endCallBtn").addEventListener("click", () => {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    socket.emit("leave-room", gigId);
    window.location.href = `chat.html?gigId=${gigId}`;
});
