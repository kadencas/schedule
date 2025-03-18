// hooks/useUserShifts.ts
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const useUserShifts = () => {
  const { data: session, status } = useSession();
  const [userShifts, setUserShifts] = useState<any[]>([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const fetchUserShifts = async () => {
      try {
        const res = await fetch(
          `/api/builder/getOneUserAllShifts?userId=${session.user.id}`
        );
        const data = await res.json();
        if (data.success) {
          setUserShifts(data.data);
        } else {
          console.error("Error fetching shifts:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user shifts:", error);
      }
    };

    fetchUserShifts();
  }, [session, status]);
  console.log("backend api", userShifts)

  return { userShifts, session, status };
};
