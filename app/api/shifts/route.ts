// app/api/shifts/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Fetch all users and include their work shifts
    const users = await prisma.users.findMany({
      include: { work_shifts: true },
    });

    // Transform the data into a structure the frontend expects:
    // Each employee will have a name and a list of shifts with ISO 8601 start and end times.
    const employees = users.map(user => ({
      name: user.name,
      shifts: user.work_shifts.map(shift => ({
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
      })),
    }));

    console.log(employees[0].shifts);
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching shifts", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
