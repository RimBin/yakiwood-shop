'use client';

interface StockIndicatorProps {
  quantity: number;
  threshold?: number;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StockIndicator({ 
  quantity, 
  threshold = 10, 
  showQuantity = false,
  size = 'md' 
}: StockIndicatorProps) {
  const getStatus = () => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= threshold) return 'low-stock';
    return 'in-stock';
  };

  const status = getStatus();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const statusConfig = {
    'in-stock': {
      label: 'In Stock',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: '✓',
    },
    'low-stock': {
      label: 'Low Stock',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '⚠',
    },
    'out-of-stock': {
      label: 'Out of Stock',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '✕',
    },
  };

  const config = statusConfig[status];

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
      `}
    >
      <span className="leading-none">{config.icon}</span>
      <span>
        {config.label}
        {showQuantity && status !== 'out-of-stock' && ` (${quantity})`}
      </span>
    </span>
  );
}

interface PreOrderBadgeProps {
  availableDate?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PreOrderBadge({ availableDate, size = 'md' }: PreOrderBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        bg-blue-100 text-blue-800 ${sizeClasses[size]}
      `}
    >
      <span className="leading-none">⏰</span>
      <span>
        Pre-Order
        {availableDate && ` • Ships ${new Date(availableDate).toLocaleDateString()}`}
      </span>
    </span>
  );
}
