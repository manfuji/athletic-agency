export const dynamic = 'force-dynamic'
import TeamsHeader from '@/components/homepage/teams/TeamsHeader';
import TeamsTable from '@/components/homepage/teams/TeamsTable';
import { fetchAllTeams } from '@/actions/teams';

export default async function Teams() {
  const initialTeams = await fetchAllTeams();

  return (
    <div className="w-[95%] px-4 py-6 ml-0 mr-auto">
      <TeamsHeader />
      <TeamsTable initialTeams={initialTeams} />
    </div>
  );
}
