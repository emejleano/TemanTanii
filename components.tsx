import React from 'react';
import { User, Role, FarmerStatus, Product, Article, DevicePurchase, ProduceOrderStatus } from './types';

// FIX: Update Icon component to accept a className prop for custom styling.
export const IconLeaf: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className || ''}`.trim()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536A9.003 9.003 0 0112 15c-1.24 0-2.43.26-3.536.728M12 21C6.477 21 2 16.523 2 11S6.477 1 12 1s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);

// FIX: Update Icon component to accept a className prop for custom styling.
export const IconSun: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className || ''}`.trim()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// FIX: Update Icon component to accept a className prop for custom styling.
export const IconDrop: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className || ''}`.trim()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.523 0-10 4.477-10 10 0 2.25.743 4.33 2 6 .5.667 1.333 1 2 1h12c.667 0 1.5-.333 2-1 1.257-1.67 2-3.75 2-6 0-5.523-4.477-10-10-10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c-1.88 0-3.41-1.53-3.41-3.41S10.12 6 12 6s3.41 1.53 3.41 3.41S13.88 12.75 12 12.75z" />
  </svg>
);

// FIX: Update Icon component to accept a className prop for custom styling.
export const IconChat: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className || ''}`.trim()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
);

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  </div>
);

// FIX: Add `size` prop to ButtonProps to allow for different button sizes.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

// FIX: Update Button component to handle the new `size` prop and adjust classes accordingly.
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2',
  };
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden p-6 ${className}`}>
      {children}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// FIX: Update Input component to correctly accept and merge a `className` prop.
export const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input id={id} className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${className || ''}`} {...props} />
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: FarmerStatus | ProduceOrderStatus;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    // FIX: Removed duplicate keys from the `statusStyles` object. The `FarmerStatus` and `ProduceOrderStatus` enums had members with identical string values ('Menunggu Pembayaran' and 'Dalam Pengiriman'), causing errors.
    const statusStyles: { [key: string]: string } = {
        // Farmer Statuses
        [FarmerStatus.REGISTERED]: 'bg-gray-100 text-gray-800',
        [FarmerStatus.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800',
        [FarmerStatus.PENDING_SHIPMENT]: 'bg-blue-100 text-blue-800',
        [FarmerStatus.SHIPPING]: 'bg-cyan-100 text-cyan-800',
        [FarmerStatus.DELIVERED]: 'bg-indigo-100 text-indigo-800',
        [FarmerStatus.PENDING_INSTALLATION_CONFIRMATION]: 'bg-purple-100 text-purple-800',
        [FarmerStatus.ACTIVE]: 'bg-gray-100 text-gray-800', // Now means ready to connect device
        [FarmerStatus.DEVICE_OFFLINE]: 'bg-red-100 text-red-800',
        [FarmerStatus.DEVICE_ONLINE]: 'bg-green-100 text-green-800',
        // Produce Order Statuses
        [ProduceOrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
        [ProduceOrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
        [ProduceOrderStatus.CANCELED]: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};
