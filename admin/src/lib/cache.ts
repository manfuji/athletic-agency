import { Fixture } from '@/types/fixtures';

const fixtureCache: { [competitionId: string]: { [date: string]: Fixture[] } } =
  {};

export const getCachedFixtures = (competitionId: string) =>
  fixtureCache[competitionId] || {};
export const setCachedFixtures = (
  competitionId: string,
  fixtures: { [date: string]: Fixture[] }
) => {
  fixtureCache[competitionId] = fixtures;
};
