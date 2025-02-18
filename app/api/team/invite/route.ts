// app/api/team/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma"; // adjust path as necessary

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, companyId } = body;

    if (!name || !email || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate an invitation token
    const inviteToken = randomBytes(20).toString("hex");

    // Define expiration (e.g., 24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Insert the invitation into the database
    await prisma.invitation.create({
      data: {
        token: inviteToken,
        companyId: companyId, // Derived from the admin's session or selection
        inviteeEmail: email,  // Optional if you want to restrict by email
        expiresAt: expiresAt,
      },
    });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Construct the invitation URL
    const inviteUrl = `http://localhost:3000/signup?invite=${inviteToken}`;

    // Define email options
    const mailOptions = {
      from: `"Your Company Name" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're Invited to Join Our Team!",
      html: `
        <p>Hello ${name},</p>
        <p>You have been invited to join our team. Click the link below to accept the invitation and sign up:</p>
        <p><a href="${inviteUrl}">Join the Team</a></p>
        <p>If you did not expect this invitation, please ignore this email.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return NextResponse.json(
      { error: "Failed to send invitation email" },
      { status: 500 }
    );
  }
}
