import { cva, type VariantProps } from 'class-variance-authority';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/common/utils';

const toastVariants = cva(
	'flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 max-w-md',
	{
		variants: {
			type: {
				success: 'bg-green-900/90 border-green-500 text-green-100',
				error: 'bg-red-900/90 border-red-500 text-red-100',
				warning: 'bg-yellow-900/90 border-yellow-500 text-yellow-100',
				info: 'bg-blue-900/90 border-blue-500 text-blue-100',
			},
		},
		defaultVariants: {
			type: 'info',
		},
	}
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
	id: string;
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	onClose: (id: string) => void;
}

const iconMap = {
	success: CheckCircleIcon,
	error: ExclamationCircleIcon,
	warning: ExclamationTriangleIcon,
	info: InformationCircleIcon,
};

export function Toast({ id, message, type = 'info', onClose }: ToastProps) {
	const Icon = iconMap[type];

	return (
		<div
			className={cn(toastVariants({ type }))}
			role="alert"
			aria-live="polite"
			aria-atomic="true"
		>
			<Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
			<p className="flex-1 text-sm font-medium">{message}</p>
			<button
				onClick={() => onClose(id)}
				className="flex-shrink-0 hover:opacity-70 transition-opacity"
				aria-label="Close notification"
			>
				<XMarkIcon className="w-5 h-5" />
			</button>
		</div>
	);
}
