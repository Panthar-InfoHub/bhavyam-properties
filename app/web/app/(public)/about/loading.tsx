import PremiumLoader from '@/components/ui/PremiumLoader';

export default function Loading() {
  return (
    <PremiumLoader 
      messages={[
        "Loading Bhavyam story", 
        "Syncing values and mission", 
        "Almost ready"
      ]} 
      duration={1500}
    />
  );
}
