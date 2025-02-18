// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers));

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type:', contentType);
      return NextResponse.json(
        { error: "Invalid Content-Type. Must be application/json" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.log('Parsed request body:', body);

    // Destructure the expected fields including the inviteToken
    const { email, name, password, inviteToken } = body;

    // Validate that required fields are provided.
    if (!email || !name || !password || !inviteToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists.
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Look up the invitation in the database
    const invitation = await prisma.invitation.findUnique({
      where: { token: inviteToken },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token." },
        { status: 400 }
      );
    }

    // Check if the invitation is expired or already used.
    const now = new Date();
    if (now > invitation.expiresAt || invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation token is expired or has already been used." },
        { status: 400 }
      );
    }

    // Optionally, check if the invitation was issued for a specific email.
    if (invitation.inviteeEmail && invitation.inviteeEmail !== email) {
      return NextResponse.json(
        { error: "Invitation token does not match the provided email." },
        { status: 400 }
      );
    }

    // Hash the password.
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the new user record and associate the companyId from the invitation.
    const user = await prisma.users.create({
      data: {
        email,
        name,
        passwordHash, // store the hashed password
        companyId: invitation.companyId, // enroll user in the correct company
        // Add any other required fields here.
      },
    });

    // Mark the invitation as used.
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "USED" },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Detailed error creating user:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
