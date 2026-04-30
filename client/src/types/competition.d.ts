interface CompetitionType {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

type StatusColor = {
  backgroundColor: string;
  textColor: string;
};

type CompetitionStatusInfo = {
  label: string;
  colors: StatusColor;
};

interface CompetitionResponse extends CompetitionType {
  competitions: Competition[];
}

interface Competition {
  id: string;
  competition_type_id: string;
  category_id: string;
  title: string;
  description: string;
  banner: string | null;
  start_date: string;
  end_date: string;
  slug: string;
  location: string;
  status: "draft" | "started" | "ended";
  category: Category;
  competition_type: CompetitionType;
  ticket_url: string
}
