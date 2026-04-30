'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function ReactSwagger() {
  const [spec, setSpec] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await fetch('/api/swagger', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load API docs (${res.status})`);
        }
        const data: object = await res.json();
        if (isMounted) {
          setSpec(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load API docs');
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <p className="px-4 py-3 text-sm text-red-600">{error}</p>;
  }
  if (!spec) {
    return <p className="px-4 py-3 text-sm text-gray-600">Loading API docs...</p>;
  }
  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;
