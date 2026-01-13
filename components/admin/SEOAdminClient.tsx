'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SEOPreview } from '@/components/admin/SEOPreview';
import type { PageSEOResult } from '@/lib/seo/scanner';
import { Breadcrumbs } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

type SeoOverrideFormState = {
  canonicalPath: string;
  locale: 'en' | 'lt';
  enabled: boolean;
  title: string;
  description: string;
  canonicalUrl: string;
  robotsIndex: 'inherit' | 'index' | 'noindex';
  robotsFollow: 'inherit' | 'follow' | 'nofollow';
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

type SeoOverrideRow = {
  id: string;
  canonical_path: string;
  locale: 'en' | 'lt';
  enabled: boolean;
  title: string | null;
  description: string | null;
  canonical_url: string | null;
  robots_index: boolean | null;
  robots_follow: boolean | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  updated_by_email: string | null;
  updated_at: string;
};

type FilterType = 'all' | 'good' | 'warning' | 'error';

async function getAdminToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function downloadJson(filename: string, data: unknown) {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const SEO_EDITOR_ENABLED_KEY = 'admin.seo.editorEnabled';
const SEO_SCAN_CACHE_KEY = 'admin.seo.scanCache.v1';

type SeoScanCache = {
  savedAt: string;
  pages: PageSEOResult[];
};

type ScanProgress = {
  total: number;
  done: number;
  currentPath?: string;
};

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function readErrorFromResponse(res: Response): Promise<string> {
  const fallback = `${res.status} ${res.statusText}`.trim();
  try {
    const clone = res.clone();
    const json = await clone.json();
    const msg = (json as any)?.error;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  } catch {
    // ignore
  }

  try {
    const clone = res.clone();
    const text = await clone.text();
    if (text && text.trim()) return `${fallback}: ${text.trim().slice(0, 200)}`;
  } catch {
    // ignore
  }

  return fallback || 'Request failed';
}

function inferLocaleFromPath(pathname: string): 'en' | 'lt' {
  return pathname === '/lt' || pathname.startsWith('/lt/') ? 'lt' : 'en';
}

function urlPathname(urlOrPathname: string): string {
  const raw = (urlOrPathname || '').trim();
  if (!raw) return '';
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const parsed = new URL(raw);
      return parsed.pathname || '/';
    }
  } catch {
    // fall through
  }
  if (!raw.startsWith('/')) return `/${raw}`;
  return raw;
}

function toNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function robotsStateToNullable(value: SeoOverrideFormState['robotsIndex' | 'robotsFollow']): boolean | null {
  if (value === 'inherit') return null;
  if (value === 'index' || value === 'follow') return true;
  return false;
}

function overrideToFormState(page: PageSEOResult, override: SeoOverrideRow | null): SeoOverrideFormState {
  const locale = override?.locale ?? inferLocaleFromPath(page.path);
  const canonicalPath = override?.canonical_path ?? urlPathname(page.path);

  return {
    canonicalPath,
    locale,
    enabled: override?.enabled ?? true,
    title: override?.title ?? '',
    description: override?.description ?? '',
    canonicalUrl: override?.canonical_url ?? '',
    robotsIndex:
      override?.robots_index == null ? 'inherit' : override.robots_index ? 'index' : 'noindex',
    robotsFollow:
      override?.robots_follow == null ? 'inherit' : override.robots_follow ? 'follow' : 'nofollow',
    ogTitle: override?.og_title ?? '',
    ogDescription: override?.og_description ?? '',
    ogImage: override?.og_image ?? '',
    twitterTitle: override?.twitter_title ?? '',
    twitterDescription: override?.twitter_description ?? '',
    twitterImage: override?.twitter_image ?? '',
  };
}

function applyFormOverrideToPreview(page: PageSEOResult, form: SeoOverrideFormState): PageSEOResult {
  const resolvedUrl = form.canonicalUrl.trim() ? form.canonicalUrl.trim() : page.url;
  const resolvedTitle = form.title.trim() ? form.title.trim() : page.title;
  const resolvedDescription = form.description.trim() ? form.description.trim() : page.description;

  const ogTitle = form.ogTitle.trim() || page.openGraph?.title || resolvedTitle;
  const ogDescription = form.ogDescription.trim() || page.openGraph?.description || resolvedDescription;
  const ogImageUrl = form.ogImage.trim() || (page.openGraph?.images?.[0] as any)?.url;

  const twitterTitle = form.twitterTitle.trim() || (page.twitter as any)?.title || resolvedTitle;
  const twitterDescription = form.twitterDescription.trim() || (page.twitter as any)?.description || resolvedDescription;
  const twitterImageUrl = form.twitterImage.trim();

  const nextPage: PageSEOResult = {
    ...page,
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      ...(page.openGraph ?? {}),
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: typeof ogTitle === 'string' ? ogTitle : 'Open Graph image',
            },
          ]
        : page.openGraph?.images,
    },
    twitter: {
      ...(page.twitter ?? {}),
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImageUrl ? [twitterImageUrl] : (page.twitter as any)?.images,
    },
  };

  nextPage.url = resolvedUrl;
  return nextPage;
}

export default function SEOAdminClient() {
  const t = useTranslations('admin.seo');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const [pages, setPages] = useState<PageSEOResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [hasAttemptedScan, setHasAttemptedScan] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPage, setSelectedPage] = useState<PageSEOResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editorEnabled, setEditorEnabled] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSEOResult | null>(null);
  const [overrideRow, setOverrideRow] = useState<SeoOverrideRow | null>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideSaving, setOverrideSaving] = useState(false);
  const [overrideForm, setOverrideForm] = useState<SeoOverrideFormState | null>(null);
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  const persistScanCache = (nextPages: PageSEOResult[]) => {
    try {
      const cache: SeoScanCache = {
        savedAt: new Date().toISOString(),
        pages: nextPages,
      };
      localStorage.setItem(SEO_SCAN_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // ignore cache write errors
    }
  };

  const mergePages = (existing: PageSEOResult[], incoming: PageSEOResult[]): PageSEOResult[] => {
    const byPath = new Map<string, PageSEOResult>();
    existing.forEach((p) => byPath.set(p.path, p));
    incoming.forEach((p) => byPath.set(p.path, p));
    return Array.from(byPath.values()).sort((a, b) => (a.path < b.path ? -1 : 1));
  };

  async function loadPages() {
    setLoading(true);
    setError(null);
    setScanProgress(null);
    setHasAttemptedScan(true);

    try {
      const token = await getAdminToken();
      if (!token) throw new Error(t('errors.noSession'));

      // 1) Get paths to scan so we can show progress.
      const pathsRes = await fetch('/api/admin/seo/paths', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const pathsJson = await pathsRes.json().catch(() => null);
      if (!pathsRes.ok) {
        const msg = (pathsJson as any)?.error || (await readErrorFromResponse(pathsRes));
        throw new Error(`[paths] ${msg}`);
      }

      const paths = (pathsJson?.paths ?? []) as string[];
      const total = paths.length;

      if (total === 0) {
        throw new Error(t('errors.noPaths'));
      }

      setScanProgress({ total, done: 0, currentPath: total > 0 ? paths[0] : undefined });

      const batchSize = process.env.NODE_ENV !== 'production' ? 1 : 2;
      const batches = chunkArray(paths, batchSize);

      let aggregated: PageSEOResult[] = [];
      let done = 0;

      for (const batch of batches) {
        setScanProgress({ total, done, currentPath: batch[0] });

        const controller = new AbortController();
        const timeoutMs = 120_000;
        let didTimeout = false;
        const timeoutHandle = setTimeout(() => {
          didTimeout = true;
          controller.abort();
        }, timeoutMs);

        const query = batch.map((p) => `path=${encodeURIComponent(p)}`).join('&');
        const res = await fetch(`/api/admin/seo/scan?${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutHandle);
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = (json as any)?.error || (await readErrorFromResponse(res));
          throw new Error(`[scan ${batch[0]}] ${msg}`);
        }

        const incoming = (json?.pages ?? []) as PageSEOResult[];
        aggregated = mergePages(aggregated, incoming);
        setPages(aggregated);
        persistScanCache(aggregated);

        done += batch.length;
        setScanProgress({ total, done, currentPath: batch[0] });

        if (didTimeout) {
          throw new Error(t('errors.scanTimeout'));
        }
      }

      setScanProgress({ total, done: total, currentPath: undefined });
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError(t('errors.scanTimeout'));
      } else if (e instanceof TypeError && e.message === 'Failed to fetch') {
        const suffix = scanProgress?.total
          ? ` (${scanProgress.done}/${scanProgress.total}${scanProgress.currentPath ? `: ${scanProgress.currentPath}` : ''})`
          : '';
        setError(`${t('errors.scanFailed')}${suffix}`);
      } else {
        const base = e instanceof Error ? e.message : t('errors.scanFailed');
        const suffix = scanProgress?.total
          ? ` (${scanProgress.done}/${scanProgress.total}${scanProgress.currentPath ? `: ${scanProgress.currentPath}` : ''})`
          : '';
        setError(`${base}${suffix}`);
      }
    } finally {
      setLoading(false);
      setScanProgress(null);
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEO_SCAN_CACHE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<SeoScanCache>;
      if (Array.isArray(parsed.pages)) {
        setPages(parsed.pages);
        setHasAttemptedScan(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEO_EDITOR_ENABLED_KEY);
      if (stored === '1') setEditorEnabled(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SEO_EDITOR_ENABLED_KEY, editorEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [editorEnabled]);

  const openEditor = async (page: PageSEOResult) => {
    setOverrideNotice(null);
    setError(null);
    setEditingPage(page);
    setOverrideRow(null);
    setOverrideForm(null);
    setOverrideLoading(true);

    try {
      const token = await getAdminToken();
      if (!token) throw new Error(t('errors.noSession'));

      const locale = inferLocaleFromPath(page.path);
      const canonicalPath = urlPathname(page.path);

      const res = await fetch(
        `/api/admin/seo/overrides?canonicalPath=${encodeURIComponent(canonicalPath)}&locale=${encodeURIComponent(locale)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load override');

      const row = (json?.override ?? null) as SeoOverrideRow | null;
      setOverrideRow(row);
      setOverrideForm(overrideToFormState(page, row));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load override');
      setEditingPage(null);
    } finally {
      setOverrideLoading(false);
    }
  };

  const closeEditor = () => {
    setEditingPage(null);
    setOverrideRow(null);
    setOverrideForm(null);
    setOverrideNotice(null);
  };

  const saveOverride = async () => {
    if (!overrideForm) return;

    setOverrideNotice(null);
    setError(null);
    setOverrideSaving(true);

    try {
      const token = await getAdminToken();
      if (!token) throw new Error(t('errors.noSession'));

      const payload = {
        canonicalPath: overrideForm.canonicalPath,
        locale: overrideForm.locale,
        enabled: overrideForm.enabled,
        title: toNullableString(overrideForm.title),
        description: toNullableString(overrideForm.description),
        canonicalUrl: toNullableString(overrideForm.canonicalUrl),
        robotsIndex: robotsStateToNullable(overrideForm.robotsIndex),
        robotsFollow: robotsStateToNullable(overrideForm.robotsFollow),
        ogTitle: toNullableString(overrideForm.ogTitle),
        ogDescription: toNullableString(overrideForm.ogDescription),
        ogImage: toNullableString(overrideForm.ogImage),
        twitterTitle: toNullableString(overrideForm.twitterTitle),
        twitterDescription: toNullableString(overrideForm.twitterDescription),
        twitterImage: toNullableString(overrideForm.twitterImage),
      };

      const res = await fetch('/api/admin/seo/overrides', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save override');

      const saved = (json?.override ?? null) as SeoOverrideRow | null;
      setOverrideRow(saved);
      setOverrideNotice('Saved. Re-scan to see updated score.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save override');
    } finally {
      setOverrideSaving(false);
    }
  };

  const deleteOverride = async () => {
    if (!overrideForm) return;
    if (!confirm('Delete this override?')) return;

    setOverrideNotice(null);
    setError(null);
    setOverrideSaving(true);

    try {
      const token = await getAdminToken();
      if (!token) throw new Error(t('errors.noSession'));

      const res = await fetch(
        `/api/admin/seo/overrides?canonicalPath=${encodeURIComponent(overrideForm.canonicalPath)}&locale=${encodeURIComponent(
          overrideForm.locale
        )}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete override');

      setOverrideRow(null);
      if (editingPage) setOverrideForm(overrideToFormState(editingPage, null));
      setOverrideNotice('Override deleted.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete override');
    } finally {
      setOverrideSaving(false);
    }
  };

  const filteredPages = pages.filter((page) => {
    if (filter === 'all') return true;
    if (filter === 'good') return page.seoScore >= 80;
    if (filter === 'warning') return page.seoScore >= 50 && page.seoScore < 80;
    if (filter === 'error') return page.seoScore < 50;
    return true;
  });

  const stats = {
    total: pages.length,
    good: pages.filter((p) => p.seoScore >= 80).length,
    warning: pages.filter((p) => p.seoScore >= 50 && p.seoScore < 80).length,
    error: pages.filter((p) => p.seoScore < 50).length,
  };

  const averageScore =
    pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.seoScore, 0) / pages.length) : 0;

  const handleExportJSON = () => {
    downloadJson(`seo-audit-${new Date().toISOString().split('T')[0]}.json`, pages);
  };

  const handleExportFixes = async () => {
    setError(null);

    try {
      const token = await getAdminToken();
      if (!token) throw new Error(t('errors.noSession'));

      const res = await fetch('/api/admin/seo/fix', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('errors.fixFailed'));

      downloadJson(`seo-fixes-${new Date().toISOString().split('T')[0]}.json`, json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.fixFailed'));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    const progressText = scanProgress?.total
      ? t('scanningProgress', {
          current: scanProgress.currentPath || '',
          done: scanProgress.done,
          total: scanProgress.total,
        })
      : t('scanning');

    return (
      <>
        <Breadcrumbs
          items={[
            { label: tBreadcrumb('home'), href: '/' },
            { label: tBreadcrumb('admin'), href: '/admin' },
            { label: tBreadcrumb('seo') },
          ]}
        />
        <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161616] mx-auto mb-4" />
            <p className="font-['Outfit'] text-[#535353]">{progressText}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Homepage', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'SEO' },
        ]}
      />

      <div className="min-h-screen bg-[#E1E1E1] py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-[clamp(32px,4vw,48px)]">
            <h1 className="font-['DM_Sans'] font-light text-[clamp(40px,6vw,72px)] leading-none tracking-[clamp(-1.6px,-0.025em,-2.88px)] text-[#161616] mb-[8px]">
              {t('title')}
            </h1>
            <p className="font-['Outfit'] font-light text-[clamp(14px,1.5vw,16px)] text-[#535353]">{t('subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-[16px] px-4 py-3 font-['Outfit'] text-sm">
              {error}
            </div>
          )}

          {!error && !hasAttemptedScan && pages.length === 0 && (
            <div className="mb-6 bg-[#EAEAEA] border border-[#E1E1E1] text-[#535353] rounded-[16px] px-4 py-3 font-['Outfit'] text-sm">
              {t('notScannedYet')}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(16px,2vw,24px)] mb-[clamp(24px,3vw,32px)]">
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
              <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">{t('stats.totalPages')}</div>
              <div className="font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] text-[#161616]">
                {stats.total}
              </div>
            </div>
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
              <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">{t('stats.averageScore')}</div>
              <div
                className={`font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] ${getScoreColor(averageScore)}`}
              >
                {averageScore}%
              </div>
            </div>
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
              <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">{t('stats.goodSeo')}</div>
              <div className="font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] text-green-600">
                {stats.good}
              </div>
            </div>
            <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
              <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">{t('stats.needsWork')}</div>
              <div className="font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] text-red-600">
                {stats.error}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-[8px] mb-[32px] overflow-x-auto pb-[8px]">
            <button
              onClick={() => setFilter('all')}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#161616] text-white'
                  : 'bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616]'
              }`}
            >
              {t('filters.all')} ({stats.total})
            </button>
            <button
              onClick={() => setFilter('good')}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                filter === 'good'
                  ? 'bg-green-600 text-white'
                  : 'bg-[#EAEAEA] text-green-600 border border-green-200 hover:border-green-600'
              }`}
            >
              {t('filters.good')} ({stats.good})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                filter === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-[#EAEAEA] text-yellow-600 border border-yellow-200 hover:border-yellow-600'
              }`}
            >
              {t('filters.warning')} ({stats.warning})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
                filter === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#EAEAEA] text-red-600 border border-red-200 hover:border-red-600'
              }`}
            >
              {t('filters.errors')} ({stats.error})
            </button>

            <button
              onClick={() => setEditorEnabled((v) => !v)}
              className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap border ${
                editorEnabled
                  ? 'bg-[#161616] text-white border-[#161616]'
                  : 'bg-[#EAEAEA] text-[#161616] border-[#E1E1E1] hover:border-[#161616]'
              }`}
              title="Toggle SEO editor"
            >
              Editor: {editorEnabled ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={loadPages}
              className="h-[48px] ml-auto px-[24px] rounded-[100px] bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap"
            >
              {t('actions.rescan')}
            </button>
            <button
              onClick={handleExportFixes}
              className="h-[48px] px-[24px] rounded-[100px] bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap"
            >
              {t('actions.exportFixes')}
            </button>
            <button
              onClick={handleExportJSON}
              className="h-[48px] px-[24px] rounded-[100px] bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap"
            >
              {t('actions.exportJson')}
            </button>
          </div>

          {/* Pages Table */}
          <div className="bg-[#EAEAEA] rounded-[24px] border border-[#E1E1E1] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#EAEAEA] border-b border-[#E1E1E1]">
                  <tr>
                    <th className="text-left px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">{t('table.page')}</th>
                    <th className="text-left px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">{t('table.title')}</th>
                    <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">{t('table.score')}</th>
                    <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">{t('table.issues')}</th>
                    <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E1E1]">
                  {filteredPages.map((page, index) => (
                    <tr key={index} className="hover:bg-[#EAEAEA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-['Outfit'] text-sm text-[#161616] font-medium">{page.path}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-['Outfit'] text-sm text-[#535353] max-w-xs truncate">{page.title || t('table.noTitle')}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${getScoreBgColor(
                            page.seoScore
                          )}`}
                        >
                          <span className={`font-['DM_Sans'] text-xl font-light ${getScoreColor(page.seoScore)}`}>
                            {page.seoScore}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#E1E1E1] font-['Outfit'] text-sm text-[#161616]">
                          {page.issues.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editorEnabled && (
                            <button
                              onClick={() => openEditor(page)}
                              className="h-[40px] px-[20px] rounded-[100px] bg-white text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPage(page)}
                            className="h-[40px] px-[20px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors"
                          >
                            {t('actions.viewDetails')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPages.length === 0 && (
              <div className="text-center py-12">
                <p className="font-['Outfit'] text-[#535353]">{t('noPages')}</p>
              </div>
            )}
          </div>

          {/* Preview Modal */}
          {selectedPage && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setSelectedPage(null)}
            >
              <div
                className="bg-[#EAEAEA] rounded-[24px] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-[#EAEAEA] border-b border-[#E1E1E1] px-8 py-6 flex items-center justify-between rounded-t-[24px]">
                  <div>
                    <h2 className="font-['DM_Sans'] text-2xl font-light tracking-[-0.96px] text-[#161616]">
                      {selectedPage.path}
                    </h2>
                    <p className="font-['Outfit'] text-sm text-[#535353] mt-1">
                      {t('seoScore')}: <span className={getScoreColor(selectedPage.seoScore)}>{selectedPage.seoScore}%</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPage(null)}
                    className="w-10 h-10 rounded-full bg-[#EAEAEA] hover:bg-[#E1E1E1] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-8">
                  <SEOPreview metadata={selectedPage} />
                </div>
              </div>
            </div>
          )}

          {/* Editor Modal */}
          {editingPage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={closeEditor}>
              <div
                className="bg-[#EAEAEA] rounded-[24px] max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-[#EAEAEA] border-b border-[#E1E1E1] px-8 py-6 flex items-center justify-between rounded-t-[24px]">
                  <div>
                    <h2 className="font-['DM_Sans'] text-2xl font-light tracking-[-0.96px] text-[#161616]">Edit SEO</h2>
                    <p className="font-['Outfit'] text-sm text-[#535353] mt-1">{editingPage.path}</p>
                  </div>
                  <button
                    onClick={closeEditor}
                    className="w-10 h-10 rounded-full bg-[#EAEAEA] hover:bg-[#E1E1E1] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-8">
                  {overrideLoading || !overrideForm ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#161616] mx-auto mb-4" />
                      <p className="font-['Outfit'] text-[#535353]">Loading override…</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {overrideNotice && (
                          <div className="bg-green-50 border border-green-200 text-green-700 rounded-[16px] px-4 py-3 font-['Outfit'] text-sm">
                            {overrideNotice}
                          </div>
                        )}

                        <div className="bg-white rounded-[24px] border border-[#E1E1E1] p-6">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-['DM_Sans'] text-lg font-light tracking-[-0.48px] text-[#161616]">
                                Override
                              </div>
                              <div className="font-['Outfit'] text-xs text-[#535353] mt-1">
                                canonical_path: {overrideForm.canonicalPath} • locale: {overrideForm.locale}
                              </div>
                              {overrideRow && (
                                <div className="font-['Outfit'] text-xs text-[#535353] mt-1">
                                  Updated: {new Date(overrideRow.updated_at).toLocaleString()} ({overrideRow.updated_by_email || 'unknown'})
                                </div>
                              )}
                            </div>
                            <label className="flex items-center gap-2 font-['Outfit'] text-sm text-[#161616]">
                              <input
                                type="checkbox"
                                checked={overrideForm.enabled}
                                onChange={(e) =>
                                  setOverrideForm((s) =>
                                    s ? { ...s, enabled: e.target.checked } : s
                                  )
                                }
                              />
                              Enabled
                            </label>
                          </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#E1E1E1] p-6 space-y-4">
                          <div className="font-['DM_Sans'] text-lg font-light tracking-[-0.48px] text-[#161616]">Basic</div>

                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Title</div>
                            <input
                              value={overrideForm.title}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, title: e.target.value } : s))}
                              placeholder={editingPage.title || ''}
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>

                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Description</div>
                            <textarea
                              value={overrideForm.description}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, description: e.target.value } : s))}
                              placeholder={editingPage.description || ''}
                              className="w-full min-h-[96px] px-4 py-3 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>

                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Canonical URL (optional)</div>
                            <input
                              value={overrideForm.canonicalUrl}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, canonicalUrl: e.target.value } : s))}
                              placeholder={editingPage.url}
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Robots index</div>
                              <select
                                value={overrideForm.robotsIndex}
                                onChange={(e) =>
                                  setOverrideForm((s) =>
                                    s ? { ...s, robotsIndex: e.target.value as SeoOverrideFormState['robotsIndex'] } : s
                                  )
                                }
                                className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                              >
                                <option value="inherit">Inherit</option>
                                <option value="index">index</option>
                                <option value="noindex">noindex</option>
                              </select>
                            </div>

                            <div>
                              <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Robots follow</div>
                              <select
                                value={overrideForm.robotsFollow}
                                onChange={(e) =>
                                  setOverrideForm((s) =>
                                    s ? { ...s, robotsFollow: e.target.value as SeoOverrideFormState['robotsFollow'] } : s
                                  )
                                }
                                className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                              >
                                <option value="inherit">Inherit</option>
                                <option value="follow">follow</option>
                                <option value="nofollow">nofollow</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#E1E1E1] p-6 space-y-4">
                          <div className="font-['DM_Sans'] text-lg font-light tracking-[-0.48px] text-[#161616]">Open Graph</div>

                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">OG Title</div>
                            <input
                              value={overrideForm.ogTitle}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, ogTitle: e.target.value } : s))}
                              placeholder={(editingPage.openGraph as any)?.title || editingPage.title || ''}
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">OG Description</div>
                            <textarea
                              value={overrideForm.ogDescription}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, ogDescription: e.target.value } : s))}
                              placeholder={(editingPage.openGraph as any)?.description || editingPage.description || ''}
                              className="w-full min-h-[96px] px-4 py-3 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">OG Image URL</div>
                            <input
                              value={overrideForm.ogImage}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, ogImage: e.target.value } : s))}
                              placeholder={(editingPage.openGraph?.images?.[0] as any)?.url || ''}
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#E1E1E1] p-6 space-y-4">
                          <div className="font-['DM_Sans'] text-lg font-light tracking-[-0.48px] text-[#161616]">Twitter</div>

                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Twitter Title</div>
                            <input
                              value={overrideForm.twitterTitle}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, twitterTitle: e.target.value } : s))}
                              placeholder={(editingPage.twitter as any)?.title || editingPage.title || ''}
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Twitter Description</div>
                            <textarea
                              value={overrideForm.twitterDescription}
                              onChange={(e) =>
                                setOverrideForm((s) => (s ? { ...s, twitterDescription: e.target.value } : s))
                              }
                              placeholder={(editingPage.twitter as any)?.description || editingPage.description || ''}
                              className="w-full min-h-[96px] px-4 py-3 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                          <div>
                            <div className="font-['Outfit'] text-xs text-[#535353] mb-2">Twitter Image URL</div>
                            <input
                              value={overrideForm.twitterImage}
                              onChange={(e) => setOverrideForm((s) => (s ? { ...s, twitterImage: e.target.value } : s))}
                              placeholder={
                                Array.isArray((editingPage.twitter as any)?.images)
                                  ? ((editingPage.twitter as any)?.images?.[0] as string) || ''
                                  : ((editingPage.twitter as any)?.images as string) || ''
                              }
                              className="w-full h-[44px] px-4 rounded-[12px] border border-[#E1E1E1] bg-white font-['Outfit'] text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={saveOverride}
                            disabled={overrideSaving}
                            className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
                          >
                            {overrideSaving ? 'Saving…' : 'Save'}
                          </button>

                          {overrideRow && (
                            <button
                              onClick={deleteOverride}
                              disabled={overrideSaving}
                              className="h-[48px] px-[24px] rounded-[100px] bg-white text-red-600 border border-red-200 hover:border-red-600 font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-colors disabled:opacity-60"
                            >
                              Delete override
                            </button>
                          )}

                          <button
                            onClick={closeEditor}
                            className="h-[48px] ml-auto px-[24px] rounded-[100px] bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="font-['DM_Sans'] text-2xl font-light tracking-[-0.96px] text-[#161616]">
                          Preview
                        </div>
                        <SEOPreview metadata={applyFormOverrideToPreview(editingPage, overrideForm)} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
