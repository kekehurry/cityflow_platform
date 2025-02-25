import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    // Get environment variables
    const defaultRuuner = process.env.DEFAULT_RUNNER || '';

    return NextResponse.json(defaultRuuner, { status: 200 });
  } catch (error) {
    console.error('Error get defaultRuuner:', error);
    return NextResponse.json(
      { error: `Failed to get defaultRuuner:${error}` },
      { status: 500 }
    );
  }
};
