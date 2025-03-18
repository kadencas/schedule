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
          include: { 
            segments: { 
              include: { 
                entities: true 
              } 
            } 
          },
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
        isRecurring: shift.isRecurring,
        recurrenceRule: shift.recurrenceRule,
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
          entities: segment.entities

        })),
      })),
    }));

    return NextResponse.json({ employees });
  } catch (error: any) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Get session info and validate authorization
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = String(session.user.companyId);

    // Parse the request body for shift details
    const body = await request.json();
    const {
      userId,       // ID of the user for whom the shift is being added
      shiftDate,    // Date for the first occurrence of the shift
      startTime,    // Shift start time
      endTime,      // Shift end time
      isRecurring,  // Optional: whether the shift recurs
      recurrenceRule,    // Optional: recurrence rule, e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR"
      recurrenceEndDate, // Optional: when the recurrence ends
      notes,        // Optional: any additional notes for the shift
    } = body;

    // Validate required fields
    if (!userId || !shiftDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the new shift in the database (without segments)
    const newShift = await prisma.work_shifts.create({
      data: {
        userId,
        companyId,
        shiftDate: new Date(shiftDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isRecurring: isRecurring || false,
        recurrenceRule: recurrenceRule || null,
        recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ shift: newShift }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shift", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

