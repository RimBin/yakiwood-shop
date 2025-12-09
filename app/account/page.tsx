'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <p className="font-['Outfit'] text-[16px] text-[#161616]">Kraunama...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-4">
        <div className="bg-white rounded-[12px] p-8 max-w-[420px] w-full text-center shadow-sm">
          <h1 className="font-['DM_Sans'] text-[32px] font-light tracking-tight text-[#161616] mb-4">Prisijunkite</h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353] mb-6">
            Norėdami peržiūrėti paskyros informaciją, prisijunkite prie savo paskyros.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-[48px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#535353]"
          >
            Eiti į prisijungimą
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1] px-[16px] md:px-[40px] py-[32px]">
      <div className="max-w-[960px] mx-auto bg-white rounded-[16px] p-[32px] shadow-sm">
        <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] mb-2">Paskyra</p>
        <h1 className="font-['DM_Sans'] text-[40px] font-light text-[#161616] tracking-[-1.2px] mb-6">
          Sveiki sugrįžę, {session.user.email}
        </h1>
        <p className="font-['Outfit'] text-[16px] text-[#535353] leading-[1.5]">
          Paskyros valdymo skiltis dar ruošiama. Netrukus čia galėsite redaguoti asmeninius duomenis,
          pristatymo adresus ir užsakymų istoriją. Jei reikia pagalbos dabar, susisiekite el. paštu
          <a href="mailto:info@yakiwood.lt" className="text-[#161616] underline ml-1">
            info@yakiwood.lt
          </a>
          .
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-8 h-[48px] px-[32px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#161616] hover:text-white"
        >
          Grįžti į pradžią
        </button>
      </div>
    </main>
  )
}
