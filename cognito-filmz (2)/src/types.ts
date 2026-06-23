export interface Movie {
  id: string; // Dynamic ID slug (e.g., "interstellar-157336" or standard TMDB ID)
  title: string;
  year: string;
  type: "movie" | "tv";
  tmdbId: number;
  imdbId?: string;
  rating: number; // 0-10 rating
  genre: string[];
  overview: string;
  posterUrl?: string; // TMDB image URL
  backdropUrl?: string; // TMDB image URL
  runtime?: string; // e.g., "169 min" or "2 Seasons"
  tagline?: string;
  cast?: string[];
  director?: string;
}

export interface ContinueWatchingItem {
  movie: Movie;
  season?: number;
  episode?: number;
  percent: number; // 0 to 100 watched
  elapsedSeconds: number; // exact second watched last
  durationSeconds: number; // total duration in seconds
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string; // Hex or tailwind color name
  watchlistIds: string[];
  watchlistMovies: Movie[];
  continueWatching: ContinueWatchingItem[];
}

export interface UserAccount {
  id: string;
  email: string;
  passwordPlain: string; // we'll use a simple password model for the dynamic prototype
  profiles: UserProfile[];
}

export interface CuratedSections {
  trending: Movie[];
  popular: Movie[];
  classics: Movie[];
  scifi: Movie[];
  drama: Movie[];
}

