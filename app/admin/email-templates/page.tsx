'use client';

import { useState } from 'react';
import {
  EMAIL_TEMPLATES,
  getEmailTemplatesByCategory,
  getSampleData,
  type EmailTemplate,
} from '@/lib/email/templates';
import { Breadcrumbs } from '@/components/ui';

export default function EmailTemplatesAdmin() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewVars, setPreviewVars] = useState<Record<string, any>>({});

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewVars(getSampleData(template.id));
  };

  const handleCopyHTML = () => {
    if (!selectedTemplate) return;
    const html = selectedTemplate.html(previewVars);
    navigator.clipboard.writeText(html);
    alert('HTML copied to clipboard!');
  };

  const handleSendTest = () => {
    if (!selectedTemplate) return;
    // TODO: Implement test email sending
    alert('Test email functionality coming soon!');
  };

  const categories = [
    { id: 'transactional' as const, name: 'Transactional', color: 'bg-blue-100 text-blue-800' },
    { id: 'marketing' as const, name: 'Marketing', color: 'bg-green-100 text-green-800' },
    { id: 'customer-service' as const, name: 'Customer Service', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Homepage', href: '/' }, { label: 'Admin', href: '/admin' }, { label: 'Email Templates' }]} />
      
      <div className="min-h-screen bg-[#E1E1E1] py-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-[clamp(32px,4vw,48px)]">
            <h1 className="font-['DM_Sans'] font-light text-[clamp(40px,6vw,72px)] leading-none tracking-[clamp(-1.6px,-0.025em,-2.88px)] text-[#161616] mb-[8px]">
              Email Templates
            </h1>
            <p className="font-['Outfit'] font-light text-[clamp(14px,1.5vw,16px)] text-[#535353]">
              E-commerce email template management and preview
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[clamp(16px,2vw,24px)]">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <div className="bg-[#EAEAEA] rounded-[24px] p-[clamp(20px,3vw,32px)]">
                <div className="mb-[24px]">
                  <h2 className="font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px]">
                    Available Templates ({EMAIL_TEMPLATES.length})
                  </h2>
                </div>

                {categories.map((category) => {
                  const templates = getEmailTemplatesByCategory(category.id);
                  if (templates.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-[24px] last:mb-0">
                      <h3 className="font-['DM_Sans'] text-[14px] font-medium text-[#161616] mb-[12px] flex items-center gap-[8px]">
                        <span className={`px-[12px] py-[4px] rounded-[100px] text-[11px] font-['Outfit'] uppercase tracking-[0.55px] ${category.color}`}>
                          {templates.length}
                        </span>
                        {category.name}
                      </h3>
                      <div className="space-y-[8px]">
                        {templates.map((template: EmailTemplate) => (
                          <button
                            key={template.id}
                            onClick={() => handlePreview(template)}
                            className={`w-full text-left p-[16px] rounded-[12px] transition-colors ${
                              selectedTemplate?.id === template.id
                                ? 'bg-[#161616] text-white'
                                : 'bg-[#EAEAEA] text-[#161616] hover:bg-[#E1E1E1]'
                            }`}
                          >
                            <div className="font-['DM_Sans'] font-medium text-[14px] mb-[4px] tracking-[-0.28px]">
                              {template.name}
                            </div>
                            <div
                              className={`font-['Outfit'] text-[12px] ${
                                selectedTemplate?.id === template.id ? 'text-[#E1E1E1]' : 'text-[#535353]'
                              }`}
                            >
                              {template.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <div className="bg-white rounded-[24px] overflow-hidden">
                  <div className="bg-[#161616] text-white p-[clamp(20px,3vw,32px)]">
                    <div className="flex items-start justify-between mb-[20px]">
                      <div className="flex-1">
                        <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] mb-[8px]">
                          {selectedTemplate.name}
                        </h2>
                        <p className="font-['Outfit'] text-[#E1E1E1] text-[14px]">{selectedTemplate.description}</p>
                      </div>
                      <div className={`px-[12px] py-[4px] rounded-[100px] text-[11px] font-['Outfit'] uppercase tracking-[0.55px] ${
                        selectedTemplate.category === 'transactional' ? 'bg-blue-100 text-blue-800' :
                        selectedTemplate.category === 'marketing' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedTemplate.category}
                      </div>
                    </div>
                    <div className="bg-[#535353] rounded-[12px] p-[16px]">
                      <div className="font-['Outfit'] text-[#BBBBBB] text-[11px] uppercase tracking-[0.55px] mb-[4px]">
                        Subject Line:
                      </div>
                      <div className="font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px]">
                        {selectedTemplate.subject(previewVars)}
                      </div>
                    </div>
                  </div>

                  <div className="p-[clamp(20px,3vw,32px)]">
                    <div className="mb-[24px]">
                      <label className="block font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px] mb-[12px]">
                        HTML Preview
                      </label>
                      <div className="border-2 border-[#E1E1E1] rounded-[12px] overflow-hidden">
                        <iframe
                          srcDoc={selectedTemplate.html(previewVars)}
                          className="w-full h-[600px] bg-[#EAEAEA]"
                          title="Email Preview"
                        />
                      </div>
                    </div>

                    <div className="flex gap-[12px] flex-wrap">
                      <button
                        onClick={handleSendTest}
                        className="h-[48px] px-[24px] rounded-[100px] bg-[#161616] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-white hover:bg-[#535353] transition-colors"
                      >
                        📧 Send Test Email
                      </button>
                      <button
                        onClick={handleCopyHTML}
                        className="h-[48px] px-[24px] rounded-[100px] bg-[#E1E1E1] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:bg-[#BBBBBB] transition-colors"
                      >
                        📋 Copy HTML
                      </button>
                    </div>

                    {/* Template Variables */}
                    <div className="mt-[24px] p-[20px] bg-[#EAEAEA] rounded-[12px]">
                      <h4 className="font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px] mb-[12px]">
                        Sample Data
                      </h4>
                      <pre className="font-['Outfit'] text-[11px] text-[#535353] overflow-x-auto">
                        {JSON.stringify(previewVars, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] p-[clamp(40px,6vw,80px)] text-center">
                  <div className="text-[#BBBBBB] text-[clamp(48px,8vw,72px)] mb-[16px]">📧</div>
                  <h3 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[8px]">
                    Select a Template
                  </h3>
                  <p className="font-['Outfit'] text-[14px] text-[#535353]">
                    Choose an email template from the list to preview
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-[clamp(24px,3vw,32px)] grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2vw,24px)]">
            {categories.map((category) => {
              const templates = getEmailTemplatesByCategory(category.id);
              return (
                <div key={category.id} className="bg-white rounded-[24px] p-[clamp(20px,3vw,24px)]">
                  <div className="flex items-center justify-between mb-[16px]">
                    <h3 className="font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px] text-[#161616]">
                      {category.name}
                    </h3>
                    <span className={`px-[12px] py-[4px] rounded-[100px] text-[11px] font-['Outfit'] uppercase tracking-[0.55px] font-medium ${category.color}`}>
                      {templates.length}
                    </span>
                  </div>
                  <div className="space-y-[6px]">
                    {templates.map((template: EmailTemplate) => (
                      <div key={template.id} className="font-['Outfit'] text-[12px] text-[#535353]">
                        • {template.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
