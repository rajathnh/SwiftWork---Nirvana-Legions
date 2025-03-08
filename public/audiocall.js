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
const localAudio = document.getElementById("localAudio");
const remoteAudio = document.getElementById("remoteAudio");
const endCallButton = document.getElementById("end-call");

let localStream;
let remoteStream;
let peerConnection;
let isOfferer = false;

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

window.onload = () => {
  console.log("🚀 Page Loaded! Starting video call...");
  startCall();
};

const constraints = {
  video: false, // Disable video for audio-only calls
  audio: true,
};


async function startCall() {
  console.log("🔹 Starting audio call...");
  try {
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Microphone Access Granted:", localStream);

      localAudio.srcObject = localStream;
      localAudio.play().catch(e => console.error("❌ Local audio play error:", e));

      setupAudioPeerConnection();
      socket.emit("join-room", gigId);
  } catch (error) {
      console.error("❌ Microphone Access Error:", error);
      alert("Microphone access failed: " + error.message);
  }
}


socket.on("offer", async ({ offer }) => {
  if (!peerConnection) setupAudioPeerConnection(); // 🔹 Use audio setup for audio calls
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", { gigId, answer });
});

socket.on("answer", async ({ answer }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

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

socket.on("start-offer", async () => {
  console.log("Starting offer...");

  if (!peerConnection) setupPeerConnection();

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", { gigId, offer });
});


function setupAudioPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    remoteAudio.srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        console.log("🎙️ Remote audio track received:", event.streams[0]);

        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });

        remoteAudio.srcObject = remoteStream;
        remoteAudio.play().catch(e => console.error("❌ Remote audio play error:", e));
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", { gigId, candidate: event.candidate });
        }
    };
}


document.getElementById("muteBtn").addEventListener("click", () => {
  localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
});

document.getElementById("endCallBtn").addEventListener("click", () => {
  if (peerConnection) peerConnection.close();
  if (localStream) localStream.getTracks().forEach(track => track.stop());

  localAudio.srcObject = null;
  remoteAudio.srcObject = null;

  socket.emit("leave-room", gigId);
  window.location.href = `chat.html?gigId=${gigId}`;
});

