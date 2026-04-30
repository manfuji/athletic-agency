"use server";

import { cmsUrl } from "@/lib/constant";
import { fetchWrapper } from "@/lib/fetch-wrapper";

const EMPTY_VIDEO_ITEM: VideoLibrary = {
  id: "",
  title: "",
  slug: "",
  type: "url",
  video_source: "",
  video_url: null,
  media_file: null,
  thumbnail: null,
  description: null,
  published_at: new Date(0).toISOString(),
  is_highlight: false,
  duration: null,
  duration_formatted: null,
  competition: null,
  category: {
    id: "",
    name: "",
  },
  meta_title: null,
  meta_description: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

const EMPTY_LIVE_VIDEO_ITEM: LiveVideo = {
  id: "",
  title: "",
  slug: "",
  description: null,
  stream_url: "",
  thumbnail: null,
  status: "scheduled",
  scheduled_at: new Date(0).toISOString(),
  started_at: null,
  ended_at: null,
  published_at: new Date(0).toISOString(),
  is_live: false,
  is_scheduled: true,
  is_ended: false,
  competition: null,
  category: {
    id: "",
    name: "",
  },
  meta_title: null,
  meta_description: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export async function getSingleVideo(slug: string): Promise<VideoResponse> {
  const url = cmsUrl(`/cms/videos/${slug}`);

  const response = await fetchWrapper<VideoResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { data: { ...EMPTY_VIDEO_ITEM, slug } };
  }
  return response;
}

export async function getVideos(): Promise<VideosListResponse> {
  const url = cmsUrl("/cms/videos");

  const response = await fetchWrapper<VideosListResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { data: [] };
  }
  return response;
}

export async function getLiveVideosByDate(
  date: string
): Promise<LiveVideosListResponse> {
  const url = cmsUrl(`/cms/live-videos/date?date=${date}`);

  const response = await fetchWrapper<LiveVideosListResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { data: [] };
  }
  return response;
}
export async function getSingleLiveVideo(
  slug: string
): Promise<LiveVideoResponse> {
  const url = cmsUrl(`/cms/live-videos/${slug}`);

  const response = await fetchWrapper<LiveVideoResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { data: { ...EMPTY_LIVE_VIDEO_ITEM, slug } };
  }
  return response;
}

export async function getLiveVideosCalendar(): Promise<LiveVideoCalendarResponse> {
  const url = cmsUrl("/cms/live-videos/calendar");

  const response = await fetchWrapper<LiveVideoCalendarResponse>(url, {
    method: "GET",
  });
  if ("error" in response) {
    return { data: [] };
  }
  return response;
}
