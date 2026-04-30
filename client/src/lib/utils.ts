import {
  format,
  formatDistanceToNowStrict,
  parseISO,
  startOfDay,
} from "date-fns";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeData(data: MediaData) {
  return {
    title: data?.title,
    videoUrl: data?.live_video_url || data?.video_url || data?.stream_url,
    image: data?.cover_image || data?.thumbnail,
    category: data?.category?.name,
    date: data?.published_at,
    type: data?.type,
    mediaFile: data?.media_file,
  };
}

export function TimeAgo(date: string) {
  if (!date) return;
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function FullDate(date: string) {
  if (!date) return;
  return format(new Date(date), "EEEE d MMMM yyyy HH:mm");
}

export function DayDate(date: string) {
  if (!date) return;
  return format(new Date(date), "EEEE do LLLL");
}

export function formatTimeToGMT(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes} GMT`;
}

export function getYouTubeId(url: string | null): string | null {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|embed\/|shorts\/))([^?&/]+)/;
  const match = url?.match(regex);
  return match ? match[1] : null;
}

export function getStatColor(label: string): string {
  const colors: Record<string, string> = {
    wins: "#12B76A",
    draws: "#F79009",
    losses: "#F04438",
  };

  return colors[label.toLowerCase()] || "#000000";
}

export function dobFormat(dob?: string): string | undefined {
  if (!dob) return;
  const [year, month, day] = dob.split("-");
  return `${day}/${month}/${year}`;
}

// Register English locale
countries.registerLocale(enLocale);

export const getCountryCode = (nationality: string): string => {
  if (!nationality) return "unknown";
  const normalizedNationality = nationality.toLowerCase().trim();
  if (
    normalizedNationality.length === 2 &&
    countries.isValid(normalizedNationality)
  ) {
    return normalizedNationality;
  }
  const countryEntry = Object.entries(
    countries.getNames("en", { select: "official" })
  ).find(([, name]) => name.toLowerCase() === normalizedNationality);
  const code = countryEntry ? countryEntry[0].toLowerCase() : "unknown";
  return code;
};

export const getCountryName = (nationality: string): string => {
  if (!nationality) return "unknown";
  const normalizedNationality = nationality.toLowerCase().trim();
  if (
    normalizedNationality.length === 2 &&
    countries.isValid(normalizedNationality)
  ) {
    const name = countries.getName(normalizedNationality, "en", {
      select: "official",
    });
    return name || nationality;
  }
  const countryEntry = Object.entries(
    countries.getNames("en", { select: "official" })
  ).find(([, name]) => name.toLowerCase() === normalizedNationality);
  return countryEntry ? countryEntry[1] : nationality;
};

// added function to get team name with fallback
export const getTeamName = (team: string): string => {
  if (!team) return "Unknown Team";
  return team;
};

export const getImage = (asset: string, placeHolder: string): string => {
  if (!asset) return placeHolder;

  // If asset is a placeholder URL, use the fallback instead
  if (asset.includes("via.placeholder.com") || asset.includes("placeholder")) {
    return placeHolder;
  }

  // If asset is already a full URL (starts with http:// or https://), return it as is
  if (asset.startsWith("http://") || asset.startsWith("https://")) {
    return asset;
  }

  let decodedAsset = asset;
  try {
    if (asset.includes("%")) {
      decodedAsset = decodeURIComponent(asset);
    }
  } catch {
    // Ignore decode error
  }

  const encodedAsset = decodedAsset.split("/").map(part => encodeURIComponent(part)).join("/");

  return `${process.env.NEXT_PUBLIC_STORAGE_URL}/${encodedAsset}`;
};

export function formatDateRangeWithOrdinal(
  startDate: string,
  endDate: string
): string {
  if (!startDate || !endDate) return "";

  const start = format(new Date(startDate), "do MMM");
  const end = format(new Date(endDate), "MMMM do yyyy");

  return `${start} - ${end}`;
}

export function getCompetitionStatusInfo(
  status: string
): CompetitionStatusInfo {
  const statusMap: Record<string, CompetitionStatusInfo> = {
    draft: {
      label: "Upcoming",
      colors: { backgroundColor: "#F0F9FF", textColor: "#026AA2" },
    },
    started: {
      label: "Started",
      colors: { backgroundColor: "#ECFDF3", textColor: "#027A48" },
    },
    ended: {
      label: "Ended",
      colors: { backgroundColor: "#FEF3F2", textColor: "#B42318" },
    },
  };

  return (
    statusMap[status.toLowerCase()] || {
      label: "Unknown",
      colors: { backgroundColor: "#FFFFFF", textColor: "#000000" },
    }
  );
}

export const getClientHtmlContent = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.innerHTML;
};

export function formatAsYYYYMMDD(date: Date | string | undefined) {
  if (!date) return;
  return format(date ?? new Date(), "yyyy-MM-dd");
}

export function liveVideoStatus(
  data: Pick<LiveVideo, "scheduled_at" | "status" | "title" | "slug">[]
) {
  const modifiers = {
    live: data
      ?.filter((item) => item.status === "live")
      .map((item) => startOfDay(parseISO(item.scheduled_at))),
    ended: data
      ?.filter((item) => item.status === "ended")
      .map((item) => startOfDay(parseISO(item.scheduled_at))),
    scheduled: data
      ?.filter((item) => item.status === "scheduled")
      .map((item) => startOfDay(parseISO(item.scheduled_at))),
  };

  return modifiers;
}
