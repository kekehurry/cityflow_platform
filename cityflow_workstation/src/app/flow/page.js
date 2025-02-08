'use client';
import React, { Suspense } from 'react';
import FlowInterface from './components/FlowInterface';

export default function FlowPage() {
  return (
    <Suspense fallback={<div>loading</div>}>
      <FlowInterface />
    </Suspense>
  );
}
