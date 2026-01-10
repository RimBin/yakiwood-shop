'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

type AdminUserRow = {
  id: string
  email: string | null
  fullName: string | null
  role: string
  createdAt: string
  lastSignInAt: string | null
}

type DiscountRow = {
  role: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  is_active: boolean
  currency?: string
}

async function getAdminToken(): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export default function UsersAdminClient() {
  const t = useTranslations('adminUsers')
  const supabase = createClient()

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [discounts, setDiscounts] = useState<DiscountRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')

  const [selectedRole, setSelectedRole] = useState('user')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState<string>('0')
  const [discountActive, setDiscountActive] = useState(true)

  const roles = useMemo(() => {
    const set = new Set<string>(['user', 'admin'])
    users.forEach((u) => set.add(u.role))
    discounts.forEach((d) => set.add(d.role))
    return Array.from(set).sort()
  }, [users, discounts])

  useEffect(() => {
    const current = discounts.find((d) => d.role === selectedRole)
    if (current) {
      setDiscountType(current.discount_type)
      setDiscountValue(String(current.discount_value ?? 0))
      setDiscountActive(current.is_active !== false)
    } else {
      setDiscountType('percent')
      setDiscountValue('0')
      setDiscountActive(true)
    }
  }, [selectedRole, discounts])

  async function loadAll() {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getAdminToken()
      if (!token) throw new Error(t('errors.noSession'))

      const [usersRes, discountsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('/api/admin/role-discounts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      const usersJson = await usersRes.json()
      const discountsJson = await discountsRes.json()

      if (!usersRes.ok) throw new Error(usersJson?.error || t('errors.loadUsers'))
      if (!discountsRes.ok) throw new Error(discountsJson?.error || t('errors.loadDiscounts'))

      setUsers((usersJson?.users ?? []) as AdminUserRow[])
      setDiscounts((discountsJson?.discounts ?? []) as DiscountRow[])
    } catch (e: any) {
      setError(e?.message || t('errors.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateRole(userId: string, role: string) {
    try {
      const token = await getAdminToken()
      if (!token) throw new Error(t('errors.noSession'))

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || t('errors.updateRole'))

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (e: any) {
      alert(e?.message || t('errors.updateRole'))
    }
  }

  async function createUser() {
    try {
      const token = await getAdminToken()
      if (!token) throw new Error(t('errors.noSession'))

      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          role: newUserRole,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || t('errors.createUser'))

      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserFullName('')
      setNewUserRole('user')

      await loadAll()
    } catch (e: any) {
      alert(e?.message || t('errors.createUser'))
    }
  }

  async function saveDiscount() {
    try {
      const token = await getAdminToken()
      if (!token) throw new Error(t('errors.noSession'))

      const value = Number(discountValue)
      if (!Number.isFinite(value) || value < 0) throw new Error(t('errors.invalidDiscount'))
      if (discountType === 'percent' && value > 100) throw new Error(t('errors.invalidPercent'))

      const res = await fetch('/api/admin/role-discounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: selectedRole,
          discountType,
          discountValue: value,
          isActive: discountActive,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || t('errors.saveDiscount'))

      await loadAll()
    } catch (e: any) {
      alert(e?.message || t('errors.saveDiscount'))
    }
  }

  if (!supabase) {
    return (
      <div className="rounded-[16px] border border-[#BBBBBB] bg-white p-[16px]">
        <h2 className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('notConfigured.title')}</h2>
        <p className="font-['Outfit'] text-[14px] text-[#535353] mt-[8px]">{t('notConfigured.body')}</p>
      </div>
    )
  }

  return (
    <div>

      {error && (
        <div className="mb-6 border border-red-200 bg-red-50 text-red-800 rounded-lg px-4 py-3 font-['DM_Sans']">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users */}
        <div className="bg-white border border-[#E1E1E1] rounded-xl p-6">
          <h2 className="font-['DM_Sans'] text-xl font-medium text-[#161616]">{t('users.title')}</h2>

          <div className="mt-4 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="py-2 pr-3 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">{t('users.email')}</th>
                  <th className="py-2 pr-3 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">{t('users.role')}</th>
                  <th className="py-2 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">{t('users.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 font-['DM_Sans'] text-[#535353]">{t('loading')}</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 font-['DM_Sans'] text-[#535353]">{t('users.empty')}</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-[#F0F0F0]">
                      <td className="py-3 pr-3 font-['DM_Sans'] text-[#161616] text-sm">{u.email || '-'}</td>
                      <td className="py-3 pr-3">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          className="px-3 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white text-sm"
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 font-['DM_Sans'] text-sm text-[#535353]">{t('users.autoSave')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E1E1E1]">
            <h3 className="font-['DM_Sans'] text-lg font-medium text-[#161616]">{t('create.title')}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder={t('create.email')}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans']"
              />
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder={t('create.password')}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans']"
              />
              <input
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
                placeholder={t('create.fullName')}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans']"
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={createUser}
                className="h-[48px] px-[40px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:opacity-90"
              >
                {t('create.submit')}
              </button>
            </div>
          </div>
        </div>

        {/* Discounts */}
        <div className="bg-white border border-[#E1E1E1] rounded-xl p-6">
          <h2 className="font-['DM_Sans'] text-xl font-medium text-[#161616]">{t('discounts.title')}</h2>
          <p className="mt-2 font-['DM_Sans'] text-sm text-[#535353]">{t('discounts.help')}</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">
              {t('discounts.role')}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
                  {t('discounts.type')}
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
                >
                  <option value="percent">{t('discounts.types.percent')}</option>
                  <option value="fixed">{t('discounts.types.fixed')}</option>
                </select>
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
                  {discountType === 'percent' ? t('discounts.valuePercent') : t('discounts.valueFixed')}
                </label>
                <input
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  inputMode="decimal"
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans']"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-['DM_Sans'] text-sm text-[#161616]">
              <input
                type="checkbox"
                checked={discountActive}
                onChange={(e) => setDiscountActive(e.target.checked)}
              />
              {t('discounts.active')}
            </label>

            <button
              type="button"
              onClick={saveDiscount}
              className="h-[48px] px-[40px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:opacity-90"
            >
              {t('discounts.save')}
            </button>

            <button
              type="button"
              onClick={loadAll}
              className="h-[48px] px-[40px] border border-[#161616] text-[#161616] rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-white"
            >
              {t('refresh')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
