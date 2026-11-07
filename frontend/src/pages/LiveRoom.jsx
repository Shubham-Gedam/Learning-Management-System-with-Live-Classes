import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import api from "../services/api";
import { Video, Square, LogOut, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LiveRoom() {
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [classEnded, setClassEnded] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  let connection = null;

  try {
    connection = JSON.parse(
      localStorage.getItem("liveClassConnection") || "null",
    );
  } catch {
    connection = null;
  }

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

  useEffect(() => {
    if (!connection?.serverUrl || !connection?.token) {
      navigate("/classes", { replace: true });
    }
  }, [navigate, connection?.serverUrl, connection?.token]);

  if (!connection?.serverUrl || !connection?.token) {
    return (
      <div className="bg-[#0B0B0B] text-white h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Opening live class session...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white h-screen overflow-hidden font-sans flex flex-col">
      
      {/* Top Navbar Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-3 shrink-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 animate-pulse">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">{connection.title || "Live Class Session"}</h1>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> Live Broadcast Room
            </span>
          </div>
        </div>

        {/* Top Actions: End Class & Leave */}
        <div className="flex items-center gap-3">
          {isInstructor && (
            <button
              type="button"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50"
              onClick={handleEndLiveClass}
              disabled={ending}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {ending ? "Ending..." : "End Class for All"}
            </button>
          )}

          <button
            type="button"
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 font-semibold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
            onClick={() => {
              localStorage.removeItem("liveClassConnection");
              navigate("/classes");
            }}
          >
            <LogOut className="w-3.5 h-3.5 text-orange-500" /> Leave
          </button>
        </div>
      </header>

      {/* Main Video Room Workspace (Occupies exact remaining screen height) */}
      <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
        
        {/* Error Alert */}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-3 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Status Notification */}
        {classEnded && (
          <div role="status" className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-3 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> The live class has ended or you have been disconnected from the room.
          </div>
        )}

        {/* LiveKit Video Conference Container */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex-1 relative w-full h-full">
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
            style={{ height: "100%", width: "100%" }}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>

      </div>
    </div>
  );
}