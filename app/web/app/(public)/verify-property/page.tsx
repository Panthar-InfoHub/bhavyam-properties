'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Upload, MapPin, Building2, User, FileText, Camera, Video, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PremiumLoader from '@/components/ui/PremiumLoader';
import Script from 'next/script';

export default function VerifyPropertyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationFee, setVerificationFee] = useState<number>(499);

  // Form State
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phoneNumber: '',
    propertyType: '',
    areaSize: '',
    location: '',
    address: '',
    googleMapsUrl: '',
    purpose: 'selling',
    expectedPrice: '',
  });

  // File State
  const [files, setFiles] = useState<{
    floorPlan: File | null;
    images: File[];
    video: File | null;
    certificate: File | null;
    idProof: File | null;
  }>({
    floorPlan: null,
    images: [],
    video: null,
    certificate: null,
    idProof: null,
  });

  useEffect(() => {
    const fetchUserAndFee = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          ownerName: `${currentUser.profile?.first_name || ''} ${currentUser.profile?.last_name || ''}`.trim(),
          email: currentUser.email || '',
          phoneNumber: currentUser.profile?.phone_number || '',
        }));
      }
      
      // Fetch dynamic verification fee from DB
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('price')
          .eq('name', 'Property Verification Fee')
          .eq('is_active', true)
          .maybeSingle();
        if (data && !error) {
          setVerificationFee(Number(data.price));
        }
      } catch (e) {
        console.error("Error fetching verification fee:", e);
      }
      
      setIsLoading(false);
    };
    fetchUserAndFee();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof files) => {
    const fileList = e.target.files;
    if (!fileList) return;

    if (type === 'images') {
      const newImages = Array.from(fileList).slice(0, 5);
      setFiles(prev => ({ ...prev, images: [...prev.images, ...newImages].slice(0, 5) }));
    } else {
      const file = fileList[0];
      // Basic size validation
      if (type === 'floorPlan' && file.size > 1024 * 1024) {
        toast.error('Floor plan must be max 1MB');
        return;
      }
      if (type === 'video' && file.size > 5 * 1024 * 1024) {
        toast.error('Video must be max 5MB');
        return;
      }
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${path}/${fileName}`;
    const { error } = await supabase.storage.from('verification-docs').upload(filePath, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('verification-docs').getPublicUrl(filePath);
    return publicUrl;
  };

  const isFormValid = !!(
    formData.ownerName &&
    formData.phoneNumber &&
    formData.propertyType &&
    formData.areaSize &&
    formData.location &&
    formData.address &&
    files.certificate &&
    files.images.length > 0
  );

  const executeDatabaseSubmit = async (orderId: string, paymentId: string) => {
    try {
      // 1. Upload files
      let floorPlanUrl = '';
      if (files.floorPlan) floorPlanUrl = await uploadFile(files.floorPlan, 'floor-plans');

      let videoUrl = '';
      if (files.video) videoUrl = await uploadFile(files.video, 'videos');

      let certificateUrl = '';
      if (files.certificate) certificateUrl = await uploadFile(files.certificate, 'certificates');

      let idProofUrl = '';
      if (files.idProof) idProofUrl = await uploadFile(files.idProof, 'id-proofs');

      const imageUrls = [];
      for (const img of files.images) {
        const url = await uploadFile(img, 'property-images');
        imageUrls.push(url);
      }

      // 2. Insert into DB
      const { error } = await supabase.from('property_verifications').insert([{
        user_id: user.id,
        agent_id: user.profile?.role === 'agent' ? user.id : null,
        owner_name: formData.ownerName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        property_type: formData.propertyType,
        area_size: formData.areaSize,
        location: formData.location,
        address: formData.address,
        google_maps_url: formData.googleMapsUrl,
        purpose: formData.purpose,
        expected_price: formData.expectedPrice ? parseFloat(formData.expectedPrice) : null,
        floor_plan_url: floorPlanUrl,
        video_url: videoUrl,
        certificate_url: certificateUrl,
        id_proof_url: idProofUrl,
        images: imageUrls,
      }]);

      if (error) throw error;
      setIsSuccess(true);
      toast.success('Verification request submitted successfully!');
    } catch (err: any) {
      console.error('Submission Error:', err);
      toast.error('Failed to submit. Please check your files and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startPaymentAndSubmit = async () => {
    try {
      // Step A: Create order on server (amount: verificationFee, payment_type: 'verification')
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: verificationFee, 
          payment_type: 'verification' 
        }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to initialize payment gateway.');

      // Step B: If mock order (local development)
      if (order.mock) {
        toast.loading(`Simulating ₹${verificationFee} payment checkout...`, { duration: 1500 });
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-test-bypass': 'true'
              },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id:   order.id,
                razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 10),
                razorpay_signature:  'sig_mock',
              }),
            });
            
            if (verifyRes.ok) {
              toast.success("Payment verified successfully!");
              await executeDatabaseSubmit(order.id, 'pay_mock_' + Math.random().toString(36).substring(2, 6));
            } else {
              toast.error("Payment verification failed.");
              setIsSubmitting(false);
            }
          } catch (e) {
            console.error("Payment Verification error:", e);
            toast.error("Payment verification failed.");
            setIsSubmitting(false);
          }
        }, 1500);
        return;
      }

      // Step C: Live Razorpay order checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Bhavyam Properties",
        description: `Property Verification Fee`,
        order_id: order.id,
        handler: async (rzpResponse: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id:   rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature:  rzpResponse.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              toast.success("Payment verified successfully!");
              await executeDatabaseSubmit(rzpResponse.razorpay_order_id, rzpResponse.razorpay_payment_id);
            } else {
              toast.error("Payment verification failed. Contact support if charged.");
              setIsSubmitting(false);
            }
          } catch (e) {
            console.error("Payment Verification error:", e);
            toast.error("Failed to verify payment.");
            setIsSubmitting(false);
          }
        },
        prefill: { 
          email: user.email, 
          contact: formData.phoneNumber || "" 
        },
        theme: { color: "#00b48f" },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (r: any) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment gateway.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit verification request');
      return;
    }
    setIsSubmitting(true);
    await startPaymentAndSubmit();
  };

  if (isLoading) return <PremiumLoader />;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#fbfcfa] flex items-center justify-center p-6 mt-16 md:mt-24">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Request Received!</h1>
          <p className="text-gray-800 text-lg font-medium mb-10 leading-relaxed">
            Our expert team will now manually verify your property documents and media. You will receive an update via email within 2-3 business days.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-[#112743] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#00ecbd] hover:text-[#112743] transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfcfa] pt-40 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00ecbd]/10 text-[#00b48f] text-xs font-black tracking-widest uppercase mb-4 border border-[#00ecbd]/20">
            <ShieldCheck size={14} />
            Professional Verification
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
            Get Your Property <span className="text-[#00b48f]">Verified</span>
          </h1>
          <p className="text-gray-800 font-medium text-lg max-w-2xl">
            Complete the form below with accurate details and high-quality media. Verified properties receive 5x more leads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Owner Details Section */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Owner Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Owner Name *</label>
                <input
                  required
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Email ID *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none opacity-80 cursor-not-allowed"
                  placeholder="email@example.com"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Contact Number *</label>
                <input
                  required
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="e.g. 9451567034"
                />
              </div>
              {user?.profile?.role === 'agent' && (
                <div className="space-y-2 opacity-60">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Agent ID (Auto-filled)</label>
                  <div className="w-full bg-gray-100 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-800">
                    {user.id.slice(0, 8)}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property Specifications */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Property Specifications</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Property Type *</label>
                <select
                  required
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Area Size *</label>
                <input
                  required
                  name="areaSize"
                  value={formData.areaSize}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="e.g. 1200 sq.ft"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Location / City *</label>
                <input
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="e.g. Jhansi"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Address *</label>
                <input
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="Exact building/plot address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Google Maps URL</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                    placeholder="Link from maps"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Purpose *</label>
                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, purpose: 'selling'})}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.purpose === 'selling' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Selling
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, purpose: 'renting'})}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.purpose === 'renting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Renting
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Expected Price (Optional)</label>
                <input
                  type="number"
                  name="expectedPrice"
                  value={formData.expectedPrice}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#00ecbd] focus:bg-white transition-all outline-none"
                  placeholder="e.g. 4500000"
                />
              </div>
            </div>
          </div>

          {/* Documents & Media */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Documents & Media</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Floor Plan */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center justify-between">
                  Floor Plan (Max 1MB)
                  {files.floorPlan && <CheckCircle2 size={14} className="text-emerald-500" />}
                </label>
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-6 cursor-pointer hover:border-[#00ecbd] hover:bg-[#fbfcfa] transition-all group overflow-hidden">
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'floorPlan')} />
                  <Upload className="text-gray-300 group-hover:text-[#00ecbd] mb-2 transition-colors" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                    {files.floorPlan ? files.floorPlan.name : 'Select PDF/Image'}
                  </span>
                </label>
              </div>

              {/* Property Certificate */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center justify-between">
                  Certificate *
                  {files.certificate && <CheckCircle2 size={14} className="text-emerald-500" />}
                </label>
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-6 cursor-pointer hover:border-[#00ecbd] hover:bg-[#fbfcfa] transition-all group">
                  <input type="file" required className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'certificate')} />
                  <FileText className="text-gray-300 group-hover:text-[#00ecbd] mb-2 transition-colors" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                    {files.certificate ? files.certificate.name : 'Select Doc'}
                  </span>
                </label>
              </div>

              {/* Identity Proof */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center justify-between">
                  ID (Aadhaar/PAN)
                  {files.idProof && <CheckCircle2 size={14} className="text-emerald-500" />}
                </label>
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-6 cursor-pointer hover:border-[#00ecbd] hover:bg-[#fbfcfa] transition-all group">
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idProof')} />
                  <ShieldCheck className="text-gray-300 group-hover:text-[#00ecbd] mb-2 transition-colors" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                    {files.idProof ? files.idProof.name : 'Optional'}
                  </span>
                </label>
              </div>

              {/* Images */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center justify-between">
                  Property Images (Max 5) *
                  <span className="text-gray-300">{files.images.length}/5</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {files.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden group">
                      <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFiles(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {files.images.length < 5 && (
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:border-[#00ecbd] hover:bg-[#fbfcfa] transition-all group">
                      <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'images')} />
                      <Camera className="text-gray-300 group-hover:text-[#00ecbd] mb-1" size={20} />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Add Image</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center justify-between">
                  Virtual Tour Video (Max 5MB)
                  {files.video && <CheckCircle2 size={14} className="text-emerald-500" />}
                </label>
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] p-6 cursor-pointer hover:border-[#00ecbd] hover:bg-[#fbfcfa] transition-all group">
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                  <Video className="text-gray-300 group-hover:text-[#00ecbd] mb-2 transition-colors" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                    {files.video ? files.video.name : 'Select Video'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-6 pt-10">
            <button
              disabled={isSubmitting || (!!user && !isFormValid)}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.error('Please login first to submit verification request', {
                    icon: '🔒',
                    duration: 4000
                  });
                }
              }}
              type="submit"
              className={`w-full max-w-md font-semibold py-5 rounded-3xl font-black tracking-[0.2em] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 group ${
                isSubmitting || (!!user && !isFormValid)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#112743] text-white hover:bg-[#00ecbd] hover:text-[#112743] hover:shadow-[#00ecbd]/20'
              }`}
            >
              {isSubmitting ? 'Processing Documents...' : (
                <>
                  {(!user || isFormValid) ? 'Submit For Verification' : 'Fill All Required Fields'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">
              Our experts will manually review each document. <br className="hidden md:block" />
              Inaccurate info will result in immediate rejection.
            </p>
          </div>

        </form>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </main>
  );
}
