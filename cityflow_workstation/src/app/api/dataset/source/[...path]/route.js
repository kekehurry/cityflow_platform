import path from 'path';
import dotenv from 'dotenv';
import { NextResponse } from 'next/server';

export const GET = async (req, { params }) => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const datasetServer = process.env.NEXT_PUBLIC_DATASET_SERVER;
  const filePath = params.path.join('/');
  try {
    const response = await fetch(
      `${datasetServer}/api/dataset/source/${filePath}`
    );
    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};
