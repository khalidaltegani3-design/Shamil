"use client";

import dynamic from 'next/dynamic';

const ConnectionStatus = dynamic(
  () => import('./connection-status').then(mod => mod.ConnectionStatus),
  { ssr: false }
);

export function ConnectionWrapper() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <ConnectionStatus />
    </div>
  );
}