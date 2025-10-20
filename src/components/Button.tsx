import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({ 
  variant = 'primary', 
  icon: Icon, 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
