"use client";
import { MdSkipNext } from "react-icons/md";
import { FaStopCircle } from "react-icons/fa";
import { FaPause } from "react-icons/fa";
import { MdSkipPrevious } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa6";
import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HostLobby({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [hostInfo, setHostInfo] = useState({ hostName: "", hostId: "" });
  const [clients, setClients] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [reviewRating, setReviewRating] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { roomId } = typeof params.then === "function" ? use(params) : params;
  const timeslot = Number(searchParams.get("timeslot")) || 0; // in minutes

  useEffect(() => {
    const auth = localStorage.getItem(`host-auth-${roomId}`);
    if (!auth) {
      router.replace("/");
      return;
    }
    const { hostName, hostId } = JSON.parse(auth);
    setHostInfo({ hostName, hostId });
    setAuthorized(true);
  }, [roomId, router]);

  useEffect(() => {
    if (!authorized) return;
    const fetchClients = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/client/list?roomId=${roomId}`);
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
        }
      } catch (err) {}
    };
    fetchClients();
    const interval = setInterval(fetchClients, 5000);
    return () => clearInterval(interval);
  }, [authorized, roomId]);

  // Timer logic
  useEffect(() => {
    if (sessionActive && timeslot > 0 && clients.length > 0) {
      setTimer(timeslot * 60);
      if (intervalId) clearInterval(intervalId);
      const id = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev <= 1 ? timeslot * 60 : prev - 1;
          // Send session state to backend
          fetch(`${BACKEND_URL}/api/host/session-state`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId,
              sessionActive: true,
              currentIndex,
              timer: newTime,
            }),
          });
          if (prev <= 1) {
            handleNext();
          }
          return newTime;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
    // eslint-disable-next-line
  }, [sessionActive, currentIndex, timeslot, clients.length]);

  const handleStart = () => {
    setSessionActive(true);
    setCurrentIndex(0);
    setTimer(timeslot * 60);
  };

  const handleStop = () => {
    setSessionActive(false);
    setCurrentIndex(0);
    setTimer(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handlePause = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    } else if (sessionActive && timeslot > 0) {
      const id = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleNext();
            return timeslot * 60;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
    }
  };

  const handleNext = () => {
    if (currentIndex < clients.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimer(timeslot * 60);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTimer(timeslot * 60);
    }
  };

  const handleDestroyRoom = async () => {
    if (!window.confirm("Are you sure you want to destroy this room? This will remove all data for this room.")) return;
    try {
      await fetch(`${BACKEND_URL}/api/host/destroy-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      localStorage.removeItem(`host-auth-${roomId}`);
      router.replace("/");
    } catch (err) {
      alert("Failed to destroy room.");
    }
  };

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
          reviewedClientUsn: clients[currentIndex].usn, 
          reviewerName: hostInfo.hostName, 
          reviewerRole: "host", 
          rating: Number(reviewRating),
          comment: reviewComment
        })
      });
      setReviewSuccess(true);
    } catch {
      setReviewSuccess(false);
    }
    setReviewSubmitting(false);
  };

  // Download reviews as Excel
  const handleDownloadReviews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/review/all?roomId=${roomId}`);
      const data = await res.json();
      if (!data.reviews) throw new Error("No data");

      const rows = [];
      data.reviews.forEach((reviewDoc) => {
        // Add client USN as a header row
        rows.push({ Name: reviewDoc.reviewedClientUsn, Rating: "", Comment: "" });

        let total = 0;
        let count = 0;

        reviewDoc.reviews.forEach((r) => {
          rows.push({
            Name: r.reviewerName,
            Rating: r.rating,
            Comment: r.comment
          });
          total += Number(r.rating);
          count++;
        });

        // Add total and average rows
        rows.push({ Name: "Total", Rating: total, Comment: "" });
        rows.push({ Name: "Average", Rating: count > 0 ? (total / count).toFixed(2) : "0", Comment: "" });

        // Add an empty row for spacing
        rows.push({ Name: "", Rating: "", Comment: "" });
      });

      const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reviews");
      XLSX.writeFile(wb, `reviews_${roomId}.xlsx`);
    } catch (err) {
      alert("Failed to download reviews.");
    }
  };

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

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
          <div className="font-semibold">{hostInfo.hostName}</div>
          <div className="text-sm text-gray-600">{hostInfo.hostId}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex justify-end w-full max-w-lg mb-2 gap-2">
          <button
            onClick={handleDestroyRoom}
            className="px-4 py-2 rounded bg-red-700 text-white font-semibold shadow hover:bg-red-800 transition"
          >
            Destroy Room
          </button>
          <button
            onClick={handleDownloadReviews}
            disabled={sessionActive}
            className={`px-4 py-2 rounded font-semibold shadow transition ${
              sessionActive
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Download Reviews
          </button>
        </div>
        <div className="bg-white p-8 rounded shadow-md text-center w-full max-w-lg relative">
          {/* Timer on top left */}
          {sessionActive && (
            <div className="absolute top-4 left-4 text-lg font-bold text-blue-700">
              {formatTime(timer)}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">Host Lobby ( {roomId} )</h1>
          {!sessionActive && (
            <p className="text-lg text-gray-700 mb-6">Waiting for host to start...</p>
          )}

          {/* Timeslot and Session Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <form
              onSubmit={e => {
                e.preventDefault();
                const value = Number(e.target.timeslot.value);
                if (!isNaN(value) && value > 0) {
                  const params = new URLSearchParams(window.location.search);
                  params.set("timeslot", value);
                  router.replace(`/hostlobby/${roomId}?${params.toString()}`);
                }
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor="timeslot" className="font-semibold text-gray-700">Timeslot (min):</label>
                <input
                id="timeslot"
                name="timeslot"
                type="number"
                min="1"
                defaultValue={timeslot}
                className="w-20 px-2 py-1 border rounded"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
                title="Change the timeslot for each client"
              >
                Change
              </button>
            </form>
            <div className="flex flex-row gap-[3px]">
              <button
                className="px-4 py-2 rounded bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
                onClick={handleStart}
                disabled={sessionActive || clients.length === 0}
                title="Start session"
              >
                <FaPlay size={25} />
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
                onClick={handleStop}
                disabled={!sessionActive}
                title="Stop session"
              >
                <FaStopCircle size={30} />
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
                onClick={handlePrevious}
                disabled={!sessionActive || currentIndex === 0}
                title="Previous client"
              >
                <MdSkipPrevious size={30} />
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
                onClick={handleNext}
                disabled={!sessionActive || currentIndex === clients.length - 1}
                title="Next client"
              >
                <MdSkipNext size={30}/>
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition"
                onClick={handlePause}
                disabled={!sessionActive}
                title="Pause session"
              >
                <FaPause size={25}/>
              </button>
            </div>
          </div>

          {sessionActive && clients.length > 0 ? (
            <div className="mb-6 text-left border rounded p-4 bg-gray-50">
              <div className="mb-2"><span className="font-semibold">Name:</span> {clients[currentIndex].name}</div>
              <div className="mb-2"><span className="font-semibold">USN:</span> {clients[currentIndex].usn}</div>
              <div className="mb-2"><span className="font-semibold">Title:</span> {clients[currentIndex].title}</div>
              <div className="mb-2"><span className="font-semibold">Abstract:</span> {clients[currentIndex].abstract}</div>
              <div className="mb-2"><span className="font-semibold">PDF Link:</span> <a href={clients[currentIndex].pdf} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">PDF Link</a></div>
              <div className="mb-2"><span className="font-semibold">GitHub Link:</span> <a href={clients[currentIndex].githubLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Github Link</a></div>
              <form onSubmit={handleReviewSubmit} className="mt-6 border-t pt-4">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-4 md:gap-4 items-center">
                  <label className="font-semibold text-gray-700 col-span-1 text-left md:text-right">
                    Your Grade (0-10):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={reviewRating}
                    onChange={e => setReviewRating(e.target.value)}
                    required
                    className="w-full md:w-24 px-2 py-1 border rounded col-span-1"
                  />
                  <label className="font-semibold text-gray-700 col-span-1 text-left md:text-right">
                    Review:
                  </label>
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
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
                {reviewSuccess && <div className="text-green-600 mt-2 text-right">Review submitted!</div>}
              </form>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Clients Joined <span className="text-base font-normal text-gray-500">({clients.length})</span>
              </h2>
              <ul className="mb-2">
                {clients.length === 0 && (
                  <li className="text-gray-500">No clients joined yet.</li>
                )}
                {clients.map((client) => (
                  <li key={client._id} className="flex items-center justify-between text-gray-800 py-1">
                    <span>
                      {client.name} ({client.usn})
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`${BACKEND_URL}/api/client/remove`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ clientId: client._id }),
                          });
                          setClients((prev) => prev.filter((c) => c._id !== client._id));
                        } catch (err) {}
                      }}
                      className="ml-4 px-2 py-1 red border rounded text-xs"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}