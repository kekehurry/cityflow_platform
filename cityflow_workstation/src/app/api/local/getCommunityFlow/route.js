import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const { flowURL } = await req.json();
    const flow = await fetch(flowURL).then((res) => res.json());
    return NextResponse.json({
      message: 'community workflow fetched successfully',
      flow,
    });
  } catch (error) {
    console.error('Error get community workflow:', error);
    return NextResponse.json(
      { error: 'Failed to get community workflow' },
      { status: 500 }
    );
  }
};
