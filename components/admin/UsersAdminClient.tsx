'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import {
  AdminButton,
  AdminInput,
  AdminLabel,
  AdminSectionTitle,
  AdminSelect,
  AdminStack,
} from '@/components/admin/ui/AdminUI'

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

  function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) return error.message
    if (typeof error === 'string' && error) return error
    return fallback
  }

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
  const [newRoleName, setNewRoleName] = useState('')
  const [createRoleError, setCreateRoleError] = useState<string | null>(null)
  const [createRoleInfo, setCreateRoleInfo] = useState<string | null>(null)
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  function normalizeRoleName(value: string) {
    return value.trim().replace(/\s+/g, ' ')
  }

  function isValidRoleName(value: string) {
    if (!value) return false
    if (value.length > 64) return false
    return /^[A-Za-z0-9_-]+(?: [A-Za-z0-9_-]+)*$/.test(value)
  }

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
    } catch (error: unknown) {
      setError(getErrorMessage(error, t('errors.generic')))
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, t('errors.updateRole')))
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, t('errors.createUser')))
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, t('errors.saveDiscount')))
    }
  }

  async function createRole() {
    setCreateRoleError(null)
    setCreateRoleInfo(null)

    const normalizedRole = normalizeRoleName(newRoleName)
    if (!isValidRoleName(normalizedRole)) {
      setCreateRoleError(t('discounts.createRole.errors.invalidRole'))
      return
    }

    if (roles.includes(normalizedRole)) {
      setSelectedRole(normalizedRole)
      setCreateRoleInfo(t('discounts.createRole.errors.roleExists'))
      return
    }

    setIsCreatingRole(true)
    try {
      const token = await getAdminToken()
      if (!token) throw new Error(t('errors.noSession'))

      let value = Number(discountValue)
      if (!Number.isFinite(value) || value < 0) value = 0
      if (discountType === 'percent' && value > 100) value = 0

      const res = await fetch('/api/admin/role-discounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: normalizedRole,
          discountType,
          discountValue: value,
          isActive: discountActive,
        }),
      })

      type ApiErrorResponse = { error?: unknown }
      const json = (await res.json().catch(() => ({}))) as ApiErrorResponse
      if (!res.ok) {
        const apiError = typeof json?.error === 'string' ? json.error : undefined
        const maybeExists = res.status === 409 || (apiError && /exists|duplicate/i.test(apiError))
        if (maybeExists) {
          setSelectedRole(normalizedRole)
          setCreateRoleInfo(t('discounts.createRole.errors.roleExists'))
          return
        }

        throw new Error(apiError || t('errors.saveDiscount'))
      }

      setNewRoleName('')
      setSelectedRole(normalizedRole)
      await loadAll()
    } catch (error: unknown) {
      setCreateRoleError(getErrorMessage(error, t('errors.saveDiscount')))
    } finally {
      setIsCreatingRole(false)
    }
  }

  if (!supabase) {
    return (
      <div>
        <AdminSectionTitle>{t('notConfigured.title')}</AdminSectionTitle>
        <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">{t('notConfigured.body')}</p>
      </div>
    )
  }

  return (
    <AdminStack>
      {error && (
        <div className="border border-red-200 bg-[#EAEAEA] text-red-700 rounded-[16px] px-[16px] py-[12px] font-['Outfit'] text-[13px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(16px,2vw,24px)]">
        {/* Users */}
        <div className="border border-[#E1E1E1] rounded-[24px] p-[clamp(16px,2vw,24px)] bg-[#EAEAEA]">
          <AdminSectionTitle>{t('users.title')}</AdminSectionTitle>

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
                        <div className="min-w-[180px]">
                          <AdminSelect value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                          </AdminSelect>
                        </div>
                      </td>
                      <td className="py-3 font-['DM_Sans'] text-sm text-[#535353]">{t('users.autoSave')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E1E1E1]">
            <div className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('create.title')}</div>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <AdminInput
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder={t('create.email')}
              />
              <AdminInput
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder={t('create.password')}
              />
              <AdminInput
                value={newUserFullName}
                onChange={(e) => setNewUserFullName(e.target.value)}
                placeholder={t('create.fullName')}
              />
              <AdminSelect value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </AdminSelect>
              <AdminButton onClick={createUser}>
                {t('create.submit')}
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Discounts */}
        <div className="border border-[#E1E1E1] rounded-[24px] p-[clamp(16px,2vw,24px)] bg-[#EAEAEA]">
          <AdminSectionTitle>{t('discounts.title')}</AdminSectionTitle>
          <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">{t('discounts.help')}</p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <AdminLabel className="mb-[6px]">{t('discounts.role')}</AdminLabel>
              <AdminSelect value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              </AdminSelect>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <AdminLabel className="mb-[6px]">{t('discounts.type')}</AdminLabel>
                <AdminSelect
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value === 'fixed' ? 'fixed' : 'percent')}
                >
                  <option value="percent">{t('discounts.types.percent')}</option>
                  <option value="fixed">{t('discounts.types.fixed')}</option>
                </AdminSelect>
              </div>
              <div>
                <AdminLabel className="mb-[6px]">
                  {discountType === 'percent' ? t('discounts.valuePercent') : t('discounts.valueFixed')}
                </AdminLabel>
                <AdminInput
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  inputMode="decimal"
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

            <div className="mt-3 pt-4 border-t border-[#E1E1E1]">
              <div className="font-['DM_Sans'] text-[18px] font-medium text-[#161616]">{t('discounts.createRole.title')}</div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <AdminLabel>{t('discounts.createRole.label')}</AdminLabel>

                <div className="flex flex-col sm:flex-row gap-3">
                  <AdminInput
                    value={newRoleName}
                    onChange={(e) => {
                      setNewRoleName(e.target.value)
                      setCreateRoleError(null)
                      setCreateRoleInfo(null)
                    }}
                    placeholder={t('discounts.createRole.placeholder')}
                  />

                  <AdminButton
                    type="button"
                    size="md"
                    onClick={createRole}
                    disabled={isCreatingRole || !isValidRoleName(normalizeRoleName(newRoleName))}
                  >
                    {t('discounts.createRole.button')}
                  </AdminButton>
                </div>

                {createRoleError && (
                  <div className="font-['DM_Sans'] text-sm text-red-700">{createRoleError}</div>
                )}
                {createRoleInfo && (
                  <div className="font-['DM_Sans'] text-sm text-[#535353]">{createRoleInfo}</div>
                )}
              </div>
            </div>

            <AdminButton type="button" onClick={saveDiscount}>
              {t('discounts.save')}
            </AdminButton>

            <AdminButton type="button" variant="outline" onClick={loadAll}>
              {t('refresh')}
            </AdminButton>
          </div>
        </div>
      </div>
    </AdminStack>
  )
}
