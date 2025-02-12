import pool from '../../../lib/db';

export async function GET(request) {
  try {
    console.log('hitting GET endpoint');
    const result = await pool.query('SELECT NOW() AS current_time;');
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
