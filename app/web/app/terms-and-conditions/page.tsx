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
              <p className="font-medium text-[15px] leading-relaxed">
                This website, including any subdomains, mobile applications, and other digital platforms (hereinafter collectively referred to as “Bhavyam Properties”), is owned, hosted, and operated by Bhavyam Properties. These Terms & Conditions, along with the Privacy Policy and applicable guidelines, constitute a legally binding agreement between Bhavyam Properties and the User. By accessing or using the platform, you agree to comply with these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">01</span>
                Definitions
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>The term User/Subscriber includes any individual or legal entity who has subscribed to the services (paid or free) and is provided access through login credentials.</li>
                <li>The term Visitor/Browser refers to any person accessing the platform without registration.</li>
                <li>The term Advertiser includes users posting listings or advertisements.</li>
                <li>The term Services refers to the online information, listings, search tools, and advertising facilities provided by Bhavyam Properties.</li>
                <li>Bhavyam Properties acts only as a medium of information exchange and does not act as an agent of any user.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">02</span>
                Platform Nature
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties is an online real estate information and communication platform.</li>
                <li>It does not guarantee the accuracy, completeness, or legality of listings.</li>
                <li>It does not act as an owner, broker, or agent unless explicitly stated.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">03</span>
                Amendments & Availability
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties may modify these terms at any time without prior notice.</li>
                <li>Continued usage implies acceptance of updated terms.</li>
                <li>Platform services may be suspended for maintenance, upgrades, or other reasons.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">04</span>
                User Obligations
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Users must provide accurate and lawful information.</li>
                <li>Users must not misuse the platform or violate applicable laws.</li>
                <li>Bhavyam Properties reserves the right to terminate access in case of misuse.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">05</span>
                Submission of Listings / Advertisements
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Users must have legal rights and authorization to post property details, images, or content.</li>
                <li>Bhavyam Properties does not independently verify listings or advertisements.</li>
                <li>Content provided is for informational purposes only and does not constitute advice or recommendation.</li>
                <li>Users grant Bhavyam Properties the right to use submitted content for promotion, marketing, and display purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">06</span>
                RERA Compliance
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Users must comply with all provisions of the Real Estate (Regulation and Development) Act, 2016 (RERA).</li>
                <li>Users must disclose: Project registration details, Ownership and title status, Encumbrances and approvals.</li>
                <li>Bhavyam Properties may remove listings that do not comply.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">07</span>
                Verification Disclaimer
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Any “Verified” tag only indicates basic existence verification.</li>
                <li>It does NOT confirm ownership, documentation, or pricing accuracy.</li>
                <li>Users must independently verify all details before transactions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">08</span>
                Content Moderation
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties may use automated tools and human review to monitor content.</li>
                <li>Content may be approved, rejected, or removed based on internal policies.</li>
                <li>Users may raise grievances for review of moderation decisions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">09</span>
                Payments & Terms
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Payments for services are 100% advance and non-refundable.</li>
                <li>Refunds, if any, are at the sole discretion of Bhavyam Properties.</li>
                <li>Bhavyam Properties does not guarantee: Service uptime, Lead generation, Transaction success.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">10</span>
                Refund in Failed Transactions
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Refund timelines depend on banking systems and third-party payment gateways.</li>
                <li>Bhavyam Properties is not responsible for delays in refund processing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">11</span>
                Activation & Subscription
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Services must be activated within defined timelines.</li>
                <li>Unused services cannot be extended beyond validity.</li>
                <li>Exceptions are at the sole discretion of Bhavyam Properties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">12</span>
                Lead Generation Services
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Leads represent user inquiries only.</li>
                <li>Bhavyam Properties does not guarantee: Accuracy of leads, Conversion into transactions.</li>
                <li>Duplicate leads within a defined time frame may not be charged.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">13</span>
                Use of Information
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>All content and data on the platform are proprietary to Bhavyam Properties.</li>
                <li>Users shall not reproduce, distribute, or use content for commercial purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">14</span>
                Intellectual Property Rights
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>All trademarks, logos, and branding belong to Bhavyam Properties.</li>
                <li>Unauthorized use is strictly prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">15</span>
                Prohibited Activities
              </h2>
              <p className="mb-2 font-medium text-[15px] leading-relaxed">Users must not:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-gray-500">
                {['Copy, scrape, or extract data', 'Use bots or automated tools', 'Attempt unauthorized access', 'Post illegal, harmful, or misleading content', 'Misrepresent identity or engage in fraudulent activities'].map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-gray-100 pt-12">
              <h2 className="text-2xl font-black text-[#112743] mb-6">16. Third-Party Links</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties may provide links to third-party websites.</li>
                <li>It does not control or endorse such websites and is not responsible for their content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">17. Disclaimer</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Services are provided on an “as is” and “as available” basis.</li>
                <li>Bhavyam Properties disclaims all warranties regarding accuracy, reliability, and availability.</li>
                <li>Users are responsible for evaluating all information independently.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">18. Limitation of Liability</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties shall not be liable for: Errors or omissions, Financial losses, Technical failures.</li>
                <li>Liability is limited to the amount paid by the user (if any).</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">19. Termination</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties may terminate or restrict access at any time without notice for violation of terms.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">20. Indemnification</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Users agree to indemnify Bhavyam Properties against any claims, damages, or losses arising from misuse of the platform.</li>
              </ul>
            </section>
            
            <section className="bg-teal-50/50 p-8 rounded-2xl border border-teal-100">
              <h2 className="text-2xl font-black text-[#00c194] mb-6">21. Privacy</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed text-teal-800 space-y-2">
                <li>User data will be handled as per the Privacy Policy.</li>
                <li>Users consent to sharing of information with relevant stakeholders.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">22. Arbitration</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Disputes shall be resolved through arbitration by a neutral arbitrator.</li>
                <li>Decision shall be final and binding.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">23. Governing Law & Jurisdiction</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>These terms are governed by the laws of India.</li>
                <li>Courts of Jhansi, UP shall have exclusive jurisdiction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">24. Severability & Waiver</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Invalid provisions shall not affect remaining terms.</li>
                <li>Failure to enforce any clause does not waive rights.</li>
              </ul>
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
