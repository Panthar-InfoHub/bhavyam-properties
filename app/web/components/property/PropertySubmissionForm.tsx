'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PropertySubmissionForm() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAllowed, setIsAllowed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Complex Form State
  const [formData, setFormData] = useState({
    // Step 1
    listingType: '',
    propertyType: '',
    propertyTypeOther: '',
    pricingType: '',
    yourDemand: '',
    priceRange: '',
    propertyDetails: '',
    
    // Step 2 & 3
    features: [] as string[],
    amenities: [] as string[],
    amenitiesOther: '',
    
    // Step 4
    bedrooms: '',
    bathrooms: '',
    builtUpArea: '',
    carpetArea: '',
    buildYear: '',
    
    // Step 5
    bedroomPhotos: [] as File[],
    bathroomPhotos: [] as File[],
    frontPhotos: [] as File[],
    insidePhotos: [] as File[],
    mapPhoto: null as File | null,
    propertyDocuments: [] as File[],
    floorPlan: null as File | null,
    propertyVideo: null as File | null,
    
    // Step 6
    ownerName: '',
    contactNumber: '',
    whatsappNumber: '',
    ownerEmail: '',
    
    // Step 7
    address: '',
    zipCode: '',
    cityLocation: '',
    otherLocationDetails: '',
    mapUrl: '',
    
    // Step 8
    agentName: '',
    agentCode: '',
    
    // Step 9
    furnishedAmenities: [] as string[],
    furnishedAmenitiesOther: '',
    
    // Step 10
    agreements: {
      termsAgreed: false,
      allPhotosUploaded: false,
      agreementSigned: false,
      documentsReceived: false,
      commissionDiscussed: false,
    },
    
    // Step 11
    questions: '',
    otherNotes: '',
  });

  // Check Rules on Mount
  useEffect(() => {
    const checkRules = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      
      // Auto-fill Agent Details if they exist
      if (user.profile?.agent_code) {
        setFormData(prev => ({
          ...prev,
          agentName: `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim(),
          agentCode: user.profile.agent_code
        }));
      } else if (user.profile?.role === 'admin' || user.profile?.role === 'agent') {
         setFormData(prev => ({
          ...prev,
          agentName: `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim(),
        }));
      }
      
      const role = user.profile?.role;
      // Admin and Agent have no limits. Seller and Buyer (non-agents) have 1 property/month limit.
      if (role === 'seller' || role === 'buyer') {
         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
         const { count, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .gte('created_at', thirtyDaysAgo);
          
         if (count && count >= 1) {
           setIsAllowed(false);
         }
      }
    };
    checkRules();
  }, [router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxArray = (arrayName: 'features' | 'amenities' | 'furnishedAmenities', value: string) => {
    setFormData((prev) => {
      const currentArray = prev[arrayName] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [arrayName]: currentArray.filter(v => v !== value) };
      }
      return { ...prev, [arrayName]: [...currentArray, value] };
    });
  };

  const handleAgreementCheck = (name: keyof typeof formData.agreements) => {
    setFormData(prev => ({
      ...prev,
      agreements: { ...prev.agreements, [name]: !prev.agreements[name] }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof typeof formData, maxFiles: number = 5) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    
    // Validate Size
    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        alert(`File ${f.name} exceeds standard 10MB limit!`);
        return;
      }
    }
    
    if (maxFiles === 1) {
      setFormData(prev => ({ ...prev, [name]: newFiles[0] }));
    } else {
      setFormData(prev => {
        const existingFiles = Array.isArray(prev[name]) ? (prev[name] as File[]) : [];
        const combined = [...existingFiles, ...newFiles];
        
        if (combined.length > maxFiles) {
          alert(`You can only upload a maximum of ${maxFiles} files here. Taking the first ${maxFiles} only.`);
          return { ...prev, [name]: combined.slice(0, maxFiles) };
        }
        
        return { ...prev, [name]: combined };
      });
    }
  };

  const removeFile = (fieldName: keyof typeof formData, index: number) => {
    setFormData(prev => {
      const current = prev[fieldName];
      if (Array.isArray(current)) {
        return { ...prev, [fieldName]: current.filter((_, i) => i !== index) };
      }
      return { ...prev, [fieldName]: null };
    });
  };

  const nextStep = () => {
    if (currentStep === 8 && !formData.agreements.termsAgreed) {
      alert("Please agree to the terms and conditions in Step 8 before proceeding.");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 9));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (!currentUser) throw new Error("No authenticated user");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    // Path: user_id/category/filename (e.g. "82f3.../bedrooms/abc.jpg")
    const filePath = `${currentUser.id}/${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('property-media').upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('property-media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!formData.agreements.termsAgreed) {
      setErrorMsg('You must agree to the terms and conditions in Step 8.');
      setCurrentStep(8);
      return;
    }

    // Agent Validation
    const role = currentUser.profile?.role;
    if ((role === 'agent' || role === 'admin') && !formData.agentCode) {
      setErrorMsg('Agent Code is required for Agent/Admin accounts.');
      setCurrentStep(7);
      setIsSubmitting(false);
      return;
    }

    if (formData.agentCode && (role === 'agent' || role === 'admin') && formData.agentCode !== currentUser.profile?.agent_code) {
      setErrorMsg('The Agent Code provided does not match your profile.');
      setCurrentStep(7);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Validation for required fields
    if (formData.frontPhotos.length === 0) {
      setErrorMsg('At least one Front Photo is required.');
      setCurrentStep(4);
      setIsSubmitting(false);
      return;
    }
    if (!formData.propertyVideo) {
      setErrorMsg('Property Video is required.');
      setCurrentStep(4);
      setIsSubmitting(false);
      return;
    }
    if (formData.propertyDocuments.length === 0) {
      setErrorMsg('Basic legal documents are required.');
      setCurrentStep(4);
      setIsSubmitting(false);
      return;
    }
    if (!formData.mapUrl.trim()) {
      setErrorMsg('Google Maps link is required. Please paste your property location URL.');
      setCurrentStep(6);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Calculate base numeric price
      const numericPrice = parseFloat(formData.yourDemand.replace(/[^0-9.-]+/g,"")) || 0;
      
      // 2. Insert main property record mapping UI to standard Database schema
      const { data: propertyRecord, error: propError } = await supabase
        .from('properties')
        .insert({
          owner_id: currentUser.id,
          listing_type: formData.listingType || 'Unspecified',
          property_type: formData.propertyType || 'Unspecified',
          pricing_type: formData.pricingType || 'Unspecified',
          price: numericPrice,
          city: formData.cityLocation || 'Unspecified',
          area: formData.carpetArea ? formData.carpetArea + ' sqft' : 'Unspecified',
          address: formData.address || 'Unspecified',
          status: 'pending', // Admin must approve
          map_url: formData.mapUrl || null,
          description: formData.propertyDetails || 'No details provided'
        })
        .select()
        .single();
        
      if (propError) throw propError;

      // 3. Process all media uploads recursively if the bucket is present
      const uploadPromises: Promise<void>[] = [];
      const mediaRecords: { property_id: string, url: string, media_type: string }[] = [];

      const processArrayUpload = (files: File[], bucketFolder: string) => {
        for (const file of files) {
           uploadPromises.push(
               uploadFileToSupabase(file, bucketFolder).then(url => {
                   mediaRecords.push({ property_id: propertyRecord.id, url, media_type: 'image' });
               })
           );
        }
      };

      processArrayUpload(formData.bedroomPhotos, 'bedrooms');
      processArrayUpload(formData.bathroomPhotos, 'bathrooms');
      processArrayUpload(formData.frontPhotos, 'front');
      processArrayUpload(formData.insidePhotos, 'inside');
      processArrayUpload(formData.propertyDocuments, 'documents');
      
      if (formData.mapPhoto) {
        uploadPromises.push(
          uploadFileToSupabase(formData.mapPhoto, 'maps').then(url => {
              mediaRecords.push({ property_id: propertyRecord.id, url, media_type: 'map' });
          })
        );
      }
      
      if (formData.floorPlan) {
        uploadPromises.push(
          uploadFileToSupabase(formData.floorPlan, 'floor-plans').then(url => {
              mediaRecords.push({ property_id: propertyRecord.id, url, media_type: 'document' });
          })
        );
      }
      
      if (formData.propertyVideo) {
         uploadPromises.push(
          uploadFileToSupabase(formData.propertyVideo, 'videos').then(url => {
              mediaRecords.push({ property_id: propertyRecord.id, url, media_type: 'video' });
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // 4. Batch insert all media URLs into database
      if (mediaRecords.length > 0) {
        const { error: mediaError } = await supabase.from('property_media').insert(mediaRecords);
        if (mediaError) throw mediaError;
      }

      // 5. Success
      alert('Property securely submitted! It is in Pending status waiting for an Admin review.');
      router.push('/dashboard');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred uploading data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAllowed) {
    return (
      <div className="bg-red-50 text-red-500 p-8 rounded-[2.5rem] border border-red-100 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-500 shadow-xl">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-2">🚫</div>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-red-900">Monthly Limit Reached</h3>
        <p className="max-w-md font-medium text-red-700/80 leading-relaxed">
          As a non-agent user, you are currently limited to publishing exactly <span className="font-bold underline">1 property per month</span> via your dashboard. 
        </p>
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl border border-red-50 shadow-sm mt-4">
           <p className="text-sm font-bold text-gray-800 mb-4">Want to list unlimited properties?</p>
           <Link href="/user/apply-agent" className="block w-full bg-[#112743] hover:bg-black text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
              Apply as Professional Agent
           </Link>
        </div>
      </div>
    );
  }

  // Common UI Layout wrapper for Step logic
  const renderStep = () => {
    const inputClasses = "w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:border-[#00b48f] focus:ring-4 focus:ring-teal-500/10 transition-all bg-white text-gray-800 placeholder-gray-400";
    const labelClasses = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1";

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Basic Information</h3>
              <p className="text-gray-500 text-sm">Let's start with the core details of your listing.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Listing Type</label>
                <select name="listingType" onChange={handleChange} value={formData.listingType} className={inputClasses}>
                  <option value="">Select Type</option>
                  <option value="Sell">For Sell</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">For Lease</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Property Type</label>
                <select name="propertyType" onChange={handleChange} value={formData.propertyType} className={inputClasses}>
                  <option value="">Select Category</option>
                  <option value="Agriculture">Agriculture Land</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="House">Independent House</option>
                  <option value="Commercial">Commercial Space</option>
                  <option value="Plot">Land / Plot</option>
                  <option value="Other">Other</option>
                </select>
                {formData.propertyType === 'Other' && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClasses}>Please Specify Property Type</label>
                    <input 
                      type="text" 
                      name="propertyTypeOther" 
                      placeholder="e.g. Penthouse, Studio, etc." 
                      onChange={handleChange} 
                      value={formData.propertyTypeOther} 
                      className={inputClasses} 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClasses}>Pricing Type</label>
                <select name="pricingType" onChange={handleChange} value={formData.pricingType} className={inputClasses}>
                  <option value="">Select Pricing</option>
                  <option value="Fixed">Fixed Price</option>
                  <option value="Negotiable">Negotiable</option>
                  <option value="Call">Call for Price</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Your Demand (₹)</label>
                <input type="text" name="yourDemand" placeholder="e.g. 45,00,000" onChange={handleChange} value={formData.yourDemand} className={inputClasses} />
              </div>

              <div>
                <label className={labelClasses}>Price Range (Optional)</label>
                <input type="text" name="priceRange" placeholder="e.g. 40L - 50L" onChange={handleChange} value={formData.priceRange} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Property Description</label>
              <textarea name="propertyDetails" placeholder="Tell us about the property, its history, and unique selling points..." rows={5} onChange={handleChange} value={formData.propertyDetails} className={inputClasses}></textarea>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Features Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-black text-gray-800">Property Features</h3>
                <p className="text-gray-500 text-sm">Select the physical characteristics of the property.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Parking', 'Garden', '2 floor', '3 floor', '4 floor', 'Basement', 'Balcony', 'Black road property', 'Apex Road Property', 'Light poll', 'Solar Panel'].map(feature => (
                   <label key={feature} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group">
                     <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => handleCheckboxArray('features', feature)} className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /> 
                     <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">{feature}</span>
                   </label>
                ))}
              </div>
            </div>

            {/* Nearby Amenities Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-black text-gray-800">Nearby Amenities</h3>
                <p className="text-gray-500 text-sm">Highlight what’s available in the immediate surroundings.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Railway Station', 'Bus stand', 'Highway', 'Temple', 'School', 'Hospital', 'Police Station', 'Market', 'Other'].map(item => (
                   <label key={item} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group">
                     <input type="checkbox" checked={formData.amenities.includes(item)} onChange={() => handleCheckboxArray('amenities', item)} className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /> 
                     <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">{item}</span>
                   </label>
                ))}
              </div>
              {formData.amenities.includes('Other') && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClasses}>Please Specify Other Amenities</label>
                  <input type="text" name="amenitiesOther" placeholder="e.g. Park, Community Center, etc." onChange={handleChange} value={formData.amenitiesOther} className={inputClasses} />
                </div>
              )}
            </div>

            {/* Furnished Amenities Section */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-2xl font-black text-gray-800">Furnishings & Assets</h3>
                <p className="text-gray-500 text-sm">What movable assets are included in the price?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['TV Case', 'AC Unit', 'Gym Kit', 'Bed', 'Sofa', 'Fridge', 'Wifi', 'Fan', 'Washing Machine', 'Other'].map(item => (
                   <label key={item} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group">
                     <input type="checkbox" checked={formData.furnishedAmenities.includes(item)} onChange={() => handleCheckboxArray('furnishedAmenities', item)} className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500" /> 
                     <span className="text-xs font-bold text-gray-700 group-hover:text-teal-700 transition-colors uppercase tracking-tight">{item}</span>
                   </label>
                ))}
              </div>
              {formData.furnishedAmenities.includes('Other') && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClasses}>Please Specify Other Furnishings</label>
                  <input type="text" name="furnishedAmenitiesOther" placeholder="e.g. Microwave, Curtains, etc." onChange={handleChange} value={formData.furnishedAmenitiesOther} className={inputClasses} />
                </div>
              )}
            </div>
          </div>
        );
      case 3:
         return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Property Details</h3>
              <p className="text-gray-500 text-sm">Specific technical and layout measurements.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>Bedrooms</label>
                <input type="number" name="bedrooms" placeholder="0" onChange={handleChange} value={formData.bedrooms} className={inputClasses} min="0" />
              </div>
              <div>
                <label className={labelClasses}>Bathrooms</label>
                <input type="number" name="bathrooms" placeholder="0" onChange={handleChange} value={formData.bathrooms} className={inputClasses} min="0" />
              </div>
              <div>
                <label className={labelClasses}>Total Built-up Area (sqft)</label>
                <input type="text" name="builtUpArea" placeholder="e.g. 1500" onChange={handleChange} value={formData.builtUpArea} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Carpet Area (sqft)</label>
                <input type="text" name="carpetArea" placeholder="e.g. 1200" onChange={handleChange} value={formData.carpetArea} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Build Year</label>
                <input type="text" name="buildYear" placeholder="e.g. 2022" onChange={handleChange} value={formData.buildYear} className={inputClasses} />
              </div>
            </div>
          </div>
        );
      case 4:
        const renderFileList = (fieldName: keyof typeof formData) => {
          const files = formData[fieldName];
          if (!files) return null;
          const fileArr = (Array.isArray(files) ? files : [files]) as any[];
          if (fileArr.length === 0) return null;
          
          return (
            <div className="mt-3 flex flex-wrap gap-2">
              {fileArr.map((f, idx) => {
                const isFile = f instanceof File;
                if (!isFile) return null;
                return (
                  <div key={idx} className="group flex items-center gap-2 bg-white border border-teal-100 pl-3 pr-1 py-1 rounded-xl shadow-sm hover:shadow-md transition-all animate-in zoom-in duration-300">
                    <span className="text-[10px] font-bold text-teal-600 truncate max-w-[120px]">{f.name}</span>
                    <button 
                      type="button"
                      onClick={() => removeFile(fieldName, idx)}
                      className="p-1.5 rounded-lg text-teal-300 hover:bg-teal-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        };

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Media Upload</h3>
              <p className="text-gray-500 text-sm">High-quality photos significantly increase interest. (Max 10MB/file)</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <label className={labelClasses}>Bedroom Photos (max 5)</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'bedroomPhotos', 5)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00b48f] file:text-white hover:file:bg-teal-600 transition-all" />
                  {renderFileList('bedroomPhotos')}
               </div>
               <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <label className={labelClasses}>Bathroom Photos (max 5)</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'bathroomPhotos', 5)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00b48f] file:text-white hover:file:bg-teal-600 transition-all" />
                  {renderFileList('bathroomPhotos')}
               </div>
               <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <label className={labelClasses}>Front Photos (max 5) <span className="text-[#00b48f]">* Recommended</span></label>
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'frontPhotos', 5)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00b48f] file:text-white hover:file:bg-teal-600 transition-all" />
                  {renderFileList('frontPhotos')}
               </div>
               <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <label className={labelClasses}>Property Video Tour (max 1) <span className="text-red-500">* Required</span></label>
                  <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'propertyVideo', 1)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00579e] file:text-white shadow-sm transition-all" />
                  {renderFileList('propertyVideo')}
               </div>

               <div className="p-5 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                  <label className={labelClasses}>Floor Plan (max 1) <span className="text-gray-400">Optional</span></label>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'floorPlan', 1)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00579e] file:text-white shadow-sm transition-all" />
                  {renderFileList('floorPlan')}
               </div>

               <div className="col-span-1 md:col-span-2 p-5 border-2 border-double border-[#00579e]/10 rounded-2xl bg-blue-50/10">
                  <label className={`${labelClasses} text-[#00579e]`}>Legal Photocopies / Documents (max 5) <span className="text-red-500">* Required</span></label>
                  <input type="file" multiple accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'propertyDocuments', 5)} className="w-full text-sm block cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#00579e] file:text-white hover:bg-blue-600 shadow-sm transition-all" />
                  {renderFileList('propertyDocuments')}
               </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Owner Details</h3>
              <p className="text-gray-500 text-sm">Confidential contact info for the registered owner.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Owner Full Name</label>
                <input type="text" name="ownerName" placeholder="Full Legal Name" onChange={handleChange} value={formData.ownerName} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Contact Number</label>
                <input type="tel" name="contactNumber" placeholder="+91 00000 00000" onChange={handleChange} value={formData.contactNumber} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>WhatsApp Number</label>
                <input type="tel" name="whatsappNumber" placeholder="Same as contact?" onChange={handleChange} value={formData.whatsappNumber} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Official Email</label>
                <input type="email" name="ownerEmail" placeholder="email@address.com" onChange={handleChange} value={formData.ownerEmail} className={inputClasses} />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Property Location</h3>
              <p className="text-gray-500 text-sm">Where exactly is this property situated?</p>
            </div>
            <div>
              <label className={labelClasses}>Street Address / Landmark</label>
              <input type="text" name="address" placeholder="e.g. Near Shiv Temple, Station Road" onChange={handleChange} value={formData.address} className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>City / Location</label>
                <input type="text" name="cityLocation" placeholder="e.g. Mumbai, Navi Mumbai" onChange={handleChange} value={formData.cityLocation} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Zip / Post Code</label>
                <input type="text" name="zipCode" placeholder="400001" onChange={handleChange} value={formData.zipCode} className={inputClasses} />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Additional Directionals</label>
              <textarea name="otherLocationDetails" placeholder="Any specific turns or nearby landmarks to help find it?" rows={3} onChange={handleChange} value={formData.otherLocationDetails} className={inputClasses}></textarea>
            </div>
            <div className="pt-4 border-t border-gray-100">
                <label className={labelClasses}>Google Maps Link <span className="text-red-500">* Required</span></label>
               <input 
                 type="text" 
                 name="mapUrl" 
                 placeholder="Paste Google Maps link here..." 
                 onChange={handleChange} 
                 value={formData.mapUrl} 
                 className={inputClasses} 
               />
               
               {(() => {
                 const getMapEmbedUrl = (url: string) => {
                   if (!url) return '';
                   if (url.includes('pb=') || url.includes('output=embed')) return url;
                   const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                   if (match) return `https://maps.google.com/maps?q=${match[1]},${match[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                   const placeMatch = url.match(/\/place\/([^\/]+)/);
                   if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(placeMatch[1].replace(/\+/g, ' '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                   return url.includes('goo.gl') ? null : `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                 };
                 const embedUrl = formData.mapUrl ? getMapEmbedUrl(formData.mapUrl) : null;
                 return formData.mapUrl ? (
                   <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-100 h-48 relative group flex flex-col items-center justify-center">
                      {embedUrl ? (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={embedUrl}
                          className="opacity-90 group-hover:opacity-100 transition-opacity absolute inset-0 z-0"
                        ></iframe>
                      ) : (
                        <div className="z-10 text-center px-4">
                          <p className="text-gray-500 font-bold mb-2 text-sm">Shortlink Detected</p>
                          <a href={formData.mapUrl} target="_blank" rel="noreferrer" className="inline-block bg-[#00579e] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-800 transition-colors">
                            Test Link in New Tab
                          </a>
                        </div>
                      )}
                      
                      {!embedUrl && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>
                      )}
                      
                      {embedUrl && !formData.mapUrl.includes('google.com/maps/embed') && !formData.mapUrl.includes('pb=') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-center p-6 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <p className="text-xs font-bold uppercase tracking-widest">
                            Converted to Embed Format<br/>
                            <span className="text-[10px] font-normal opacity-80 mt-1 block">Your link was automatically optimized for viewing.</span>
                          </p>
                        </div>
                      )}
                   </div>
                 ) : null;
               })()}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-gray-800">Agent Details</h3>
              <p className="text-gray-500 text-sm">Only if this property is being listed by an intermediary agent.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Agent Full Name</label>
                <input type="text" name="agentName" placeholder="Representative Name" onChange={handleChange} value={formData.agentName} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Verification Code / ID {(currentUser?.profile?.role === 'agent' || currentUser?.profile?.role === 'admin') && <span className="text-red-500">* Required</span>}</label>
                <input 
                  type="text" 
                  name="agentCode" 
                  placeholder="AGNT-XXXX" 
                  onChange={handleChange} 
                  value={formData.agentCode} 
                  className={inputClasses} 
                  readOnly={currentUser?.profile?.role === 'agent' || currentUser?.profile?.role === 'admin'}
                />
                {(currentUser?.profile?.role === 'agent' || currentUser?.profile?.role === 'admin') && <p className="text-[10px] text-teal-600 mt-2 font-bold uppercase">Locked to your verified profile ID</p>}
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="border-b border-gray-100 pb-4">
               <h3 className="text-2xl font-black text-gray-800">Final Agreement</h3>
               <p className="text-gray-500 text-sm">Please verify the following before final submission.</p>
             </div>
             <div className="flex flex-col gap-3">
              {[
                { id: 'termsAgreed', label: 'I agree to the Bhavyam Properties Terms and Conditions' },
                { id: 'allPhotosUploaded', label: 'I certify that all uploaded media is real and original' },
                { id: 'agreementSigned', label: 'I agree to the Bhavyam Properties Marketing Agreement and confirm it is signed' },
                { id: 'documentsReceived', label: 'Property Title Deeds and KYC are ready for audit' },
                { id: 'commissionDiscussed', label: 'Standard Commission percentage is agreed upon' },
              ].map(item => (
                <label key={item.id} className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-teal-300 transition-all cursor-pointer shadow-sm group">
                  <input 
                    type="checkbox" 
                    checked={(formData.agreements as any)[item.id]} 
                    onChange={() => handleAgreementCheck(item.id as any)} 
                    className="w-6 h-6 rounded-lg border-gray-300 text-teal-600 focus:ring-teal-500 transition-all" 
                  /> 
                  <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 9:
         return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="border-b border-gray-100 pb-4">
               <h3 className="text-2xl font-black text-gray-800">Review & Submit</h3>
               <p className="text-gray-500 text-sm">Need to tell our administration anything else?</p>
             </div>
             <div>
                <label className={labelClasses}>Inquiries for Reviewer</label>
                <textarea name="questions" placeholder="Questions for the admin during review..." rows={3} onChange={handleChange} value={formData.questions} className={inputClasses}></textarea>
             </div>
             <div>
                <label className={labelClasses}>Private Admin Notes</label>
                <textarea name="otherNotes" placeholder="Any internal specifics our team should know?" rows={3} onChange={handleChange} value={formData.otherNotes} className={inputClasses}></textarea>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-teal-500">📋</span> Final Checklist
                   </h5>
                   <ul className="space-y-2 text-sm">
                      <li className={`flex items-center gap-2 ${formData.agreements.termsAgreed ? 'text-green-600' : 'text-red-500 font-bold'}`}>
                         {formData.agreements.termsAgreed ? '✅' : '❌'} Terms & Conditions agreed
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                         {formData.frontPhotos.length > 0 ? '✅' : '❌'} Front Photo (Min 1 required)
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                         {formData.propertyVideo ? '✅' : '❌'} Property Video tour required
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                         {formData.floorPlan ? '✅' : '❌'} Floor Plan required
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                         {formData.propertyDocuments.length > 0 ? '✅' : '❌'} Legal Documents attached
                      </li>
                   </ul>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4 h-full">
                   <span className="text-2xl text-blue-500 mt-0.5">ℹ️</span>
                   <div>
                      <h5 className="font-bold text-blue-900">What happens next?</h5>
                      <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                         Your property will enter a "Pending" state. Our regional agents will verify your documents within 24-48 hours. You will be notified via email once your listing is public.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
       <div className="mb-8 flex flex-col pt-4">
         
         {/* Step Progress Bar visual representation loop */}
         <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
               <div>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em]">Listing Progress</span>
                  <h4 className="text-xl font-black text-gray-800 leading-tight">Step {currentStep} <span className="text-gray-300 mx-1">/</span> 9</h4>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{Math.round((currentStep / 9) * 100)}% Complete</span>
               </div>
            </div>
            <div className="flex flex-row gap-1.5 h-1.5 w-full">
               {Array.from({ length: 9 }).map((_, i) => (
               <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-500 ${
                     currentStep > i 
                     ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' 
                     : currentStep === i + 1
                     ? 'bg-teal-200 animate-pulse'
                     : 'bg-gray-100'
                  }`} 
               />
               ))}
            </div>
         </div>

         {/* Dynamic UI Content mapped above */}
         <div className="bg-white p-2 min-h-[300px]">
           {renderStep()}
         </div>
       </div>

       {errorMsg && <p className="text-red-500 font-medium bg-red-50 text-sm p-4 rounded mb-6">{errorMsg}</p>}

       {/* Form Pagination Handlers */}
       <div className="flex justify-between items-center bg-gray-50 p-4 -mx-6 md:-mx-10 -mb-6 mt-8 border-t border-gray-100 rounded-b-3xl">
          <button 
             type="button" 
             onClick={prevStep} 
             disabled={currentStep === 1 || isSubmitting}
             className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md disabled:opacity-30 hover:bg-white bg-transparent transition-all font-medium">
            Previous
          </button>

          <span className="text-sm font-semibold text-gray-400">Step {currentStep} of 9</span>

          {currentStep < 9 ? (
             <button 
               type="button" 
               onClick={nextStep} 
               className="px-6 py-2 bg-[#00b48f] text-white rounded-md hover:bg-teal-600 transition-all font-medium">
              Continue
             </button>
          ) : (
             <button 
               type="submit" 
               disabled={isSubmitting}
               className={`px-8 py-2 text-white rounded-md transition-all font-medium shadow-md ${
                 isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00579e] hover:bg-[#00427a]'
               }`}>
               {isSubmitting ? 'Uploading Data...' : 'Submit Property for Review'}
             </button>
          )}
       </div>
    </form>
  );
}
