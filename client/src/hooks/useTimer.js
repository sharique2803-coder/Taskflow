import { useState, useEffect, useRef, useCallback } from 'react';
import { updateTask } from '../api/tasks';

const STORAGE_KEY = (id) => `timer_${id}`;

const load = (id) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(id));
    return raw ? JSON.parse(raw) : { elapsed: 0, startedAt: null };
  } catch { return { elapsed: 0, startedAt: null }; }
};

const save = (id, state) => {
  try { localStorage.setItem(STORAGE_KEY(id), JSON.stringify(state)); } catch {}
};

export function useTimer(taskId, initialSeconds = 0) {
  const [state, setState] = useState(() => {
    const stored = load(taskId);
    // If there was an active session, compute elapsed since startedAt
    if (stored.startedAt) {
      const extra = Math.floor((Date.now() - stored.startedAt) / 1000);
      return { elapsed: stored.elapsed + extra, running: true };
    }
    // Use DB value if nothing stored
    return { elapsed: stored.elapsed || initialSeconds, running: false };
  });

  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setState(s => ({ ...s, elapsed: s.elapsed + 1 }));
  }, []);

  useEffect(() => {
    if (state.running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.running, tick]);

  // Persist to localStorage on every change
  useEffect(() => {
    save(taskId, {
      elapsed:   state.elapsed,
      startedAt: state.running ? (load(taskId).startedAt || Date.now()) : null,
    });
  }, [taskId, state]);

  const start = useCallback(() => {
    save(taskId, { elapsed: state.elapsed, startedAt: Date.now() });
    setState(s => ({ ...s, running: true }));
  }, [taskId, state.elapsed]);

  const pause = useCallback(async () => {
    setState(s => ({ ...s, running: false }));
    save(taskId, { elapsed: state.elapsed, startedAt: null });
    // Persist to DB silently
    try { await updateTask(taskId, { timerSeconds: state.elapsed }); } catch {}
  }, [taskId, state.elapsed]);

  const reset = useCallback(async () => {
    clearInterval(intervalRef.current);
    setState({ elapsed: 0, running: false });
    save(taskId, { elapsed: 0, startedAt: null });
    try { await updateTask(taskId, { timerSeconds: 0 }); } catch {}
  }, [taskId]);

  const format = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    elapsed:   state.elapsed,
    running:   state.running,
    formatted: format(state.elapsed),
    start,
    pause,
    reset,
  };
}
