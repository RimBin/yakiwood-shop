'use client';

import Image from 'next/image';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  configuration_snapshot: any;
  products: {
    name: string;
    slug: string;
  } | null;
}

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const statusConfig = {
  pending: {
    label: 'Laukiama',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  processing: {
    label: 'Vykdomas',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  shipped: {
    label: 'Išsiųstas',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  delivered: {
    label: 'Pristatytas',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Atšauktas',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
};

export default function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
}: OrderCardProps) {
  const statusInfo =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  const formattedDate = new Date(order.created_at).toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(order.created_at).toLocaleTimeString('lt-LT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalItems = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#E1E1E1] hover:shadow-md transition-shadow">
      {/* Order Summary (Always Visible) */}
      <div
        className="p-6 cursor-pointer"
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggleExpand();
          }
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-['DM_Sans'] font-medium text-[#161616]">
                Užsakymas #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-['DM_Sans'] font-medium border ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-[#535353] font-['DM_Sans']">
              {formattedDate} • {formattedTime}
            </p>
            <p className="text-sm text-[#535353] font-['DM_Sans'] mt-1">
              {totalItems} {totalItems === 1 ? 'prekė' : 'prekės'}
            </p>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-[#535353] font-['DM_Sans'] mb-1">
                Suma
              </p>
              <p className="text-2xl font-['DM_Sans'] font-medium text-[#161616]">
                €{order.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <svg
                className={`w-6 h-6 text-[#535353] transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-[#E1E1E1] bg-[#FAFAFA]">
          <div className="p-6 space-y-6">
            {/* Order Items */}
            <div>
              <h4 className="text-sm font-['DM_Sans'] font-medium text-[#161616] mb-4 uppercase tracking-wide">
                Užsakytos prekės
              </h4>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white p-4 rounded-[12px]"
                  >
                    <div className="w-16 h-16 bg-[#EAEAEA] rounded-[8px] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-[#BBBBBB]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-['DM_Sans'] font-medium text-[#161616]">
                        {item.product_name}
                      </h5>
                      <p className="text-sm text-[#535353] font-['DM_Sans']">
                        Kiekis: {item.quantity}
                      </p>
                      {item.configuration_snapshot && (
                        <p className="text-xs text-[#BBBBBB] font-['DM_Sans'] mt-1">
                          {item.configuration_snapshot.color && (
                            <span>Spalva: {item.configuration_snapshot.color}</span>
                          )}
                          {item.configuration_snapshot.finish && (
                            <span className="ml-2">
                              Apdaila: {item.configuration_snapshot.finish}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-['DM_Sans'] font-medium text-[#161616]">
                        €{item.total_price.toFixed(2)}
                      </p>
                      <p className="text-sm text-[#535353] font-['DM_Sans']">
                        €{item.unit_price.toFixed(2)} / vnt
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-['DM_Sans'] font-medium text-[#161616] mb-3 uppercase tracking-wide">
                  Pristatymo informacija
                </h4>
                <div className="bg-white p-4 rounded-[12px] space-y-2">
                  <p className="font-['DM_Sans'] font-medium text-[#161616]">
                    {order.shipping_name}
                  </p>
                  <p className="text-sm text-[#535353] font-['DM_Sans']">
                    {order.shipping_address}
                  </p>
                  <p className="text-sm text-[#535353] font-['DM_Sans']">
                    {order.shipping_city}, {order.shipping_postal_code}
                  </p>
                  <p className="text-sm text-[#535353] font-['DM_Sans']">
                    {order.shipping_country}
                  </p>
                  {order.shipping_phone && (
                    <p className="text-sm text-[#535353] font-['DM_Sans']">
                      Tel: {order.shipping_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="text-sm font-['DM_Sans'] font-medium text-[#161616] mb-3 uppercase tracking-wide">
                  Mokėjimo informacija
                </h4>
                <div className="bg-white p-4 rounded-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#535353] font-['DM_Sans']">
                      Būsena:
                    </span>
                    <span className="text-sm font-['DM_Sans'] font-medium text-[#161616] capitalize">
                      {order.payment_status === 'completed'
                        ? 'Apmokėta'
                        : order.payment_status === 'pending'
                        ? 'Laukiama'
                        : order.payment_status === 'failed'
                        ? 'Nepavyko'
                        : order.payment_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#535353] font-['DM_Sans']">
                      Valiuta:
                    </span>
                    <span className="text-sm font-['DM_Sans'] font-medium text-[#161616]">
                      {order.currency}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E1E1E1]">
                    <span className="text-sm font-['DM_Sans'] font-medium text-[#161616]">
                      Iš viso:
                    </span>
                    <span className="text-lg font-['DM_Sans'] font-medium text-[#161616]">
                      €{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h4 className="text-sm font-['DM_Sans'] font-medium text-[#161616] mb-3 uppercase tracking-wide">
                  Pastabos
                </h4>
                <div className="bg-white p-4 rounded-[12px]">
                  <p className="text-sm text-[#535353] font-['DM_Sans']">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <a
                href={`mailto:info@yakiwood.lt?subject=Užsakymas ${order.id.slice(
                  0,
                  8
                ).toUpperCase()}`}
                className="flex-1 px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium text-center hover:bg-[#2d2d2d] transition-colors"
              >
                Susisiekti
              </a>
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        'Ar tikrai norite atšaukti šį užsakymą? Susisieksime su jumis dėl grąžinimo.'
                      )
                    ) {
                      // TODO: Implement cancel order functionality
                      alert('Užsakymo atšaukimo funkcija dar nerealizuota');
                    }
                  }}
                  className="px-6 py-3 bg-white text-[#161616] border border-[#E1E1E1] rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#FAFAFA] transition-colors"
                >
                  Atšaukti užsakymą
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
