'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [clientInfo, setClientInfo] = useState<any>({});

  useEffect(() => {
    setClientInfo({
      userAgent: navigator.userAgent,
      width: window.innerWidth,
      height: window.innerHeight,
      loaded: true,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          🎯 Diagnostikos puslapis
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <p className="text-lg font-semibold text-green-800">
              ✅ React veikia!
            </p>
            <p className="text-sm text-green-600 mt-2">
              Jei matai šį žalią bloką, viskas gerai.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-bold mb-2">Naršyklės informacija:</h2>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-auto">
              {JSON.stringify(clientInfo, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h2 className="font-bold mb-2">Portas:</h2>
            <p className="text-lg">
              {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
            </p>
          </div>

          <Link
            href="/"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded text-center transition-colors"
          >
            Grįžti į pagrindinį puslapį →
          </Link>
        </div>
      </div>
    </div>
  );
}
