import LatestListingsSidebar from '@/components/LatestListingsSidebar';

export default function TermsAndConditions() {
  return (
    <div className="bg-[#fbfcfa] min-h-screen pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Content column */}
        <div className="w-full lg:w-[70%] text-left bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 tracking-tighter uppercase leading-tight">
            Terms and <span className="text-[#00c194]">Conditions</span>
          </h1>
          
          <div className="prose prose-lg text-gray-600 max-w-none space-y-12">
            <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">01</span>
                General Terms
              </h2>
              <p className="font-medium text-[15px] leading-relaxed">
                By accessing this Website, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                 <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">02</span>
                 Use License
              </h2>
              <p className="mb-6 font-medium text-[15px] leading-relaxed">
                Permission is granted to temporarily download one copy of the materials on Bhavyam Properties&apos; Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-gray-500">
                {['modify or copy materials', 'commercial usage', 'reverse engineering', 'remove copyright notices', 'mirror materials'].map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-gray-100 pt-12">
              <h2 className="text-2xl font-black text-[#112743] mb-6">3. Disclaimer</h2>
              <p className="font-medium text-[15px] leading-relaxed">
                All the materials on Bhavyam Properties&apos; Website are provided &quot;as is&quot;. We make no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, we do not make any representations concerning the accuracy or reliability of the use of the materials on its Website.
              </p>
            </section>

            <section className="bg-teal-50/50 p-8 rounded-2xl border border-teal-100">
              <h2 className="text-2xl font-black text-[#00c194] mb-6">8. Your Privacy</h2>
              <p className="font-medium text-[15px] leading-relaxed text-teal-800">
                Please read our Privacy Policy. We take data protection seriously and ensure your information is never shared without your explicit consent through our interest-matching system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">9. Governing Law</h2>
              <p className="font-medium text-[15px] leading-relaxed">
                Any claim related to our Website shall be governed by the laws without regards to its conflict of law provisions.
              </p>
            </section>
          </div>
        </div>

        {/* Right Sidebar column */}
        <div className="w-full lg:w-[30%]">
           <LatestListingsSidebar />
        </div>

      </div>
    </div>
  );
}
