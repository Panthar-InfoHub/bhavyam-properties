import PropertySubmissionForm from '@/components/property/PropertySubmissionForm';

export default function SubmitPropertyPage() {
  return (
    <div className="flex-1 w-full bg-[#f4f7f6] py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Submit a Property</h1>
        <p className="text-gray-600 mb-8">
          Fill out the multi-step form detailing your property to submit it for admin review.
        </p>

        <PropertySubmissionForm />
      </div>
    </div>
  );
}
