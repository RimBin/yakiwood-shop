import React from 'react';

type Locale = 'en' | 'lt';

const copy = {
  en: {
    heroLabel: 'contact',
    heroTitle: 'Get in touch',
    contactTitle: 'Contact form',
    briefTitle: 'Project brief',
    name: 'Full name',
    phone: 'Phone number',
    email: 'Email address',
    date: 'Date of contact',
    about: 'About your project',
    company: 'Company name',
    city: 'City',
    budget: 'Budget',
    timeline: 'Timeline',
    file: 'Attach files',
    submit: 'Submit',
    reset: 'Reset form',
    contactPerson: 'Contact person',
    placeholderName: 'Your name',
    placeholderPhone: '+370 000 00000',
    placeholderEmail: 'you@email.com',
    placeholderCity: 'Vilnius',
    placeholderAbout: 'Tell us about the scope, materials, and any deadlines.',
    placeholderBudget: 'Select',
    placeholderTimeline: 'Select',
    infoTitle: 'We reply within one business day.',
    infoEmail: 'hello@yakiwood.lt',
    infoPhone: '+370 600 00000',
    infoHours: 'Mon–Fri 9:00–18:00',
    infoAddress: 'Vilnius, Lithuania',
  },
  lt: {
    heroLabel: 'kontaktai',
    heroTitle: 'Susisiekite',
    contactTitle: 'Kontaktų forma',
    briefTitle: 'Projekto užklausa',
    name: 'Vardas, pavardė',
    phone: 'Telefono numeris',
    email: 'El. paštas',
    date: 'Pageidaujama skambučio data',
    about: 'Apie projektą',
    company: 'Įmonė',
    city: 'Miestas',
    budget: 'Biudžetas',
    timeline: 'Terminas',
    file: 'Pridėti failus',
    submit: 'Siųsti',
    reset: 'Išvalyti formą',
    contactPerson: 'Kontaktinis asmuo',
    placeholderName: 'Jūsų vardas',
    placeholderPhone: '+370 000 00000',
    placeholderEmail: 'jūs@el.paštas',
    placeholderCity: 'Vilnius',
    placeholderAbout: 'Trumpai apie apimtį, medžiagas ir terminus.',
    placeholderBudget: 'Pasirinkite',
    placeholderTimeline: 'Pasirinkite',
    infoTitle: 'Atsakome per 1 darbo dieną.',
    infoEmail: 'hello@yakiwood.lt',
    infoPhone: '+370 600 00000',
    infoHours: 'I–V 9:00–18:00',
    infoAddress: 'Vilnius, Lietuva',
  },
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[8px] text-[#161616]">
      <span className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase">{label}</span>
      {children}
    </label>
  );
}

export default function ContactForms({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <main className="bg-[#3e3e3e] py-[80px] px-[16px] md:px-[40px] min-h-screen">
      <div className="max-w-[1240px] mx-auto flex flex-col gap-[48px]">
        <div className="space-y-[12px] text-white">
          <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase">{t.heroLabel}</p>
          <h1 className="font-['DM_Sans'] font-light text-[48px] tracking-[-2px] leading-[1.05]">
            {t.heroTitle}
          </h1>
        </div>

        {/* Contact form card */}
        <section className="bg-white shadow-[0_16px_50px_rgba(0,0,0,0.14)] px-[32px] py-[32px] md:px-[48px] md:py-[40px] flex flex-col gap-[24px]">
          <h2 className="font-['DM_Sans'] font-light text-[32px] tracking-[-1.2px] text-[#161616]">{t.contactTitle}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[24px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <Field label={t.name}>
                <input
                  type="text"
                  placeholder={t.placeholderName}
                  className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
                />
              </Field>
              <Field label={t.phone}>
                <input
                  type="tel"
                  defaultValue="+370"
                  placeholder={t.placeholderPhone}
                  className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
                />
              </Field>
              <Field label={t.email}>
                <input
                  type="email"
                  placeholder={t.placeholderEmail}
                  className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
                />
              </Field>
              <Field label={t.date}>
                <input
                  type="date"
                  className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.about}>
                  <textarea
                    rows={4}
                    placeholder={t.placeholderAbout}
                    className="w-full bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] py-[10px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] resize-none"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 flex gap-[12px]">
                <button className="h-[44px] px-[24px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors">
                  {t.submit}
                </button>
                <button className="h-[44px] px-[20px] rounded-[100px] border border-[#BBBBBB] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] hover:border-[#161616] transition-colors">
                  {t.reset}
                </button>
              </div>
            </div>
            <aside className="bg-[#F3F3F3] border border-[#BBBBBB] rounded-[8px] p-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">{t.contactPerson}</p>
              <p className="font-['DM_Sans'] text-[18px] text-[#161616]">Tomas Kazlauskas</p>
              <p className="font-['Outfit'] text-[14px] text-[#535353]">{t.infoTitle}</p>
              <div className="space-y-[6px] text-[14px] font-['DM_Sans'] text-[#161616]">
                <p>{t.infoEmail}</p>
                <p>{t.infoPhone}</p>
                <p>{t.infoHours}</p>
                <p>{t.infoAddress}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* Project brief card */}
        <section className="bg-white shadow-[0_16px_50px_rgba(0,0,0,0.14)] px-[32px] py-[32px] md:px-[48px] md:py-[40px] flex flex-col gap-[24px]">
          <h2 className="font-['DM_Sans'] font-light text-[32px] tracking-[-1.2px] text-[#161616]">{t.briefTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <Field label={t.company}>
              <input
                type="text"
                placeholder={locale === 'lt' ? 'Įmonės pavadinimas' : 'Company or client'}
                className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
              />
            </Field>
            <Field label={t.city}>
              <input
                type="text"
                placeholder={t.placeholderCity}
                className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616]"
              />
            </Field>
            <Field label={t.budget}>
              <select className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] yw-select">
                <option>{t.placeholderBudget}</option>
                <option>€5k - €15k</option>
                <option>€15k - €50k</option>
                <option>€50k+</option>
              </select>
            </Field>
            <Field label={t.timeline}>
              <select className="h-[44px] bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] yw-select">
                <option>{t.placeholderTimeline}</option>
                <option>{locale === 'lt' ? 'Skubiai (2–4 sav.)' : 'Urgent (2–4 weeks)'}</option>
                <option>{locale === 'lt' ? 'Artimiausi 2–3 mėn.' : 'Next 2–3 months'}</option>
                <option>{locale === 'lt' ? 'Vėliau' : 'Later this year'}</option>
              </select>
            </Field>
            <Field label={t.about}>
              <textarea
                rows={4}
                placeholder={t.placeholderAbout}
                className="w-full bg-[#F3F3F3] border border-[#BBBBBB] rounded-[6px] px-[12px] py-[10px] font-['DM_Sans'] text-[14px] text-[#161616] focus:outline-none focus:border-[#161616] resize-none"
              />
            </Field>
            <Field label={t.file}>
              <div className="h-[44px] bg-[#F3F3F3] border border-dashed border-[#BBBBBB] rounded-[6px] px-[12px] flex items-center justify-between text-[14px] font-['DM_Sans'] text-[#535353]">
                <span>{locale === 'lt' ? 'Pasirinkite failą' : 'Choose a file'}</span>
                <button className="px-[12px] py-[6px] rounded-[6px] bg-[#161616] text-white text-[12px] font-['Outfit'] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors">
                  {locale === 'lt' ? 'įkelti' : 'upload'}
                </button>
              </div>
            </Field>
          </div>
          <div className="flex gap-[12px]">
            <button className="h-[44px] px-[24px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors">
              {t.submit}
            </button>
            <button className="h-[44px] px-[20px] rounded-[100px] border border-[#BBBBBB] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] hover:border-[#161616] transition-colors">
              {t.reset}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
