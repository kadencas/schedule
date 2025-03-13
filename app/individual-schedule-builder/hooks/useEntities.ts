import { Entity } from "@/types/types";
import { useEffect, useState } from "react";

export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      setError(null); // Reset error before fetching

      try {
        const response = await fetch("/api/entities", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch entities");

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response");
        }

        setEntities(data);
      } catch (err) {
        console.error(err);
        setError("Could not load entities data");
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  return { entities, loading, error };
}
