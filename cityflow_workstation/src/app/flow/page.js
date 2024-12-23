'use client';
import React, { Suspense } from 'react';
import FlowStation from './flowstation';

export default function FlowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlowStation />
    </Suspense>
  );
}
