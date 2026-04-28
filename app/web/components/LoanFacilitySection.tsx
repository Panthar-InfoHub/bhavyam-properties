'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

export default function LoanFacilitySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

  // Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Form State
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const companies = [
    { id: 'sbi', name: 'SBI Home Loans', logo: '🏦', rate: '8.40%' },
    { id: 'hdfc', name: 'HDFC Bank', logo: '💳', rate: '8.50%' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏢', rate: '8.65%' },
    { id: 'bajaj', name: 'Bajaj Housing', logo: '🏠', rate: '8.45%' },
  ];

  // Calculate EMI
  // P x R x (1+R)^N / [(1+R)^N-1]
  const calculateEMI = () => {
    const P = loanAmount;
    const R = interestRate / 12 / 100;
    const N = tenureYears * 12;
    if (P === 0 || R === 0 || N === 0) return 0;
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    return Math.round(emi);
  };

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompany(companyId);
    setFormStatus('idle');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please fill required fields');
      return;
    }
    
    try {
      const { error } = await supabase.from('loan_inquiries').insert([{
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company_id: selectedCompany,
        loan_amount: loanAmount
      }]);

      if (error) {
        console.error('Error submitting loan inquiry:', error);
        toast.error('Failed to submit request. Please try again.');
        return;
      }

      setFormStatus('success');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedCompany(null);
      setFormStatus('idle');
      setFormData({ name: '', phone: '', email: '' });
    }, 300);
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-[var(--color-emerald-heritage)] to-[#00579e]">
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl">
        <div className="text-white text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold tracking-widest uppercase mb-4 shadow-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse"></span>
            Financial Assistance
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
            Need a Home Loan?
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-medium max-w-xl">
            Get hassle-free loan facilities through our partnered top banks and NBFCs. Check your EMI and apply instantly!
          </p>
        </div>
        
        <div className="shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-black tracking-widest text-white uppercase transition-all duration-300 ease-in-out bg-[#022039] rounded-full hover:bg-white hover:text-[#022039] shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.3)] overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              Explore Loan Options
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md border border-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              {/* Left Side - Calculator (Hidden when form is active to save space on mobile, but let's keep it visible on desktop) */}
              <div className={`w-full md:w-2/5 bg-gray-50 p-6 md:p-8 border-r border-gray-100 flex flex-col ${selectedCompany ? 'hidden md:flex' : 'flex'}`}>
                <h3 className="text-xl font-black text-[#022039] mb-6 flex items-center gap-2">
                  <span>📊</span> EMI Calculator
                </h3>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <label className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                      <span>Loan Amount</span>
                      <span className="text-[var(--color-emerald-heritage)]">₹ {loanAmount.toLocaleString('en-IN')}</span>
                    </label>
                    <input 
                      type="range" 
                      min="100000" 
                      max="50000000" 
                      step="100000"
                      value={loanAmount} 
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-emerald-heritage)]"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                      <span>Interest Rate</span>
                      <span className="text-[var(--color-emerald-heritage)]">{interestRate}% p.a.</span>
                    </label>
                    <input 
                      type="range" 
                      min="6" 
                      max="15" 
                      step="0.1"
                      value={interestRate} 
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-emerald-heritage)]"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                      <span>Loan Tenure</span>
                      <span className="text-[var(--color-emerald-heritage)]">{tenureYears} Years</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      step="1"
                      value={tenureYears} 
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-emerald-heritage)]"
                    />
                  </div>
                </div>

                <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Estimated EMI</div>
                  <div className="text-3xl font-black text-[#022039]">₹ {calculateEMI().toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-400 mt-1 font-medium">per month</div>
                </div>
              </div>

              {/* Right Side - Dynamic Content (Companies or Form) */}
              <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
                
                {!selectedCompany ? (
                  <>
                    <h3 className="text-2xl font-black text-[#022039] mb-2">Available Loan Partners</h3>
                    <p className="text-gray-500 font-medium mb-8">Select a bank/NBFC to proceed with your application.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {companies.map(company => (
                        <button
                          key={company.id}
                          onClick={() => handleCompanyClick(company.id)}
                          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-[var(--color-emerald-heritage)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                        >
                          <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{company.logo}</div>
                          <h4 className="font-bold text-gray-800 text-lg mb-1">{company.name}</h4>
                          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-[#e7f2db] group-hover:text-[var(--color-emerald-heritage)] transition-colors">
                            From {company.rate}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
                    <button 
                      onClick={() => setSelectedCompany(null)}
                      className="self-start mb-6 text-sm font-bold text-gray-500 hover:text-[var(--color-emerald-heritage)] flex items-center gap-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      Back to Partners
                    </button>

                    {formStatus === 'success' ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-green-50/50 rounded-3xl border border-green-100">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-lg shadow-green-500/30 animate-bounce">
                          ✓
                        </div>
                        <h3 className="text-2xl font-black text-green-800 mb-2">Request Submitted!</h3>
                        <p className="text-green-700 font-medium text-lg max-w-xs mx-auto">
                          Thanks for contact with us, our customer executive will call you shortly.
                        </p>
                        <button 
                          onClick={closeModal}
                          className="mt-8 px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-8 flex items-center gap-4">
                          <div className="text-4xl bg-gray-50 w-16 h-16 flex items-center justify-center rounded-2xl border border-gray-100">
                            {companies.find(c => c.id === selectedCompany)?.logo}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-[#022039]">
                              Apply for {companies.find(c => c.id === selectedCompany)?.name}
                            </h3>
                            <p className="text-[var(--color-emerald-heritage)] font-bold text-sm">
                              Interest rates starting from {companies.find(c => c.id === selectedCompany)?.rate}
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 flex-1">
                          <div>
                            <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-2">Full Name *</label>
                            <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-emerald-heritage)] focus:border-transparent outline-none font-medium text-gray-800 transition-all"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-2">Phone Number *</label>
                            <input 
                              type="tel" 
                              required
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-emerald-heritage)] focus:border-transparent outline-none font-medium text-gray-800 transition-all"
                              placeholder="+91 98765 43210"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-2">Email Address</label>
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-emerald-heritage)] focus:border-transparent outline-none font-medium text-gray-800 transition-all"
                              placeholder="john@example.com"
                            />
                          </div>
                          
                          <div className="mt-auto pt-4">
                            <button 
                              type="submit"
                              className="w-full py-4 bg-[var(--color-emerald-heritage)] text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#009475] hover:shadow-[0_8px_25px_rgba(0,180,143,0.3)] transition-all active:scale-[0.98]"
                            >
                              Submit Request
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
                              By submitting, you agree to our terms and conditions.
                            </p>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
