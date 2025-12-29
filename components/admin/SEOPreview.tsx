'use client';

import React from 'react';
import { PageMetadata, validatePageMetadata, getScoreBadgeClass } from '@/lib/seo/validator';

interface SEOPreviewProps {
  metadata: PageMetadata;
}

/**
 * Google Search Result Preview
 */
export function GoogleSearchPreview({ metadata }: SEOPreviewProps) {
  const title = metadata.title || 'Untitled Page';
  const description = metadata.description || '';
  const displayUrl = metadata.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-600 mb-1">Google Paieškos Rezultatas</div>
      <div className="max-w-[600px]">
        {/* URL breadcrumb */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
            Y
          </div>
          <span className="text-sm text-gray-700">{displayUrl}</span>
        </div>

        {/* Title */}
        <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer mb-1 font-['Arial']">
          {title.length > 60 ? title.substring(0, 60) + '...' : title}
        </div>

        {/* Description */}
        <div className="text-sm text-gray-600 leading-relaxed font-['Arial']">
          {description.length > 160 ? description.substring(0, 160) + '...' : description || 'Aprašymas nerastas'}
        </div>
      </div>

      {/* Length indicators */}
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span className={title.length > 60 ? 'text-red-600 font-medium' : ''}>
          Title: {title.length}/60
        </span>
        <span className={description.length > 160 ? 'text-red-600 font-medium' : ''}>
          Description: {description.length}/160
        </span>
      </div>
    </div>
  );
}

/**
 * Facebook Open Graph Preview
 */
export function FacebookPreview({ metadata }: SEOPreviewProps) {
  const ogTitle = metadata.openGraph?.title || metadata.title || 'Untitled';
  const ogDescription = metadata.openGraph?.description || metadata.description || '';
  const ogImage = metadata.openGraph?.images?.[0]?.url;
  const displayUrl = metadata.url.replace(/^https?:\/\//, '');

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-600 mb-3">Facebook / Open Graph Preview</div>
      <div className="max-w-[500px] border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Image */}
        {ogImage ? (
          <div className="w-full aspect-[1.91/1] bg-gray-200 relative">
            <img src={ogImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-[1.91/1] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Nuotrauka nerastas</span>
          </div>
        )}

        {/* Content */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500 uppercase mb-1">{displayUrl}</div>
          <div className="text-base font-semibold text-gray-900 mb-1 font-['Helvetica']">
            {ogTitle.length > 95 ? ogTitle.substring(0, 95) + '...' : ogTitle}
          </div>
          <div className="text-sm text-gray-600 font-['Helvetica']">
            {ogDescription.length > 200 ? ogDescription.substring(0, 200) + '...' : ogDescription}
          </div>
        </div>
      </div>

      {/* Metadata info */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <div className={ogTitle.length > 95 ? 'text-red-600 font-medium' : ''}>
          OG Title: {ogTitle.length}/95
        </div>
        <div className={ogDescription.length > 200 ? 'text-red-600 font-medium' : ''}>
          OG Description: {ogDescription.length}/200
        </div>
        {metadata.openGraph?.images?.[0] && (
          <div>
            Image: {metadata.openGraph.images[0].width || '?'}x{metadata.openGraph.images[0].height || '?'}px
            {(!metadata.openGraph.images[0].width || metadata.openGraph.images[0].width < 1200) && (
              <span className="text-red-600 ml-2">(rekomenduojama 1200x630)</span>
            )}
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
  const twitterTitle = metadata.twitter?.title || metadata.openGraph?.title || metadata.title || 'Untitled';
  const twitterDescription =
    metadata.twitter?.description || metadata.openGraph?.description || metadata.description || '';
  const twitterImage =
    metadata.twitter?.images?.[0] || metadata.openGraph?.images?.[0]?.url;
  const cardType = metadata.twitter?.card || 'summary_large_image';
  const displayUrl = metadata.url.replace(/^https?:\/\//, '');

  const isSummaryCard = cardType === 'summary';

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-xs text-gray-600 mb-3">Twitter Card Preview ({cardType})</div>
      <div className="max-w-[504px] border border-gray-300 rounded-2xl overflow-hidden bg-white">
        {/* Image */}
        {twitterImage ? (
          <div className={`w-full ${isSummaryCard ? 'aspect-square' : 'aspect-[2/1]'} bg-gray-200 relative`}>
            <img src={twitterImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-full ${isSummaryCard ? 'aspect-square' : 'aspect-[2/1]'} bg-gray-200 flex items-center justify-center`}>
            <span className="text-gray-400 text-sm">Nuotrauka nerastas</span>
          </div>
        )}

        {/* Content */}
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">{displayUrl}</div>
          <div className="text-base font-semibold text-gray-900 mb-1 font-['Helvetica']">
            {twitterTitle.length > 70 ? twitterTitle.substring(0, 70) + '...' : twitterTitle}
          </div>
          <div className="text-sm text-gray-600 font-['Helvetica']">
            {twitterDescription.length > 200
              ? twitterDescription.substring(0, 200) + '...'
              : twitterDescription}
          </div>
        </div>
      </div>

      {/* Metadata info */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <div>Card Type: {cardType}</div>
        <div className={twitterTitle.length > 70 ? 'text-red-600 font-medium' : ''}>
          Title: {twitterTitle.length}/70
        </div>
        <div className={twitterDescription.length > 200 ? 'text-red-600 font-medium' : ''}>
          Description: {twitterDescription.length}/200
        </div>
      </div>
    </div>
  );
}

/**
 * SEO Issues List
 */
export function SEOIssuesList({ metadata }: SEOPreviewProps) {
  const validation = validatePageMetadata(metadata);

  const errors = validation.issues.filter((i) => i.severity === 'error');
  const warnings = validation.issues.filter((i) => i.severity === 'warning');
  const infos = validation.issues.filter((i) => i.severity === 'info');

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">SEO Analizė</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreBadgeClass(validation.score)}`}>
          {validation.score}/100
        </div>
      </div>

      {validation.issues.length === 0 ? (
        <div className="text-green-600 text-sm">✓ Problemų nerasta!</div>
      ) : (
        <div className="space-y-3">
          {/* Errors */}
          {errors.length > 0 && (
            <div>
              <div className="text-red-600 font-medium text-sm mb-2">🚨 Klaidos ({errors.length})</div>
              <ul className="space-y-1">
                {errors.map((issue, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-red-500">
                    <span className="font-medium text-red-600">{issue.field}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <div className="text-yellow-600 font-medium text-sm mb-2">⚠️ Įspėjimai ({warnings.length})</div>
              <ul className="space-y-1">
                {warnings.map((issue, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-yellow-500">
                    <span className="font-medium text-yellow-600">{issue.field}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          {infos.length > 0 && (
            <div>
              <div className="text-blue-600 font-medium text-sm mb-2">ℹ️ Informacija ({infos.length})</div>
              <ul className="space-y-1">
                {infos.map((issue, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-500">
                    <span className="font-medium text-blue-600">{issue.field}:</span> {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Complete SEO Preview Card
 */
export function SEOPreviewCard({ metadata }: SEOPreviewProps) {
  const validation = validatePageMetadata(metadata);

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{metadata.url}</h2>
          <p className="text-sm text-gray-500 mt-1">SEO Preview</p>
        </div>
        <div className={`px-4 py-2 rounded-lg text-lg font-bold border-2 ${getScoreBadgeClass(validation.score)}`}>
          {validation.score}
        </div>
      </div>

      {/* Previews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoogleSearchPreview metadata={metadata} />
        <FacebookPreview metadata={metadata} />
        <TwitterPreview metadata={metadata} />
        <SEOIssuesList metadata={metadata} />
      </div>

      {/* Raw Metadata (collapsible) */}
      <details className="border border-gray-200 rounded-lg bg-white">
        <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
          Raw Metadata (JSON)
        </summary>
        <pre className="p-4 bg-gray-900 text-green-400 text-xs overflow-x-auto rounded-b-lg">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </details>
    </div>
  );
}
