'use client';

import React, { useState, useEffect } from 'react';
import { SEOPreviewCard } from '@/components/admin/SEOPreview';
import {
  getAllPages,
  getPagesWithMissingMetadata,
  getPagesWithMetadata,
  calculateSEOCompleteness,
  PageInfo,
} from '@/lib/seo/scanner';
import { validatePageMetadata, getScoreBadgeClass } from '@/lib/seo/validator';

export default function SEOAdminPage() {
  const [allPages, setAllPages] = useState<PageInfo[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    withMetadata: number;
    withoutMetadata: number;
    percentage: number;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'with' | 'without'>('all');
  const [selectedPage, setSelectedPage] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const pages = await getAllPages();
      const seoStats = await calculateSEOCompleteness();
      setAllPages(pages);
      setStats(seoStats);
    } catch (error) {
      console.error('Failed to load SEO data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPages = allPages.filter((page) => {
    if (filter === 'with') return page.hasMetadata;
    if (filter === 'without') return !page.hasMetadata;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Kraunama SEO duomenys...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Dashboard</h1>
          <p className="text-gray-600">
            Peržiūrėkite ir valdykite visų puslapių SEO metadata
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Bendras rezultatas</div>
              <div className={`text-4xl font-bold ${getScoreBadgeClass(stats.percentage).split(' ')[1]}`}>
                {stats.percentage}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Viso puslapių</div>
              <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Su metadata</div>
              <div className="text-4xl font-bold text-green-600">{stats.withMetadata}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Be metadata</div>
              <div className="text-4xl font-bold text-red-600">{stats.withoutMetadata}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Visi ({allPages.length})
            </button>
            <button
              onClick={() => setFilter('with')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'with'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Su metadata ({allPages.filter((p) => p.hasMetadata).length})
            </button>
            <button
              onClick={() => setFilter('without')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'without'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Be metadata ({allPages.filter((p) => !p.hasMetadata).length})
            </button>
          </div>
        </div>

        {/* Pages List */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puslapis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    OG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Twitter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SEO Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veiksmai
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.map((page, idx) => {
                  const validation = page.metadata
                    ? validatePageMetadata(page.metadata)
                    : null;
                  const score = validation?.score || 0;

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{page.path}</div>
                        <div className="text-xs text-gray-500">{page.file}</div>
                      </td>
                      <td className="px-6 py-4">
                        {page.metadata?.title ? (
                          <div className="text-sm text-gray-900">
                            {' '}
                            <span
                              className={
                                page.metadata.title.length > 60 ? 'text-red-600' : ''
                              }
                            >
                              ({page.metadata.title.length}/60)
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600"> Trūksta</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {page.metadata?.description ? (
                          <div className="text-sm text-gray-900">
                            {' '}
                            <span
                              className={
                                page.metadata.description.length > 160
                                  ? 'text-red-600'
                                  : ''
                              }
                            >
                              ({page.metadata.description.length}/160)
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600"> Trūksta</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.metadata?.openGraph ? (
                          <div className="text-sm text-green-600"></div>
                        ) : (
                          <div className="text-sm text-gray-400"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.metadata?.twitter ? (
                          <div className="text-sm text-green-600"></div>
                        ) : (
                          <div className="text-sm text-gray-400"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-bold ${getScoreBadgeClass(score).split(' ')[1]}`}
                        >
                          {score}/100
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedPage(page)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Peržiūrėti
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Page Preview */}
        {selectedPage && selectedPage.metadata && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalus SEO Preview: {selectedPage.path}
              </h2>
              <button
                onClick={() => setSelectedPage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Uždaryti
              </button>
            </div>
            <SEOPreviewCard metadata={selectedPage.metadata} />
          </div>
        )}

        {/* Export Button */}
        <div className="text-center">
          <button
            onClick={async () => {
              const data = JSON.stringify(allPages, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Eksportuoti JSON
          </button>
        </div>
      </div>
    </div>
  );
}
