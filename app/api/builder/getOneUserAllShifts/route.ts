import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId query parameter" },
        { status: 400 }
      );
    }

    const userShifts = await prisma.work_shifts.findMany({
      where: { userId },
      orderBy: { shiftDate: "desc" },
      include: { 
        segments: {
          include: {
            entities: true
        },
      },
    },
  });

    return NextResponse.json({ success: true, data: userShifts });
  } catch (error: any) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
