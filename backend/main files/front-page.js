"use client";
// frontend/pages/index.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

let socket;

export default function Host() {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    // connect to backend on localhost:4000
    socket = io('http://localhost:4000');

    // receive all past evaluations once
    socket.on('all-evals', (all) => {
      setEvaluations(all.reverse());
    });

    // listen for new evaluations
    socket.on('new-eval', (evalData) => {
      setEvaluations((prev) => [evalData, ...prev]);
    });

    return () => {
      socket.off('all-evals');
      socket.off('new-eval');
      socket.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Host Dashboard</h1>
      {evaluations.length === 0 ? (
        <p>No evaluations submitted yet.</p>
      ) : (
        <ul className="space-y-2">
          {evaluations.map((e, idx) => (
            <li
              key={idx}
              className="p-2 border rounded shadow-sm flex justify-between"
            >
              <div>
                <strong>{e.from}</strong> rated <strong>{e.to}</strong>
              </div>
              <div>
                <span className="font-mono">{e.score}</span> at{' '}
                {new Date(e.timestamp).toLocaleTimeString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}