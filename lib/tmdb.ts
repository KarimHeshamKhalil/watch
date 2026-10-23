import { cacheLife } from "next/cache";

const API = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

if (!KEY) {
  throw new Error("TMDB_API_KEY is not set");
}

const imgBase = "https://image.tmdb.org/t/p";

export function imgUrl(path: string | null, size: string): string | null {
  if (!path) return null;
  return `${imgBase}/${size}${path.startsWith("/") ? path : `/${path}`}`;
}

export type MediaType = "movie" | "tv";

export type MediaItem = {
  id: number;
  mediaType: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  date: string | null;
};

export type ListResult = {
  items: MediaItem[];
  loadedAll: boolean;
};

type RawListItem = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string | null;
  first_air_date?: string | null;
};

function mapItem(raw: RawListItem): MediaItem | null {
  const mediaType =
    raw.media_type === "movie" || raw.media_type === "tv"
      ? raw.media_type
      : raw.title !== undefined
        ? "movie"
        : raw.name !== undefined
          ? "tv"
          : null;
  if (!mediaType) return null;
  const title = mediaType === "movie" ? raw.title : raw.name;
  if (!title) return null;
  return {
    id: raw.id,
    mediaType,
    title,
    poster: raw.poster_path ?? null,
    backdrop: raw.backdrop_path ?? null,
    rating: raw.vote_average ?? 0,
    date: mediaType === "movie" ? raw.release_date ?? null : raw.first_air_date ?? null,
  };
}

interface RawListResponse {
  results: RawListItem[];
  total_results: number;
}

async function tmdbList(path: string, params = "", page = 1): Promise<ListResult> {
  const res = await fetch(
    `${API}${path}?api_key=${KEY}&language=en-US&page=${page}${params}`,
  );
  if (!res.ok) return { items: [], loadedAll: true };
  const data = (await res.json()) as RawListResponse;
  const items = data.results
    .map(mapItem)
    .filter((i): i is MediaItem => i !== null);
  return { items, loadedAll: page * 20 >= data.total_results };
}

export async function getTrendingAll(
  period: "day" | "week" = "day",
): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  return (await tmdbList(`/trending/all/${period}`)).items;
}

export async function getMovieList(
  path: string,
  params = "",
): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  return (await tmdbList(path, params)).items;
}

export async function getTVList(path: string): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  return (await tmdbList(path)).items;
}

export async function getDiscover(
  type: MediaType,
  genre: number,
  page: number,
): Promise<ListResult> {
  "use cache";
  cacheLife("hours");
  return tmdbList(
    `/discover/${type}`,
    `${genre ? `&with_genres=${genre}` : ""}&sort_by=popularity.desc&include_adult=false`,
    page,
  );
}

export async function getGenreList(
  type: MediaType,
): Promise<{ id: number; name: string }[]> {
  "use cache";
  cacheLife("weeks");
  const res = await fetch(`${API}/genre/${type}/list?api_key=${KEY}&language=en-US`);
  if (!res.ok) return [];
  const data = (await res.json()) as { genres: { id: number; name: string }[] };
  return data.genres;
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  const q = encodeURIComponent(query.trim());
  if (!q) return [];
  return (await tmdbList("/search/multi", `&query=${q}&include_adult=false`)).items;
}

/* -------- details -------- */

type RawDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  tagline?: string | null;
  release_date?: string;
  first_air_date?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  status: string;
  budget?: number;
  revenue?: number;
  seasons?: SeasonSummary[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
};

export type Details = {
  id: number;
  type: MediaType;
  title: string;
  tagline: string | null;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  date: string | null;
  runtime: number | null;
  status: string;
  genres: { id: number; name: string }[];
  cast: { id: number; name: string; character: string; profile: string | null }[];
  seasons: SeasonSummary[] | null;
};

function mapDetails(raw: RawDetails, type: MediaType): Details {
  return {
    id: raw.id,
    type,
    title: raw.title ?? raw.name ?? "Untitled",
    tagline: raw.tagline || null,
    overview: raw.overview,
    poster: raw.poster_path,
    backdrop: raw.backdrop_path,
    rating: raw.vote_average,
    date: raw.release_date ?? raw.first_air_date ?? null,
    runtime: raw.runtime ?? raw.episode_run_time?.[0] ?? null,
    status: raw.status,
    genres: raw.genres,
    cast: (raw.credits?.cast ?? []).slice(0, 6).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile: c.profile_path,
    })),
    seasons: raw.seasons
      ? raw.seasons.filter((s) => s.season_number > 0 && s.episode_count > 0)
      : null,
  };
}

export async function getMovieDetails(id: number): Promise<Details | null> {
  "use cache";
  cacheLife("days");
  const res = await fetch(
    `${API}/movie/${id}?api_key=${KEY}&language=en-US&append_to_response=credits`,
  );
  if (!res.ok) return null;
  return mapDetails((await res.json()) as RawDetails, "movie");
}

export async function getTVDetails(id: number): Promise<Details | null> {
  "use cache";
  cacheLife("days");
  const res = await fetch(
    `${API}/tv/${id}?api_key=${KEY}&language=en-US&append_to_response=credits`,
  );
  if (!res.ok) return null;
  return mapDetails((await res.json()) as RawDetails, "tv");
}

export async function getSimilar(
  type: MediaType,
  id: number,
): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  return (await tmdbList(`/${type}/${id}/recommendations`)).items;
}

/* -------- seasons / episodes -------- */

export type SeasonSummary = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster: string | null;
  air_date: string | null;
};

type RawEpisode = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  runtime: number | null;
  air_date: string | null;
  vote_average: number;
};

export type Episode = {
  id: number;
  name: string;
  overview: string;
  number: number;
  season: number;
  still: string | null;
  runtime: number | null;
  date: string | null;
  rating: number;
};

type RawSeason = {
  episodes: RawEpisode[];
};

function mapEpisode(raw: RawEpisode): Episode {
  return {
    id: raw.id,
    name: raw.name,
    overview: raw.overview,
    number: raw.episode_number,
    season: raw.season_number,
    still: raw.still_path,
    runtime: raw.runtime,
    date: raw.air_date,
    rating: raw.vote_average,
  };
}

export async function getSeason(
  tvId: number,
  season: number,
): Promise<Episode[]> {
  "use cache";
  cacheLife("weeks");
  const res = await fetch(
    `${API}/tv/${tvId}/season/${season}?api_key=${KEY}&language=en-US`,
  );
  if (!res.ok) return [];
  const data = (await res.json()) as RawSeason;
  return data.episodes.map(mapEpisode);
}
