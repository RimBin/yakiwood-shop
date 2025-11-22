import React from 'react';

export default function Projects() {
  const projects = [
    { id: 1, title: 'Modern Villa Facade', location: 'Vilnius, Lithuania', year: '2024' },
    { id: 2, title: 'Boutique Hotel Interior', location: 'Kaunas, Lithuania', year: '2024' },
    { id: 3, title: 'Residential Terrace', location: 'Klaipėda, Lithuania', year: '2023' },
    { id: 4, title: 'Office Building Cladding', location: 'Vilnius, Lithuania', year: '2023' },
    { id: 5, title: 'Garden House', location: 'Palanga, Lithuania', year: '2023' },
    { id: 6, title: 'Restaurant Interior', location: 'Vilnius, Lithuania', year: '2022' },
  ];

  return (
    <section id="projects" className="py-20 px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['DM_Sans'] text-5xl font-bold text-center mb-4">Featured Projects</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          See how our Shou Sugi Ban products transform spaces
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="group cursor-pointer">
              <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gray-300 group-hover:bg-gray-400 transition-colors flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Project Image</span>
                </div>
              </div>
              <h3 className="font-['DM_Sans'] text-xl font-semibold mb-1">{project.title}</h3>
              <p className="text-sm text-gray-600">{project.location}</p>
              <p className="text-sm text-gray-500">{project.year}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
