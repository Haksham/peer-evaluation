"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;

  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [clients, setClients] = useState([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientTimer, setClientTimer] = useState(10);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [timeLimit, setTimeLimit] = useState(10);

  const socketRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("peerEvalRole");
    const storedName = sessionStorage.getItem("peerEvalName");
    const storedUsn = sessionStorage.getItem("peerEvalUsn");
    const storedTimeLimit = sessionStorage.getItem("peerEvalTimeLimit");
    setRole(storedRole);
    setName(storedName);
    setUsn(storedUsn);
    if (storedTimeLimit) setTimeLimit(Number(storedTimeLimit));

    if (!storedRole) {
      router.replace("/");
      return;
    }

    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("joinRoom", { roomId, name: storedName, usn: storedUsn, role: storedRole });

    socket.on("users", (users) => setClients(users));
    socket.on("roomNotFound", () => {
      alert("Room ID does not exist!");
      router.replace("/");
    });
    socket.on("roomClosed", () => {
      alert("Room was closed by host.");
      router.replace("/");
    });
    socket.on("sessionStarted", () => setSessionStarted(true));
    socket.on("sessionStopped", () => {
      setSessionStarted(false);
      setCurrentClient(null);
    });
    socket.on("showClient", (client) => setCurrentClient(client));
    socket.on("sessionPaused", () => setSessionPaused(true));
    socket.on("sessionResumed", () => setSessionPaused(false));

    // Restore session state after refresh
    socket.on("sessionState", ({ sessionStarted, currentClient, timeLeft }) => {
      setSessionStarted(sessionStarted);
      setCurrentClient(currentClient);
      setClientTimer(timeLeft);
    });

    return () => {
      socket.disconnect();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [roomId, router]);

  // Reset timer to timeLimit only when a new client is shown (not on resume)
  useEffect(() => {
    if (sessionStarted && currentClient) {
      setClientTimer(timeLimit * 60);
    }
  }, [currentClient, sessionStarted, timeLimit]);

  // If sessionState event set a specific timeLeft, don't overwrite it
  // So, only set timer to timeLimit*60 if clientTimer is not already set (i.e., on showClient, not on sessionState)
  useEffect(() => {
    if (sessionStarted && currentClient && clientTimer === undefined) {
      setClientTimer(timeLimit * 60);
    }
  }, [currentClient, sessionStarted, timeLimit, clientTimer]);

  // Timer countdown effect
  useEffect(() => {
    if (sessionStarted && currentClient && !sessionPaused) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setClientTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [currentClient, sessionStarted, sessionPaused]);

  const handleStartSession = () => {
    if (socketRef.current) {
      socketRef.current.emit("startSession", { roomId });
    }
  };

  const handleStopSession = () => {
    if (socketRef.current) {
      socketRef.current.emit("stopSession", { roomId });
    }
  };

  const handlePauseSession = () => {
    if (socketRef.current) {
      socketRef.current.emit("pauseSession", { roomId });
    }
  };

  const handleResumeSession = () => {
    if (socketRef.current) {
      socketRef.current.emit("resumeSession", { roomId });
    }
  };

  const handleNextClient = () => {
    if (socketRef.current) {
      socketRef.current.emit("nextClient", { roomId });
    }
  };

  const handlePrevClient = () => {
    if (socketRef.current) {
      socketRef.current.emit("prevClient", { roomId });
    }
  };

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 border border-gray-300 rounded-lg shadow-md bg-white">
      {/* Display current user info */}
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200">
        <span className="font-semibold">You:</span>{" "}
        {name} {usn && <>({usn})</>}
        <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs uppercase">{role}</span>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-center">Room: {roomId}</h2>
      {sessionStarted && currentClient ? (
        <div className="mb-6 p-4 bg-yellow-100 rounded text-center">
          <span className="font-bold text-lg">Current Client:</span>
          <div className="mt-2 text-xl">
            {currentClient.name} {currentClient.usn && <>({currentClient.usn})</>}
          </div>
          <div className="mt-2 text-2xl font-mono text-blue-700">
            Time left: {formatTime(clientTimer)}
          </div>
        </div>
      ) : null}
      {role === "host" ? (
        <>
          <div>
            <h3 className="font-semibold mb-2">Clients Joined:</h3>
            <ul className="list-disc ml-6">
              {clients.map((user, idx) => (
                <li key={idx}>
                  {user.name} {user.usn && <>({user.usn})</>}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleStartSession}
              disabled={sessionStarted}
            >
              Start Session
            </button>
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={handlePauseSession}
              disabled={!sessionStarted || sessionPaused}
            >
              Pause
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleResumeSession}
              disabled={!sessionStarted || !sessionPaused}
            >
              Resume
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleStopSession}
              disabled={!sessionStarted}
            >
              Stop Session
            </button>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={handlePrevClient}
              disabled={!sessionStarted || sessionPaused}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={handleNextClient}
              disabled={!sessionStarted || sessionPaused}
            >
              Next
            </button>
          </div>
          <div className="mt-4 text-center">
            {sessionStarted ? (
              <span className="text-green-600 font-semibold">Session is running</span>
            ) : (
              <span className="text-gray-600">Session not started</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 text-center">
            {sessionStarted ? (
              <span className="text-green-600 font-semibold">Session started!</span>
            ) : (
              <span className="text-gray-600">Waiting for host to start session...</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Clients Joined:</h3>
            <ul className="list-disc ml-6">
              {clients.map((user, idx) => (
                <li key={idx}>
                  {user.name} {user.usn && <>({user.usn})</>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}