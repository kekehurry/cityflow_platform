import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const { communityURL } = await req.json();
    const data = await fetch(communityURL).then((res) => res.json());

    let communityFlows = [];
    if (Array.isArray(data?.basic)) {
      const basicFlows = await Promise.all(
        data.basic.map(async (item) => {
          try {
            const r = await fetch(item);
            const flow = await r.json();
            flow.basic = true;
            flow.private = false;
            flow.globalScale = 0.01;
            return flow;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
      );
      communityFlows.push(...basicFlows.filter(Boolean));
    }
    if (Array.isArray(data?.tutorial)) {
      const tutorialFlows = await Promise.all(
        data.tutorial.map(async (item) => {
          try {
            const r = await fetch(item);
            const flow = await r.json();
            flow.tutorial = true;
            flow.private = false;
            flow.showcase = false;
            flow.basic = false;
            flow.globalScale = 0.01;
            return flow;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
      );
      communityFlows.push(...tutorialFlows.filter(Boolean));
    }
    if (Array.isArray(data?.showcase)) {
      const showcaseFlows = await Promise.all(
        data.showcase.map(async (item) => {
          try {
            const r = await fetch(item);
            const flow = await r.json();
            flow.tutorial = false;
            flow.showcase = true;
            flow.private = false;
            flow.basic = false;
            flow.globalScale = 0.01;
            return flow;
          } catch (err) {
            console.error(err);
            return null;
          }
        })
      );
      communityFlows.push(...showcaseFlows.filter(Boolean));
    }
    return NextResponse.json({
      message: 'community workflows fetched successfully',
      communityFlows,
    });
  } catch (error) {
    console.error('Error get community workflows:', error);
    return NextResponse.json(
      { error: 'Failed to get community workflows' },
      { status: 500 }
    );
  }
};
