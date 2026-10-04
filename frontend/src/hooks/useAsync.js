import { useCallback, useEffect, useState } from "react";

// Runs a loader (sync today, async once an API exists) and exposes
// { data, loading, error, reload } so pages always have real
// loading and error states. The loader re-runs when `deps` change
// or when `reload()` is called.
function useAsync(loader, deps = []) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const key = `${version}:${JSON.stringify(deps)}`;

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setResult({ key, data: null, error });
      });

    return () => {
      cancelled = true;
    };
    // `loader` is intentionally driven by the caller-provided `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return {
    data: result.data,
    error: result.error,
    loading: result.key !== key,
    reload,
  };
}

export default useAsync;
