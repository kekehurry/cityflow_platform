import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const POST = async (req) => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const executorServer = process.env.NEXT_PUBLIC_EXECUTOR_SERVER;
  try {
    // Parse the request body
    const { flowId, userId, image } = await req.json();

    // Make a POST request to the dataset server
    const response = await fetch(`${executorServer}/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, userId, image }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Failed to stop container' },
      { status: response.status }
    );
  } catch (error) {
    // console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  return NextResponse.json(
    { error: 'GET method not allowed' },
    { status: 405 }
  );
};
