"use server";

import { apiUrl } from "@/lib/constant";
import { fetchWrapper } from "@/lib/fetch-wrapper";

const EMPTY_PLAYER_PROFILE: PlayerDetails = {
  data: {
    id: "",
    profile_picture: "",
    name: "",
    nationality: "",
    dob: "",
    team: {
      id: "",
      logo: "",
      name: "",
    },
    stats: [],
    sections: [],
  },
};

export async function getPlayerProfile(id: string): Promise<PlayerDetails> {
  const url = apiUrl(`/api/player/${id}`);

  const response = await fetchWrapper<PlayerDetails>(url, {
    method: "GET",
  });
  
  if ("error" in response) {
    return {
      ...EMPTY_PLAYER_PROFILE,
      data: { ...EMPTY_PLAYER_PROFILE.data, id },
    };
  }

  return response;
}
