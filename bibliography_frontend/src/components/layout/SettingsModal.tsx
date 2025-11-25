import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SparklesIcon } from '@heroicons/react/24/outline';

type SettingsTab = 'general' | 'project-defaults' | 'shortcuts' | 'storage';

interface SettingsModalProps {
  tab: SettingsTab;
  onClose: () => void;
}

const tabLabels: Record<SettingsTab, string> = {
  general: 'General Settings',
  'project-defaults': 'Project Defaults',
  shortcuts: 'Keyboard Shortcuts',
  storage: 'Storage/Sync',
};

const tabDescriptions: Record<SettingsTab, string> = {
  general: 'Customize your bibliography experience with language, theme, and default view options.',
  'project-defaults': 'Set default bibliography style, citation commands, and project-specific preferences.',
  shortcuts: 'View and customize keyboard shortcuts for faster navigation and common actions.',
  storage: 'Manage storage location, sync settings, and backup/restore your data.',
};

export const SettingsModal = ({ tab, onClose }: SettingsModalProps) => {
  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-app-surface rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-app-accent/10">
              <SparklesIcon className="w-8 h-8 text-app-accent" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-app-text mb-3">
            {tabLabels[tab]}
          </h2>

          {/* Description */}
          <p className="text-app-text-muted mb-8">
            {tabDescriptions[tab]}
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-flex flex-col items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-app-accent/10 border border-app-accent/30">
              <div className="w-2 h-2 rounded-full bg-app-accent" />
              <span className="text-sm text-app-accent font-medium">Coming in Phase 2</span>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
