import Contact from '@/components/Contact';

export const metadata = { 
  title: 'Contact',
  description: 'Need assistance? Leave your contact details, and our manager will reach out for a consultation.'
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Contact />
    </main>
  );
}
