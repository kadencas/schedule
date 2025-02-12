// app/api/testdb/route.js

import pool from '../../../lib/db';

// Named export for HTTP GET requests
export async function GET(request) {
  try {
    console.log('hitting GET endpoint');
    const result = await pool.query('SELECT NOW() AS current_time;');

    // Return a Next.js Response object:
    // (Remember to set status code and headers explicitly if you want JSON)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database connection successful!',
        serverTime: result.rows[0].current_time,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Database error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
