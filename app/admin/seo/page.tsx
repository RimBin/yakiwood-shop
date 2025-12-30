'use client';

import React, { useState, useEffect } from 'react';
import { SEOPreview } from '@/components/admin/SEOPreview';
import { scanAllPages, type PageSEOResult } from '@/lib/seo/scanner';
import { Breadcrumbs } from '@/components/ui';

type FilterType = 'all' | 'good' | 'warning' | 'error';

export default function SEOAdminPage() {
  const [pages, setPages] = useState<PageSEOResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPage, setSelectedPage] = useState<PageSEOResult | null>(null);

  useEffect(() => {
    const loadPages = async () => {
      setLoading(true);
      const scannedPages = await scanAllPages();
      setPages(scannedPages);
      setLoading(false);
    };
    loadPages();
  }, []);

  const filteredPages = pages.filter(page => {
    if (filter === 'all') return true;
    if (filter === 'good') return page.seoScore >= 80;
    if (filter === 'warning') return page.seoScore >= 50 && page.seoScore < 80;
    if (filter === 'error') return page.seoScore < 50;
    return true;
  });

  const stats = {
    total: pages.length,
    good: pages.filter(p => p.seoScore >= 80).length,
    warning: pages.filter(p => p.seoScore >= 50 && p.seoScore < 80).length,
    error: pages.filter(p => p.seoScore < 50).length,
  };

  const averageScore = pages.length > 0 
    ? Math.round(pages.reduce((sum, p) => sum + p.seoScore, 0) / pages.length)
    : 0;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(pages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seo-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
    return (
      <>
        <Breadcrumbs items={[{ label: 'Pradžia', href: '/' }, { label: 'Administravimas', href: '/admin' }, { label: 'SEO' }]} />
        <div className="min-h-screen bg-[#E1E1E1] flex items-center justify-center py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161616] mx-auto mb-4"></div>
            <p className="font-['Outfit'] text-[#535353]">Skenuojami puslapiai...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Homepage', href: '/' }, { label: 'Admin', href: '/admin' }, { label: 'SEO' }]} />
      
      <div className="min-h-screen bg-[#E1E1E1] py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
        <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-[clamp(32px,4vw,48px)]">
          <h1 className="font-['DM_Sans'] font-light text-[clamp(40px,6vw,72px)] leading-none tracking-[clamp(-1.6px,-0.025em,-2.88px)] text-[#161616] mb-[8px]">
            SEO Valdymas
          </h1>
          <p className="font-['Outfit'] font-light text-[clamp(14px,1.5vw,16px)] text-[#535353]">
            Stebėkite ir optimizuokite savo svetainės paieškos sistemų našumą
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(16px,2vw,24px)] mb-[clamp(24px,3vw,32px)]">
          <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
            <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">Iš viso puslapių</div>
            <div className="font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] text-[#161616]">
              {stats.total}
            </div>
          </div>
          <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
            <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">Vidutinis balas</div>
            <div className={`font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] ${getScoreColor(averageScore)}`}>
              {averageScore}%
            </div>
          </div>
          <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
            <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">Geras SEO</div>
            <div className="font-['DM_Sans'] font-light text-[clamp(32px,4vw,48px)] leading-none tracking-[clamp(-1px,-0.025em,-1.44px)] text-green-600">
              {stats.good}
            </div>
          </div>
          <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(16px,2vw,24px)] border border-[#E1E1E1]">
            <div className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px]">Reikia darbo</div>
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
            All Puslapiai ({stats.total})
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
              filter === 'good'
                ? 'bg-green-600 text-white'
                : 'bg-[#EAEAEA] text-green-600 border border-green-200 hover:border-green-600'
            }`}
          >
            Geri ({stats.good})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
              filter === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-[#EAEAEA] text-yellow-600 border border-yellow-200 hover:border-yellow-600'
            }`}
          >
            Įspėjimai ({stats.warning})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap ${
              filter === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-[#EAEAEA] text-red-600 border border-red-200 hover:border-red-600'
            }`}
          >
            Klaidos ({stats.error})
          </button>
          <button
            onClick={handleExportJSON}
            className="h-[48px] ml-auto px-[24px] rounded-[100px] bg-[#EAEAEA] text-[#161616] border border-[#E1E1E1] hover:border-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap"
          >
            Eksportuoti JSON
          </button>
        </div>

        {/* Pages Table */}
        <div className="bg-[#EAEAEA] rounded-[24px] border border-[#E1E1E1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#EAEAEA] border-b border-[#E1E1E1]">
                <tr>
                  <th className="text-left px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">
                    Puslapis
                  </th>
                  <th className="text-left px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">
                    Pavadinimas
                  </th>
                  <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">
                    Balas
                  </th>
                  <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">
                    Problemos
                  </th>
                  <th className="text-center px-6 py-4 font-['Outfit'] text-sm font-normal text-[#535353]">
                    Veiksmai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E1E1]">
                {filteredPages.map((page, index) => (
                  <tr key={index} className="hover:bg-[#EAEAEA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-['Outfit'] text-sm text-[#161616] font-medium">
                        {page.path}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-['Outfit'] text-sm text-[#535353] max-w-xs truncate">
                        {page.title || 'Nėra pavadinimo'}
                      </div>
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
                      <button
                        onClick={() => setSelectedPage(page)}
                        className="h-[40px] px-[20px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition-colors"
                      >
                        Peržiūrėti detaliai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <p className="font-['Outfit'] text-[#535353]">Nėra puslapių atitinkančių pasirinktą filtrą</p>
            </div>
          )}
        </div>
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
                  SEO Balas: <span className={getScoreColor(selectedPage.seoScore)}>{selectedPage.seoScore}%</span>
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
      </div>
    </>
  );
}
