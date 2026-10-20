import { useEffect, useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../utils/format.js';

// Runs `fetcher(signal)` on mount and whenever `deps` change.
// Cancels the old request if the deps change again before it finishes.
// Returns { data, loading, error, reload }.
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
