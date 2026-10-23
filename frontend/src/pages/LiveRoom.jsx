import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function LiveRoom() {
  const navigate = useNavigate();

  let connection = null;

  try {
    connection = JSON.parse(
      localStorage.getItem("liveClassConnection") || "null"
    );
  } catch {
    connection = null;
  }

  useEffect(() => {
    if (!connection?.serverUrl || !connection?.token) {
      navigate("/classes", { replace: true });
    }
  }, [navigate, connection?.serverUrl, connection?.token]);

  if (!connection?.serverUrl || !connection?.token) {
    return <p>Opening live class...</p>;
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>{connection.title || "Live Class"}</h1>

      <LiveKitRoom
        video={true}
        audio={true}
        token={connection.token}
        serverUrl={connection.serverUrl}
        connect={true}
        onDisconnected={() => navigate("/classes")}
        data-lk-theme="default"
        style={{ height: "75vh" }}
      >
        <VideoConference />
      </LiveKitRoom>

      <button
        type="button"
        className="primary-btn"
        onClick={() => navigate("/classes")}
        style={{ marginTop: "16px" }}
      >
        Back to Classes
      </button>
    </main>
  );
}