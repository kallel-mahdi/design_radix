import { createFileRoute } from '@tanstack/react-router';
import { useUIStore } from '../store/ui.store';
import { useEffect } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Route = createFileRoute('/sharing')({
  component: SharingPage,
});

export function SharingPage() {
  const { setActiveView } = useUIStore();

  useEffect(() => {
    setActiveView('sharing');
  }, [setActiveView]);

  return (
    <div className="flex-1 overflow-auto bg-app-bg">
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-app-accent/10">
              <UserGroupIcon className="w-12 h-12 text-app-accent" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-app-text mb-3">
            START COLLABORATING
          </h1>

          {/* Description */}
          <p className="text-app-text-muted mb-8">
            Invite others to work together on your bibliography
          </p>

          {/* Invite Form */}
          <div className="bg-app-surface rounded-lg p-6 border border-app-border mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app-text mb-2">
                  Invite by email
                </label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
              </div>
              <Button disabled variant="primary" className="w-full">
                Send Invite
              </Button>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-app-accent/20 border border-app-accent/50">
            <div className="w-2 h-2 rounded-full bg-app-accent" />
            <span className="text-sm text-app-accent font-medium">Coming in Phase 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
