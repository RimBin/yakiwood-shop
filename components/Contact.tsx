import React from 'react';

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-['DM_Sans'] text-5xl font-bold text-center mb-4">Get in Touch</h2>
        <p className="text-center text-gray-600 mb-12">
          Ready to start your project? Contact us for a consultation.
        </p>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-['DM_Sans'] text-xl font-semibold mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-900">info@yakiwood.com</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="text-gray-900">+370 600 12345</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-gray-900">Vilnius, Lithuania</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Working Hours</p>
                <p className="text-gray-900">Mon - Fri: 9:00 - 18:00</p>
              </div>
            </div>
          </div>
          
          <div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Tell us about your project..."
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white rounded-full py-3 px-6 hover:bg-gray-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
