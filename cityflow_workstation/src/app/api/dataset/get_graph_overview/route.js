import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const GET = async () => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const datasetServer = process.env.DATASET_SERVER;
  try {
    const response = await fetch(`${datasetServer}/get_graph_overview`);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Failed to get graph overview' },
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

export const POST = async () => {
  return NextResponse.json(
    { error: 'POST method not allowed' },
    { status: 405 }
  );
};
