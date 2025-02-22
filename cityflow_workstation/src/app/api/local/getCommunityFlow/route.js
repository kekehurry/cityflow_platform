import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const POST = async (req) => {
  try {
    // Load environment variables
    const envPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envPath });

    // Get environment variables
    const datasetServer = process.env.DATASET_SERVER;

    const { flowURL } = await req.json();
    const flowData = await fetch(flowURL).then((res) => res.json());
    flowData.private = false;
    flowData.globalScale = 0.01;
    // Send the POST request to the dataset server
    const response = await fetch(`${datasetServer}/save_workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowData }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error('Error get community workflow:', error);
    return NextResponse.json(
      { error: 'Failed to get community workflow' },
      { status: 500 }
    );
  }
};
