import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const socket = io("http://localhost:5000"); // Replace with your backend URL

const VideoChat = ({ gigId }) => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const [peer, setPeer] = useState(null);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("My peer ID:", id);
      setPeerId(id);
      socket.emit("joinRoom", gigId);
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          myVideoRef.current.srcObject = stream;
          call.answer(stream);

          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        });
    });

    return () => {
      newPeer.destroy();
    };
  }, [gigId]);

  const startCall = () => {
    if (!remotePeerId) return alert("Enter a Peer ID to call");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideoRef.current.srcObject = stream;
        const call = peer.call(remotePeerId, stream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
  };

  return (
    <div>
      <h2>Video Chat for Gig ID: {gigId}</h2>
      <video ref={myVideoRef} autoPlay muted style={{ width: "300px" }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />

      <input
        type="text"
        placeholder="Enter remote Peer ID"
        onChange={(e) => setRemotePeerId(e.target.value)}
      />
      <button onClick={startCall}>Start Call</button>
    </div>
  );
};

export default VideoChat;
