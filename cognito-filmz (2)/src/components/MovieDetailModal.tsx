import { useState, useEffect, useRef } from "react";
import { Movie } from "../types";
import { X, Play, Pause, Star, Clock, User, Film, Bookmark, BookmarkCheck, Share2, Sparkles, RefreshCw, Maximize2, AlertTriangle, HelpCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getMockEpisodes } from "../fallbackData";

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  watchlist: string[];
  onToggleWatchlist: (movieId: string) => void;
  onSetContinueWatching: (movie: Movie, season?: number, episode?: number, elapsedSeconds?: number, durationSeconds?: number) => void;
  continueWatching?: any[];
  profileId?: string;
  theme: string;
}

// Active multiple embed sources with varied API paths for ultimate streaming resilience
const embedSources = [
  { 
    name: "VidSrc.me (Official)", 
    urlMovie: "https://vidsrc.me/embed/movie?tmdb=", 
    urlTV: "https://vidsrc.me/embed/tv?tmdb=",
    type: "params" 
  },
  { 
    name: "VidSrc.cc (Highly Resilient)",
    urlMovie: "https://vidsrc.cc/v2/embed/movie/",
    urlTV: "https://vidsrc.cc/v2/embed/tv/",
    type: "path_to"
  },
  { 
    name: "VidSrcme (ru Mirror/Live)", 
    urlMovie: "https://vidsrcme.ru/embed/movie?tmdb=", 
    urlTV: "https://vidsrcme.ru/embed/tv?tmdb=",
    type: "params" 
  }
];

export default function MovieDetailModal({
  movie,
  onClose,
  watchlist,
  onToggleWatchlist,
  onSetContinueWatching,
  continueWatching,
  profileId,
  theme
}: MovieDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStandaloneFullscreen, setIsStandaloneFullscreen] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [customTmdbId, setCustomTmdbId] = useState<string>("");
  const [isIframe, setIsIframe] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  // Accurate dynamic television screenplay list syncing state
  interface EpisodeInfo {
    episode_number: number;
    name: string;
    overview?: string;
    runtime?: number;
  }
  const [episodesList, setEpisodesList] = useState<EpisodeInfo[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Use the theme directly from props rather than expensive localStorage intervals

  // Extract season volume count safely from movie details or fall back to standard TV series density
  const getSeasonsCount = () => {
    if (movie.type !== "tv") return 0;
    if (!movie.runtime) return 1;
    const match = movie.runtime.match(/(\d+)\s+Season/i);
    if (match) {
      return parseInt(match[1]) || 1;
    }
    return 5; // Default fallback density
  };
  const totalSeasons = getSeasonsCount();

  // Load initial episode/season details from profile watched-resumes when movie changes
  useEffect(() => {
    setIsPlaying(false);
    setIsStandaloneFullscreen(false);
    setSelectedSourceIdx(0);
    setCustomTmdbId(movie.tmdbId || "");

    let initialSeason = 1;
    let initialEpisode = 1;

    try {
      if (continueWatching) {
        const match = continueWatching.find((item: any) => item.movie.id === movie.id);
        if (match) {
          if (match.season) initialSeason = match.season;
          if (match.episode) initialEpisode = match.episode;
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSeason(initialSeason);
    setEpisode(initialEpisode);
  }, [movie.id, profileId]);

  // Fetch season episodes dynamically from Flixr TV guide service
  useEffect(() => {
    if (movie.type !== "tv") return;

    let isMounted = true;
    setIsLoadingEpisodes(true);

    const tmdbIdToUse = customTmdbId || movie.tmdbId || "";
    const fetchUrl = `/api/tv/${tmdbIdToUse}/season/${season}?showTitle=${encodeURIComponent(movie.title)}`;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch episodes");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && Array.isArray(data.episodes)) {
          setEpisodesList(data.episodes);
          // Auto-adjust episode index if we load into an invalid state
          if (episode > data.episodes.length && data.episodes.length > 0) {
            setEpisode(1);
          }
        }
      })
      .catch((err) => {
        console.warn("[Flixr Hub] Resorting to local episode guide fallback:", err);
        const fallbackEpisodes = getMockEpisodes(season, movie.title);
        if (isMounted) {
          setEpisodesList(fallbackEpisodes.episodes);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingEpisodes(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie.id, customTmdbId, movie.tmdbId, season]);

  // In Watchlist boolean
  const isBookmarked = watchlist.includes(movie.id);

  // Detect iframe context on mount
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }
  }, []);

  const activeSource = embedSources[selectedSourceIdx];

  // Helper to construct player iframe URL depending on the source type
  const getPlayerUrl = () => {
    const tmdbIdToUse = customTmdbId || movie.tmdbId;
    const pId = profileId || "default";
    let baseUrl = "";
    if (movie.type === "movie") {
      if (activeSource.type === "params") {
        baseUrl = `${activeSource.urlMovie}${tmdbIdToUse}`;
      } else if (activeSource.type === "multiembed") {
        baseUrl = `${activeSource.urlMovie}${tmdbIdToUse}&tmdb=1`;
      } else {
        baseUrl = `${activeSource.urlMovie}${tmdbIdToUse}`;
      }
    } else {
      // TV Series
      if (activeSource.type === "params") {
        baseUrl = `${activeSource.urlTV}${tmdbIdToUse}&season=${season}&episode=${episode}`;
      } else if (activeSource.type === "multiembed") {
        baseUrl = `${activeSource.urlTV}${tmdbIdToUse}&tmdb=1&s=${season}&e=${episode}`;
      } else {
        baseUrl = `${activeSource.urlTV}${tmdbIdToUse}/${season}/${episode}`;
      }
    }
    // Append unique profile parameter to isolate browser localStorage/indexedDB state across different user profiles
    const connector = baseUrl.includes("?") ? "&" : "?";
    let finalUrl = `${baseUrl}${connector}_u=${pId}`;
    // Add common force-start parameters utilized by embed providers
    finalUrl += "&start=0&time=0&seek=0&t=0&initialTime=0&playback=0";
    return finalUrl;
  };

  const handleStartPlaying = () => {
    setIsPlaying(true);
    onSetContinueWatching(
      movie,
      movie.type === "tv" ? season : undefined,
      movie.type === "tv" ? episode : undefined,
      0,
      100
    );
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      const prevEp = episode - 1;
      setEpisode(prevEp);
      onSetContinueWatching(movie, season, prevEp, 0, 100);
    } else if (season > 1) {
      const prevSeason = season - 1;
      setSeason(prevSeason);
      setEpisode(1);
      onSetContinueWatching(movie, prevSeason, 1, 0, 100);
    }
  };

  const handleNextEpisode = () => {
    const maxEp = episodesList.length > 0 ? episodesList.length : 12;
    if (episode < maxEp) {
      const nextEp = episode + 1;
      setEpisode(nextEp);
      onSetContinueWatching(movie, season, nextEp, 0, 100);
    } else {
      // Loop into the next season if available
      if (season < totalSeasons) {
        const nextSeason = season + 1;
        setSeason(nextSeason);
        setEpisode(1);
        onSetContinueWatching(movie, nextSeason, 1, 0, 100);
      }
    }
  };

  // Create clean sharable URL
  const handleShare = () => {
    const text = `Currently watching ${movie.title} on Flixr! Stream it now at:`;
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: text,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Direct copy fallback
      navigator.clipboard.writeText(`${window.location.href}?id=${movie.id}`);
      alert("Flixr Movie Live Link copied to clipboard!");
    }
  };

  // Detect future releases to display helpful heads-up flags
  const currentYearNum = new Date().getFullYear();
  const movieYearNum = parseInt(movie.year) || 0;
  const isFutureOrUnreleased = movieYearNum >= currentYearNum || movie.year === "2026";

  // Immersive In-App Standalone Cinematic Player
  if (isStandaloneFullscreen) {
    return (
      <div 
        id="standalone-theater" 
        className="fixed inset-0 z-[60] bg-[#080808] flex flex-col w-screen h-screen overflow-hidden text-[#FDFDFC] animate-fade-in font-sans"
      >
        {/* Top Control Bar with Source selectors and controls */}
        <div className="bg-[#121212]/95 border-b border-white/10 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 backdrop-blur-md shrink-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-400" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#FDFDFC]/70">Cinématique In-App Standalone Deck</span>
            </div>
            <h2 className="text-sm font-semibold truncate pr-4 text-white">
              {movie.title} <span className="text-neutral-500 font-normal">({movie.year})</span>
            </h2>
          </div>

          {/* Controls & Server Source Chooser inline in stand-alone player header */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Source dropdown inside Standalone Player for easy fallback swaps */}
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-2.5 py-1">
              <span className="text-[9px] font-mono uppercase text-neutral-400">Stream Source:</span>
              <select
                value={selectedSourceIdx}
                onChange={(e) => setSelectedSourceIdx(Number(e.target.value))}
                className="bg-black text-[10px] text-white font-mono px-2 py-1 outline-none border border-white/10 cursor-pointer focus:ring-1 focus:ring-white"
              >
                {embedSources.map((s, idx) => (
                  <option key={idx} value={idx}>{s.name}</option>
                ))}
              </select>
            </div>

            {movie.type === "tv" && (
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider">
                <span className="text-white">Vol {season}</span>
                <span className="text-white/30">&bull;</span>
                <span className="text-white">Ch {episode}</span>
              </div>
            )}

            <a
              href={getPlayerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/15 text-white font-mono font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest border border-white/15 transition-all rounded-none flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Open player in a clean, unsandboxed standalone browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>External Stream ↗</span>
            </a>

            <button
              onClick={() => setIsStandaloneFullscreen(false)}
              className="bg-white/5 hover:bg-white/10 text-white font-mono font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 transition-all rounded-none flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Minimize</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#FAF9F6] text-black border border-white/20 hover:bg-rose-600 hover:text-[#FAF9F6] font-mono font-bold px-4 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-none flex items-center space-x-1.5 cursor-pointer shadow-sm"
              aria-label="Exit movie stream fully"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Deck</span>
            </button>
          </div>
        </div>

        {/* Dynamic Screen Viewport */}
        <div className="flex-1 bg-black relative flex items-center justify-center">
          <iframe
            key={`${season}-${episode}-${selectedSourceIdx}`}
            src={getPlayerUrl()}
            className="w-full h-full border-0 absolute inset-0 bg-black"
            allowFullScreen
            referrerPolicy="origin"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            title={`${movie.title} Immersive Standalone Player`}
          />
        </div>



        {/* Sandbox explanation & troubleshooting info banner */}
        <div className="bg-[#141414] border-t border-white/5 py-2 px-6 flex items-center justify-center space-x-2 text-[10px] font-mono text-neutral-400">
          <HelpCircle className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span>Security restriction from standard frame? Press the <strong>"External Stream ↗"</strong> trigger to view standard playback in a standalone page.</span>
        </div>

        {/* Standalone Player Advice Banner (Unreleased alert to help users) */}
        {isFutureOrUnreleased && (
          <div className="bg-[#1C1A16] border-t border-[#E0A96D]/15 py-2 px-6 flex items-center justify-center space-x-2 text-[10px] font-mono text-[#E0A96D]/80 text-center">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Note: "{movie.title}" is a scheduled {movie.year} release. If active servers claim "unavailable", try alternative streams or released titles.</span>
          </div>
        )}

        {/* Bottom Control & Steering Deck */}
        <div className="bg-[#121212]/95 border-t border-white/10 p-5 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md shrink-0">
          {movie.type === "tv" ? (
            <div className="flex items-center space-x-3 w-full md:w-auto justify-center">
              <button
                onClick={handlePrevEpisode}
                className="bg-[#1A1A1A] hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-[#1A1A1A] text-white border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center space-x-1.5"
                disabled={season === 1 && episode === 1}
              >
                <span>&larr; Prev Episode</span>
              </button>
              
              <div className="flex items-center space-x-2 font-mono text-[11px] bg-white/5 px-4 py-3 border border-white/5">
                <span className="text-zinc-200 font-bold">S{season}</span>
                <span className="text-neutral-500">/</span>
                <span className="text-zinc-200 font-bold">E{episode}</span>
              </div>

              <button
                onClick={handleNextEpisode}
                className="bg-[#1A1A1A] hover:bg-neutral-800 text-white border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>Next Episode &rarr;</span>
              </button>
            </div>
          ) : (
            <div className="text-[10px] font-mono tracking-wider text-[#FDFDFC]/50 uppercase flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
              <span>Cinema Screening: Standalone Mode</span>
            </div>
          )}

          <div className="flex items-center space-x-6 justify-center w-full md:w-auto">
            <div className="text-[9px] font-mono text-[#FDFDFC]/40 uppercase tracking-widest hidden lg:block">
              Server: {activeSource.name} &bull; Native High Res Embed
            </div>
            <button
              onClick={() => onToggleWatchlist(movie.id)}
              className="border border-[#FDFDFC]/25 hover:bg-white/10 text-[#FDFDFC] px-5 py-2.5 text-[10px] font-bold tracking-widest transition cursor-pointer font-mono uppercase"
            >
              {isBookmarked ? "Saved in Watchlist" : "Save Film Entry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-fade-in transition-colors duration-500 bg-black/60`}>
      {/* Container Grid with Editorial aesthetic (absolute flat edges, sharp borders, warm off-white bg) */}
      <div 
        id="detail-modal"
        className={`relative w-full max-w-5xl rounded-none h-full sm:h-[90vh] max-h-full sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-500 border ${
          isDark 
            ? "bg-[#09090b] border-white/8 text-zinc-100 shadow-zinc-950/80" 
            : "bg-[#FDFDFC] border-[#1A1A1A]/15 text-[#1A1A1A] shadow-black/10"
        }`}
      >
        {/* Editorial Top Status Bar with Close Trigger */}
        <div className={`px-6 py-3 border-b flex items-center justify-between shrink-0 select-none z-10 transition-colors duration-500 ${
          isDark 
            ? "bg-[#18181b] text-zinc-100 border-b border-white/5" 
            : "bg-[#1A1A1A] text-[#FDFDFC] border-[#FAF9F5]/10"
        }`}>
          <div className="flex items-center space-x-3 text-[10px] font-mono uppercase tracking-widest opacity-80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold">FLIXR DIRECT STREAM</span>
            <span className="opacity-50">&bull;</span>
            <span className="italic lowercase">playing:</span>
            <span className="font-semibold drop-shadow-sm font-serif italic normal-case text-xs">{movie.title}</span>
          </div>

          <button
            onClick={onClose}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition ${
              isDark 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                : "bg-white/5 border border-white/15 hover:bg-white/15 text-white"
            }`}
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close Deck</span>
          </button>
        </div>

        {/* Scrollable Body Deck Panel */}
        <div className="flex-1 overflow-y-auto">
          {/* Streaming Theater / Backdrop Stage */}
          <div className="w-full relative aspect-video bg-neutral-950 flex items-center justify-center">
          {isPlaying ? (
            <div className="absolute inset-0 w-full h-full bg-neutral-950 flex flex-col">
              {/* Dynamic top-bar providing standalone launch options inside the app */}
              <div className="bg-[#111111] text-[9px] sm:text-[10px] font-mono py-2.5 px-4 flex items-center justify-between text-[#FDFDFC]/70 border-b border-white/5 shrink-0 z-10">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-none bg-neutral-400" />
                  <span>STREAMING SOURCE:</span>
                  <select
                    value={selectedSourceIdx}
                    onChange={(e) => setSelectedSourceIdx(Number(e.target.value))}
                    className="bg-black text-[#FDFDFC]/90 font-mono text-[9px] px-2 py-0.5 outline-none border border-white/10 cursor-pointer focus:ring-1 focus:ring-white"
                  >
                    {embedSources.map((s, idx) => (
                      <option key={idx} value={idx}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="hidden md:inline text-neutral-400">Sandbox blockage?</span>
                  <a
                    href={getPlayerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 hover:bg-white/15 border border-white/15 text-white font-bold px-3 py-1 text-[9px] uppercase tracking-widest transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    title="Open stream in clean external browser tab"
                  >
                    <ExternalLink className="w-3 h-3 text-white" />
                    <span>External Stream ↗</span>
                  </a>
                  <button 
                    onClick={() => {
                      setIsStandaloneFullscreen(true);
                      onSetContinueWatching(movie, movie.type === "tv" ? season : undefined, movie.type === "tv" ? episode : undefined, 0, 100);
                    }}
                    className="bg-[#FDFDFC] hover:bg-[#F5F5F0] text-[#1A1A1A] font-bold px-3 py-1 text-[9px] uppercase tracking-widest transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3 text-[#1A1A1A]" />
                    <span>Open Standalone ⛶</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 relative w-full h-full bg-black overflow-hidden flex flex-col">
                <iframe
                  src={getPlayerUrl()}
                  className="w-full h-full border-0 bg-black flex-1"
                  allowFullScreen
                  referrerPolicy="origin"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                  title={`${movie.title} Stream Player`}
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col justify-end bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-[#1A1A1A]/20">
              {/* Backdrop image */}
              <img
                src={movie.backdropUrl}
                alt={movie.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200";
                }}
              />

              <div className="relative p-6 sm:p-10 flex flex-col items-start space-y-4 max-w-2xl text-[#FDFDFC]">
                <span className="text-[9px] font-mono tracking-widest text-[#FDFDFC]/80 uppercase flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-none border border-white/20">
                  <Film className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>{movie.type.toUpperCase()}</span>
                </span>

                <h1 className="text-3xl sm:text-5xl font-serif italic text-[#FDFDFC] font-light tracking-tight leading-none mb-1">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="text-xs sm:text-sm text-[#FDFDFC]/80 italic font-mono font-light">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap gap-3 items-center pt-2">
                  <button
                    onClick={handleStartPlaying}
                    className="flex items-center space-x-2 bg-[#FDFDFC] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-none hover:bg-[#F5F5F0] transition shadow-md shrink-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-[#1A1A1A]" />
                    <span>Watch {movie.type === "tv" ? `S${season} E${episode}` : "Now"}</span>
                  </button>

                  <a
                    href={getPlayerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      onSetContinueWatching(movie, movie.type === "tv" ? season : undefined, movie.type === "tv" ? episode : undefined, 0, 100);
                    }}
                    className="flex items-center space-x-2 bg-transparent border border-white/35 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-none hover:bg-white/10 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                    <span>Watch in New Tab ↗</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsStandaloneFullscreen(true);
                      handleStartPlaying();
                    }}
                    className="flex items-center space-x-2 bg-[#1A1A1A]/90 hover:bg-[#2A2A2A] text-[#FDFDFC] border border-white/15 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-none transition cursor-pointer shadow-md"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                    <span>Standalone</span>
                  </button>

                  <button
                    onClick={() => onToggleWatchlist(movie.id)}
                    className="flex items-center space-x-2 bg-[#1A1A1A]/80 backdrop-blur border border-white/20 text-[#FDFDFC] font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-none hover:bg-[#1A1A1A] transition cursor-pointer"
                  >
                    {isBookmarked ? (
                       <>
                        <BookmarkCheck className="w-4 h-4 text-white fill-white" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Add Film</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center bg-white/15 hover:bg-white/25 text-[#FDFDFC] p-3.5 rounded-none transition border border-white/20 cursor-pointer"
                    title="Share stream connection"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Controls & Metadata Information */}
        <div className={`p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 transition-colors duration-500 ${
          isDark ? "bg-[#09090b]" : "bg-[#FDFDFC]"
        }`}>
          {/* Main Info Columns */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className={`flex flex-wrap gap-4 items-center text-[10px] font-mono uppercase tracking-wider border-b pb-4 transition-colors ${
              isDark ? "text-zinc-500 border-white/10" : "text-[#1A1A1A]/50 border-[#1A1A1A]/10"
            }`}>
              <div className="flex items-center space-x-1.5">
                <Star className={`w-4 h-4 ${isDark ? "text-amber-500 fill-amber-500" : "text-[#1A1A1A] fill-[#1A1A1A]"}`} />
                <span className={`font-bold ${isDark ? "text-zinc-200" : "text-[#1A1A1A]"}`}>{movie.rating.toFixed(1)} / 10</span>
              </div>
              <span>&bull;</span>
              <span>Released {movie.year}</span>
              <span>&bull;</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{movie.runtime || "N/A"}</span>
              </div>
              <span>&bull;</span>
              <span className={`border px-2.5 py-0.5 rounded-none text-[9px] font-bold font-mono transition-colors ${
                isDark ? "bg-white/5 text-zinc-300 border-white/10" : "bg-[#F5F5F0] text-[#1A1A1A] border-[#1A1A1A]/10"
              }`}>TMDB {movie.tmdbId}</span>
            </div>

            {/* Overview Section */}
            <div className="flex flex-col space-y-2">
              <h3 className={`text-[10px] uppercase font-mono tracking-widest font-bold transition-colors ${
                isDark ? "text-zinc-400" : "text-[#1A1A1A]/72"
              }`}>Story Synopsis</h3>
              <p className={`text-[14px] leading-relaxed font-light transition-colors ${
                isDark ? "text-zinc-300" : "text-[#1A1A1A]/90"
              }`}>
                {movie.overview}
              </p>
            </div>

            {/* Future release advice banner for standard view */}
            {isFutureOrUnreleased && (
              <div className={`border p-4 flex items-start space-x-3 transition-colors ${
                isDark ? "bg-zinc-900/30 border-white/8 text-zinc-300" : "bg-[#FAF9F6] border-[#1A1A1A]/10"
              }`}>
                <HelpCircle className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-[#1A1A1A]/68"
                }`} />
                <div className="flex-1 flex flex-col space-y-1">
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-bold transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/75"
                  }`}>TMDb Catalog Notice</span>
                  <p className={`text-[11px] leading-relaxed font-light transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/78"
                  }`}>
                    This file is slated as a {movie.year} catalog entry. If the video player returns "Unavailable", it indicates the digital files are not yet deployed by third-party scrapers. Try toggling alternative source feeds under the player options, or try fully available blockbusters.
                  </p>
                </div>
              </div>
            )}

            {/* TV Show episodic control triggers */}
            {movie.type === "tv" && (
              <div id="episodic-screenplay-controls" className={`p-4 rounded-none flex flex-col space-y-4 transition-colors ${
                isDark ? "bg-zinc-900/40 border border-white/8" : "bg-[#F5F5F0] border border-[#1A1A1A]/10"
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Film className="w-3.5 h-3.5 opacity-70" />
                  <span className={`text-[10px] uppercase font-mono tracking-widest font-bold transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/60"
                  }`}>EPISODE INDEX / {episodesList.length || "?"} CHAPTERS AVAILABLE</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                    }`}>Season Volume</label>
                    <select
                      value={season}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setSeason(val);
                        setEpisode(1); // Reset episode index on season volume change
                        if (isPlaying) {
                          onSetContinueWatching(movie, val, 1);
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-none font-sans text-xs outline-none cursor-pointer transition-all ${
                        isDark 
                          ? "bg-zinc-950 border border-white/10 text-zinc-100 focus:border-white" 
                          : "bg-[#FDFDFC] border border-[#1A1A1A]/15 text-[#1A1A1A] focus:border-[#1A1A1A]"
                      }`}
                    >
                      {Array.from({ length: totalSeasons || 1 }, (_, i) => i + 1).map((sNum) => (
                        <option key={sNum} value={sNum}>
                          Volume {sNum} ({totalSeasons ? `of ${totalSeasons}` : "Season"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                    }`}>Episode Chapter</label>
                    <select
                      value={episode}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setEpisode(val);
                        if (isPlaying) {
                          onSetContinueWatching(movie, season, val);
                        }
                      }}
                      disabled={isLoadingEpisodes || episodesList.length === 0}
                      className={`w-full px-3 py-2 rounded-none font-sans text-xs outline-none cursor-pointer transition-all ${
                        isDark 
                          ? "bg-zinc-950 border border-white/10 text-zinc-100 focus:border-white disabled:opacity-40" 
                          : "bg-[#FDFDFC] border border-[#1A1A1A]/15 text-[#1A1A1A] focus:border-[#1A1A1A] disabled:opacity-40"
                      }`}
                    >
                      {isLoadingEpisodes ? (
                        <option value={episode}>Syncing Episode titles...</option>
                      ) : episodesList.length > 0 ? (
                        episodesList.map((ep) => (
                          <option key={ep.episode_number} value={ep.episode_number}>
                            Ch. {ep.episode_number}: {ep.name}
                          </option>
                        ))
                      ) : (
                        <option value={episode}>Episode {episode}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Selected Episode Summary Context Cards */}
                {!isLoadingEpisodes && episodesList.length > 0 && (
                  (() => {
                    const activeEpInfo = episodesList.find(ep => ep.episode_number === episode);
                    if (!activeEpInfo) return null;
                    return (
                      <div className={`p-3.5 border transition-colors ${
                        isDark ? "bg-black/20 border-white/5" : "bg-white/40 border-[#1A1A1A]/8"
                      }`}>
                        <div className={`flex justify-between items-center text-[10px] font-mono uppercase tracking-wider transition-colors ${
                          isDark ? "text-zinc-400" : "text-[#1A1A1A]/70"
                        }`}>
                          <span>Chapter {episode} &bull; {activeEpInfo.name}</span>
                          {activeEpInfo.runtime && <span>{activeEpInfo.runtime} min runtime</span>}
                        </div>
                        {activeEpInfo.overview && (
                          <p className={`text-[11px] font-sans leading-relaxed tracking-normal mt-1.5 opacity-85 ${
                            isDark ? "text-zinc-300" : "text-[#1A1A1A]/80"
                          }`}>
                            {activeEpInfo.overview}
                          </p>
                        )}
                      </div>
                    );
                  })()
                )}

                {/* Episode Steppers */}
                <div className="flex items-center space-x-2.5 pt-1">
                  <button
                    onClick={handlePrevEpisode}
                    className={`flex-1 border py-2.5 rounded-none font-bold text-[10px] uppercase tracking-wider cursor-pointer text-center transition-all ${
                      isDark 
                        ? "bg-[#18181b] text-zinc-200 border-white/10 hover:bg-zinc-850 hover:text-white disabled:opacity-30" 
                        : "bg-[#FDFDFC] hover:bg-[#1A1A1A] hover:text-[#FDFDFC] disabled:opacity-40 disabled:hover:bg-[#FDFDFC] disabled:hover:text-[#1A1A1A] border-[#1A1A1A]/15 text-[#1A1A1A]"
                    }`}
                    disabled={(season === 1 && episode === 1) || isLoadingEpisodes}
                  >
                    &larr; Prev Episode
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    className={`flex-1 py-2.5 rounded-none font-bold text-[10px] uppercase tracking-wider cursor-pointer text-center shadow-xs transition-all ${
                      isDark 
                        ? "bg-white text-black hover:bg-zinc-200 disabled:opacity-30" 
                        : "bg-[#1A1A1A] hover:bg-black text-[#FDFDFC] disabled:opacity-40"
                    }`}
                    disabled={isLoadingEpisodes || (season === totalSeasons && episode === (episodesList.length || 12))}
                  >
                    Next Episode &rarr;
                  </button>
                </div>

                {isPlaying && (
                  <p className={`text-[10px] flex items-center space-x-1.5 font-mono uppercase tracking-widest pt-1 ${
                    isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                  }`}>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Playback sync active</span>
                  </p>
                )}
              </div>
            )}

            {/* Genres Chips List */}
            <div className="flex flex-wrap gap-2 pt-2">
              {movie.genre && movie.genre.map((g, i) => (
                <span
                  key={i}
                  className={`font-mono text-[9px] tracking-widest uppercase px-3 py-1 rounded-none border transition-colors ${
                    isDark 
                      ? "bg-white/5 border-white/10 text-zinc-400" 
                      : "bg-[#F5F5F0] text-[#1A1A1A]/80 border-[#1A1A1A]/10"
                  }`}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Right Side Controls Panel */}
          <div className={`flex flex-col space-y-6 lg:border-l lg:pl-8 transition-colors duration-500 ${
            isDark ? "border-white/10" : "border-[#1A1A1A]/10"
          }`}>
            {/* Stream Server Selection Box */}
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-mono tracking-widest font-bold transition-colors ${
                  isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                }`}>Active Streaming Feed</span>
                <span className={`text-[9px] px-1.5 py-0.5 font-mono font-bold border transition-colors ${
                  isDark ? "bg-white/10 text-zinc-300 border-white/15" : "bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border-[#1A1A1A]/5"
                }`}>
                  {embedSources.length} SERVERS
                </span>
              </div>
              
              <div className="flex flex-col space-y-2">
                <select
                  value={selectedSourceIdx}
                  onChange={(e) => setSelectedSourceIdx(Number(e.target.value))}
                  className={`w-full px-4 py-3.5 border text-xs font-semibold uppercase tracking-wider cursor-pointer outline-none transition-all ${
                    isDark 
                      ? "bg-zinc-900 border-white/10 text-zinc-100 focus:border-white" 
                      : "bg-[#1A1A1A] text-[#FDFDFC] border-[#1A1A1A] focus:ring-1 focus:ring-black"
                  }`}
                >
                  {embedSources.map((s, idx) => (
                    <option key={idx} value={idx}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Premium, Minimalist Layout Standalone Breakout & Overrides */}
            <div className={`border p-4 flex flex-col space-y-3 transition-colors ${
              isDark ? "border-white/8 bg-zinc-900/10 text-zinc-400" : "border border-[#1A1A1A]/12 bg-[#FDFDFC]"
            }`}>
              {isIframe && (
                <div className="space-y-3">
                  <p className={`text-[11px] leading-relaxed transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/70"
                  }`}>
                    For an optimal experience with unfiltered access and premium performance, open the player in a separate dedicated tab.
                  </p>
                  
                  <button
                    onClick={() => window.open(window.location.origin, "_blank")}
                    className={`w-full text-[10px] font-bold uppercase tracking-widest py-3 flex items-center justify-center space-x-2 transition cursor-pointer ${
                      isDark 
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100" 
                        : "bg-[#1A1A1A] hover:bg-black text-white"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Standalone Tab ↗</span>
                  </button>
                </div>
              )}

              {/* Advanced Parameter Override controls */}
              <div className={`space-y-2 ${isIframe ? "pt-2.5 border-t" : ""}`} style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.08)" }}>
                <button
                  onClick={() => setShowTroubleshooter(!showTroubleshooter)}
                  className={`text-[9px] font-mono uppercase font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                    isDark ? "text-zinc-400 hover:text-white" : "text-[#1A1A1A]/72 hover:text-black"
                  }`}
                >
                  <span>{showTroubleshooter ? "Hide Advanced Feed Overrides" : "Show Advanced Feed Overrides"}</span>
                  <span>&bull;</span>
                  <span className="underline">Overrides</span>
                </button>

                {showTroubleshooter && (
                  <div className="space-y-3 pt-1 animate-fade-in">
                    <div className="flex flex-col space-y-1">
                      <label className={`text-[9px] font-mono font-bold uppercase transition-colors ${
                  isDark ? "text-zinc-400" : "text-[#1A1A1A]/70"
                }`}>
                        TMDb Media Segment ID
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={customTmdbId}
                          onChange={(e) => setCustomTmdbId(e.target.value)}
                          placeholder="e.g. 157336"
                          className={`flex-1 text-xs font-mono px-2 py-1.5 focus:ring-1 outline-none transition-all ${
                            isDark 
                              ? "bg-zinc-950 border border-white/10 text-zinc-100 focus:ring-white" 
                              : "bg-white border border-[#1A1A1A]/15 text-[#1A1A1A] focus:ring-black"
                          }`}
                        />
                        <button
                          onClick={() => setCustomTmdbId(movie.tmdbId || "")}
                          className={`text-[10px] font-mono px-2.5 py-1.5 cursor-pointer text-white transition ${
                            isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-[#1A1A1A] hover:bg-black"
                          }`}
                          title="Reset to default ID"
                        >
                          Reset
                        </button>
                      </div>
                      <p className={`text-[9px] font-light leading-relaxed transition-colors ${
                  isDark ? "text-zinc-400" : "text-[#1A1A1A]/70"
                }`}>
                        Allows hardcoded correction of streaming feed identification code if the default movie catalog mapping is offset.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Crew Panel section */}
            <div className={`flex flex-col space-y-3.5 pt-4 border-t transition-colors ${
              isDark ? "border-white/10" : "border-[#1A1A1A]/10"
            }`}>
              {movie.director && (
                <div className="flex flex-col space-y-0.5">
                  <span className={`text-[9px] uppercase font-mono tracking-widest font-bold transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/72"
                  }`}>Director</span>
                  <span className={`text-xs font-semibold transition-colors ${
                    isDark ? "text-zinc-200" : "text-[#1A1A1A]"
                  }`}>{movie.director}</span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="flex flex-col space-y-1">
                  <span className={`text-[9px] uppercase font-mono tracking-widest font-bold transition-colors ${
                    isDark ? "text-zinc-400" : "text-[#1A1A1A]/72"
                  }`}>Cast Screenplay</span>
                  <div className="flex flex-col space-y-1">
                    {movie.cast.map((c, idx) => (
                      <span key={idx} className={`text-xs flex items-center space-x-1.5 font-light transition-colors ${
                        isDark ? "text-zinc-300" : "text-[#1A1A1A]/90"
                      }`}>
                        <User className={`w-3 h-3 ${isDark ? "text-zinc-500" : "text-[#1A1A1A]/68"}`} />
                        <span>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> {/* Close scrollable body container */}
    </div> {/* Close detail-modal */}
  </div>
  );
}
