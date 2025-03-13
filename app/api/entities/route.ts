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

    // Create the new entity in the database
    const newEntity = await prisma.entities.create({
      data: {
        name,
        type,
        icon,
        color,
        // if not provided, requiresCoverage defaults to false in your schema
        requiresCoverage: requiresCoverage ?? false,
        // if not provided, minCoverage can remain null
        minCoverage: minCoverage ?? null,
        companyId,
      },
    });

    return NextResponse.json(newEntity, { status: 201 });
  } catch (error) {
    console.error("Error creating entity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
