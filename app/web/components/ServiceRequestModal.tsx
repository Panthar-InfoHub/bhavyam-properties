'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import toast from 'react-hot-toast';

type ServiceType = 'Commercial Spaces' | 'Rent Property' | 'Sell Property' | 'Legal Assistance' | 'Property Loan';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
  color?: string;
}

export default function ServiceRequestModal({ isOpen, onClose, serviceType, color = 'bg-[var(--color-emerald-heritage)]' }: ServiceRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    businessName: '',
    businessType: '',
    propertyType: '',
    location: '',
    budget: '',
    expectedPrice: '',
    assistanceType: '',
    loanAmount: '',
    employmentStatus: '',
    query: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        name: `${currentUser.profile?.first_name || ''} ${currentUser.profile?.last_name || ''}`.trim() || currentUser.email || '',
        contact: currentUser.profile?.phone_number || currentUser.email || '',
      }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSuccess(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('service_requests').insert([
        {
          service_type: serviceType,
          user_id: user?.id || null,
          user_name: formData.name,
          contact_info: formData.contact,
          business_name: formData.businessName,
          business_type: formData.businessType,
          property_type: formData.propertyType,
          location: formData.location,
          budget: formData.budget,
          expected_price: formData.expectedPrice,
          assistance_type: formData.assistanceType,
          loan_amount: formData.loanAmount,
          employment_status: formData.employmentStatus,
          query_description: formData.query,
          status: 'pending',
        }
      ]);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({
          name: user ? `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || user.email || '' : '',
          contact: user ? user.profile?.phone_number || user.email || '' : '',
          businessName: '',
          businessType: '',
          propertyType: '',
          location: '',
          budget: '',
          expectedPrice: '',
          assistanceType: '',
          loanAmount: '',
          employmentStatus: '',
          query: '',
        });
      }, 2000);
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}} />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className={`${color} p-6 md:p-8 text-white relative overflow-hidden`}>
          {/* Decorative SVG Patterns */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="300" cy="100" r="150" fill="url(#grad1)" />
            </svg>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 -left-12 w-24 h-24 border-4 border-white/10 rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <path fill="currentColor" d="M0 0 L100 0 L50 100 Z" />
            </svg>
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10">
            <p className="text-white/70 font-bold text-[10px] tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Service Inquiry
            </p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">{serviceType}</h2>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 md:p-7 max-h-[85vh] overflow-y-auto custom-scrollbar bg-gray-50/50">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">Inquiry Received!</h3>
              <p className="text-gray-500 text-lg font-medium max-w-md">Our specialized consultant will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Common Fields */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Phone *</label>
                  <input
                    required
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Contact detail"
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                  />
                </div>

                {/* Specific Fields */}
                {serviceType === 'Commercial Spaces' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                      <input
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Type</label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="Retail">Retail</option>
                        <option value="Office">Office</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Showroom">Showroom</option>
                      </select>
                    </div>
                  </>
                )}

                {serviceType === 'Rent Property' && (
                  <>
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Preferred location"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monthly Budget</label>
                      <input
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="e.g. ₹20,000"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Property Type</label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {['Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Plot'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                            className={`py-2 px-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${
                              formData.propertyType === type 
                                ? 'border-[var(--color-emerald-heritage)] bg-emerald-50 text-[var(--color-emerald-heritage)] shadow-md' 
                                : 'border-white bg-white hover:border-gray-200 text-gray-400'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {serviceType === 'Sell Property' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Type</label>
                      <input
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        placeholder="e.g. 3BHK Flat"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Property location"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected Price</label>
                      <input
                        name="expectedPrice"
                        value={formData.expectedPrice}
                        onChange={handleChange}
                        placeholder="Your asking price"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                  </>
                )}

                {serviceType === 'Legal Assistance' && (
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type of Assistance</label>
                    <select
                      name="assistanceType"
                      value={formData.assistanceType}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                    >
                      <option value="">Select Assistance</option>
                      <option value="Property Documentation">Property Documentation</option>
                      <option value="Legal Verification">Legal Verification</option>
                      <option value="Sale Agreement">Sale Agreement</option>
                      <option value="Registration Support">Registration Support</option>
                      <option value="Dispute Resolution">Dispute Resolution</option>
                    </select>
                  </div>
                )}

                {serviceType === 'Property Loan' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Loan Amount</label>
                      <input
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        placeholder="Estimated amount"
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employment Status</label>
                      <select
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleChange}
                        className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all text-gray-700 font-medium text-sm"
                      >
                        <option value="">Select Status</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Business Owner">Business Owner</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Common Query Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Describe your query *</label>
                <textarea
                  required
                  name="query"
                  rows={2}
                  value={formData.query}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-[var(--color-emerald-heritage)]/10 focus:border-[var(--color-emerald-heritage)] outline-none transition-all resize-none text-gray-700 font-medium text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={loading}
                  type="submit"
                  className="px-8 py-3.5 bg-[var(--color-near-black)] text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:shadow-[var(--color-emerald-heritage)]/20 hover:bg-[var(--color-emerald-heritage)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 text-xs"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Send Inquiry 
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
