import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import api from "../services/api";

export default function LiveRoom() {
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  async function handleEndLiveClass() {
    const shouldEnd = window.confirm(
      "Are you sure you want to end this live class for everyone?",
    );

    if (!shouldEnd) return;

    try {
      setEnding(true);
      setError("");

      await api.patch(
        `/live-classes/${encodeURIComponent(connection.classId)}/status`,
        { status: "completed" },
      );

      setClassEnded(true);
      localStorage.removeItem("liveClassConnection");
      navigate("/classes", {
        replace: true,
        state: { message: "Live class ended for all participants." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to end the live class.");
    } finally {
      setEnding(false);
    }
  }

  let connection = null;

  try {
    connection = JSON.parse(
      localStorage.getItem("liveClassConnection") || "null",
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

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {isInstructor && (
        <button
          type="button"
          className="primary-btn"
          onClick={handleEndLiveClass}
          disabled={ending}
          style={{ marginBottom: "16px" }}
        >
          {ending ? "Ending Class..." : "End Live Class"}
        </button>
      )}

      <LiveKitRoom
        video={true}
        audio={true}
        token={connection.token}
        serverUrl={connection.serverUrl}
        connect={true}
        onDisconnected={() => {
          if (!isInstructor) {
            setClassEnded(true);
          }
        }}
        data-lk-theme="default"
        style={{ height: "75vh" }}
      >
        <VideoConference />
      </LiveKitRoom>
      {classEnded && (
        <p role="status">
          The live class has ended or you have been disconnected.
        </p>
      )}

      <button
        type="button"
        className="primary-btn"
        onClick={() => {
          localStorage.removeItem("liveClassConnection");
          navigate("/classes");
        }}
        style={{ marginTop: "16px" }}
      >
        Leave Live Class
      </button>
    </main>
  );
}
