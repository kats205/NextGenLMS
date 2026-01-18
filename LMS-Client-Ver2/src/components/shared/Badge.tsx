interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'primary' | 'secondary';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ variant, children, size = 'sm' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    danger: 'bg-danger-100 text-danger-700 border-danger-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
