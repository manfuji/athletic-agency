import AssignCollatorsHeader from '@/components/collators/AssignCollatorsHeader';
import AssignCollators from '@/components/collators/AssignCollators';

export default async function AssignCollatorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: competitionId } = await params;

  return (
    <div className="w-[75%] 2xl:w-[50%] px-4 py-6 ml-0 mr-auto">
      <AssignCollatorsHeader />
      <AssignCollators competitionId={competitionId} />
    </div>
  );
}
