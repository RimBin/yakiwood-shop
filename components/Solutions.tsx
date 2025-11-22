import React from 'react';

export default function Solutions() {
  const solutions = [
    { 
      title: 'Facades', 
      description: 'Transform building exteriors with durable, fire-resistant charred wood cladding.',
      features: ['Weather resistant', 'Low maintenance', 'Natural aesthetics']
    },
    { 
      title: 'Interior Design', 
      description: 'Create stunning indoor spaces with unique textured wall panels and accents.',
      features: ['Unique patterns', 'Eco-friendly', 'Easy installation']
    },
    { 
      title: 'Outdoor Spaces', 
      description: 'Enhance terraces, decks, and fences with long-lasting charred wood.',
      features: ['UV resistant', 'Anti-fungal', '25+ year lifespan']
    },
    { 
      title: 'Commercial Projects', 
      description: 'Large-scale solutions for hotels, restaurants, and office buildings.',
      features: ['Custom sizing', 'Fast delivery', 'Professional support']
    },
  ];

  return (
    <section id="solutions" className="py-20 px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['DM_Sans'] text-5xl font-bold text-center mb-4">Solutions</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Versatile applications for residential and commercial projects
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, idx) => (
            <div key={idx} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-['DM_Sans'] text-2xl font-semibold mb-3">{solution.title}</h3>
              <p className="text-gray-600 mb-4">{solution.description}</p>
              <ul className="space-y-2">
                {solution.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-gray-900 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
