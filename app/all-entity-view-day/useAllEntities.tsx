import { useEffect, useState } from "react";

export const useAllEntitiesShifts = () => {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch("/api/getAllEntitiesShifts");
        const data = await response.json();

        if (data.success) {
          console.log(data);
          // Format entity_shifts and ensure segments include full entity objects
          const formattedEntities = data.entities.map((entity) => ({
            ...entity,
            entity_shifts: entity.entity_shifts.map((shift) => ({
              ...shift,
              startTime: new Date(shift.startTime),
              endTime: new Date(shift.endTime),
              segments: shift.segments.map((segment) => ({
                ...segment,
                startTime: new Date(segment.startTime),
                endTime: new Date(segment.endTime),
                entities: segment.entities || null, // Ensure entities are included
              })),
            })),
          }));
          setEntities(formattedEntities);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching entity shifts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  return { entities, loading, error };
};
