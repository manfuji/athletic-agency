interface StatCardProps {
  value: string | number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg text-center border border-[#D0D5DD]">
      <p className="text-xl font-semibold font-evogria">{value}</p>
      <p className="text-sm text-gray-600 font-evogria">{label}</p>
    </div>
  );
}
