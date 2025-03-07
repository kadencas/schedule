import { useState, useEffect } from "react";

export function useAllEmployeesShifts() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/shifts");
        if (!response.ok) {
          throw new Error(`Failed to fetch shifts: ${response.statusText}`);
        }
        const data = await response.json();
        setEmployees(data.employees ?? []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { employees, loading, error };
}
