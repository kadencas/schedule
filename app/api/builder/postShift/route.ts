import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Expect the client to send these properties:
    // - userId: the ID of the user for whom the shift is created
    // - companyId: the company the user belongs to
    // - shiftDate: the date of the shift (as an ISO string)
    // - startTime: when the shift starts (ISO string)
    // - endTime: when the shift ends (ISO string)
    const { userId, companyId, shiftDate, startTime, endTime } = body;

    // Create a new shift in the database
    const newShift = await prisma.work_shifts.create({
      data: {
        userId,
        companyId,
        shiftDate: new Date(shiftDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json({ success: true, data: newShift });
  } catch (error: any) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
