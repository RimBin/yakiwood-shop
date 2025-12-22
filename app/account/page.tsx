'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface User {
  email: string;
  role: string;
  name: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface Address {
  id: string;
  type: 'delivery' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'info' | 'orders' | 'addresses' | 'password' | 'invoices'>('info');
  const [user, setUser] = useState<User | null>(null);

  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'delivery' as 'delivery' | 'billing',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Lietuva',
    phone: '',
    isDefault: false
  });

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        router.push('/login');
        return;
      }

      const userData: User = JSON.parse(userStr);
      setUser(userData);
      setEmail(userData.email);
      
      // Load demo data for demo user
      const nameParts = userData.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      // Load saved personal data from localStorage
      const savedData = localStorage.getItem(`user_data_${userData.email}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setPhone(data.phone || '');
      } else {
        // Set demo phone if no saved data
        setPhone('+370 600 00000');
      }

      // Load or create demo orders
      const savedOrders = localStorage.getItem(`user_orders_${userData.email}`);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        // Create demo orders
        const demoOrders: Order[] = [
          {
            id: 'ORD-2024-001',
            date: '2024-12-15',
            status: 'completed',
            total: 389.00,
            items: [
              { name: 'Lentos paketas "Classic"', quantity: 2, price: 159.00 },
              { name: 'Fasado dailylentės', quantity: 1, price: 71.00 }
            ]
          },
          {
            id: 'ORD-2024-002',
            date: '2024-11-28',
            status: 'processing',
            total: 159.00,
            items: [
              { name: 'Lentos paketas "Premium"', quantity: 1, price: 159.00 }
            ]
          }
        ];
        setOrders(demoOrders);
        localStorage.setItem(`user_orders_${userData.email}`, JSON.stringify(demoOrders));
      }

      // Load or create demo addresses
      const savedAddresses = localStorage.getItem(`user_addresses_${userData.email}`);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        // Create demo addresses
        const demoAddresses: Address[] = [
          {
            id: 'addr-1',
            type: 'delivery',
            firstName: nameParts[0] || 'Demo',
            lastName: nameParts.slice(1).join(' ') || 'User',
            address: 'Gedimino pr. 45',
            city: 'Vilnius',
            postalCode: '01109',
            country: 'Lietuva',
            phone: '+370 600 00000',
            isDefault: true
          }
        ];
        setAddresses(demoAddresses);
        localStorage.setItem(`user_addresses_${userData.email}`, JSON.stringify(demoAddresses));
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    // Save to localStorage (demo)
    const userData = {
      firstName,
      lastName,
      phone,
      email
    };

    localStorage.setItem(`user_data_${user.email}`, JSON.stringify(userData));

    setSuccess('Profilis sėkmingai atnaujintas!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map(addr =>
        addr.id === editingAddress
          ? { ...addressForm, id: editingAddress }
          : addr
      );
      setAddresses(updatedAddresses);
      localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(updatedAddresses));
      setEditingAddress(null);
    } else {
      // Add new address
      const newAddress: Address = {
        ...addressForm,
        id: `addr-${Date.now()}`
      };
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(updatedAddresses));
      setShowAddAddress(false);
    }

    // Reset form
    setAddressForm({
      type: 'delivery',
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Lietuva',
      phone: '',
      isDefault: false
    });

    setSuccess('Adresas išsaugotas sėkmingai!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company ?? '',
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingAddress(address.id);
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(updatedAddresses));
    setSuccess('Adresas ištrintas sėkmingai!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSetDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id && addr.type === addresses.find(a => a.id === id)?.type
    }));
    setAddresses(updatedAddresses);
    localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(updatedAddresses));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password
    if (newPassword !== confirmPassword) {
      setError('Nauji slaptažodžiai nesutampa');
      return;
    }

    if (newPassword.length < 6) {
      setError('Slaptažodis turi būti ne trumpesnis nei 6 simboliai');
      return;
    }

    // Demo: just show success
    setSuccess('Slaptažodis pakeistas sėkmingai!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSignOut = () => {
    handleLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Kraunama...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1] pt-[80px]">
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-[368px_1fr] gap-[40px]">
          {/* Left Sidebar - Menu */}
          <nav className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="bg-white rounded-[8px] p-[24px]">
              <button
                onClick={() => setActiveSection('info')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'info'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Mano informacija
              </button>
              <button
                onClick={() => setActiveSection('orders')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'orders'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Mano užsakymai
              </button>
              <button
                onClick={() => setActiveSection('addresses')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'addresses'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Adresų knyga
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'password'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Slaptažodis
              </button>
              <button
                onClick={() => router.push('/account/invoices')}
                className="w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] hover:bg-[#E1E1E1] transition-colors"
              >
                Sąskaitos faktūros
              </button>
              <hr className="my-[16px] border-[#E1E1E1]" />
              <button
                onClick={handleSignOut}
                className="w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-red-600 hover:bg-red-50 transition-colors"
              >
                Atsijungti
              </button>
            </div>
          </nav>

          {/* Right Content - Forms */}
          <div>
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-[24px] p-[16px] rounded-[8px] bg-red-50 border border-red-200">
                <p className="font-['Outfit'] text-[14px] text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-[24px] p-[16px] rounded-[8px] bg-green-50 border border-green-200">
                <p className="font-['Outfit'] text-[14px] text-green-600">{success}</p>
              </div>
            )}

            {/* My Information */}
            {activeSection === 'info' && (
              <form onSubmit={handleSaveInfo} className="max-w-[672px]">
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Mano informacija
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
                  <div>
                    <label htmlFor="firstName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Vardas
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Pavardė
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      El. paštas
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Telefonas
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-[16px]">
                  <button
                    type="button"
                    className="h-[48px] px-[24px] rounded-[100px] border border-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
                  >
                    Atšaukti
                  </button>
                  <button
                    type="submit"
                    className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    Išsaugoti pakeitimus
                  </button>
                </div>
              </form>
            )}

            {/* Orders */}
            {activeSection === 'orders' && (
              <div>
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Mano užsakymai
                  </h2>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-[40px]">
                    <p className="font-['Outfit'] text-[14px] text-[#535353] mb-[16px]">Neturite užsakymų</p>
                  </div>
                ) : (
                  <div className="space-y-[16px]">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-[8px] border border-[#BBBBBB] overflow-hidden">
                        <div className="p-[20px]">
                          <div className="flex flex-wrap items-start justify-between gap-[16px] mb-[16px]">
                            <div>
                              <h3 className="font-['Outfit'] font-medium text-[16px] text-[#161616] mb-[4px]">
                                Užsakymas #{order.id}
                              </h3>
                              <p className="font-['Outfit'] text-[12px] text-[#535353]">
                                {new Date(order.date).toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-[12px]">
                              <span className={`px-[12px] py-[4px] rounded-[100px] font-['Outfit'] text-[11px] uppercase ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {order.status === 'completed' ? 'Užbaigtas' :
                                 order.status === 'processing' ? 'Vykdomas' :
                                 order.status === 'pending' ? 'Laukiama' : 'Atšauktas'}
                              </span>
                              <button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="h-[36px] px-[20px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[11px] uppercase text-[#161616] hover:bg-[#E1E1E1] transition-colors"
                              >
                                {expandedOrder === order.id ? 'Paslėpti' : 'Peržiūrėti'}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-[16px] border-t border-[#E1E1E1]">
                            <span className="font-['Outfit'] text-[14px] text-[#535353]">
                              Iš viso: <span className="font-medium text-[#161616]">€{order.total.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                        
                        {expandedOrder === order.id && (
                          <div className="p-[20px] pt-0">
                            <div className="pt-[16px] border-t border-[#E1E1E1]">
                              <h4 className="font-['Outfit'] font-medium text-[14px] text-[#161616] mb-[12px]">Užsakymo turinys:</h4>
                              <div className="space-y-[8px]">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-[8px]">
                                    <div className="flex-1">
                                      <p className="font-['Outfit'] text-[14px] text-[#161616]">{item.name}</p>
                                      <p className="font-['Outfit'] text-[12px] text-[#535353]">Kiekis: {item.quantity}</p>
                                    </div>
                                    <p className="font-['Outfit'] text-[14px] font-medium text-[#161616]">€{(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {activeSection === 'addresses' && (
              <div>
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px] flex items-center justify-between">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Adresų knyga
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddAddress(!showAddAddress);
                      setEditingAddress(null);
                      if (!showAddAddress) {
                        setAddressForm({
                          type: 'delivery',
                          firstName: '',
                          lastName: '',
                          company: '',
                          address: '',
                          city: '',
                          postalCode: '',
                          country: 'Lietuva',
                          phone: '',
                          isDefault: false
                        });
                      }
                    }}
                    className="h-[36px] px-[20px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[11px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    {showAddAddress ? 'Atšaukti' : '+ Pridėti adresą'}
                  </button>
                </div>

                {/* Add/Edit Address Form */}
                {(showAddAddress || editingAddress) && (
                  <form onSubmit={handleSaveAddress} className="bg-white rounded-[8px] border border-[#BBBBBB] p-[20px] mb-[24px]">
                    <h3 className="font-['Outfit'] font-medium text-[16px] text-[#161616] mb-[16px]">
                      {editingAddress ? 'Redaguoti adresą' : 'Naujas adresas'}
                    </h3>
                    
                    <div className="mb-[16px]">
                      <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Adreso tipas</label>
                      <div className="flex gap-[12px]">
                        <button
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, type: 'delivery' })}
                          className={`px-[20px] py-[8px] rounded-[100px] font-['Outfit'] text-[12px] uppercase transition-colors ${
                            addressForm.type === 'delivery'
                              ? 'bg-[#161616] text-white'
                              : 'border border-[#161616] text-[#161616] hover:bg-[#E1E1E1]'
                          }`}
                        >
                          Pristatymas
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, type: 'billing' })}
                          className={`px-[20px] py-[8px] rounded-[100px] font-['Outfit'] text-[12px] uppercase transition-colors ${
                            addressForm.type === 'billing'
                              ? 'bg-[#161616] text-white'
                              : 'border border-[#161616] text-[#161616] hover:bg-[#E1E1E1]'
                          }`}
                        >
                          Sąskaitos
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[16px]">
                      <div>
                        <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Vardas *</label>
                        <input
                          type="text"
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Pavardė *</label>
                        <input
                          type="text"
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="mb-[16px]">
                      <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Įmonė (nebūtina)</label>
                      <input
                        type="text"
                        value={addressForm.company}
                        onChange={(e) => setAddressForm({ ...addressForm, company: e.target.value })}
                        className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                      />
                    </div>

                    <div className="mb-[16px]">
                      <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Adresas *</label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        required
                        className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] mb-[16px]">
                      <div>
                        <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Miestas *</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Pašto kodas *</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Šalis *</label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          required
                          className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="mb-[16px]">
                      <label className="block font-['Outfit'] text-[12px] uppercase text-[#161616] mb-[8px]">Telefonas *</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                        className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px]"
                      />
                    </div>

                    <div className="mb-[24px]">
                      <label className="flex items-center gap-[8px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-[18px] h-[18px]"
                        />
                        <span className="font-['Outfit'] text-[14px] text-[#161616]">Nustatyti kaip numatytąjį adresą</span>
                      </label>
                    </div>

                    <div className="flex gap-[12px]">
                      <button
                        type="submit"
                        className="flex-1 h-[48px] rounded-[100px] bg-[#161616] font-['Outfit'] text-[12px] uppercase text-white hover:bg-[#535353] transition-colors"
                      >
                        {editingAddress ? 'Atnaujinti' : 'Išsaugoti'}
                      </button>
                      {editingAddress && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(null);
                            setAddressForm({
                              type: 'delivery',
                              firstName: '',
                              lastName: '',
                              company: '',
                              address: '',
                              city: '',
                              postalCode: '',
                              country: 'Lietuva',
                              phone: '',
                              isDefault: false
                            });
                          }}
                          className="h-[48px] px-[32px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[12px] uppercase text-[#161616] hover:bg-[#E1E1E1] transition-colors"
                        >
                          Atšaukti
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                  <div className="text-center py-[40px]">
                    <p className="font-['Outfit'] text-[14px] text-[#535353]">Neturite išsaugotų adresų</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white rounded-[8px] border border-[#BBBBBB] p-[20px] relative">
                        {address.isDefault && (
                          <span className="absolute top-[12px] right-[12px] px-[8px] py-[2px] rounded-[100px] bg-green-100 font-['Outfit'] text-[10px] uppercase text-green-700">
                            Numatytasis
                          </span>
                        )}
                        <div className="mb-[12px]">
                          <span className="inline-block px-[12px] py-[4px] rounded-[100px] bg-[#E1E1E1] font-['Outfit'] text-[11px] uppercase text-[#161616] mb-[8px]">
                            {address.type === 'delivery' ? 'Pristatymas' : 'Sąskaitos'}
                          </span>
                          <h3 className="font-['Outfit'] font-medium text-[16px] text-[#161616]">
                            {address.firstName} {address.lastName}
                          </h3>
                          {address.company && (
                            <p className="font-['Outfit'] text-[14px] text-[#535353]">{address.company}</p>
                          )}
                        </div>
                        <div className="font-['Outfit'] text-[14px] text-[#535353] space-y-[4px] mb-[16px]">
                          <p>{address.address}</p>
                          <p>{address.postalCode} {address.city}</p>
                          <p>{address.country}</p>
                          <p>{address.phone}</p>
                        </div>
                        <div className="flex gap-[8px]">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="h-[32px] px-[16px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[11px] uppercase text-[#161616] hover:bg-[#E1E1E1] transition-colors"
                          >
                            Redaguoti
                          </button>
                          {!address.isDefault && (
                            <>
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="h-[32px] px-[16px] rounded-[100px] border border-[#535353] font-['Outfit'] text-[11px] uppercase text-[#535353] hover:bg-[#E1E1E1] transition-colors"
                              >
                                Numatytasis
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="h-[32px] px-[16px] rounded-[100px] bg-red-500 font-['Outfit'] text-[11px] uppercase text-white hover:bg-red-600 transition-colors"
                              >
                                Ištrinti
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Change Password */}
            {activeSection === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-[672px]">
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Keisti slaptažodį
                  </h2>
                </div>

                <div className="space-y-[16px] mb-[24px]">
                  <div>
                    <label htmlFor="currentPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Dabartinis slaptažodis
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Naujas slaptažodis
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Patvirtinkite naują slaptažodį
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                    <p className="mt-[8px] font-['Outfit'] font-light text-[12px] leading-[1.5] text-[#535353]">
                      Slaptažodis turi būti ne trumpesnis nei 6 simboliai
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                >
                  Keisti slaptažodį
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
