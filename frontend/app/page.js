"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState("host");
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [roomId, setRoomId] = useState(generateRoomId());
  const [timeLimit, setTimeLimit] = useState(10); // default 10 seconds

  // Reset fields when role changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setName("");
    setUsn("");
    if (newRole === "host" && !roomId) {
      setRoomId("");
    }
    if (newRole === "client" && !roomId) {
      setRoomId("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = role === "host" ? roomId : roomId.trim();
    if (!name || (role === "client" && (!usn || !id))) return;

    sessionStorage.setItem("peerEvalRole", role);
    sessionStorage.setItem("peerEvalName", name);
    if (role === "host") {
      sessionStorage.setItem("peerEvalTimeLimit", timeLimit);
    }
    if (role === "client") {
      sessionStorage.setItem("peerEvalUsn", usn);
    } else {
      sessionStorage.removeItem("peerEvalUsn");
    }
    router.push(`/lobby/${roomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 relative">
      {/* Toggle */}
      <div className="absolute top-8 right-8 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${role === "host" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => handleRoleChange("host")}
        >
          Host
        </button>
        <button
          className={`px-4 py-2 rounded ${role === "client" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => handleRoleChange("client")}
        >
          Client
        </button>
      </div>
      <h1 className="mb-12 text-4xl font-bold text-gray-800">Peer Evaluation System</h1>
      <form
        className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-6 min-w-[320px]"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Name</span>
          <input
            className="border rounded px-3 py-2"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        {role === "client" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">USN</span>
              <input
                className="border rounded px-3 py-2"
                type="text"
                value={usn}
                onChange={e => setUsn(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Room ID</span>
              <input
                className="border rounded px-3 py-2"
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                required
              />
            </label>
          </>
        )}
        {role === "host" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Room ID</span>
              <div className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 bg-gray-100"
                  type="text"
                  value={roomId}
                  readOnly
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                  onClick={() => setRoomId(generateRoomId())}
                >
                  New ID
                </button>
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Time Limit (seconds per client)</span>
              <input
                className="border rounded px-3 py-2"
                type="number"
                min={1}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
                required
              />
            </label>
          </>
        )}
        <button
          type="submit"
          className="mt-4 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition"
        >
          {role === "host" ? "Create Room" : "Join"}
        </button>
      </form>
    </div>
  );
}