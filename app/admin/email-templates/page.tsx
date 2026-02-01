'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();
  const isLt = locale === 'lt';

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

  const labels = useMemo(
    () =>
      isLt
        ? {
            availableTemplates: 'Galimi šablonai',
            subjectPreview: 'Temos eilutės (peržiūra)',
            cmsEditor: 'CMS šablonų redaktorius',
            loadDefaults: 'Įkelti numatytuosius',
            saveToCms: 'Išsaugoti į CMS',
            saving: 'Išsaugoma…',
            cmsDescription:
              'Pakeitimai saugomi Sanity ir naudojami produkcinėms žinutėms. Reikia admin sesijos ir SANITY write token.',
            subjectLt: 'Tema (LT)',
            subjectEn: 'Tema (EN)',
            subjectLtPlaceholder: 'Pvz.: Užsakymo patvirtinimas #{{orderNumber}}',
            subjectEnPlaceholder: 'Pvz.: Order Confirmation #{{orderNumber}}',
            htmlLt: 'HTML (LT)',
            htmlEn: 'HTML (EN)',
            htmlLtPlaceholder: '<h1>Ačiū už užsakymą</h1> ...',
            htmlEnPlaceholder: '<h1>Thanks for your order</h1> ...',
            testRecipient: 'Testo gavėjas',
            sending: 'Siunčiama…',
            sendTest: 'Siųsti testinį laišką',
            providerNote:
              'Pastaba: siuntimui reikia el. pašto tiekėjo konfigūracijos (pvz. RESEND_API_KEY).',
            htmlPreviewLt: 'HTML peržiūra (LT)',
            htmlPreviewEn: 'HTML peržiūra (EN)',
            copyHtml: 'Kopijuoti HTML',
            sampleData: 'Pavyzdiniai duomenys',
            selectTemplateTitle: 'Pasirinkite šabloną',
            selectTemplateSubtitle: 'Pasirinkite el. laiško šabloną peržiūrai',
            cmsLoadFail: 'Nepavyko užkrauti CMS šablono.',
            cmsLoadUnexpected: 'Netikėta klaida kraunant CMS šabloną.',
            cmsSaveFail: 'Nepavyko išsaugoti CMS šablono.',
            cmsSaveOk: 'Šablonas išsaugotas į CMS.',
            cmsSaveUnexpected: 'Netikėta klaida saugant CMS šabloną.',
            cmsDefaultsMissing: 'Nerasti numatytieji dvikalbiai šablonai šiam tipui.',
            cmsDefaultsLoaded: 'Įkelti numatytieji dvikalbiai šablonai.',
            htmlCopied: 'HTML nukopijuotas!',
            emailMissing: 'Įveskite gavėjo el. paštą.',
            emailInvalid: 'Gavėjo el. paštas atrodo neteisingas.',
            testSendFail: 'Nepavyko išsiųsti testinio laiško.',
            testSendOk: 'Testinis laiškas sėkmingai įtrauktas į eilę.',
            testSendUnexpected: 'Netikėta klaida siunčiant testinį laišką.',
          }
        : {
            availableTemplates: 'Available Templates',
            subjectPreview: 'Subject Lines (Preview)',
            cmsEditor: 'CMS Template Editor',
            loadDefaults: 'Load Defaults',
            saveToCms: 'Save to CMS',
            saving: 'Saving…',
            cmsDescription:
              'Changes are stored in Sanity and used for production emails. Requires admin session and SANITY write token.',
            subjectLt: 'Subject (LT)',
            subjectEn: 'Subject (EN)',
            subjectLtPlaceholder: 'Example: Užsakymo patvirtinimas #{{orderNumber}}',
            subjectEnPlaceholder: 'Example: Order Confirmation #{{orderNumber}}',
            htmlLt: 'HTML (LT)',
            htmlEn: 'HTML (EN)',
            htmlLtPlaceholder: '<h1>Ačiū už užsakymą</h1> ...',
            htmlEnPlaceholder: '<h1>Thanks for your order</h1> ...',
            testRecipient: 'Test Recipient',
            sending: 'Sending…',
            sendTest: 'Send Test Email',
            providerNote: 'Note: sending requires email provider config (e.g. RESEND_API_KEY).',
            htmlPreviewLt: 'HTML Preview (LT)',
            htmlPreviewEn: 'HTML Preview (EN)',
            copyHtml: 'Copy HTML',
            sampleData: 'Sample Data',
            selectTemplateTitle: 'Select a Template',
            selectTemplateSubtitle: 'Choose an email template from the list to preview',
            cmsLoadFail: 'Failed to load CMS template.',
            cmsLoadUnexpected: 'Unexpected error loading CMS template.',
            cmsSaveFail: 'Failed to save CMS template.',
            cmsSaveOk: 'Template saved to CMS.',
            cmsSaveUnexpected: 'Unexpected error saving CMS template.',
            cmsDefaultsMissing: 'No bilingual defaults found for this template.',
            cmsDefaultsLoaded: 'Loaded default bilingual template.',
            htmlCopied: 'HTML copied to clipboard!',
            emailMissing: 'Please enter a recipient email address.',
            emailInvalid: 'Recipient email address looks invalid.',
            testSendFail: 'Failed to send test email.',
            testSendOk: 'Test email queued successfully.',
            testSendUnexpected: 'Unexpected error sending test email.',
          },
    [isLt]
  );

  const categoryLabels = useMemo(
    () =>
      isLt
        ? {
            transactional: 'Transakciniai',
            marketing: 'Marketingo',
            'customer-service': 'Klientų aptarnavimo',
          }
        : {
            transactional: 'Transactional',
            marketing: 'Marketing',
            'customer-service': 'Customer Service',
          },
    [isLt]
  );

  const templateTranslations = useMemo(() => {
    if (!isLt) return null;
    return {
      'order-confirmation': {
        name: 'Užsakymo patvirtinimas',
        description: 'Siunčiama po sėkmingo apmokėjimo',
      },
      'shipping-notification': {
        name: 'Siuntos išsiuntimo pranešimas',
        description: 'Siunčiama, kai užsakymas išsiunčiamas',
      },
      'abandoned-cart': {
        name: 'Apleistas krepšelis',
        description: 'Priminti apie nebaigtą pirkimą',
      },
      'back-in-stock': {
        name: 'Vėl sandėlyje',
        description: 'Siunčiama, kai prekė vėl pasiekiama',
      },
      newsletter: {
        name: 'Naujienlaiškis',
        description: 'Periodiniai naujienlaiškiai',
      },
      'password-reset': {
        name: 'Slaptažodžio atstatymas',
        description: 'Slaptažodžio atkūrimo nuoroda',
      },
      'review-request': {
        name: 'Atsiliepimo prašymas',
        description: 'Prašymas įvertinti po pristatymo',
      },
      'delivery-confirmation': {
        name: 'Pristatymo patvirtinimas',
        description: 'Siunčiama, kai užsakymas pristatytas',
      },
      welcome: {
        name: 'Sveikinimo laiškas',
        description: 'Pirmas laiškas po registracijos',
      },
      'refund-confirmation': {
        name: 'Pinigų grąžinimo patvirtinimas',
        description: 'Siunčiama, kai grąžinimas įvykdytas',
      },
    } as Record<string, { name: string; description: string }>;
  }, [isLt]);

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
          setCmsStatus({ ok: false, message: data?.error || labels.cmsLoadFail });
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
        setCmsStatus({ ok: false, message: e?.message || labels.cmsLoadUnexpected });
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
  }, [labels, selectedTemplate]);

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
        setCmsStatus({ ok: false, message: data?.error || labels.cmsSaveFail });
        return;
      }

      setCmsStatus({ ok: true, message: labels.cmsSaveOk });
    } catch (e: any) {
      setCmsStatus({ ok: false, message: e?.message || labels.cmsSaveUnexpected });
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleLoadDefaults = () => {
    if (!selectedTemplate) return;
    const defaults = getBilingualEmailTemplate(selectedTemplate.id);
    if (!defaults) {
      setCmsStatus({ ok: false, message: labels.cmsDefaultsMissing });
      return;
    }

    setCmsFields({
      subjectLt: defaults.subject.lt,
      subjectEn: defaults.subject.en,
      htmlLt: defaults.html.lt,
      htmlEn: defaults.html.en,
    });
    setCmsStatus({ ok: true, message: labels.cmsDefaultsLoaded });
  };

  const handleCopyHTML = () => {
    if (!selectedTemplate) return;
    const html = selectedTemplate.html(previewVars);
    navigator.clipboard.writeText(html);
    alert(labels.htmlCopied);
  };

  const handleSendTest = async () => {
    if (!selectedTemplate) return;

    const to = testEmailTo.trim();
    if (!to) {
      setSendStatus({ ok: false, message: labels.emailMissing });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      setSendStatus({ ok: false, message: labels.emailInvalid });
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
        setSendStatus({ ok: false, message: data?.error || labels.testSendFail });
        return;
      }

      setSendStatus({ ok: true, message: labels.testSendOk });
    } catch (e: any) {
      setSendStatus({ ok: false, message: e?.message || labels.testSendUnexpected });
    } finally {
      setIsSendingTest(false);
    }
  };

  const categories = [
    { id: 'transactional' as const, name: categoryLabels.transactional, color: 'bg-blue-100 text-blue-800' },
    { id: 'marketing' as const, name: categoryLabels.marketing, color: 'bg-green-100 text-green-800' },
    { id: 'customer-service' as const, name: categoryLabels['customer-service'], color: 'bg-purple-100 text-purple-800' },
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
                    {labels.availableTemplates} ({EMAIL_TEMPLATES.length})
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
                        {templates.map((template: EmailTemplate) => {
                          const translation = templateTranslations?.[template.id];
                          const displayName = translation?.name || template.name;
                          const displayDescription = translation?.description || template.description;
                          return (
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
                              {displayName}
                            </div>
                            <div
                              className={`font-['Outfit'] text-[12px] ${
                                selectedTemplate?.id === template.id ? 'text-[#E1E1E1]' : 'text-[#535353]'
                              }`}
                            >
                              {displayDescription}
                            </div>
                          </button>
                          );
                        })}
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
                          {templateTranslations?.[selectedTemplate.id]?.name || selectedTemplate.name}
                        </h2>
                        <p className="font-['Outfit'] text-[#E1E1E1] text-[14px]">
                          {templateTranslations?.[selectedTemplate.id]?.description || selectedTemplate.description}
                        </p>
                      </div>
                      <div className={`px-[12px] py-[4px] rounded-[100px] text-[11px] font-['Outfit'] uppercase tracking-[0.55px] border ${
                        selectedTemplate.category === 'transactional' ? 'bg-[#EAEAEA] text-blue-700 border-blue-200' :
                        selectedTemplate.category === 'marketing' ? 'bg-[#EAEAEA] text-green-700 border-green-200' :
                        'bg-[#EAEAEA] text-purple-700 border-purple-200'
                      }`}>
                        {categoryLabels[selectedTemplate.category]}
                      </div>
                    </div>
                    <div className="bg-[#535353] rounded-[12px] p-[16px]">
                      <div className="font-['Outfit'] text-[#BBBBBB] text-[11px] uppercase tracking-[0.55px] mb-[8px]">
                        {labels.subjectPreview}
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
                          <AdminLabel>{labels.cmsEditor}</AdminLabel>
                          <div className="flex gap-[8px] flex-wrap">
                            <AdminButton variant="secondary" size="sm" onClick={handleLoadDefaults}>
                              {labels.loadDefaults}
                            </AdminButton>
                            <AdminButton onClick={handleSaveCms} size="sm" disabled={isSavingCms || isLoadingCms}>
                              {isSavingCms ? labels.saving : labels.saveToCms}
                            </AdminButton>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#535353] font-['Outfit']">
                          {labels.cmsDescription}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px] mt-[16px]">
                        <div className="space-y-[12px]">
                          <AdminLabel>{labels.subjectLt}</AdminLabel>
                          <AdminInput
                            value={cmsFields.subjectLt}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, subjectLt: e.target.value }))}
                            placeholder={labels.subjectLtPlaceholder}
                          />
                        </div>
                        <div className="space-y-[12px]">
                          <AdminLabel>{labels.subjectEn}</AdminLabel>
                          <AdminInput
                            value={cmsFields.subjectEn}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, subjectEn: e.target.value }))}
                            placeholder={labels.subjectEnPlaceholder}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px] mt-[16px]">
                        <div className="space-y-[12px]">
                          <AdminLabel>{labels.htmlLt}</AdminLabel>
                          <AdminTextarea
                            value={cmsFields.htmlLt}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, htmlLt: e.target.value }))}
                            placeholder={labels.htmlLtPlaceholder}
                            rows={10}
                          />
                        </div>
                        <div className="space-y-[12px]">
                          <AdminLabel>{labels.htmlEn}</AdminLabel>
                          <AdminTextarea
                            value={cmsFields.htmlEn}
                            onChange={(e) => setCmsFields((prev) => ({ ...prev, htmlEn: e.target.value }))}
                            placeholder={labels.htmlEnPlaceholder}
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
                      <AdminLabel className="mb-[8px]">{labels.testRecipient}</AdminLabel>
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
                          {isSendingTest ? labels.sending : labels.sendTest}
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
                              {labels.providerNote}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-[24px]">
                      <AdminLabel className="mb-[12px]">{labels.htmlPreviewLt}</AdminLabel>
                      <div className="border-2 border-[#E1E1E1] rounded-[12px] overflow-hidden mb-[16px]">
                        <iframe
                          srcDoc={renderedLt?.html || selectedTemplate.html(previewVars)}
                          className="w-full h-[420px] bg-[#EAEAEA]"
                          title="Email Preview LT"
                        />
                      </div>
                      <AdminLabel className="mb-[12px]">{labels.htmlPreviewEn}</AdminLabel>
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
                        {labels.copyHtml}
                      </AdminButton>
                    </div>

                    {/* Template Variables */}
                    <div className="mt-[24px] p-[20px] bg-[#EAEAEA] rounded-[16px] border border-[#E1E1E1]">
                      <h4 className="font-['Outfit'] text-[11px] font-medium text-[#535353] uppercase tracking-[0.55px] mb-[12px]">
                        {labels.sampleData}
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
                    {labels.selectTemplateTitle}
                  </h3>
                  <p className="font-['Outfit'] text-[14px] text-[#535353]">{labels.selectTemplateSubtitle}</p>
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
                        • {templateTranslations?.[template.id]?.name || template.name}
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
