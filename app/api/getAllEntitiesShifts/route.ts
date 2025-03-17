import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
      const entities = await prisma.entities.findMany({
        include: {
          entity_shifts: {
            orderBy: { shiftDate: "desc" },
            include: {
              segments: {
                include: {
                  entities: true, // 🔹 Include full entity details inside segments
                },
              },
            },
          },
        },
      });

    return NextResponse.json({ success: true, entities });
  } catch (error) {
    console.error("Error fetching entities and shifts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
