'use client';

/**
 * Local Sanity Studio is disabled due to jsdom dependency conflict with Next.js 16 + Turbopack.
 * 
 * Please use the cloud Sanity Studio instead:
 * https://shop.yakiwood.co.uk
 * 
 * Or upgrade Node.js to >=20.19 or >=22.12 and redeploy schema with:
 * npx sanity@latest schema deploy
 */

export default function StudioRedirect() {
  if (typeof window !== 'undefined') {
    window.location.href = 'https://shop.yakiwood.co.uk';
  }
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sanity Studio</h1>
      <p>Local Studio is temporarily disabled due to compatibility issues.</p>
      <p>
        Please use the cloud version:{' '}
        <a href="https://shop.yakiwood.co.uk" style={{ color: '#0066cc' }}>
          shop.yakiwood.co.uk
        </a>
      </p>
      <p style={{ marginTop: '2rem', fontSize: '0.9em', color: '#666' }}>
        Redirecting automatically...
      </p>
    </div>
  );
}

