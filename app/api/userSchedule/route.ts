import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// We define a GET handler instead of a default export
export async function GET() {
  try {
    // Hardcoded userId for demonstration
    const userId = "d0978b0e-64de-4869-acd8-55289183c176";

    const userResult = await pool.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    // If no row found, default to a placeholder name
    const userRow = userResult.rows[0] || { name: "Unknown User" };

    return NextResponse.json({ name: userRow.name });
  } catch (error) {
    console.error("Error fetching user name:", error);
    // 500 = Internal Server Error
    return NextResponse.json({ error: "Failed to get user name." }, { status: 500 });
  }
}
