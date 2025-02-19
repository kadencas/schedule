import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';


const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions);
    console.log("Session data:", session);

    // Ensure the user is authenticated
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companyId = String(session.user.companyId);

    // Fetch users whose companyId matches the session's companyId
    const users = await prisma.users.findMany({
      where: { companyId },
    });

    // Transform the data into the structure the frontend expects
    const userList = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      department: user.department,
      location: user.location,
      hoursAllowed: user.hoursAllowed,
    }));

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error("Error fetching users", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
