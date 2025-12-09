'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'info' | 'delivery' | 'password'>('info');

  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Delivery Info
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || '');
      
      // Load user profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const fullName = profile.full_name || '';
        const [first, ...rest] = fullName.split(' ');
        setFirstName(first || '');
        setLastName(rest.join(' ') || '');
        setPhone(profile.phone || '');
      }

      // Load delivery info if exists
      const { data: deliveryData } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_default', true)
        .single();

      if (deliveryData) {
        setCountry(deliveryData.country || '');
        setCity(deliveryData.city || '');
        setAddress(`${deliveryData.street_address || ''}`);
        setPostalCode(deliveryData.postal_code || '');
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) return;

    const fullName = `${firstName} ${lastName}`.trim();

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      setError('Failed to update profile: ' + updateError.message);
    } else {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Update password
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (passwordError) {
      setError('Failed to change password: ' + passwordError.message);
    } else {
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Loading...</div>
      </div>
    );
  }

  return (ect('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    const addressData = {
      user_id: userId,
      country: country,
      city: city,
      street_address: address,
      postal_code: postalCode,
      is_default: true,
      updated_at: new Date().toISOString()
    };

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
                My Information
              </button>
              <button
                onClick={() => setActiveSection('delivery')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'delivery'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Delivery Info
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'password'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Password
              </button>
              <hr className="my-[16px] border-[#E1E1E1]" />
              <button
                onClick={handleSignOut}
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
                    My Information
                  </h2>
                </div>max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px]">
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
                My Information
              </button>
              <button
                onClick={() => setActiveSection('delivery')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'delivery'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Delivery Info
              </button>
              <button
                onClick={() => setActiveSection('password')}
                className={`w-full text-left px-[16px] py-[12px] rounded-[4px] font-['Outfit'] font-normal text-[14px] leading-[1.5] transition-colors ${
                  activeSection === 'password'
                    ? 'bg-[#161616] text-white'
                    : 'text-[#161616] hover:bg-[#E1E1E1]'
                }`}
              >
                Password
              </button>
            </div>
          </nav>

          {/* Right Content - Forms */}
          <div>
            {/* My Information */}
            {activeSection === 'info' && (
              <form onSubmit={handleSaveInfo} className="max-w-[672px]">
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    My Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
                  <div>
                    <label htmlFor="firstName" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      First Name
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
                      Last Name
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
                      Email
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
                      Phone
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Delivery Information */}
            {activeSection === 'delivery' && (
              <form onSubmit={handleSaveDelivery} className="max-w-[672px]">
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Delivery Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[24px]">
                  <div>
                    <label htmlFor="country" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full h-[48px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Change Password */}
            {activeSection === 'password' && (
              <form onSubmit={handleChangePassword} className="max-w-[672px]">
                <div className="pb-[16px] border-b border-[#BBBBBB] mb-[24px]">
                  <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                    Change Password
                  </h2>
                </div>

                <div className="space-y-[16px] mb-[24px]">
                  <div>
                    <label htmlFor="currentPassword" className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                      Current Password
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
                      New Password
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
                      Confirm New Password
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
                      Password must be at least 8 characters long and contain a mix of letters and numbers
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                >
                  Change Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
