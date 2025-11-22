import React from 'react';

export default function About() {
  return (
    <section id="about" className="py-20 px-10 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-['DM_Sans'] text-5xl font-bold text-center mb-8">About Yakiwood</h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h3 className="font-['DM_Sans'] text-2xl font-semibold mb-4">Our Story</h3>
            <p className="text-gray-700 mb-4">
              Yakiwood brings the ancient Japanese art of Shou Sugi Ban to modern architecture. 
              This traditional technique of charring wood creates a stunning, durable finish that 
              naturally resists fire, insects, and decay.
            </p>
            <p className="text-gray-700">
              We combine centuries-old craftsmanship with contemporary design to deliver 
              sustainable, beautiful wood products for residential and commercial projects.
            </p>
          </div>
          <div className="w-full h-80 bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Workshop Image</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">25+</div>
            <p className="text-gray-600">Years Lifespan</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
            <p className="text-gray-600">Natural & Eco-friendly</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
            <p className="text-gray-600">Projects Completed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
