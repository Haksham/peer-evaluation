import React from 'react';
import { render, screen, act } from '@testing-library/react';

// 1. Define the mock function
var mockIo = jest.fn(() => {
  const handlers = {};
  return {
    on: (event, cb) => { handlers[event] = cb; },
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    __handlers: handlers,
  };
});

// 2. Mock socket.io-client BEFORE importing Host
jest.mock('socket.io-client', () => mockIo);

// 3. Now import Host (after the mock)
import Host from './page';

describe('Host Dashboard', () => {
  beforeEach(() => {
    mockIo.mockClear();
  });

  function waitForMockSocket() {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        if (mockIo.mock.results.length > 0 && mockIo.mock.results[mockIo.mock.results.length - 1].value) {
          resolve(mockIo.mock.results[mockIo.mock.results.length - 1].value);
        } else if (Date.now() - start > 1000) {
          reject(new Error('Mock socket.io-client instance not created'));
        } else {
          setTimeout(check, 5);
        }
      })();
    });
  }

  it('renders empty state when no evaluations', async () => {
    render(<Host />);
    const mockSocket = await waitForMockSocket();
    act(() => {
      mockSocket.__handlers['all-evals']([]);
    });
    expect(await screen.findByText(/No evaluations submitted yet/i)).toBeInTheDocument();
  });

  it('renders evaluations when received', async () => {
    render(<Host />);
    const mockSocket = await waitForMockSocket();
    const evals = [
      { from: 'Alice', to: 'Bob', score: 9, timestamp: new Date().toISOString() },
      { from: 'Carol', to: 'Dave', score: 7, timestamp: new Date().toISOString() },
    ];
    act(() => {
      mockSocket.__handlers['all-evals'](evals);
    });
    expect(await screen.findByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.getByText(/Carol/)).toBeInTheDocument();
    expect(screen.getByText(/Dave/)).toBeInTheDocument();
  });

  it('prepends new evaluation on new-eval event', async () => {
    render(<Host />);
    const mockSocket = await waitForMockSocket();
    const initial = [
      { from: 'Alice', to: 'Bob', score: 9, timestamp: new Date().toISOString() },
    ];
    act(() => {
      mockSocket.__handlers['all-evals'](initial);
    });
    const newEval = { from: 'Eve', to: 'Mallory', score: 10, timestamp: new Date().toISOString() };
    act(() => {
      mockSocket.__handlers['new-eval'](newEval);
    });
    expect(await screen.findByText(/Eve/)).toBeInTheDocument();
    expect(screen.getByText(/Mallory/)).toBeInTheDocument();
  });
});