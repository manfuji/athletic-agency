interface PlayerStats {
  id: string;
  profilePicture: string;
  slug: string;
  name: string;
  team: TeamInfo;
  position?: string;
}

interface Player {
  id: string;
  slug: string;
  profile_picture: string | null;
  name: string;
  nationality: string;
  team: TeamInfo;
  weight: string;
  height: string;
  position: string;
  preferred_foot: string;
  previous_experience: string;
  reason_for_joining: string;
}

interface PlayerDetails {
  data: {
    id: string;
    profile_picture: string;
    name: string;
    nationality: string;
    dob: string;
    team: TeamInfo;
    position?: string;
    preferred_foot?: string;
    weight?: string;
    height?: string;
    stats: {
      title: string;
      value: string | number;
    }[];
    sections: {
      title: string;
      content: string;
    }[];
  };
}
