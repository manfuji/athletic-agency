import CollatorsHeader from '@/components/collators/CollatorsHeader';
import CollatorsTable from '@/components/collators/CollatorsTable';

export default function Collators() {
  return (
    <div className="w-[90%] px-4 py-6 ml-0 mr-auto">
      <CollatorsHeader />
      <CollatorsTable />
    </div>
  );
}
