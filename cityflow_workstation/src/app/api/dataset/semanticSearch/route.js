import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const POST = async (req) => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const datasetServer = process.env.NEXT_PUBLIC_DATASET_SERVER;
  const { query, limit = 5 } = await req.json();

  try {
    const response = await fetch(`${datasetServer}/semantic_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error:', error);
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
