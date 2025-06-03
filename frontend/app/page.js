"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function Home() {
  const [mode, setMode] = useState("host");
  const [hostName, setHostName] = useState("");
  const [hostId, setHostId] = useState("");
  const [roomId, setRoomId] = useState(generateRoomId());
  const [clientName, setClientName] = useState("");
  const [clientUsn, setClientUsn] = useState("");
  const [clientRoomId, setClientRoomId] = useState("");
  const [clientTitle, setClientTitle] = useState("");
  const [clientAbstract, setClientAbstract] = useState("");
  const [clientPdf, setClientPdf] = useState("");
  const [clientGithubLink, setClientGithubLink] = useState("");
  const [hostTimeslot, setHostTimeslot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Host submit: checks for existing room and credentials, passes timeslot as query param
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/host/create-host`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName, hostId, roomId }),
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        // Store credentials for this roomId
        localStorage.setItem(
          `host-auth-${data.roomId}`,
          JSON.stringify({ hostName, hostId })
        );
        router.push(`/hostlobby/${data.roomId}?timeslot=${encodeURIComponent(hostTimeslot)}`);
      } else {
        setError(data.error || "Room ID is in use");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Client submit: no timeslot, checks for room existence
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/client/create-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          usn: clientUsn,
          title: clientTitle,
          abstract: clientAbstract,
          pdf: clientPdf,
          githubLink: clientGithubLink,
          roomId: clientRoomId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(
          `client-auth-${clientRoomId}`,
          JSON.stringify({ name: clientName, usn: clientUsn })
        );
        router.push(`/clientlobby/${clientRoomId}`);
      } else {
        setError(data.message || data.error || "Failed to join room");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow bg-white">
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setMode("host")}
          className={`px-6 py-2 rounded-l-md font-medium transition-colors ${
            mode === "host"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Host
        </button>
        <button
          onClick={() => setMode("client")}
          className={`px-6 py-2 rounded-r-md font-medium transition-colors ${
            mode === "client"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Client
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
      )}

      {mode === "host" ? (
        <form onSubmit={handleHostSubmit} className="space-y-5">
          <div>
            <label htmlFor="hostName" className="block text-sm font-medium mb-1">Host Name</label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={e => setHostName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="hostId" className="block text-sm font-medium mb-1">Host ID</label>
            <input
              id="hostId"
              type="text"
              value={hostId}
              onChange={e => setHostId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="hostTimeslot" className="block text-sm font-medium mb-1">Timeslot</label>
            <input
              id="hostTimeslot"
              type="text"
              value={hostTimeslot}
              onChange={e => setHostTimeslot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium mb-1">Room ID</label>
            <div className="flex gap-2 mt-1">
              <input
                id="roomId"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
              />
              <button
                className="px-3 py-2 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300 transition-colors"
                type="button"
                onClick={() => setRoomId(generateRoomId())}
              >
                Generate New
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-blue-600 text-white rounded font-semibold transition-colors ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleClientSubmit} className="space-y-5">
           <button
            type="button"
            onClick={() => router.push("/client")}
            className="w-full mt-2 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Login <br/> <span className="text-xs">(If already registered)</span>
          </button>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientUsn" className="block text-sm font-medium mb-1">USN</label>
            <input
              id="clientUsn"
              type="text"
              value={clientUsn}
              onChange={e => setClientUsn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientTitle" className="block text-sm font-medium mb-1">Title</label>
            <input
              id="clientTitle"
              type="text"
              value={clientTitle}
              onChange={e => setClientTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientAbstract" className="block text-sm font-medium mb-1">Abstract</label>
            <textarea
              id="clientAbstract"
              value={clientAbstract}
              onChange={e => setClientAbstract(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientPdf" className="block text-sm font-medium mb-1">PDF Link</label>
            <input
              id="clientPdf"
              type="text"
              value={clientPdf}
              onChange={e => setClientPdf(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientGithubLink" className="block text-sm font-medium mb-1">GitHub Link</label>
            <input
              id="clientGithubLink"
              type="text"
              value={clientGithubLink}
              onChange={e => setClientGithubLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="clientRoomId" className="block text-sm font-medium mb-1">Room ID</label>
            <input
              id="clientRoomId"
              type="text"
              value={clientRoomId}
              onChange={e => setClientRoomId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-blue-600 text-white rounded font-semibold transition-colors ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>
      )}
    </div>
  );
}