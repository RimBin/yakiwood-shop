export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  suggestions?: string[];
};

const FAQ_ENTRIES_LT: FaqEntry[] = [
  {
    id: 'delivery',
    question: 'Ar pristatote visoje Lietuvoje?',
    answer:
      'Taip, pristatome visoje Lietuvoje. Pristatymo kaina ir terminas priklauso nuo kiekio ir lokacijos. Parašykite, kur pristatyti ir kokio kiekio reikia – pateiksime tikslų pasiūlymą.',
    keywords: ['pristatymas', 'siuntimas', 'kurjeris', 'terminas', 'kaina', 'lietuva', 'miestas'],
    suggestions: ['Kiek kainuoja pristatymas?', 'Kiek laiko trunka gamyba?'],
  },
  {
    id: 'production-time',
    question: 'Kiek laiko trunka gamyba?',
    answer:
      'Gamybos terminas priklauso nuo produkto profilio, pasirinkto paviršiaus apdirbimo ir kiekio. Dažniausiai terminą pateikiame per 1 darbo dieną po užklausos.',
    keywords: ['gamyba', 'terminas', 'kiek laiko', 'užsakymas', 'eile'],
    suggestions: ['Ar turite sandėlyje?', 'Ar galima atsiimti patiems?'],
  },
  {
    id: 'price',
    question: 'Kaip sužinoti kainą?',
    answer:
      'Kaina priklauso nuo medienos rūšies, profilio, apdirbimo ir kiekio. Geriausia – pateikti projektą arba reikalingus m² ir norimą profilį/spalvą. Tada paruošime tikslų pasiūlymą.',
    keywords: ['kaina', 'kainos', 'pasiulymas', 'samata', 'm2', 'kiek kainuoja'],
    suggestions: ['Kokius profilius siūlote?', 'Ar darote sąmatas projektams?'],
  },
  {
    id: 'installation',
    question: 'Ar montuojate (įrengiate) patys?',
    answer:
      'Galime rekomenduoti montuotojus arba suderinti montavimo darbų organizavimą – tai priklauso nuo projekto vietos ir apimties. Parašykite projekto vietą ir apimtį.',
    keywords: ['montavimas', 'irengimas', 'meistrai', 'darbas', 'fasadas', 'terasos'],
    suggestions: ['Kokie tvirtinimo sprendimai?', 'Kaip prižiūrėti paviršių?'],
  },
  {
    id: 'maintenance',
    question: 'Kaip prižiūrėti Shou Sugi Ban paviršių?',
    answer:
      'Priežiūra priklauso nuo pasirinkto apdirbimo (šukuotas/alyvuotas ir pan.) ir eksploatacijos sąlygų. Paprastai rekomenduojame periodinę apžiūrą ir atnaujinimą pagal poreikį. Parašykite, kur naudosite (lauke/viduje) ir kokį apdirbimą pasirinkote.',
    keywords: ['prieziura', 'alyva', 'atnaujinimas', 'valymas', 'lauke', 'viduje'],
    suggestions: ['Ar spalva keičiasi laikui bėgant?', 'Ar tinka prie jūros?'],
  },
  {
    id: 'samples',
    question: 'Ar galima gauti pavyzdžių?',
    answer:
      'Taip, dažnai galime pateikti pavyzdžius (priklauso nuo profilio ir apdirbimo). Parašykite, kokio profilio/spalvos norite ir kur pristatyti.',
    keywords: ['pavyzdys', 'pavyzdziai', 'sample', 'pavyzdiniai', 'pavizdys'],
    suggestions: ['Kokios spalvos galimos?', 'Kaip užsisakyti?'],
  },
  {
    id: 'colors',
    question: 'Kokios spalvos ir apdirbimai galimi?',
    answer:
      'Galimi keli atspalviai ir apdirbimo variantai (nuo švelniai iki stipriai deginto, su alyva ar be). Patogiausia – parašyti, kur bus naudojama, ir atsiųsti norimą estetiką (nuotraukas).',
    keywords: ['spalvos', 'atspalviai', 'apdirbimas', 'degintas', 'yakisugi', 'shou', 'sugi', 'ban'],
    suggestions: ['Ar galima suderinti spalvą pagal pavyzdį?', 'Ar darote individualų apdirbimą?'],
  },
  {
    id: 'invoices',
    question: 'Ar išrašote sąskaitas?',
    answer:
      'Taip, išrašome sąskaitas (fiziniams ir juridiniams). Parašykite rekvizitus ir pristatymo adresą.',
    keywords: ['saskaita', 'faktura', 'invoice', 'rekvizitai', 'pvm'],
    suggestions: ['Kokie apmokėjimo būdai?', 'Ar galima avansas?'],
  },
  {
    id: 'contact',
    question: 'Kaip su jumis susisiekti?',
    answer:
      'Grečiausia – parašyti per kontaktų formą puslapyje „Kontaktai“. Jei nurodysite projekto lokaciją ir apimtį (m²), atsakysime greičiau.',
    keywords: ['kontaktai', 'susisiekti', 'telefonas', 'el', 'pastas', 'email', 'uzklausa'],
    suggestions: ['Noriu pasiūlymo projektui', 'Noriu pavyzdžių'],
  },
  {
    id: 'fallback',
    question: 'Bendra pagalba',
    answer:
      'Galiu padėti su dažniausiais klausimais: kaina, terminai, pristatymas, priežiūra, pavyzdžiai. Parašyk, kas aktualu, arba palik užklausą per „Kontaktai“.',
    keywords: [],
    suggestions: ['Kiek kainuoja?', 'Ar pristatote?', 'Kaip prižiūrėti?', 'Ar galima pavyzdžių?'],
  },
];

const FAQ_ENTRIES_EN: FaqEntry[] = [
  {
    id: 'delivery',
    question: 'Do you deliver across Lithuania?',
    answer:
      'Yes, we deliver across Lithuania. Delivery cost and lead time depend on quantity and location. Tell us where to deliver and the required amount and we’ll provide an exact quote.',
    keywords: ['delivery', 'shipping', 'courier', 'lead', 'time', 'price', 'lithuania', 'city'],
    suggestions: ['How much is delivery?', 'How long is production?'],
  },
  {
    id: 'production-time',
    question: 'How long is production?',
    answer:
      'Lead time depends on profile, finish and quantity. Usually we can confirm the exact timeline within 1 business day after your request.',
    keywords: ['production', 'lead', 'time', 'timeline', 'order'],
    suggestions: ['Do you have stock?', 'Can I pick up myself?'],
  },
  {
    id: 'price',
    question: 'How can I get a price?',
    answer:
      'Pricing depends on wood type, profile, finish and quantity. The best way is to share your project or required m² and the preferred profile/color. Then we can prepare an accurate quote.',
    keywords: ['price', 'pricing', 'quote', 'estimate', 'sqm', 'm2', 'cost'],
    suggestions: ['Which profiles do you offer?', 'Do you make project estimates?'],
  },
  {
    id: 'installation',
    question: 'Do you offer installation?',
    answer:
      'We can recommend installers or coordinate installation depending on project location and scope. Share your location and approximate scope and we’ll advise.',
    keywords: ['installation', 'install', 'contractor', 'mounting', 'facade', 'deck'],
    suggestions: ['What fixing solutions do you recommend?', 'How to maintain the surface?'],
  },
  {
    id: 'maintenance',
    question: 'How do I maintain Shou Sugi Ban surfaces?',
    answer:
      'Maintenance depends on the chosen finish (brushed/oiled etc.) and exposure conditions. We recommend periodic inspection and refreshing when needed. Tell us if it’s indoor/outdoor and which finish you selected.',
    keywords: ['maintenance', 'oil', 'refresh', 'cleaning', 'outdoor', 'indoor'],
    suggestions: ['Does the color change over time?', 'Is it suitable near the sea?'],
  },
  {
    id: 'samples',
    question: 'Can I get samples?',
    answer:
      'Yes, in many cases we can provide samples (depending on profile and finish). Tell us which profile/color you want and where to ship.',
    keywords: ['sample', 'samples', 'swatch'],
    suggestions: ['What colors are available?', 'How to order?'],
  },
  {
    id: 'colors',
    question: 'Which colors/finishes are available?',
    answer:
      'We offer multiple tones and finish options (from lightly to heavily charred, with or without oil). The easiest is to tell us where it will be used and share reference photos of the look you want.',
    keywords: ['colors', 'finishes', 'charred', 'yakisugi', 'shou', 'sugi', 'ban'],
    suggestions: ['Can you match a sample color?', 'Do you offer custom finishing?'],
  },
  {
    id: 'invoices',
    question: 'Do you issue invoices?',
    answer:
      'Yes, we issue invoices for individuals and businesses. Share your details and delivery address.',
    keywords: ['invoice', 'vat', 'company', 'details'],
    suggestions: ['What payment methods are available?', 'Is a deposit possible?'],
  },
  {
    id: 'contact',
    question: 'How can I contact you?',
    answer:
      'The fastest way is to use the contact form on the “Contact” page. If you include project location and approximate m², we can reply faster.',
    keywords: ['contact', 'email', 'phone', 'inquiry'],
    suggestions: ['I need a quote for a project', 'I want samples'],
  },
  {
    id: 'fallback',
    question: 'General help',
    answer:
      'I can help with common questions: pricing, lead times, delivery, maintenance, samples. Ask anything, or contact us if you need a custom quote.',
    keywords: [],
    suggestions: ['How much does it cost?', 'Do you deliver?', 'How to maintain it?', 'Can I get samples?'],
  },
];

export type SupportedChatbotLocale = 'lt' | 'en';

type FaqCacheEntry = {
  expiresAt: number;
  entries: FaqEntry[]; // may be empty if Sanity query returned empty
};

type FaqCacheStore = {
  byLocale: Partial<Record<SupportedChatbotLocale, FaqCacheEntry>>;
};

function normalizeLocale(locale: string | undefined): SupportedChatbotLocale {
  return locale === 'en' ? 'en' : 'lt';
}

export function getStaticFaqEntries(locale: SupportedChatbotLocale): FaqEntry[] {
  return locale === 'en' ? FAQ_ENTRIES_EN : FAQ_ENTRIES_LT;
}

function getFaqCacheStore(): FaqCacheStore {
  const g = globalThis as unknown as { __chatbotFaqCache?: FaqCacheStore };
  if (!g.__chatbotFaqCache) g.__chatbotFaqCache = { byLocale: {} };
  return g.__chatbotFaqCache;
}

async function fetchFaqEntriesFromSupabase(locale: SupportedChatbotLocale): Promise<FaqEntry[] | null> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    if (!supabaseAdmin) return null;

    const { data, error } = await supabaseAdmin
      .from('chatbot_faq_entries')
      .select('id, question, answer, keywords, suggestions')
      .eq('locale', locale)
      .eq('enabled', true)
      .order('sort_order', { ascending: true });

    if (error) return null;
    if (!Array.isArray(data)) return [];

    return data
      .filter((e) => Boolean(e && e.id && e.question && e.answer))
      .map((e) => ({
        id: String((e as { id: string }).id),
        question: String((e as { question: string }).question),
        answer: String((e as { answer: string }).answer),
        keywords: Array.isArray((e as { keywords?: unknown }).keywords)
          ? ((e as { keywords: unknown[] }).keywords as unknown[]).map(String)
          : [],
        suggestions: Array.isArray((e as { suggestions?: unknown }).suggestions)
          ? ((e as { suggestions: unknown[] }).suggestions as unknown[]).map(String)
          : undefined,
      }));
  } catch {
    return null;
  }
}

export async function getFaqEntries(locale: string | undefined): Promise<FaqEntry[]> {
  const normalized = normalizeLocale(locale);
  const now = Date.now();

  const cache = getFaqCacheStore();
  const cached = cache.byLocale[normalized];
  if (cached && cached.expiresAt > now) {
    return cached.entries.length > 0 ? cached.entries : getStaticFaqEntries(normalized);
  }

  // Cache for a short time to avoid repeated Supabase queries per request.
  const ttlMs = 2 * 60 * 1000; // ~2 minutes
  const fetched = await fetchFaqEntriesFromSupabase(normalized);

  if (fetched) {
    cache.byLocale[normalized] = { expiresAt: now + ttlMs, entries: fetched };
    return fetched.length > 0 ? fetched : getStaticFaqEntries(normalized);
  }

  return getStaticFaqEntries(normalized);
}
