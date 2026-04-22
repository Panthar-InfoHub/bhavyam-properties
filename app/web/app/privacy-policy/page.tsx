import LatestListingsSidebar from '@/components/LatestListingsSidebar';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#fbfcfa] min-h-screen pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Content column */}
        <div className="w-full lg:w-[70%] text-left bg-white p-10 md:p-14 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-12 tracking-tighter uppercase leading-tight">
            Privacy <span className="text-[#00c194]">Policy</span>
          </h1>
          
          <div className="prose prose-lg text-gray-600 max-w-none space-y-12">
            
            <section className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
              <p className="font-medium text-[15px] leading-relaxed">
                We, at Bhavyam Properties and our affiliated entities, are committed to respecting your online privacy and recognize your need for appropriate protection and management of any personally identifiable information you share with us.
                <br /><br />
                This Privacy Policy (“Policy”) governs our website and mobile application (collectively, the “Platform”). The Policy describes how Bhavyam Properties (hereinafter referred to as the “Company”) collects, uses, discloses and transfers personal data of users while browsing the Platform or availing specific services therein (the “Services”).
                <br /><br />
                This Policy describes how we process personal data of all users of our Platform or Services, including buyers, renters, owners, dealers, brokers, and visitors. “Personal Data” means any data about an individual who is identifiable by or in relation to such data.
                <br /><br />
                By providing your consent to this Policy, or accessing the Platform and Services, you consent to the Company’s processing of your Personal Data in accordance with this Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">01</span>
                Personal Data We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#112743] mb-3">A. Information You Provide</h3>
                  <p className="font-medium text-[15px] leading-relaxed mb-2">We collect information directly when you:</p>
                  <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed mb-4">
                    <li>Register or create an account</li>
                    <li>Post property listings</li>
                    <li>Contact us via calls, emails, or forms</li>
                  </ul>
                  <p className="font-medium text-[15px] leading-relaxed mb-2">This includes:</p>
                  <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed">
                    <li><strong>Personal Details:</strong> Name, email, phone number, address, login credentials</li>
                    <li><strong>Property Details:</strong> Property type, location, dimensions, pricing, images</li>
                    <li><strong>Identification Documents:</strong> Aadhaar, PAN, property papers, etc.</li>
                    <li><strong>Payment Information:</strong> Processed via third-party gateways (we do not store card/bank details)</li>
                    <li><strong>Communication Data:</strong> Emails, chats, feedback, support queries</li>
                    <li><strong>Voice Data:</strong> For property video voiceovers (if provided)</li>
                    <li>Any other information shared with consent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#112743] mb-3">B. Information Collected Automatically</h3>
                  <p className="font-medium text-[15px] leading-relaxed mb-2">When using the Platform:</p>
                  <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed">
                    <li><strong>Usage Data:</strong> Searches, activity, preferences</li>
                    <li><strong>Technical Data:</strong> Device, IP address, browser, OS</li>
                    <li><strong>Location Data:</strong> Approximate location (city/region)</li>
                    <li><strong>Cookies Data:</strong> For user experience and tracking</li>
                    <li><strong>Transaction Data:</strong> Purchase and service usage details</li>
                    <li><strong>App Permissions:</strong> Camera, location, notifications (user-controlled)</li>
                    <li><strong>Insight Data:</strong> Derived user behavior and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#112743] mb-3">C. Information from Third Parties</h3>
                  <p className="font-medium text-[15px] leading-relaxed mb-2">We may receive data from:</p>
                  <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed">
                    <li>Marketing partners</li>
                    <li>Campaigns or public sources</li>
                    <li>Third-party login providers (Google, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">02</span>
                How We Use Your Personal Data
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">A. To Provide Services</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Account creation and management</li>
                    <li>Property listing and promotion</li>
                    <li>Connecting buyers, sellers, agents</li>
                    <li>Providing recommendations and search results</li>
                    <li>Enabling communication between users</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">B. Marketing Activities</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Sending offers, updates, and promotions</li>
                    <li>Informing about services and features</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">C. Third-Party Marketing</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Sharing your data with banks, NBFCs, and partners (based on your interest)</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">D. Platform Improvement</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Enhancing features and usability</li>
                    <li>Personalizing user experience</li>
                    <li>Analyzing user behavior</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">E. Fraud Prevention</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Detecting suspicious activities</li>
                    <li>Verifying users and listings</li>
                    <li>Ensuring platform security</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">F. Troubleshooting</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Fixing technical issues</li>
                    <li>Maintaining backups and system recovery</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">G. Analytics & H. Legal Compliance</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Creating user insights</li>
                    <li>Improving service delivery</li>
                    <li>Meeting legal obligations</li>
                    <li>Defending legal claims</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-[#112743] mb-3">I. Communication & J. Grievance</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Responding to queries and feedback</li>
                    <li>Providing support and updates</li>
                    <li>Resolving complaints and disputes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">03</span>
                Cookies
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Cookies help improve user experience and track activity</li>
                <li>Users can control cookies via browser settings</li>
                <li>Blocking cookies may affect functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#00c194] text-white rounded-lg flex items-center justify-center text-sm">04</span>
                Sharing of Personal Data
              </h2>
              <p className="font-medium text-[15px] leading-relaxed mb-3">We may share data with:</p>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li><strong>Service Providers:</strong> Vendors, agents, verification partners</li>
                <li><strong>Other Users:</strong> Buyers, sellers, brokers</li>
                <li><strong>Banking Partners:</strong> For loan-related services</li>
                <li><strong>Legal Authorities:</strong> When required by law</li>
                <li><strong>Business Transfers:</strong> During mergers or restructuring</li>
                <li><strong>Professional Advisors:</strong> Lawyers, auditors, etc.</li>
              </ul>
              <p className="font-medium text-[15px] leading-relaxed mt-4 italic">Bhavyam Properties is not responsible for third-party privacy practices.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#112743] text-white rounded-lg flex items-center justify-center text-sm">05</span>
                User Rights
              </h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Access, update, or delete personal data</li>
                <li>Withdraw consent (may limit services)</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="font-medium text-[15px] leading-relaxed mt-4">📧 Contact: info@bhavyamproperties.in</p>
            </section>

            <section className="border-t border-gray-100 pt-12">
              <h2 className="text-2xl font-black text-[#112743] mb-6">06. Data Protection</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Data stored securely in India</li>
                <li>Industry-standard security measures used</li>
                <li>Protection against unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">07. Data Retention</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Data retained as long as necessary</li>
                <li>May be retained for legal compliance</li>
                <li>Anonymized data may be used indefinitely</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">08. Third-Party Services</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Platform may link to third-party websites</li>
                <li>Their privacy policies apply separately</li>
                <li>Bhavyam Properties holds no responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">09. Children</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Platform not intended for users under 18</li>
                <li>No intentional data collection from minors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-[#112743] mb-6">10. Policy Updates</h2>
              <ul className="list-disc pl-5 font-medium text-[15px] leading-relaxed space-y-2">
                <li>Bhavyam Properties may update this Policy anytime</li>
                <li>Continued use implies acceptance</li>
              </ul>
            </section>

            <section className="bg-teal-50/50 p-8 rounded-2xl border border-teal-100">
              <h2 className="text-2xl font-black text-[#00c194] mb-6">11. Grievance Redressal</h2>
              <p className="font-medium text-[15px] leading-relaxed text-teal-800">
                For any privacy concerns, contact: <br /><br />
                <strong>Bhavyam Properties</strong><br />
                📧 Email: info@bhavyamproperties.in<br />
                📞 Contact: +91 9795782331
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
