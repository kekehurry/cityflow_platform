import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const POST = async (req) => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const executorServer = process.env.EXECUTOR_SERVER;
  try {
    // Parse the request body
    const { flowId, userId, sessionId, image, codeBlock } = await req.json();

    // Make a POST request to the dataset server
    const response = await fetch(`${executorServer}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, userId, sessionId, image, codeBlock }),
    });

    if (response.ok) {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
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
