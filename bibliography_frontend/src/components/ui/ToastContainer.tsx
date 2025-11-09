import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Toast } from './Toast';

const TOAST_DURATION = 5000; // 5 seconds

export function ToastContainer() {
	const toasts = useUIStore((state) => state.toasts);
	const removeToast = useUIStore((state) => state.removeToast);

	useEffect(() => {
		if (toasts.length === 0) return;

		// Auto-dismiss toasts after TOAST_DURATION
		const timers = toasts.map((toast) => {
			return setTimeout(() => {
				removeToast(toast.id);
			}, TOAST_DURATION);
		});

		return () => {
			timers.forEach((timer) => clearTimeout(timer));
		};
	}, [toasts, removeToast]);

	if (toasts.length === 0) return null;

	return (
		<div
			className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
			aria-live="polite"
			aria-atomic="false"
		>
			{toasts.map((toast) => (
				<div key={toast.id} className="pointer-events-auto animate-slide-in-right">
					<Toast
						id={toast.id}
						message={toast.message}
						type={toast.type}
						onClose={removeToast}
					/>
				</div>
			))}
		</div>
	);
}
