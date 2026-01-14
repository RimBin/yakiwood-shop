
/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { blogPosts, normalizeStoredPosts, type BlogPost, type BlogLocale } from '@/data/blog-posts';
import { slugify } from '@/lib/slugify';

const POSTS_STORAGE_KEY = 'yakiwood_posts';

type Draft = BlogPost;

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

function clonePost(post: BlogPost): BlogPost {
  return JSON.parse(JSON.stringify(post)) as BlogPost;
}

function createEmptyPost(): BlogPost {
  const baseId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `post_${Math.random().toString(36).slice(2)}_${Date.now()}`;

  return {
    id: baseId,
    slug: { lt: '', en: '' },
    title: { lt: '', en: '' },
    excerpt: { lt: '', en: '' },
    summary: { lt: '', en: '' },
    sections: [],
    body: { lt: [], en: [] },
    callout: { lt: '', en: '' },
    closing: { lt: '', en: '' },
    heroImage: '',
    gallery: [],
    featureImages: [],
    author: 'Yakiwood',
    date: new Date().toISOString().slice(0, 10),
    category: { lt: '', en: '' },
    published: true,
    readTimeMinutes: 4,
  };
}

async function readFiles(files: FileList | null): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const readers = Array.from(files).map(
    (file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(String(event.target?.result || ''));
        reader.readAsDataURL(file);
      })
  );
  return Promise.all(readers);
}

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinParagraphs(value: string[]): string {
  return value.join('\n\n');
}

export default function PostsAdminClient() {
  const t = useTranslations('admin');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(createEmptyPost());
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState<Record<BlogLocale, boolean>>({ lt: false, en: false });

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const featureInputRef = useRef<HTMLInputElement | null>(null);

  const [galleryUrl, setGalleryUrl] = useState('');
  const [featureUrl, setFeatureUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const normalized = normalizeStoredPosts(parsed);
        if (normalized) {
          setPosts(normalized);
          if (normalized[0]) {
            setSelectedId(normalized[0].id);
            setDraft(clonePost(normalized[0]));
          }
          return;
        }
      } catch {
        // ignore
      }
    }

    setPosts(blogPosts);
    if (blogPosts[0]) {
      setSelectedId(blogPosts[0].id);
      setDraft(clonePost(blogPosts[0]));
    }
  }, []);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) || null,
    [posts, selectedId]
  );

  useEffect(() => {
    if (!selectedPost) return;
    setDraft(clonePost(selectedPost));
    setSlugTouched({ lt: false, en: false });
    setError(null);
    setNotice(null);
  }, [selectedPost]);

  const updateDraft = useCallback((next: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  }, []);

  const updateLocalizedField = (key: keyof Draft, locale: BlogLocale, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as Record<BlogLocale, string>), [locale]: value },
    }));
  };

  const handleTitleChange = (locale: BlogLocale, value: string) => {
    setDraft((prev) => {
      const next = {
        ...prev,
        title: { ...prev.title, [locale]: value },
      };
      const autoSlug = !slugTouched[locale] || prev.slug[locale] === slugify(prev.title[locale]);
      if (autoSlug) {
        next.slug = { ...next.slug, [locale]: slugify(value) };
      }
      return next;
    });
  };

  const handleBodyChange = (locale: BlogLocale, value: string) => {
    setDraft((prev) => ({
      ...prev,
      body: { ...prev.body, [locale]: splitParagraphs(value) },
    }));
  };

  const addSection = () => {
    setDraft((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { heading: { lt: '', en: '' }, body: { lt: '', en: '' } },
      ],
    }));
  };

  const updateSection = (index: number, locale: BlogLocale, key: 'heading' | 'body', value: string) => {
    setDraft((prev) => {
      const next = prev.sections.map((section, idx) => {
        if (idx !== index) return section;
        return {
          ...section,
          [key]: { ...section[key], [locale]: value },
        };
      });
      return { ...prev, sections: next };
    });
  };

  const removeSection = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index),
    }));
  };

  const addGalleryImages = async (files: FileList | null) => {
    const images = await readFiles(files);
    if (images.length === 0) return;
    setDraft((prev) => ({ ...prev, gallery: [...prev.gallery, ...images] }));
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const addFeatureImages = async (files: FileList | null) => {
    const images = await readFiles(files);
    if (images.length === 0) return;
    setDraft((prev) => ({ ...prev, featureImages: [...prev.featureImages, ...images] }));
    if (featureInputRef.current) featureInputRef.current.value = '';
  };

  const addHeroImage = async (files: FileList | null) => {
    const images = await readFiles(files);
    if (images[0]) {
      updateDraft({ heroImage: images[0] });
    }
    if (heroInputRef.current) heroInputRef.current.value = '';
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const persistPosts = (next: BlogPost[]) => {
    setPosts(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const handleSave = () => {
    setError(null);
    if (!draft.title.lt.trim()) {
      setError(t('posts.errors.titleLtRequired'));
      return;
    }
    if (!draft.title.en.trim()) {
      setError(t('posts.errors.titleEnRequired'));
      return;
    }
    if (!draft.slug.lt.trim()) {
      setError(t('posts.errors.slugLtRequired'));
      return;
    }
    if (!draft.slug.en.trim()) {
      setError(t('posts.errors.slugEnRequired'));
      return;
    }

    const existingIndex = posts.findIndex((post) => post.id === draft.id);
    const nextPosts = [...posts];

    if (existingIndex >= 0) {
      nextPosts[existingIndex] = clonePost(draft);
    } else {
      nextPosts.unshift(clonePost(draft));
      setSelectedId(draft.id);
    }

    persistPosts(nextPosts);
    showNotice(t('posts.noticeSaved'));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const next = posts.filter((post) => post.id !== selectedId);
    persistPosts(next);
    showNotice(t('posts.noticeDeleted'));
    if (next[0]) {
      setSelectedId(next[0].id);
    } else {
      setSelectedId(null);
      setDraft(createEmptyPost());
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setDraft(createEmptyPost());
    setSlugTouched({ lt: false, en: false });
    setError(null);
    setNotice(null);
  };

  const buttonSecondary =
    "border border-[#161616] rounded-[100px] h-[36px] px-[14px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#E1E1E1]";

  const panelClass = 'rounded-[16px] border border-[#E1E1E1] bg-[#EAEAEA] p-[16px]';

  return (
    <div className="py-[24px] md:py-[40px]">
      <div className="flex items-center justify-between gap-[10px] mb-[16px]">
        <div>
          <h2 className="font-['DM_Sans'] text-[24px] text-[#161616]">{t('posts.title')}</h2>
          <p className="font-['Outfit'] text-[13px] text-[#535353]">{t('posts.subtitle')}</p>
        </div>
        <button onClick={handleNew} className={buttonSecondary}>
          {t('posts.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-[16px]">
        <div className={panelClass}>
          <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] mb-[12px]">
            {t('posts.listTitle', { count: posts.length })}
          </div>
          {posts.length === 0 ? (
            <p className="font-['Outfit'] text-[13px] text-[#535353]">{t('posts.empty')}</p>
          ) : (
            <div className="space-y-[10px]">
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedId(post.id)}
                  className={
                    'w-full text-left rounded-[14px] border px-[12px] py-[10px] ' +
                    (selectedId === post.id
                      ? 'border-[#161616] bg-[#E1E1E1]'
                      : 'border-[#E1E1E1] bg-[#F1F1F1] hover:bg-[#E1E1E1]')
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="font-['DM_Sans'] text-[13px] text-[#161616]">
                      {post.title.lt || t('posts.untitled')}
                    </div>
                    <span className="font-['Outfit'] text-[10px] uppercase text-[#888]">
                      {post.published ? t('posts.status.published') : t('posts.status.draft')}
                    </span>
                  </div>
                  <div className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">
                    {post.title.en || ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={panelClass}>
          <div className="flex items-center justify-between gap-[10px]">
            <div className="font-['DM_Sans'] text-[18px] text-[#161616]">{t('posts.editorTitle')}</div>
            <div className="flex items-center gap-[8px]">
              <button onClick={handleSave} className={buttonSecondary}>
                {t('posts.save')}
              </button>
              <button onClick={handleDelete} className={buttonSecondary}>
                {t('posts.delete')}
              </button>
            </div>
          </div>

          {notice ? <p className="mt-[10px] font-['Outfit'] text-[13px] text-[#161616]">{notice}</p> : null}
          {error ? <p className="mt-[10px] font-['Outfit'] text-[13px] text-red-600">{error}</p> : null}

          <div className="mt-[16px] grid grid-cols-1 gap-[16px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.titleLt')}
                </label>
                <input
                  value={draft.title.lt}
                  onChange={(e) => handleTitleChange('lt', e.target.value)}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.titleLt')}
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.titleEn')}
                </label>
                <input
                  value={draft.title.en}
                  onChange={(e) => handleTitleChange('en', e.target.value)}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.titleEn')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.slugLt')}
                </label>
                <input
                  value={draft.slug.lt}
                  onChange={(e) => {
                    setSlugTouched((prev) => ({ ...prev, lt: true }));
                    updateLocalizedField('slug', 'lt', slugify(e.target.value));
                  }}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.slugLt')}
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.slugEn')}
                </label>
                <input
                  value={draft.slug.en}
                  onChange={(e) => {
                    setSlugTouched((prev) => ({ ...prev, en: true }));
                    updateLocalizedField('slug', 'en', slugify(e.target.value));
                  }}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.slugEn')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.excerptLt')}
                </label>
                <textarea
                  value={draft.excerpt.lt}
                  onChange={(e) => updateLocalizedField('excerpt', 'lt', e.target.value)}
                  className="w-full min-h-[110px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.excerptLt')}
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.excerptEn')}
                </label>
                <textarea
                  value={draft.excerpt.en}
                  onChange={(e) => updateLocalizedField('excerpt', 'en', e.target.value)}
                  className="w-full min-h-[110px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.excerptEn')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.summaryLt')}
                </label>
                <textarea
                  value={draft.summary.lt}
                  onChange={(e) => updateLocalizedField('summary', 'lt', e.target.value)}
                  className="w-full min-h-[110px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.summaryLt')}
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.summaryEn')}
                </label>
                <textarea
                  value={draft.summary.en}
                  onChange={(e) => updateLocalizedField('summary', 'en', e.target.value)}
                  className="w-full min-h-[110px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.summaryEn')}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.bodyLt')}
                </label>
                <textarea
                  value={joinParagraphs(draft.body.lt)}
                  onChange={(e) => handleBodyChange('lt', e.target.value)}
                  className="w-full min-h-[160px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.bodyLt')}
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.bodyEn')}
                </label>
                <textarea
                  value={joinParagraphs(draft.body.en)}
                  onChange={(e) => handleBodyChange('en', e.target.value)}
                  className="w-full min-h-[160px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.bodyEn')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-[10px]">
                <div className="font-['Outfit'] text-[12px] text-[#161616] uppercase tracking-[0.6px]">
                  {t('posts.fields.sections')}
                </div>
                <button type="button" onClick={addSection} className={buttonSecondary}>
                  {t('posts.addSection')}
                </button>
              </div>
              {draft.sections.length === 0 ? (
                <p className="font-['Outfit'] text-[13px] text-[#535353]">{t('posts.sectionsEmpty')}</p>
              ) : (
                <div className="space-y-[12px]">
                  {draft.sections.map((section, index) => (
                    <div key={`section-${index}`} className="rounded-[14px] border border-[#D0D0D0] p-[12px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                        <div>
                          <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                            {t('posts.fields.sectionHeadingLt')}
                          </label>
                          <input
                            value={section.heading.lt}
                            onChange={(e) => updateSection(index, 'lt', 'heading', e.target.value)}
                            className="w-full h-[36px] rounded-[10px] border border-[#BBBBBB] px-[10px] font-['Outfit'] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                            {t('posts.fields.sectionHeadingEn')}
                          </label>
                          <input
                            value={section.heading.en}
                            onChange={(e) => updateSection(index, 'en', 'heading', e.target.value)}
                            className="w-full h-[36px] rounded-[10px] border border-[#BBBBBB] px-[10px] font-['Outfit'] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                            {t('posts.fields.sectionBodyLt')}
                          </label>
                          <textarea
                            value={section.body.lt}
                            onChange={(e) => updateSection(index, 'lt', 'body', e.target.value)}
                            className="w-full min-h-[90px] rounded-[10px] border border-[#BBBBBB] px-[10px] py-[6px] font-['Outfit'] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                            {t('posts.fields.sectionBodyEn')}
                          </label>
                          <textarea
                            value={section.body.en}
                            onChange={(e) => updateSection(index, 'en', 'body', e.target.value)}
                            className="w-full min-h-[90px] rounded-[10px] border border-[#BBBBBB] px-[10px] py-[6px] font-['Outfit'] text-[13px]"
                          />
                        </div>
                      </div>
                      <div className="mt-[8px] flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="text-[12px] font-['Outfit'] text-red-600 hover:underline"
                        >
                          {t('posts.removeSection')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.calloutLt')}
                </label>
                <textarea
                  value={draft.callout.lt}
                  onChange={(e) => updateLocalizedField('callout', 'lt', e.target.value)}
                  className="w-full min-h-[90px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.calloutEn')}
                </label>
                <textarea
                  value={draft.callout.en}
                  onChange={(e) => updateLocalizedField('callout', 'en', e.target.value)}
                  className="w-full min-h-[90px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.closingLt')}
                </label>
                <textarea
                  value={draft.closing.lt}
                  onChange={(e) => updateLocalizedField('closing', 'lt', e.target.value)}
                  className="w-full min-h-[90px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.closingEn')}
                </label>
                <textarea
                  value={draft.closing.en}
                  onChange={(e) => updateLocalizedField('closing', 'en', e.target.value)}
                  className="w-full min-h-[90px] rounded-[12px] border border-[#BBBBBB] px-[12px] py-[8px] font-['Outfit'] text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.categoryLt')}
                </label>
                <input
                  value={draft.category.lt}
                  onChange={(e) => updateLocalizedField('category', 'lt', e.target.value)}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.categoryEn')}
                </label>
                <input
                  value={draft.category.en}
                  onChange={(e) => updateLocalizedField('category', 'en', e.target.value)}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.author')}
                </label>
                <input
                  value={draft.author}
                  onChange={(e) => updateDraft({ author: e.target.value })}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.date')}
                </label>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => updateDraft({ date: e.target.value })}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                />
              </div>
              <div>
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.fields.readTime')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={draft.readTimeMinutes}
                  onChange={(e) => updateDraft({ readTimeMinutes: Number.parseInt(e.target.value || '0', 10) })}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-[12px]">
              <label className="flex items-center gap-[8px] font-['Outfit'] text-[13px] text-[#161616]">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => updateDraft({ published: e.target.checked })}
                  className="h-[16px] w-[16px] accent-[#161616]"
                />
                {t('posts.fields.published')}
              </label>
            </div>

            <div>
              <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                {t('posts.images.hero')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[10px] items-center">
                <input
                  value={draft.heroImage}
                  onChange={(e) => updateDraft({ heroImage: e.target.value })}
                  className="w-full h-[38px] rounded-[12px] border border-[#BBBBBB] px-[12px] font-['Outfit'] text-[13px]"
                  placeholder={t('posts.placeholders.hero')}
                />
                <div>
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => void addHeroImage(e.target.files)}
                    className="hidden"
                    id="hero-upload"
                  />
                  <label htmlFor="hero-upload" className={buttonSecondary + ' cursor-pointer'}>
                    {t('posts.images.upload')}
                  </label>
                </div>
              </div>
              {draft.heroImage ? (
                <div className="mt-[10px] relative h-[200px] rounded-[14px] overflow-hidden border border-[#BBBBBB]">
                  {isDataUrl(draft.heroImage) ? (
                    <img src={draft.heroImage} alt={draft.title.lt || 'Hero'} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={draft.heroImage} alt={draft.title.lt || 'Hero'} fill className="object-cover" />
                  )}
                </div>
              ) : null}
            </div>
            <div>
              <div className="flex items-center justify-between gap-[10px]">
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.images.gallery')}
                </label>
                <div className="flex items-center gap-[8px]">
                  <input
                    value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    className="h-[30px] rounded-[10px] border border-[#BBBBBB] px-[8px] font-['Outfit'] text-[12px]"
                    placeholder={t('posts.placeholders.imageUrl')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!galleryUrl.trim()) return;
                      setDraft((prev) => ({ ...prev, gallery: [...prev.gallery, galleryUrl.trim()] }));
                      setGalleryUrl('');
                    }}
                    className={buttonSecondary + ' h-[30px] px-[10px]'}
                  >
                    {t('posts.images.addUrl')}
                  </button>
                </div>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => void addGalleryImages(e.target.files)}
                className="hidden"
                id="gallery-upload"
              />
              <label htmlFor="gallery-upload" className={buttonSecondary + ' cursor-pointer'}>
                {t('posts.images.upload')}
              </label>
              {draft.gallery.length > 0 && (
                <div className="mt-[10px] grid grid-cols-4 gap-[8px]">
                  {draft.gallery.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative h-[70px] rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                      {isDataUrl(img) ? (
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, index) => index !== idx),
                          }))
                        }
                        className="absolute top-[4px] right-[4px] w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[12px] flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-[10px]">
                <label className="block font-['Outfit'] text-[12px] text-[#161616] mb-[6px]">
                  {t('posts.images.feature')}
                </label>
                <div className="flex items-center gap-[8px]">
                  <input
                    value={featureUrl}
                    onChange={(e) => setFeatureUrl(e.target.value)}
                    className="h-[30px] rounded-[10px] border border-[#BBBBBB] px-[8px] font-['Outfit'] text-[12px]"
                    placeholder={t('posts.placeholders.imageUrl')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!featureUrl.trim()) return;
                      setDraft((prev) => ({ ...prev, featureImages: [...prev.featureImages, featureUrl.trim()] }));
                      setFeatureUrl('');
                    }}
                    className={buttonSecondary + ' h-[30px] px-[10px]'}
                  >
                    {t('posts.images.addUrl')}
                  </button>
                </div>
              </div>
              <input
                ref={featureInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => void addFeatureImages(e.target.files)}
                className="hidden"
                id="feature-upload"
              />
              <label htmlFor="feature-upload" className={buttonSecondary + ' cursor-pointer'}>
                {t('posts.images.upload')}
              </label>
              {draft.featureImages.length > 0 && (
                <div className="mt-[10px] grid grid-cols-4 gap-[8px]">
                  {draft.featureImages.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative h-[70px] rounded-[8px] overflow-hidden border border-[#BBBBBB]">
                      {isDataUrl(img) ? (
                        <img src={img} alt={`Feature ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <Image src={img} alt={`Feature ${idx + 1}`} fill className="object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            featureImages: prev.featureImages.filter((_, index) => index !== idx),
                          }))
                        }
                        className="absolute top-[4px] right-[4px] w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[12px] flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
