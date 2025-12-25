export const metadata = {
  title: 'Yakiwood - Under Construction',
  description: 'Our website is currently under construction. Coming soon!',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#161616] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Title */}
        <h1 className="text-5xl md:text-7xl font-['DM_Sans'] font-bold text-white mb-6">
          YAKIWOOD
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-[#E1E1E1] mb-4 font-['Outfit']">
          Shou Sugi Ban Technique
        </p>
        
        {/* Under Construction */}
        <div className="mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4">
            <p className="text-lg md:text-xl text-white font-['DM_Sans'] tracking-wide">
              🚧 UNDER CONSTRUCTION 🚧
            </p>
          </div>
        </div>
        
        {/* Message */}
        <p className="text-base md:text-lg text-[#BBBBBB] mb-12 font-['Outfit'] leading-relaxed">
          Kuriame naują puslapį, kuris pristato unikalią japonišką medienos apdegimo techniką.
          <br />
          Grįšime netrukus su šiuolaikišku dizainu ir išsamia informacija!
        </p>
        
        {/* Contact Info */}
        <div className="space-y-4 text-[#E1E1E1] font-['DM_Sans']">
          <p className="text-sm">
            Klausimams:{' '}
            <a href="mailto:info@yakiwood.co.uk" className="text-white hover:underline transition-all">
              info@yakiwood.co.uk
            </a>
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-12 w-full max-w-md mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#BBBBBB] to-white w-2/3 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-[#BBBBBB] mt-2 font-['Outfit']">Coming Soon...</p>
        </div>
      </div>
    </main>
  );
}
