import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-accent mb-4">
          Bibliography Manager
        </h1>
        <p className="text-text-secondary">
          Session 1: Infrastructure Setup Complete
        </p>
      </div>
    </div>
  ),
});
