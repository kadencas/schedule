import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Get session info and companyId from the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = String(session.user.companyId);

    // Fetch all users along with their work_shifts and segments
    const users = await prisma.users.findMany({
      where: { companyId },
      include: {
        work_shifts: {
          include: { segments: true },
          orderBy: { shiftDate: "desc" }, // if you need ordering
        }
      },
    });

    // Map the data to include shiftDate along with other properties
    const employees = users.map(user => ({
      id: user.id, 
      name: user.name,
      department: user.department, 
      location: user.location,     
      role: user.role,             
      shifts: user.work_shifts.map(shift => ({
        id: shift.id, // include shift id
        shiftDate: shift.shiftDate ? shift.shiftDate.toISOString() : null, // include shiftDate here
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        segments: shift.segments.map(segment => ({
          id: segment.id, // include segment id
          startTime: segment.startTime.toISOString(),
          endTime: segment.endTime.toISOString(),
          segmentType: segment.segmentType,
          location: segment.location,
          notes: segment.notes,
          color: segment.color,
        })),
      })),
    }));

    return NextResponse.json({ employees });
  } catch (error: any) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
