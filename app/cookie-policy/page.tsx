export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover Section */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pt-[32px] pb-[40px] sm:pt-[32px] sm:pb-[64px]">
        <h1 className="font-['DM_Sans'] font-light text-[56px] sm:text-[128px] leading-[0.95] tracking-[-2.24px] sm:tracking-[-5.12px] text-[#161616]">
          Cookie Policy
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
        <div className="grid grid-cols-1 sm:grid-cols-[344px_1fr] gap-[24px] sm:gap-[40px]">
          {/* What are cookies */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              What are cookies
            </h2>
          </div>
          <div className="sm:col-start-2">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
              Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences and provide you with a better browsing experience. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted or expired).
            </p>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB] my-[16px]" />

          {/* How we use cookies */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              How we use cookies
            </h2>
          </div>
          <div className="sm:col-start-2 space-y-[16px]">
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Essential Cookies
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                These cookies are necessary for the website to function properly. They enable basic features like page navigation and access to secure areas.
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Analytics Cookies
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Marketing Cookies
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                These cookies track your online activity to help us deliver more relevant advertising. They may be set by us or third-party providers.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB] my-[16px]" />

          {/* Managing cookies */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              Managing cookies
            </h2>
          </div>
          <div className="sm:col-start-2">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
              You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience and some features of the website may not function properly. Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
