import { useState, useEffect } from "react";

export function useAllEntitiesShifts() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/entities");
        if (!response.ok) {
          throw new Error(`Failed to fetch entity shifts: ${response.statusText}`);
        }
        const data = await response.json();
        setEntities(data.entities ?? []); // ✅ Store entities instead of employees
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { entities, loading, error };
}
