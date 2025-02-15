import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Fetch all users and include their work shifts along with each shift's segments
    const users = await prisma.users.findMany({
      include: { 
        work_shifts: { 
          include: { segments: true } 
        } 
      },
    });

    // Transform the data into the structure the frontend expects:
    // Each employee has a name and a list of shifts with ISO 8601 start/end times,
    // including segments (each with ISO 8601 times and segment type).
    const employees = users.map(user => ({
      name: user.name,
      shifts: user.work_shifts.map(shift => ({
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        segments: shift.segments.map(segment => ({
          startTime: segment.startTime.toISOString(),
          endTime: segment.endTime.toISOString(),
          segmentType: segment.segmentType,
          // Optionally, include additional fields such as location or notes:
          location: segment.location,
          notes: segment.notes,
        })),
      })),
    }));

    console.log(employees[0].shifts[0].segments);
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

