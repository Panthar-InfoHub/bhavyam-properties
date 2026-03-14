'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
    pricingType: '',
    yourDemand: '',
    priceRange: '',
    propertyDetails: '',
    
    // Step 2 & 3
    features: [] as string[],
    amenities: [] as string[],
    
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
    
    // Step 8
    agentName: '',
    agentCode: '',
    
    // Step 9
    furnishedAmenities: [] as string[],
    
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
      
      const role = user.profile?.role;
      if (role === 'seller') {
         // Rule: Sellers can only submit 1 property
         const { count, error } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);
          
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
    const filesArray = Array.from(e.target.files);
    
    // Validate Size
    for (const f of filesArray) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        alert(`File ${f.name} exceeds standard 10MB limit!`);
        return;
      }
    }
    
    if (maxFiles === 1) {
      setFormData(prev => ({ ...prev, [name]: filesArray[0] }));
    } else {
      if (filesArray.length > maxFiles) {
        alert(`You can only upload a maximum of ${maxFiles} files here.`);
        return;
      }
      setFormData(prev => ({ ...prev, [name]: filesArray }));
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 11));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const uploadFileToSupabase = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('property-media').upload(filePath, file);
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('property-media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg('');

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
          status: 'pending' // Admin must approve
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
      <div className="bg-red-50 text-red-500 p-8 rounded-xl border border-red-200">
        <h3 className="text-xl font-bold mb-2">Limit Reached</h3>
        <p>As a registered Seller, you are currently limited to publishing exactly 1 property via your dashboard. Upgrade to an Agent profile or contact Administration for an expansion limit increase.</p>
      </div>
    );
  }

  // Common UI Layout wrapper for Step logic
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 1: Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="listingType" placeholder="Listing Type (e.g. Rent, Sell)" onChange={handleChange} value={formData.listingType} className="border p-3 rounded" />
              <input type="text" name="propertyType" placeholder="Property Type (e.g. Villa, Flat)" onChange={handleChange} value={formData.propertyType} className="border p-3 rounded" />
              <input type="text" name="pricingType" placeholder="Pricing Type (e.g. Fixed, Negotiable)" onChange={handleChange} value={formData.pricingType} className="border p-3 rounded" />
              <input type="text" name="yourDemand" placeholder="Your Demand (Amount)" onChange={handleChange} value={formData.yourDemand} className="border p-3 rounded" />
              <input type="text" name="priceRange" placeholder="Price Range" onChange={handleChange} value={formData.priceRange} className="border p-3 rounded" />
            </div>
            <textarea name="propertyDetails" placeholder="Detailed Property Description" rows={4} onChange={handleChange} value={formData.propertyDetails} className="border p-3 rounded w-full mt-4"></textarea>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 2: Property Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Parking', 'Garden', '2 floor', '3 floor', '4 floor', 'Basement', 'Balcony', 'Black road property', 'Apex Road Property', 'Light poll', 'Solar Panel'].map(feature => (
                 <label key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                   <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => handleCheckboxArray('features', feature)} className="rounded" /> {feature}
                 </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 3: Nearby Amenities</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Railway Station', 'Bus stand', 'Highway', 'Temple', 'School', 'Hospital', 'Police Station', 'Market', 'Other'].map(item => (
                 <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                   <input type="checkbox" checked={formData.amenities.includes(item)} onChange={() => handleCheckboxArray('amenities', item)} className="rounded" /> {item}
                 </label>
              ))}
            </div>
          </div>
        );
      case 4:
         return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 4: Property Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="number" name="bedrooms" placeholder="Bedrooms in house" onChange={handleChange} value={formData.bedrooms} className="border p-3 rounded" />
               <input type="number" name="bathrooms" placeholder="Bathrooms in house" onChange={handleChange} value={formData.bathrooms} className="border p-3 rounded" />
               <input type="text" name="builtUpArea" placeholder="Total built up Area (sqft)" onChange={handleChange} value={formData.builtUpArea} className="border p-3 rounded" />
               <input type="text" name="carpetArea" placeholder="Carpet Area (sqft)" onChange={handleChange} value={formData.carpetArea} className="border p-3 rounded" />
               <input type="text" name="buildYear" placeholder="Build Year" onChange={handleChange} value={formData.buildYear} className="border p-3 rounded" />
             </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 5: Media Upload <span className="text-sm font-normal text-gray-500">(10mb per file max)</span></h3>
             
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bedroom Photos (max 5)</label>
                   <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'bedroomPhotos', 5)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bathroom Photos (max 5)</label>
                   <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'bathroomPhotos', 5)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Front Photos (max 5)</label>
                   <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'frontPhotos', 5)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Inside Photos (max 5)</label>
                   <input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, 'insidePhotos', 5)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-50 file:text-teal-700" />
                </div>
                <div className="bg-gray-50 p-4 border rounded">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Map Photo (max 1)</label>
                   <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'mapPhoto', 1)} className="w-full text-sm" />
                </div>
                <div className="bg-gray-50 p-4 border rounded">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Property Video (max 1)</label>
                   <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'propertyVideo', 1)} className="w-full text-sm" />
                </div>
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Legal Documents Photocopies (max 5)</label>
                   <input type="file" multiple accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'propertyDocuments', 5)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700" />
                </div>
             </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 6: Owner Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" name="ownerName" placeholder="Owner Name" onChange={handleChange} value={formData.ownerName} className="border p-3 rounded" />
               <input type="tel" name="contactNumber" placeholder="Contact Number" onChange={handleChange} value={formData.contactNumber} className="border p-3 rounded" />
               <input type="tel" name="whatsappNumber" placeholder="Whatsapp Number" onChange={handleChange} value={formData.whatsappNumber} className="border p-3 rounded" />
               <input type="email" name="ownerEmail" placeholder="Owner Email" onChange={handleChange} value={formData.ownerEmail} className="border p-3 rounded" />
             </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 7: Location</h3>
             <input type="text" name="address" placeholder="Strict Address Line" onChange={handleChange} value={formData.address} className="border p-3 rounded w-full" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" name="zipCode" placeholder="ZIP/Post Code" onChange={handleChange} value={formData.zipCode} className="border p-3 rounded" />
               <input type="text" name="cityLocation" placeholder="Location / City" onChange={handleChange} value={formData.cityLocation} className="border p-3 rounded" />
             </div>
             <textarea name="otherLocationDetails" placeholder="Other directional specifics" rows={2} onChange={handleChange} value={formData.otherLocationDetails} className="border p-3 rounded w-full"></textarea>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 8: Agent Details <span className="text-sm font-normal text-gray-500">(If applicable)</span></h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input type="text" name="agentName" placeholder="Agent Name" onChange={handleChange} value={formData.agentName} className="border p-3 rounded" />
               <input type="text" name="agentCode" placeholder="Agent Code" onChange={handleChange} value={formData.agentCode} className="border p-3 rounded" />
             </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 9: Furnished Amenities</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['TV Cable', 'AC', 'Gym', 'Swimming Pool', 'Washing Machine', 'Bed', 'Sofa', 'Refrigerator', 'Wifi', 'Other'].map(item => (
                 <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                   <input type="checkbox" checked={formData.furnishedAmenities.includes(item)} onChange={() => handleCheckboxArray('furnishedAmenities', item)} className="rounded" /> {item}
                 </label>
              ))}
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 10: Agreement Section</h3>
             <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 font-medium text-gray-800">
                <input type="checkbox" checked={formData.agreements.termsAgreed} onChange={() => handleAgreementCheck('termsAgreed')} className="w-5 h-5 text-teal-600 rounded" /> I agree to Terms and Conditions
              </label>
              <label className="flex items-center gap-3 font-medium text-gray-800">
                <input type="checkbox" checked={formData.agreements.allPhotosUploaded} onChange={() => handleAgreementCheck('allPhotosUploaded')} className="w-5 h-5 text-teal-600 rounded" /> Uploaded all real requested photos
              </label>
              <label className="flex items-center gap-3 font-medium text-gray-800">
                <input type="checkbox" checked={formData.agreements.agreementSigned} onChange={() => handleAgreementCheck('agreementSigned')} className="w-5 h-5 text-teal-600 rounded" /> Agreement Form Signed
              </label>
              <label className="flex items-center gap-3 font-medium text-gray-800">
                <input type="checkbox" checked={formData.agreements.documentsReceived} onChange={() => handleAgreementCheck('documentsReceived')} className="w-5 h-5 text-teal-600 rounded" /> Valid Legal Photocopies ready to be verified
              </label>
              <label className="flex items-center gap-3 font-medium text-gray-800">
                <input type="checkbox" checked={formData.agreements.commissionDiscussed} onChange={() => handleAgreementCheck('commissionDiscussed')} className="w-5 h-5 text-teal-600 rounded" /> Direct Platform Commission percentage discussed with Bhavyam staff
              </label>
            </div>
          </div>
        );
      case 11:
         return (
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Step 11: Questions & Review</h3>
             <textarea name="questions" placeholder="Do you (owner or agent) have any direct questions for Administration during review?" rows={3} onChange={handleChange} value={formData.questions} className="border p-3 rounded w-full"></textarea>
             <textarea name="otherNotes" placeholder="Any final private notes?" rows={3} onChange={handleChange} value={formData.otherNotes} className="border p-3 rounded w-full mt-4"></textarea>
          </div>
        );
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
       <div className="mb-8 flex flex-col pt-4">
         
         {/* Step Progress Bar visual representation loop */}
         <div className="hidden md:flex flex-row justify-between mb-8 overflow-hidden">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 mx-1 rounded-full overflow-hidden shrink-0 transition-colors ${currentStep > i ? 'bg-teal-500' : 'bg-gray-200'}`} />
            ))}
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

          <span className="text-sm font-semibold text-gray-400">Step {currentStep} of 11</span>

          {currentStep < 11 ? (
             <button 
               type="button" 
               onClick={nextStep} 
               className="px-6 py-2 bg-[#00b48f] text-white rounded-md hover:bg-teal-600 transition-all font-medium">
              Continue
             </button>
          ) : (
             <button 
               type="submit" 
               disabled={isSubmitting || !formData.agreements.termsAgreed}
               className="px-8 py-2 bg-[#00579e] text-white rounded-md hover:bg-[#00427a] disabled:opacity-50 transition-all font-medium shadow-md">
               {isSubmitting ? 'Uploading Data...' : 'Submit Property for Review'}
             </button>
          )}
       </div>
    </form>
  );
}
