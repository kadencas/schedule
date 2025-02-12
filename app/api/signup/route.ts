// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    // Log request details for debugging
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers));

    // Check request content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid Content-Type:', contentType);
      return NextResponse.json(
        { error: "Invalid Content-Type. Must be application/json" },
        { status: 400 }
      );
    }

    // Safely parse the request body
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

    // Log parsed body for debugging
    console.log('Parsed request body:', body);

    const { email, name, password } = body;

    // Validate that all fields are provided.
    if (!email || !name || !password) {
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

    // Hash the password using bcrypt.
    const passwordHash = await bcrypt.hash(password, 10); // 10 salt rounds

    // Create the new user record.
    const user = await prisma.users.create({
      data: {
        email,
        name,
        passwordHash, // store the hashed password
        // Add any other required fields here (e.g., companyId, role)
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Detailed error creating user:", error);
    // Include more error details in the response
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
