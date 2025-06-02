"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ClientLobby({ params }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [clientInfo, setClientInfo] = useState({ name: "", usn: "" });
  const [clients, setClients] = useState([]);
  const [sessionState, setSessionState] = useState({
    sessionActive: false,
    currentIndex: 0,
    timer: 0,
  });
  const [reviewRating, setReviewRating] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { roomId } = typeof params.then === "function" ? use(params) : params;

  // Auth check
  useEffect(() => {
    const auth = localStorage.getItem(`client-auth-${roomId}`);
    if (!auth) {
      router.replace("/");
      return;
    }
    const { name, usn } = JSON.parse(auth);
    setClientInfo({ name, usn });
    setAuthorized(true);
  }, [roomId, router]);

  // Fetch clients list
  useEffect(() => {
    if (!authorized) return;
    const fetchClients = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/client/list?roomId=${roomId}`
        );
        const data = await res.json();
        if (res.ok) setClients(data.clients || []);
      } catch {}
    };
    fetchClients();
  }, [authorized, roomId]);

  // Poll session state
  useEffect(() => {
    if (!authorized) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/host/session-state?roomId=${roomId}`
        );
        const data = await res.json();
        setSessionState(data);
      } catch {}
    }, 1000);
    return () => clearInterval(poll);
  }, [authorized, roomId]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewSuccess(false);
    try {
      await fetch(`${BACKEND_URL}/api/review/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          reviewedClientUsn: clients[sessionState.currentIndex].usn,
          reviewerName: clientInfo.name,
          reviewerRole: "client",
          rating: Number(reviewRating),
          comment: reviewComment,
        }),
      });
      setReviewSuccess(true);
    } catch {
      setReviewSuccess(false);
    }
    setReviewSubmitting(false);
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-700">Unauthorized. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex justify-end p-4">
        <div className="text-right">
          <div className="font-semibold">{clientInfo.name}</div>
          <div className="text-sm text-gray-600">{clientInfo.usn}</div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md text-center w-full max-w-lg relative">
          {/* Timer on top left */}
          {sessionState.sessionActive && (
            <div className="absolute top-4 left-4 text-lg font-bold text-blue-700">
              {formatTime(sessionState.timer)}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">
            Client Lobby ( {roomId} )
          </h1>
          {sessionState.sessionActive && clients.length > 0 ? (
            <div className="mb-6 text-left border rounded p-4 bg-gray-50">
              <div className="mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {clients[sessionState.currentIndex]?.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">USN:</span>{" "}
                {clients[sessionState.currentIndex]?.usn}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Title:</span>{" "}
                {clients[sessionState.currentIndex]?.title}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Abstract:</span>{" "}
                {clients[sessionState.currentIndex]?.abstract}
              </div>
              <div className="mb-2">
                <span className="font-semibold">PDF Link:</span>{" "}
                <a
                  href={clients[sessionState.currentIndex]?.pdf}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PDF Link
                </a>
              </div>
              <div className="mb-2">
                <span className="font-semibold">GitHub Link:</span>{" "}
                <a
                  href={clients[sessionState.currentIndex]?.githubLink}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github Link
                </a>
              </div>
            </div>
          ) : (
            <p className="text-lg text-gray-700">
              Waiting for host to start the session...
            </p>
          )}
          {sessionState.sessionActive && clients.length > 0 && (
            <form
              onSubmit={handleReviewSubmit}
              className="mt-6 border-t pt-4"
            >
              <div className="flex flex-col gap-4 md:grid md:grid-cols-4 md:gap-4 items-center">
                <label className="font-semibold text-gray-700 col-span-1 text-left md:text-right">
                  Your Grade (0-10):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  required
                  className="w-full md:w-24 px-2 py-1 border rounded col-span-1"
                />
                <label className="font-semibold text-gray-700 col-span-1 text-left md:text-right">
                  Review:
                </label>
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="w-full px-2 py-1 border rounded col-span-1"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
              {reviewSuccess && (
                <div className="text-green-600 mt-2 text-right">
                  Review submitted!
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}