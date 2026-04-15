import PremiumLoader from '@/components/ui/PremiumLoader';

export default function Loading() {
  return (
    <PremiumLoader 
      messages={[
        "Fetching property details", 
        "Optimizing high-res media", 
        "Parsing local area insights",
        "Almost there..."
      ]} 
      duration={2500}
    />
  );
}
