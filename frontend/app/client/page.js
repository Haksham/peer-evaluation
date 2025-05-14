"use client";
// frontend/pages/client.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export default function Client() {
  const [peerId, setPeerId] = useState('');
  const [score, setScore] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    socket = io('http://localhost:4000');
    return () => socket.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!peerId) return;

    socket.emit('submit-eval', {
      from: socket.id,
      to: peerId,
      score: Number(score),
      timestamp: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Submit Peer Evaluation</h1>

      {submitted ? (
        <p className="text-green-600">Thank you! Your evaluation has been submitted.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Peer Socket ID</label>
            <input
              type="text"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="e.g. abc123xyz"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Score (1–10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Evaluation
          </button>
        </form>
      )}
    </div>
  );
}