'use client';
import React, { Suspense } from 'react';
import UserPage from './user';

export default function AuthorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserPage />
    </Suspense>
  );
}
