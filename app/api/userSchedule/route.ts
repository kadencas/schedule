import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Import the Prisma client

export async function GET() {
  try {
    // Hardcoded userId for demonstration; in production, get this dynamically.
    const userId = "d0978b0e-64de-4869-acd8-55289183c176";

    // Use Prisma's findUnique method to fetch the user's name.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return NextResponse.json({ name: "Unknown User" });
    }

    return NextResponse.json({ name: user.name });
  } catch (error) {
    console.error("Error fetching user name:", error);
    return NextResponse.json(
      { error: "Failed to get user name." },
      { status: 500 }
    );
  }
}
