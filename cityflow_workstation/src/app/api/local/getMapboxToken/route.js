import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const GET = async (req) => {
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN;
    // console.log("Module List:", moduleList);
    return NextResponse.json(mapboxToken);
  } catch (error) {
    console.error('Error get module list:', error);
    return NextResponse.json(
      { error: 'Failed to get module list' },
      { status: 500 }
    );
  }
};
