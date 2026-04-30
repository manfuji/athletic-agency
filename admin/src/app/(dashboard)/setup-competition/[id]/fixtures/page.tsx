import TabbedAccordion from '@/components/fixtures/TabbedAccordion';
import FixturesHeader from '@/components/fixtures/FixturesHeader';

export default async function FixturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log('Rendering FixturesPage with ID:', id);

  return (
    <div className="w-[85%] px-4 py-6 ml-0 mr-auto">
      <FixturesHeader />
      <TabbedAccordion competitionId={id} />
    </div>
  );
}
