'use client';

import { useState } from 'react';
import {
  EMAIL_TEMPLATES,
  getEmailTemplatesByCategory,
  getSampleData,
  type EmailTemplate,
} from '@/lib/email/templates';

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
    { id: 'transactional' as const, name: 'Transakcijų laiškai', color: 'bg-blue-100 text-blue-800' },
    { id: 'marketing' as const, name: 'Marketingo laiškai', color: 'bg-green-100 text-green-800' },
    { id: 'customer-service' as const, name: 'Klientų aptarnavimas', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-[#EAEAEA] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-['DM_Sans'] font-medium text-[#161616] mb-2">Email Templates</h1>
          <p className="text-[#535353]">E-commerce email template management and preview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-sm font-medium text-[#535353] uppercase tracking-wide">
                  Available Templates ({EMAIL_TEMPLATES.length})
                </h2>
              </div>

              {categories.map((category) => {
                const templates = getEmailTemplatesByCategory(category.id);
                if (templates.length === 0) return null;

                return (
                  <div key={category.id} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-medium text-[#161616] mb-3 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${category.color}`}>
                        {templates.length}
                      </span>
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handlePreview(template)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'bg-[#161616] text-white'
                              : 'bg-[#EAEAEA] text-[#161616] hover:bg-[#E1E1E1]'
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">{template.name}</div>
                          <div
                            className={`text-xs ${
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
              <div className="bg-white rounded-[24px] shadow-sm overflow-hidden">
                <div className="bg-[#161616] text-white p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-medium mb-2">{selectedTemplate.name}</h2>
                      <p className="text-[#E1E1E1] text-sm mb-3">{selectedTemplate.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      selectedTemplate.category === 'transactional' ? 'bg-blue-100 text-blue-800' :
                      selectedTemplate.category === 'marketing' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {selectedTemplate.category}
                    </div>
                  </div>
                  <div className="text-sm bg-[#535353] rounded-lg p-3">
                    <div className="text-[#BBBBBB] text-xs mb-1">Subject Line:</div>
                    <div className="font-medium">{selectedTemplate.subject(previewVars)}</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#161616] mb-2">
                      HTML Preview
                    </label>
                    <div className="border-2 border-[#E1E1E1] rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={selectedTemplate.html(previewVars)}
                        className="w-full h-[600px] bg-[#EAEAEA]"
                        title="Email Preview"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleSendTest}
                      className="px-6 py-3 bg-[#161616] text-white rounded-full text-sm font-medium hover:bg-[#535353] transition-colors"
                    >
                      📧 Send Test Email
                    </button>
                    <button
                      onClick={handleCopyHTML}
                      className="px-6 py-3 bg-[#E1E1E1] text-[#161616] rounded-full text-sm font-medium hover:bg-[#BBBBBB] transition-colors"
                    >
                      📋 Copy HTML
                    </button>
                  </div>

                  {/* Template Variables */}
                  <div className="mt-6 p-4 bg-[#EAEAEA] rounded-lg">
                    <h4 className="text-sm font-medium text-[#161616] mb-2">Sample Data</h4>
                    <pre className="text-xs text-[#535353] overflow-x-auto">
                      {JSON.stringify(previewVars, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[24px] p-12 text-center shadow-sm">
                <div className="text-[#BBBBBB] text-6xl mb-4">📧</div>
                <h3 className="text-xl font-medium text-[#161616] mb-2">Select a Template</h3>
                <p className="text-[#535353]">Choose an email template from the list to preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const templates = getEmailTemplatesByCategory(category.id);
            return (
              <div key={category.id} className="bg-white rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-[#535353]">{category.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {templates.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {templates.map((template) => (
                    <div key={template.id} className="text-xs text-[#535353]">
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
  );
}
