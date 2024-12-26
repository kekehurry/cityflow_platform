import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export const POST = async (req) => {
  // Load environment variables
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  // Get environment variables
  const BASE_URL = process.env.LLM_BASE_URL;
  const API_KEY = process.env.LLM_API_KEY;
  const LLM_MODEL = process.env.LLM_MODEL;

  try {
    // Parse the request body
    const { messages } = await req.json();

    // Make a POST request to the external API with streaming enabled
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages,
        stream: true, // Enable streaming
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get llm response' },
        { status: response.status }
      );
    }

    // Create a readable stream to forward the chunks to the client
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body.getReader();

        // Define a function to read and forward chunks
        const push = async () => {
          try {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }

            // Enqueue the chunk for the client
            controller.enqueue(value);
            push();
          } catch (error) {
            console.error('Error while reading stream:', error);
            controller.error(error);
          }
        };

        push();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in API handler:', error);
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
