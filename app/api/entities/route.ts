import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET() {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  // Ensure the user is authenticated and has a companyId
  if (!session || !session.user || !session.user.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = String(session.user.companyId);

  try {
    // Fetch all entities for the user's company
    const entities = await prisma.entities.findMany({
      where: {
        companyId,
      },
    });

    return NextResponse.json(entities);
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Retrieve the session
  const session = await getServerSession(authOptions);

  // Ensure the user is authenticated and has a companyId
  if (!session || !session.user?.companyId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = String(session.user.companyId);

  try {
    // Parse the JSON body
    const body = await request.json();

    // Basic shape validation / destructuring
    const {
      name,
      type,            // e.g., "LOCATION" or "TASK"
      icon,
      color,
      requiresCoverage,
      minCoverage,
    } = body;

    // Ensure required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name or type" },
        { status: 400 }
      );
    }
// Prepare date/time for the default 9-10pm shift
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDate();

// Shift date is typically just the calendar date
const shiftDate = new Date(year, month, day); 
// Start at 9:00 PM
const startTime = new Date(year, month, day, 9, 0, 0);
// End at 10:00 PM
const endTime = new Date(year, month, day, 22, 0, 0);

// Create the new entity + default entity shift in a single nested write
const newEntity = await prisma.entities.create({
  data: {
    name,
    type,
    icon,
    color,
    requiresCoverage: requiresCoverage ?? false,
    minCoverage: minCoverage ?? null,
    companyId,

    // This creates a single shift linked to the new entity
    entity_shifts: {
      create: {
        companyId,
        shiftDate,
        startTime,
        endTime,
        isRecurring: true,
        recurrenceRule: "FREQ=DAILY;INTERVAL=1",
      },
    },
  },
  // Include the newly-created shift(s) in the returned data
  include: {
    entity_shifts: true,
  },
});

return NextResponse.json(newEntity, { status: 201 });
} catch (error) {
console.error("Error creating entity with shift:", error);
return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}