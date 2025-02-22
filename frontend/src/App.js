import React from "react";
import VideoChat from "./VideoChat";

function App() {
  const gigId = "1234"; // Replace with actual gig ID from your app

  return (
    <div>
      <h1>Freelance Platform Video Chat</h1>
      <VideoChat gigId={gigId} />
    </div>
  );
}

export default App;
