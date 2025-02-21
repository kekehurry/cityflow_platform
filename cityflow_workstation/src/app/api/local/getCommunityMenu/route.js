import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const { communityURL } = await req.json();

    const communityMenu = await fetch(communityURL).then((res) => res.json());

    return NextResponse.json({
      message: 'community workflows fetched successfully',
      communityMenu,
    });
  } catch (error) {
    console.error('Error get community workflows:', error);
    return NextResponse.json(
      { error: 'Failed to get community workflows' },
      { status: 500 }
    );
  }
};
