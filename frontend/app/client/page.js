"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ClientLogin() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/client/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, usn, roomId }),
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        localStorage.setItem(
          `client-auth-${roomId}`,
          JSON.stringify({ name, usn })
        );
        router.push(`/clientlobby/${data.roomId}`);
      } else {
        setError(data.error || "Invalid credentials or room ID");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border border-gray-300 rounded-lg shadow bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Client Login</h2>
      {error && (
        <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
      )}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">USN</label>
          <input
            type="text"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room ID</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
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
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}