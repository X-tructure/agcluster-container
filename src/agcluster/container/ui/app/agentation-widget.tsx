'use client';

import dynamic from 'next/dynamic';

const Agentation = dynamic(
  () => import('agentation').then((m) => m.Agentation),
  { ssr: false }
);

export default function AgentationWidget() {
  return <Agentation endpoint="http://localhost:4747" />;
}
