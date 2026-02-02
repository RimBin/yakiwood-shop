'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { PageSEOResult } from '@/lib/seo/scanner';

interface SEOPreviewProps {
  metadata: PageSEOResult;
}

/**
 * Google Search Result Preview
 */
export function GoogleSearchPreview({ metadata }: SEOPreviewProps) {
  const t = useTranslations('admin.seo.preview');
  const title = metadata.title || t('untitledPage');
  const description = metadata.description || '';
  const displayUrl = metadata.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="border border-[#E1E1E1] rounded-[24px] p-6 bg-[#EAEAEA]">
      <div className="font-['Outfit'] text-xs text-[#535353] mb-4">{t('googleTitle')}</div>
      <div className="max-w-[600px]">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#E1E1E1] rounded-full flex items-center justify-center text-xs font-['Outfit']">
            Y
          </div>
          <span className="font-['Outfit'] text-sm text-[#535353]">{displayUrl}</span>
        </div>

        {/* Title */}
        <div className="font-['DM_Sans'] text-xl font-light tracking-[-0.6px] text-blue-600 hover:underline cursor-pointer mb-2">
          {title.length > 60 ? title.substring(0, 60) + '...' : title}
        </div>

        {/* Description */}
        <div className="font-['Outfit'] text-sm text-[#535353] leading-relaxed">
          {description.length > 160
            ? description.substring(0, 160) + '...'
            : description || t('descriptionMissing')}
        </div>
      </div>

      {/* Length indicators */}
      <div className="mt-4 flex gap-4 text-xs font-['Outfit']">
        <span className={title.length > 60 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('titleLabel')}: {title.length}/60
        </span>
        <span className={description.length > 160 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('descriptionLabel')}: {description.length}/160
        </span>
      </div>
    </div>
  );
}

/**
 * Facebook Open Graph Preview
 */
export function FacebookPreview({ metadata }: SEOPreviewProps) {
  const t = useTranslations('admin.seo.preview');
  const ogTitle = metadata.openGraph?.title || metadata.title || t('untitled');
  const ogDescription = metadata.openGraph?.description || metadata.description || '';
  const ogImage = metadata.openGraph?.images?.[0]?.url;
  const displayUrl = metadata.url.replace(/^https?:\/\//, '');

  return (
    <div className="border border-[#E1E1E1] rounded-[24px] p-6 bg-[#EAEAEA]">
      <div className="font-['Outfit'] text-xs text-[#535353] mb-4">{t('facebookTitle')}</div>
      <div className="max-w-[500px] border border-[#E1E1E1] rounded-[24px] overflow-hidden bg-[#EAEAEA] shadow-sm">
        {/* Image */}
        {ogImage ? (
          <div className="w-full aspect-[1.91/1] bg-[#E1E1E1] relative">
            <img src={ogImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[1.91/1] bg-[#E1E1E1] flex items-center justify-center">
            <span className="font-['Outfit'] text-[#BBBBBB] text-sm">{t('imageMissing')}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 bg-[#EAEAEA] border-t border-[#E1E1E1]">
          <div className="font-['Outfit'] text-xs text-[#535353] uppercase mb-2">{displayUrl}</div>
          <div className="font-['DM_Sans'] text-base font-light tracking-[-0.48px] text-[#161616] mb-2">
            {ogTitle.length > 95 ? ogTitle.substring(0, 95) + '...' : ogTitle}
          </div>
          <div className="font-['Outfit'] text-sm text-[#535353]">
            {ogDescription.length > 200 ? ogDescription.substring(0, 200) + '...' : ogDescription}
          </div>
        </div>
      </div>

      {/* Metadata info */}
      <div className="mt-4 space-y-1 text-xs font-['Outfit']">
        <div className={ogTitle.length > 95 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('ogTitleLabel')}: {ogTitle.length}/95
        </div>
        <div className={ogDescription.length > 200 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('ogDescriptionLabel')}: {ogDescription.length}/200
        </div>
        {metadata.openGraph?.images?.[0] && (
          <div className="text-[#535353]">
            {t('imageLabel')}: {metadata.openGraph.images[0].width || '?'}x{metadata.openGraph.images[0].height || '?'}px
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Twitter Card Preview
 */
export function TwitterPreview({ metadata }: SEOPreviewProps) {
  const t = useTranslations('admin.seo.preview');
  const twitterTitle = metadata.twitter?.title || metadata.title || t('untitled');
  const twitterDescription = metadata.twitter?.description || metadata.description || '';
  const twitterImage = 
    (Array.isArray(metadata.twitter?.images) ? metadata.twitter?.images[0] : metadata.twitter?.images) ||
    metadata.openGraph?.images?.[0]?.url;

  return (
    <div className="border border-[#E1E1E1] rounded-[24px] p-6 bg-[#EAEAEA]">
      <div className="font-['Outfit'] text-xs text-[#535353] mb-4">{t('twitterTitle')}</div>
      <div className="max-w-[500px] border border-[#E1E1E1] rounded-[24px] overflow-hidden bg-[#EAEAEA] shadow-sm">
        {/* Image */}
        {twitterImage ? (
          <div className="w-full aspect-[2/1] bg-[#E1E1E1] relative">
            <img src={twitterImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] bg-[#E1E1E1] flex items-center justify-center">
            <span className="font-['Outfit'] text-[#BBBBBB] text-sm">{t('imageMissing')}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 border-t border-[#E1E1E1]">
          <div className="font-['DM_Sans'] text-base font-light tracking-[-0.48px] text-[#161616] mb-2">
            {twitterTitle.length > 70 ? twitterTitle.substring(0, 70) + '...' : twitterTitle}
          </div>
          <div className="font-['Outfit'] text-sm text-[#535353]">
            {twitterDescription.length > 200 ? twitterDescription.substring(0, 200) + '...' : twitterDescription}
          </div>
        </div>
      </div>

      {/* Metadata info */}
      <div className="mt-4 space-y-1 text-xs font-['Outfit']">
        <div className={twitterTitle.length > 70 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('twitterTitleLabel')}: {twitterTitle.length}/70
        </div>
        <div className={twitterDescription.length > 200 ? 'text-red-600 font-medium' : 'text-[#535353]'}>
          {t('twitterDescriptionLabel')}: {twitterDescription.length}/200
        </div>
      </div>
    </div>
  );
}

/**
 * SEO Issues List Component
 */
export function SEOIssuesList({ metadata }: SEOPreviewProps) {
  const t = useTranslations('admin.seo.preview');
  const locale = useLocale();
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-700 bg-[#EAEAEA] border-red-400';
      case 'warning': return 'text-yellow-700 bg-[#EAEAEA] border-yellow-400';
      case 'info': return 'text-blue-700 bg-[#EAEAEA] border-blue-400';
      default: return 'text-[#535353] bg-[#EAEAEA] border-[#BBBBBB]';
    }
  };

  const fieldLabel = (field: string) => {
    const map: Record<string, string> = {
      title: 'fields.title',
      description: 'fields.description',
      openGraph: 'fields.openGraph',
      'openGraph.title': 'fields.openGraphTitle',
      'openGraph.description': 'fields.openGraphDescription',
      'openGraph.images': 'fields.openGraphImages',
      'openGraph.type': 'fields.openGraphType',
      twitter: 'fields.twitter',
      'twitter.card': 'fields.twitterCard',
      'twitter.title': 'fields.twitterTitle',
      'twitter.description': 'fields.twitterDescription',
      canonical: 'fields.canonical',
      robots: 'fields.robots',
    };
    const key = map[field];
    return key ? t(key) : field;
  };

  const translateIssueMessage = (message: string) => {
    if (locale === 'lt') {
      const patterns: Array<[RegExp, (...m: string[]) => string]> = [
        [/^Title is missing - this is a critical SEO element$/, () => 'Trūksta pavadinimo – tai kritinis SEO elementas'],
        [/^Title too short \((\d+) chars\)\. Recommended: (\d+)-(\d+)$/, (_m, len, min, max) => `Pavadinimas per trumpas (${len} simbolių). Rekomenduojama: ${min}–${max}`],
        [/^Title too long \((\d+) chars\)\. Recommended: (\d+)-(\d+)\. Google may truncate\.$/, (_m, len, min, max) => `Pavadinimas per ilgas (${len} simbolių). Rekomenduojama: ${min}–${max}. Google gali sutrumpinti.`],
        [/^Title optimal length \((\d+) chars\) ✓$/, (_m, len) => `Pavadinimo ilgis optimalus (${len} simbolių) ✓`],
        [/^Title has duplicate words - consider optimizing$/, () => 'Pavadinime yra pasikartojančių žodžių – verta optimizuoti'],
        [/^Description is missing - this is a critical SEO element$/, () => 'Trūksta aprašymo – tai kritinis SEO elementas'],
        [/^Description too short \((\d+) characters\)\. Recommended: (\d+)-(\d+)$/, (_m, len, min, max) => `Aprašymas per trumpas (${len} simbolių). Rekomenduojama: ${min}–${max}`],
        [/^Description too long \((\d+) characters\)\. Recommended: (\d+)-(\d+)\. Google may truncate\.$/, (_m, len, min, max) => `Aprašymas per ilgas (${len} simbolių). Rekomenduojama: ${min}–${max}. Google gali sutrumpinti.`],
        [/^Description optimal length \((\d+) characters\) ✓$/, (_m, len) => `Aprašymo ilgis optimalus (${len} simbolių) ✓`],
        [/^Open Graph metadata missing - required for social media$/, () => 'Trūksta Open Graph metaduomenų – reikalinga socialiniams tinklams'],
        [/^Open Graph title missing$/, () => 'Trūksta Open Graph pavadinimo'],
        [/^OG title too long \((\d+) characters\)\. Max: (\d+)$/, (_m, len, max) => `OG pavadinimas per ilgas (${len} simbolių). Maks.: ${max}`],
        [/^Open Graph description missing$/, () => 'Trūksta Open Graph aprašymo'],
        [/^OG description too long \((\d+) characters\)\. Max: (\d+)$/, (_m, len, max) => `OG aprašymas per ilgas (${len} simbolių). Maks.: ${max}`],
        [/^Open Graph image missing - recommended for social sharing$/, () => 'Trūksta Open Graph paveikslėlio – rekomenduojama dalijimuisi'],
        [/^OG image too narrow \((\d+)px\)\. Recommended: (\d+)x(\d+)$/, (_m, w, rw, rh) => `OG paveikslėlis per siauras (${w}px). Rekomenduojama: ${rw}x${rh}`],
        [/^OG image too short \((\d+)px\)\. Recommended: (\d+)x(\d+)$/, (_m, h, rw, rh) => `OG paveikslėlis per žemas (${h}px). Rekomenduojama: ${rw}x${rh}`],
        [/^OG image missing alt text - recommended for accessibility$/, () => 'OG paveikslėliui trūksta alt teksto – rekomenduojama dėl prieinamumo'],
        [/^OG type not set - default will be "website"$/, () => 'OG tipas nenustatytas – bus naudojama „website“'],
        [/^Twitter Card metadata missing - will use OG as fallback$/, () => 'Trūksta Twitter Card metaduomenų – bus naudojamas OG'],
        [/^Twitter card type not set$/, () => 'Twitter kortelės tipas nenustatytas'],
        [/^Unknown Twitter card type: (.+)$/, (_m, type) => `Nežinomas Twitter kortelės tipas: ${type}`],
        [/^Twitter title too long \((\d+) characters\)\. Max: (\d+)$/, (_m, len, max) => `Twitter pavadinimas per ilgas (${len} simbolių). Maks.: ${max}`],
        [/^Twitter description too long \((\d+) characters\)\. Max: (\d+)$/, (_m, len, max) => `Twitter aprašymas per ilgas (${len} simbolių). Maks.: ${max}`],
        [/^Canonical URL missing - recommended for duplicate prevention$/, () => 'Trūksta kanoninio URL – rekomenduojama dubliavimo prevencijai'],
        [/^Invalid canonical URL format: (.+)$/, (_m, value) => `Neteisingas kanoninio URL formatas: ${value}`],
        [/^Canonical URL should use HTTPS$/, () => 'Kanoninis URL turėtų naudoti HTTPS'],
      ];

      for (const [re, out] of patterns) {
        const match = message.match(re);
        if (match) return out(...match as unknown as string[]);
      }
      return message;
    }

    const ltToEn: Array<[RegExp, string | ((...m: string[]) => string)]> = [
      [/^Robots meta tag nenustatytas - default bus index,follow$/, 'Robots meta tag not set - default will be index,follow'],
      [/^Puslapis nustatytas neindeksuoti \(noindex\)$/, 'Page is set to noindex'],
      [/^Nuorodos puslapyje nebebus sekamos \(nofollow\)$/, 'Links on the page will not be followed (nofollow)'],
    ];
    for (const [re, out] of ltToEn) {
      const match = message.match(re);
      if (match) return typeof out === 'function' ? out(...(match as unknown as string[])) : out;
    }
    return message;
  };

  if (metadata.issues.length === 0) {
    return (
      <div className="border border-green-200 rounded-[24px] p-6 bg-[#EAEAEA]">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-['Outfit'] text-green-600">{t('noIssues')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {metadata.issues.map((issue, index) => (
        <div
          key={index}
          className={`border rounded-[24px] p-4 ${getSeverityColor(issue.severity)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {issue.severity === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {issue.severity === 'warning' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {issue.severity === 'info' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-['Outfit'] font-medium text-sm mb-1">
                {fieldLabel(issue.field)}
              </div>
              <div className="font-['Outfit'] text-sm">
                {translateIssueMessage(issue.message)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main SEO Preview Card
 */
export function SEOPreview({ metadata }: SEOPreviewProps) {
  const t = useTranslations('admin.seo.preview');
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Score Overview */}
      <div className="flex items-center justify-between p-6 bg-[#EAEAEA] rounded-[24px] border border-[#E1E1E1]">
        <div>
          <div className="font-['Outfit'] text-sm text-[#535353] mb-1">{t('seoScoreLabel')}</div>
          <div className={`font-['DM_Sans'] text-5xl font-light tracking-[-1.6px] ${getScoreColor(metadata.seoScore)}`}>
            {metadata.seoScore}%
          </div>
        </div>
        <div className="text-right">
          <div className="font-['Outfit'] text-sm text-[#535353] mb-1">{t('issuesFoundLabel')}</div>
          <div className="font-['DM_Sans'] text-5xl font-light tracking-[-1.6px] text-[#161616]">
            {metadata.issues.length}
          </div>
        </div>
      </div>

      {/* Issues */}
      {metadata.issues.length > 0 && (
        <div>
          <h3 className="font-['DM_Sans'] text-2xl font-light tracking-[-0.96px] text-[#161616] mb-4">
            {t('seoIssuesTitle')}
          </h3>
          <SEOIssuesList metadata={metadata} />
        </div>
      )}

      {/* Previews */}
      <div>
        <h3 className="font-['DM_Sans'] text-2xl font-light tracking-[-0.96px] text-[#161616] mb-4">
          {t('searchSocialTitle')}
        </h3>
        <div className="space-y-6">
          <GoogleSearchPreview metadata={metadata} />
          <FacebookPreview metadata={metadata} />
          <TwitterPreview metadata={metadata} />
        </div>
      </div>
    </div>
  );
}
