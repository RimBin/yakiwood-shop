'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AdminBody,
  AdminButton,
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminSelect,
  AdminStack,
  AdminTextarea,
} from '@/components/admin/ui/AdminUI';
import {
  EMAIL_TEMPLATES,
  getEmailTemplatesByCategory,
  getSampleData,
  type EmailTemplate,
} from '@/lib/email/templates';
import { getBilingualEmailTemplate, renderTemplateString } from '@/lib/email/bilingualTemplates';

type CmsTemplateFields = {
  subjectLt: string;
  subjectEn: string;
  htmlLt: string;
  htmlEn: string;
};

const EMPTY_FIELDS: CmsTemplateFields = {
  subjectLt: '',
  subjectEn: '',
  htmlLt: '',
  htmlEn: '',
};

export default function EmailTemplatesAdmin() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewVars, setPreviewVars] = useState<Record<string, any>>({});
  const [testEmailTo, setTestEmailTo] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendStatus, setSendStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [testLocale, setTestLocale] = useState<'lt' | 'en'>('lt');
  const [cmsFields, setCmsFields] = useState<CmsTemplateFields>(EMPTY_FIELDS);
  const [isLoadingCms, setIsLoadingCms] = useState(false);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [cmsStatus, setCmsStatus] = useState<null | { ok: boolean; message: string }>(null);

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewVars(getSampleData(template.id));
  };

  useEffect(() => {
    const loadCmsTemplate = async (templateId: string) => {
      setIsLoadingCms(true);
      setCmsStatus(null);
      try {
        const res = await fetch(`/api/admin/email-templates?templateId=${encodeURIComponent(templateId)}`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = (await res.json().catch(() => ({}))) as any;
        if (!res.ok) {
          setCmsFields(EMPTY_FIELDS);
          setCmsStatus({ ok: false, message: data?.error || 'Nepavyko užkrauti CMS šablono.' });
          return;
        }

        const doc = data?.data;
        setCmsFields({
          subjectLt: doc?.subjectLt || '',
          subjectEn: doc?.subjectEn || '',
          htmlLt: doc?.htmlLt || '',
          htmlEn: doc?.htmlEn || '',
        });
      } catch (e: any) {
        setCmsFields(EMPTY_FIELDS);
        setCmsStatus({ ok: false, message: e?.message || 'Netikėta klaida kraunant CMS šabloną.' });
      } finally {
        setIsLoadingCms(false);
      }
    };

    if (!selectedTemplate) {
      setCmsFields(EMPTY_FIELDS);
      setCmsStatus(null);
      return;
    }

    loadCmsTemplate(selectedTemplate.id);
  }, [selectedTemplate]);

  const handleSaveCms = async () => {
    if (!selectedTemplate) return;
    setIsSavingCms(true);
    setCmsStatus(null);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          subjectLt: cmsFields.subjectLt,
          subjectEn: cmsFields.subjectEn,
          htmlLt: cmsFields.htmlLt,
          htmlEn: cmsFields.htmlEn,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setCmsStatus({ ok: false, message: data?.error || 'Nepavyko išsaugoti CMS šablono.' });
        return;
      }

      setCmsStatus({ ok: true, message: 'Šablonas išsaugotas į CMS.' });
    } catch (e: any) {
      setCmsStatus({ ok: false, message: e?.message || 'Netikėta klaida saugant CMS šabloną.' });
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleLoadDefaults = () => {
    if (!selectedTemplate) return;
    const defaults = getBilingualEmailTemplate(selectedTemplate.id);
    if (!defaults) {
      setCmsStatus({ ok: false, message: 'Nerasti numatytieji dvikalbiai šablonai šiam tipui.' });
      return;
    }

    setCmsFields({
      subjectLt: defaults.subject.lt,
      subjectEn: defaults.subject.en,
      htmlLt: defaults.html.lt,
      htmlEn: defaults.html.en,
    });
    setCmsStatus({ ok: true, message: 'Įkelti numatytieji dvikalbiai šablonai.' });
  };

  const handleCopyHTML = () => {
    if (!selectedTemplate) return;
    const html = selectedTemplate.html(previewVars);
    navigator.clipboard.writeText(html);
    alert('HTML nukopijuotas!');
  };

  const handleSendTest = async () => {
    if (!selectedTemplate) return;

    const to = testEmailTo.trim();
    if (!to) {
      setSendStatus({ ok: false, message: 'Įveskite gavėjo el. paštą.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      setSendStatus({ ok: false, message: 'Gavėjo el. paštas atrodo neteisingas.' });
      return;
    }

    setIsSendingTest(true);
    setSendStatus(null);

    try {
      const rendered = testLocale === 'en' ? renderedEn : renderedLt;
      const subject = rendered?.subject || selectedTemplate.subject(previewVars);
      const html = rendered?.html || selectedTemplate.html(previewVars);

      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to,
          subject: `[TEST ${testLocale.toUpperCase()}] ${subject}`,
          html,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setSendStatus({ ok: false, message: data?.error || 'Nepavyko išsiųsti testinio laiško.' });
        return;
      }

      setSendStatus({ ok: true, message: 'Testinis laiškas sėkmingai įtrauktas į eilę.' });
    } catch (e: any) {
      setSendStatus({ ok: false, message: e?.message || 'Netikėta klaida siunčiant testinį laišką.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const categories = [
    { id: 'transactional' as const, name: 'Transakciniai', color: 'bg-blue-100 text-blue-800' },
    { id: 'marketing' as const, name: 'Marketingo', color: 'bg-green-100 text-green-800' },
    { id: 'customer-service' as const, name: 'Klientų aptarnavimo', color: 'bg-purple-100 text-purple-800' },
  ];

  const renderedLt = useMemo(() => {
    if (!selectedTemplate) return null;
    const defaults = getBilingualEmailTemplate(selectedTemplate.id);
    const subjectTemplate = cmsFields.subjectLt || defaults?.subject.lt || '';
    const htmlTemplate = cmsFields.htmlLt || defaults?.html.lt || '';
    return {
      subject: subjectTemplate
        ? renderTemplateString(subjectTemplate, previewVars)
        : selectedTemplate.subject(previewVars),
      html: htmlTemplate ? renderTemplateString(htmlTemplate, previewVars) : selectedTemplate.html(previewVars),
    };
  }, [cmsFields.htmlLt, cmsFields.subjectLt, previewVars, selectedTemplate]);

  const renderedEn = useMemo(() => {
    if (!selectedTemplate) return null;
    const defaults = getBilingualEmailTemplate(selectedTemplate.id);
    const subjectTemplate = cmsFields.subjectEn || defaults?.subject.en || '';
    const htmlTemplate = cmsFields.htmlEn || defaults?.html.en || '';
    return {
      subject: subjectTemplate
        ? renderTemplateString(subjectTemplate, previewVars)
        : selectedTemplate.subject(previewVars),
      html: htmlTemplate ? renderTemplateString(htmlTemplate, previewVars) : selectedTemplate.html(previewVars),
    };
  }, [cmsFields.htmlEn, cmsFields.subjectEn, previewVars, selectedTemplate]);

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminStack>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[clamp(16px,2vw,24px)]">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <AdminCard>
                <div className="mb-[24px]">
                  <h2 className="font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px]">
                    Galimi šablonai ({EMAIL_TEMPLATES.length})
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
                            className={`w-full text-left p-[16px] rounded-[16px] border transition-colors ${
                              selectedTemplate?.id === template.id
                                ? 'bg-[#161616] text-white border-[#161616]'
                                : 'bg-white text-[#161616] border-[#E1E1E1] hover:bg-[#E1E1E1]'
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
              </AdminCard>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <div className="bg-[#EAEAEA] rounded-[24px] overflow-hidden border border-[#E1E1E1]">
                  <div className="bg-[#161616] text-white p-[clamp(20px,3vw,32px)]">
                    <div className="flex items-start justify-between mb-[20px]">
                      <div className="flex-1">
                        <h2 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] mb-[8px]">
                          {selectedTemplate.name}
                        </h2>
                        <p className="font-['Outfit'] text-[#E1E1E1] text-[14px]">{selectedTemplate.description}</p>
                      </div>
                      <div className={`px-[12px] py-[4px] rounded-[100px] text-[11px] font-['Outfit'] uppercase tracking-[0.55px] border ${
                        selectedTemplate.category === 'transactional' ? 'bg-[#EAEAEA] text-blue-700 border-blue-200' :
                        selectedTemplate.category === 'marketing' ? 'bg-[#EAEAEA] text-green-700 border-green-200' :
                        'bg-[#EAEAEA] text-purple-700 border-purple-200'
                      }`}>
                        {selectedTemplate.category}
                      </div>
                    </div>
                    <div className="bg-[#535353] rounded-[12px] p-[16px]">
                      <div className="font-['Outfit'] text-[#BBBBBB] text-[11px] uppercase tracking-[0.55px] mb-[8px]">
                        Temos eilutės (peržiūra)
                      </div>
                      <div className="space-y-[10px]">
                        <div>
                          <div className="font-['Outfit'] text-[#BBBBBB] text-[10px] uppercase tracking-[0.55px]">
                            LT
                          </div>
                          <div className="font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px]">
                            {renderedLt?.subject || selectedTemplate.subject(previewVars)}
                          </div>
                        </div>
                        <div>
                          <div className="font-['Outfit'] text-[#BBBBBB] text-[10px] uppercase tracking-[0.55px]">
                            EN
                          </div>
                          <div className="font-['DM_Sans'] font-medium text-[14px] tracking-[-0.28px]">
                            {renderedEn?.subject || selectedTemplate.subject(previewVars)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-[clamp(20px,3vw,32px)]">
                    <div className="mb-[24px]">
                      <div className="flex flex-col gap-[12px]">
                        <div className="flex items-center justify-between gap-[12px] flex-wrap">
                          <AdminLabel>CMS šablonų redaktorius</AdminLabel>
                          <div className="flex gap-[8px] flex-wrap">
                            <AdminButton variant="secondary" size="sm" onClick={handleLoadDefaults}>
                              Įkelti numatytuosius
                            </AdminButton>
                            <AdminButton onClick={handleSaveCms} size="sm" disabled={isSavingCms || isLoadingCms}>
                              {isSavingCms ? 'Išsaugoma…' : 'Išsaugoti į CMS'}
                            </AdminButton>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#535353] font-['Outfit']">
                          Pakeitimai saugomi Sanity ir naudojami produkcinėms žinutėms. Reikia admin sesijos ir SANITY write token.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px] mt-[16px]">
                        <div className="space-y-[12px]">
                          <AdminLabel>Tema (LT)</AdminLabel>
                          <AdminInput
                            value={cmsFields.subjectLt}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, subjectLt: e.target.value }))}
                            placeholder="Pvz.: Užsakymo patvirtinimas #{{orderNumber}}"
                          />
                        </div>
                        <div className="space-y-[12px]">
                          <AdminLabel>Tema (EN)</AdminLabel>
                          <AdminInput
                            value={cmsFields.subjectEn}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, subjectEn: e.target.value }))}
                            placeholder="Pvz.: Order Confirmation #{{orderNumber}}"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px] mt-[16px]">
                        <div className="space-y-[12px]">
                          <AdminLabel>HTML (LT)</AdminLabel>
                          <AdminTextarea
                            value={cmsFields.htmlLt}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, htmlLt: e.target.value }))}
                            placeholder="&lt;h1&gt;Ačiū už užsakymą&lt;/h1&gt; ..."
                            rows={10}
                          />
                        </div>
                        <div className="space-y-[12px]">
                          <AdminLabel>HTML (EN)</AdminLabel>
                          <AdminTextarea
                            value={cmsFields.htmlEn}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, htmlEn: e.target.value }))}
                            placeholder="&lt;h1&gt;Thanks for your order&lt;/h1&gt; ..."
                            rows={10}
                          />
                        </div>
                      </div>

                      {cmsStatus ? (
                        <div
                          className={`mt-[12px] rounded-[12px] p-[12px] font-['Outfit'] text-[12px] ${
                            cmsStatus.ok
                              ? 'bg-[#EAEAEA] text-green-700 border border-green-200'
                              : 'bg-[#EAEAEA] text-red-700 border border-red-200'
                          }`}
                          role="status"
                        >
                          {cmsStatus.message}
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-[24px]">
                      <AdminLabel className="mb-[8px]">Testo gavėjas</AdminLabel>
                      <div className="flex flex-col sm:flex-row gap-[12px]">
                        <AdminInput
                          value={testEmailTo}
                          onChange={(e) => setTestEmailTo(e.target.value)}
                          placeholder="name@company.com"
                          inputMode="email"
                          className="h-[48px]"
                          aria-label="Test email recipient"
                        />
                        <AdminSelect
                          value={testLocale}
                          onChange={(e) => setTestLocale(e.target.value === 'en' ? 'en' : 'lt')}
                          className="h-[48px]"
                          aria-label="Test email locale"
                        >
                          <option value="lt">LT</option>
                          <option value="en">EN</option>
                        </AdminSelect>
                        <AdminButton onClick={handleSendTest} disabled={isSendingTest}>
                          {isSendingTest ? 'Siunčiama…' : 'Siųsti testinį laišką'}
                        </AdminButton>
                      </div>

                      {sendStatus ? (
                        <div
                          className={`mt-[12px] rounded-[12px] p-[12px] font-['Outfit'] text-[12px] ${
                            sendStatus.ok
                              ? 'bg-[#EAEAEA] text-green-700 border border-green-200'
                              : 'bg-[#EAEAEA] text-red-700 border border-red-200'
                          }`}
                          role="status"
                        >
                          {sendStatus.message}
                          {!sendStatus.ok ? (
                            <div className="mt-[6px] text-[11px] text-[#535353]">
                              Pastaba: siuntimui reikia el. pašto tiekėjo konfigūracijos (pvz. <code>RESEND_API_KEY</code>).
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-[24px]">
                      <AdminLabel className="mb-[12px]">HTML peržiūra (LT)</AdminLabel>
                      <div className="border-2 border-[#E1E1E1] rounded-[12px] overflow-hidden mb-[16px]">
                        <iframe
                          srcDoc={renderedLt?.html || selectedTemplate.html(previewVars)}
                          className="w-full h-[420px] bg-[#EAEAEA]"
                          title="Email Preview LT"
                        />
                      </div>
                      <AdminLabel className="mb-[12px]">HTML peržiūra (EN)</AdminLabel>
                      <div className="border-2 border-[#E1E1E1] rounded-[12px] overflow-hidden">
                        <iframe
                          srcDoc={renderedEn?.html || selectedTemplate.html(previewVars)}
                          className="w-full h-[420px] bg-[#EAEAEA]"
                          title="Email Preview EN"
                        />
                      </div>
                    </div>

                    <div className="flex gap-[12px] flex-wrap">
                      <AdminButton variant="secondary" onClick={handleCopyHTML}>
                        Kopijuoti HTML
                      </AdminButton>
                    </div>

                    {/* Template Variables */}
                    <div className="mt-[24px] p-[20px] bg-[#EAEAEA] rounded-[16px] border border-[#E1E1E1]">
                      <h4 className="font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px] mb-[12px]">
                        Pavyzdiniai duomenys
                      </h4>
                      <pre className="font-['Outfit'] text-[11px] text-[#535353] overflow-x-auto">
                        {JSON.stringify(previewVars, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <AdminCard className="text-center p-[clamp(40px,6vw,80px)]">
                  <div className="text-[#BBBBBB] text-[clamp(48px,8vw,72px)] mb-[16px]">📧</div>
                  <h3 className="font-['DM_Sans'] font-light text-[clamp(24px,3vw,32px)] tracking-[-1.28px] text-[#161616] mb-[8px]">
                    Pasirinkite šabloną
                  </h3>
                  <p className="font-['Outfit'] text-[14px] text-[#535353]">Pasirinkite el. laiško šabloną peržiūrai</p>
                </AdminCard>
              )}
            </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2vw,24px)]">
            {categories.map((category) => {
              const templates = getEmailTemplatesByCategory(category.id);
              return (
                <AdminCard key={category.id} className="p-[clamp(20px,3vw,24px)]">
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
                </AdminCard>
              );
            })}
      </div>
      </AdminStack>
    </AdminBody>
  );
}
