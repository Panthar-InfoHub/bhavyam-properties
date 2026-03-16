export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-24 pb-12">
      {children}
    </div>
  );
}
