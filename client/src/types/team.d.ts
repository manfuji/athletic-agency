type StatsType = GoalStats | AssistStats | YellowCardStats | RedCardStats;

interface GoalStats extends PlayerStats {
  goalCount: number;
}

interface AssistStats extends PlayerStats {
  assistCount: number;
}

interface YellowCardStats extends PlayerStats {
  cardCount: number;
}

interface RedCardStats extends PlayerStats {
  cardCount: number;
}

type Stat = {
  label: string;
  value: number;
};

type StatsLeaders = {
  goals: GoalStats[];
  assists: AssistStats[];
  yellowCards: YellowCardStats[];
  redCards: RedCardStats[];
};

interface TeamStats {
  overallStats: Stat[];
  statsLeaders: StatsLeaders;
}

interface TeamProfile {
  id: string;
  category_id: string;
  logo: string;
  coverPhoto: string;
  name: string;
  description: string;
  slug: string;
  category: Category;
  players: {
    position: Player[];
  };
  stats: {
    wins: number;
    draws: number;
    losses: number;
  };
}

interface Team {
  id: string;
  logo: string;
  name: string;
  slug: string;
  score?: number | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface TeamPagination {
  current_page: number;
  data: Team[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

type TeamInfo = Omit<Team, "slug">;

interface Category {
  id: string;
  name: string;
}
