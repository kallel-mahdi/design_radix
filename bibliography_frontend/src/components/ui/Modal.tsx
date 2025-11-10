import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/common/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  closeButton = true,
}) => {
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full max-w-md rounded-lg border border-app-border bg-app-surface p-6 shadow-xl transition-all',
                  className,
                )}
              >
                {/* Header */}
                {(title || closeButton) && (
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      {title && (
                        <Dialog.Title className="text-lg font-semibold text-app-text-primary">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-app-text-secondary">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {closeButton && (
                      <button
                        onClick={onClose}
                        className="ml-2 inline-flex items-center justify-center rounded-lg text-app-text-secondary transition-colors hover:bg-app-bg-hover hover:text-app-text-primary"
                        aria-label="Close modal"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
