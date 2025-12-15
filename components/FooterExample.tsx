import NewsletterSignup from './NewsletterSignup';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-['DM_Sans'] font-medium mb-4">Yakiwood</h3>
          <p className="text-sm font-['DM_Sans'] text-[#BBBBBB] mb-4">
            Kokybiškas deginto medžio (Shou Sugi Ban) produktai jūsų namams ir projektams.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-['DM_Sans'] font-medium mb-4">Nuorodos</h4>
          <ul className="space-y-2 text-sm font-['DM_Sans']">
            <li>
              <Link href="/produktai" className="text-[#BBBBBB] hover:text-white transition-colors">
                Produktai
              </Link>
            </li>
            <li>
              <Link href="/sprendimai" className="text-[#BBBBBB] hover:text-white transition-colors">
                Sprendimai
              </Link>
            </li>
            <li>
              <Link href="/projektai" className="text-[#BBBBBB] hover:text-white transition-colors">
                Projektai
              </Link>
            </li>
            <li>
              <Link href="/apie" className="text-[#BBBBBB] hover:text-white transition-colors">
                Apie mus
              </Link>
            </li>
            <li>
              <Link href="/kontaktai" className="text-[#BBBBBB] hover:text-white transition-colors">
                Kontaktai
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-['DM_Sans'] font-medium mb-4">Informacija</h4>
          <ul className="space-y-2 text-sm font-['DM_Sans']">
            <li>
              <Link href="/policies" className="text-[#BBBBBB] hover:text-white transition-colors">
                Privatumo politika
              </Link>
            </li>
            <li>
              <Link href="/policies" className="text-[#BBBBBB] hover:text-white transition-colors">
                Naudojimo sąlygos
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="text-[#BBBBBB] hover:text-white transition-colors">
                Slapukų politika
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-[#BBBBBB] hover:text-white transition-colors">
                DUK
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <NewsletterSignup 
            variant="footer" 
            showTitle={true}
            className="newsletter-footer"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#535353] text-center">
        <p className="text-sm font-['DM_Sans'] text-[#BBBBBB]">
          © {new Date().getFullYear()} Yakiwood. Visos teisės saugomos.
        </p>
      </div>
    </footer>
  );
}
