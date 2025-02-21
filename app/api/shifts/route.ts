// pages/api/save-shifts.ts (or your shifts endpoint file)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {

    // First, get the session info, and pull the user's companyID
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);

    // Ensure the user is authenticated and has a companyId
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the company ID from the session
    const companyId = String(session.user.companyId);

    // Second, fetch all users along with their work_shifts and segments
    const users = await prisma.users.findMany({
      where: { companyId: companyId },
      include: {
        work_shifts: {
          include: { segments: true }
        }
      },
    });

    // Transform the data into the structure the frontend expects.
    // Now each employee includes their id, and each shift/segment includes its id.
    const employees = users.map(user => ({
      id: user.id, 
      name: user.name,
      department: user.department, 
      location: user.location,     
      role: user.role,             
      shifts: user.work_shifts.map(shift => ({
        id: shift.id, // include shift id
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        segments: shift.segments.map(segment => ({
          id: segment.id, // include segment id
          startTime: segment.startTime.toISOString(),
          endTime: segment.endTime.toISOString(),
          segmentType: segment.segmentType,
          location: segment.location,
          notes: segment.notes,
        })),
      })),
    }));

    console.log(employees[0]?.shifts[0]?.segments);
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
