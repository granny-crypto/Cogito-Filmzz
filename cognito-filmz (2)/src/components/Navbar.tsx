import React, { useState, useEffect, useRef } from "react";
import { Movie, UserProfile } from "../types";
import { Search, Library, Film, Tv, Star, Loader2, X, ChevronDown, User, Users, LogOut, Plus, Sun, Moon, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { searchLocalMovies } from "../fallbackData";

interface NavbarProps {
  onSelectMovie: (movie: Movie) => void;
  onOpenLibrary: () => void;
  savedCount: number;
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  onSwitchProfile: (profileId: string) => void;
  onOpenProfileSelector: () => void;
  onLogout: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Navbar({ 
  onSelectMovie, 
  onOpenLibrary, 
  savedCount,
  activeProfile,
  profiles,
  onSwitchProfile,
  onOpenProfileSelector,
  onLogout,
  theme,
  onToggleTheme
}: NavbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const [searchHistory, setSearchHistory] = useState<Movie[]>([]);

  // Load search history whenever activeProfile changes
  useEffect(() => {
    if (!activeProfile) {
      setSearchHistory([]);
      return;
    }
    const key = `cinematheque_search_history_${activeProfile.id}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      } else {
        setSearchHistory([]);
      }
    } catch (e) {
      console.error("Failed to load search history from localStorage:", e);
      setSearchHistory([]);
    }
  }, [activeProfile]);

  const saveToHistory = (movie: Movie) => {
    if (!activeProfile) return;
    const key = `cinematheque_search_history_${activeProfile.id}`;
    let history = [...searchHistory];
    history = history.filter((item) => item.id !== movie.id);
    history.unshift(movie);
    if (history.length > 5) {
      history = history.slice(0, 5);
    }
    setSearchHistory(history);
    try {
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save search history to localStorage:", e);
    }
  };

  const removeFromHistory = (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    if (!activeProfile) return;
    const key = `cinematheque_search_history_${activeProfile.id}`;
    const updated = searchHistory.filter((item) => item.id !== movieId);
    setSearchHistory(updated);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to remove search history item:", e);
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProfile) return;
    const key = `cinematheque_search_history_${activeProfile.id}`;
    setSearchHistory([]);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to clear search history:", e);
    }
  };

  // Debounce API requests on input query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          setResults(searchLocalMovies(query));
        }
      } catch (err) {
        console.warn("Failed to query search API, resorting to local search fallback:", err);
        setResults(searchLocalMovies(query));
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (movie: Movie) => {
    saveToHistory(movie);
    onSelectMovie(movie);
    setQuery("");
    setShowDropdown(false);
  };

  return (
    <nav className={`sticky top-0 z-30 transition-all duration-750 ease-in-out px-6 sm:px-12 py-5 flex items-center justify-between border-b backdrop-blur-[24px] ${
      theme === "dark"
        ? "bg-[#09090b]/75 border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.36)]"
        : "bg-[#FDFDFC]/70 border-zinc-950/8 shadow-[0_8px_32px_rgba(26,26,26,0.02)]"
    }`}>
      {/* Brand logo title with elegant serif style */}
      <div className="flex items-center gap-8 select-none shrink-0">
        <div className="flex flex-col cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform duration-300" onClick={() => window.location.reload()}>
          <h1 className={`text-xl sm:text-2xl font-serif italic tracking-tight font-black transition-colors duration-500 ${
            theme === "dark" ? "text-zinc-50" : "text-zinc-950"
          }`}>
            CINÉMATHÈQUE
          </h1>
          <span className={`text-[9px] font-mono tracking-widest font-bold uppercase transition-colors duration-500 ${
            theme === "dark" ? "text-zinc-400/60" : "text-zinc-950/50"
          }`}>
            FLIXR ARCHIVE / VOL. 12
          </span>
        </div>

        {/* Curation internal category indicators for editorial look */}
        <div className={`hidden lg:flex gap-6 text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${
          theme === "dark" ? "text-zinc-200" : "text-[#1A1A1A]"
        }`}>
          <span className={`border-b pb-0.5 cursor-pointer hover:scale-105 transition-all duration-300 ${
            theme === "dark" ? "border-zinc-200" : "border-[#1A1A1A]"
          }`}>Cinema</span>
          <span className="opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer">Series</span>
          <span className="opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer">Archive</span>
          <span className="opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer">Curation</span>
        </div>
      </div>

      {/* Swiss layout: spacious search engine */}
      <div ref={dropRef} className="relative flex-1 max-w-md mx-4 sm:mx-8">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search catalog of world cinema..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={`w-full border text-xs px-4 py-3 pl-10 rounded-sm outline-none transition-all duration-500 placeholder:opacity-50 shadow-xs focus:shadow-md ${
              theme === "dark"
                ? "bg-zinc-900/60 hover:bg-zinc-900/80 focus:bg-zinc-950/90 border-white/10 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-400/10 text-zinc-100 placeholder:text-zinc-400"
                : "bg-[#F5F5F0]/65 hover:bg-[#F5F5F0]/85 focus:bg-white/90 border-[#1A1A1A]/5 focus:border-[#1A1A1A]/80 focus:ring-4 focus:ring-zinc-900/4 text-[#1A1A1A] placeholder:text-[#1A1A1A]/40"
            }`}
          />
          <div className="absolute left-3.5 text-neutral-400">
            {isLoading ? (
              <Loader2 className={`w-4 h-4 animate-spin ${theme === "dark" ? "text-zinc-400" : "text-neutral-600"}`} />
            ) : (
              <Search className={`w-4 h-4 transition-colors duration-500 ${theme === "dark" ? "text-zinc-400/60" : "text-[#1A1A1A]/72"}`} />
            )}
          </div>
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion & History Dropdown panel with Liquid Glass Effect */}
        {showDropdown && ((query.trim().length > 0 || isLoading) || (query.trim().length === 0 && searchHistory.length > 0)) && (
          <div className={`absolute top-full mt-2 left-0 right-0 backdrop-blur-3xl border rounded-sm shadow-[0_24px_60px_rgba(0,0,0,0.18)] overflow-hidden z-50 transition-all duration-300 ${
            theme === "dark"
              ? "bg-[#141417]/90 border-white/12 text-zinc-100"
              : "bg-[#FDFDFC]/90 border-[#1A1A1A]/12 text-[#1A1A1A]"
          }`}>
            {query.trim().length > 0 || isLoading ? (
              <>
                {isLoading && results.length === 0 && (
                  <div className="p-4 text-center text-xs flex items-center justify-center space-x-2">
                    <Loader2 className={`w-4 h-4 animate-spin ${theme === "dark" ? "text-zinc-300" : "text-[#1A1A1A]/60"}`} />
                    <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">Checking world databases...</span>
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="p-5 text-center text-xs opacity-60 flex flex-col space-y-1 font-serif italic">
                    <p>No titles found matching your search</p>
                    <div className="text-[10px] font-mono not-italic flex items-center justify-center space-x-1.5 opacity-80">
                      <span className="opacity-40 font-bold">&bull;</span>
                      <span>Tip: Try directory genre names or authors</span>
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className={`flex flex-col py-1.5 divide-y max-h-[380px] overflow-y-auto ${
                    theme === "dark" ? "divide-white/5" : "divide-[#1A1A1A]/5"
                  }`}>
                    {results.map((movie) => (
                      <div
                        key={movie.id || movie.tmdbId}
                        onClick={() => handleSelectResult(movie)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all duration-250 group/item ${
                          theme === "dark" ? "hover:bg-white/5" : "hover:bg-[#1A1A1A]/4"
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden flex-1 animate-fade-in">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            loading="lazy"
                            className="w-8 aspect-[2/3] object-cover rounded-sm border border-neutral-500/20 group-hover/item:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=150";
                            }}
                          />
                          <div className="flex flex-col overflow-hidden text-left">
                            <span className={`text-xs font-semibold group-hover/item:text-black transition-colors truncate ${theme === "dark" && "group-hover/item:text-white"}`}>
                              {movie.title}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 uppercase mt-0.5">
                              {movie.type === "tv" ? (
                                <Tv className="w-2.5 h-2.5" />
                              ) : (
                                <Film className="w-2.5 h-2.5" />
                              )}
                              <span>
                                {movie.year} &bull; {movie.genre ? movie.genre[0] : "Movie"}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className={`flex items-center space-x-1 border px-1.5 py-0.5 rounded-sm font-mono text-[9px] transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-white/5 border-white/10 text-zinc-100 group-hover/item:bg-white group-hover/item:text-black"
                            : "bg-[#1A1A1A]/5 border-[#1A1A1A]/10 text-[#1A1A1A] group-hover/item:bg-[#1A1A1A] group-hover/item:text-white"
                        }`}>
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 group-hover/item:text-amber-400" />
                          <span>{movie.rating ? movie.rating.toFixed(1) : "8.0"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Search History Section with Theme Support
              <div className="p-3.5 flex flex-col space-y-2 select-none">
                <div className={`flex items-center justify-between pb-2 border-b ${
                  theme === "dark" ? "border-white/5" : "border-[#1A1A1A]/5"
                }`}>
                  <div className={`flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.15em] font-bold font-mono ${
                    theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/55"
                  }`}>
                    <History className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                    <span>Recent Searches</span>
                    {activeProfile && (
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-xs font-mono font-medium tracking-normal lowercase ${
                        theme === "dark" ? "bg-white/10 text-zinc-200" : "bg-[#1A1A1A]/10 text-[#1A1A1A]"
                      }`}>
                        {activeProfile.name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearHistory}
                    className={`text-[9px] font-mono tracking-widest uppercase hover:text-rose-500 transition duration-300 font-bold decoration-dotted underline underline-offset-2 cursor-pointer opacity-70 hover:opacity-100`}
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex flex-col py-0.5 max-h-[300px] overflow-y-auto">
                  {searchHistory.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => handleSelectResult(movie)}
                      className={`flex items-center justify-between p-2 rounded-sm cursor-pointer transition-all duration-200 group/hist ${
                        theme === "dark" ? "hover:bg-white/5" : "hover:bg-[#1A1A1A]/4"
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden flex-1 text-left">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          loading="lazy"
                          className="w-7 aspect-[2/3] object-cover rounded-sm border border-neutral-500/20 shrink-0 group-hover/hist:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=150";
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-semibold group-hover/hist:text-black transition-colors truncate ${theme === "dark" && "group-hover/hist:text-white"}`}>
                            {movie.title}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400 mt-0.5 flex items-center space-x-1 uppercase">
                            <span>{movie.type === "tv" ? "TV Series" : "Movie"}</span>
                            <span>&bull;</span>
                            <span>{movie.year}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => removeFromHistory(e, movie.id)}
                        className={`p-1.5 ml-2 rounded-sm transition duration-200 cursor-pointer ${
                          theme === "dark" ? "text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20" : "text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flexible Sidebar Actions: My Library & Account profile selector */}
      <div className="flex items-center space-x-4">
        {/* Liquid Glass Theme Slider/Toggle Option strictly styled like the photo/video toggle in reference image */}
        <div 
          onClick={onToggleTheme}
          className={`h-9 w-20 rounded-full p-1 flex items-center relative select-none border cursor-pointer backdrop-blur-[24px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all duration-500 ${
            theme === "dark" 
              ? "bg-white/10 border-white/20 hover:bg-white/15" 
              : "bg-black/8 border-black/10 hover:bg-black/12"
          }`}
          title="Toggle color theme format"
        >
          {/* Slider Overlay mimicking photo/video slider */}
          <motion.div 
            layout 
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] border ${
              theme === "dark"
                ? "left-[calc(50%+1px)] bg-neutral-800/90 border-white/15"
                : "left-0.5 bg-white border-zinc-200"
            }`}
          />
          <div className="z-10 flex w-full h-full items-center justify-between font-mono text-[9px] font-bold select-none pointer-events-none">
            <span className={`w-1/2 flex items-center justify-center transition-opacity duration-300 ${theme === "light" ? "opacity-100 text-zinc-950" : "opacity-45 text-zinc-400"}`}>
              <Sun className="w-3.5 h-3.5" />
            </span>
            <span className={`w-1/2 flex items-center justify-center transition-opacity duration-300 ${theme === "dark" ? "opacity-100 text-zinc-50" : "opacity-45 text-neutral-500"}`}>
              <Moon className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Library Trigger tab with dynamic scale and shadow hover effect */}
        <button
          onClick={onOpenLibrary}
          className={`flex items-center space-x-2 border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-500 hover:scale-[1.03] active:scale-95 rounded-sm cursor-pointer shadow-xs hover:shadow-md ${
            theme === "dark"
              ? "bg-white/10 hover:bg-white text-zinc-100 hover:text-black border-white/12"
              : "bg-white/40 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border-[#1A1A1A]/12"
          }`}
        >
          <Library className="w-4 h-4" />
          <span className="hidden sm:inline">My Library</span>
          {savedCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold transition-colors ${
              theme === "dark"
                ? "bg-white text-black group-hover:bg-[#1A1A1A] group-hover:text-white"
                : "bg-[#1A1A1A] text-white group-hover:bg-white group-hover:text-[#1A1A1A]"
            }`}>
              {savedCount}
            </span>
          )}
        </button>

        {/* Profile/Account Switcher */}
        {activeProfile && (
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`flex items-center space-x-2.5 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-500 hover:scale-[1.03] active:scale-95 rounded-sm cursor-pointer select-none shadow-sm hover:shadow-md ${
                theme === "dark"
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5"
                  : "bg-[#1A1A1A] hover:bg-black text-white"
              }`}
              title="Switch user account profile"
            >
              <div className={`w-4 h-4 flex items-center justify-center rounded-xs text-[8px] font-mono font-black ${activeProfile.avatarColor}`}>
                {activeProfile.name.charAt(0)}
              </div>
              <span className="hidden md:inline font-mono text-[10px] lowercase tracking-wide font-normal max-w-[100px] truncate opacity-90">
                {activeProfile.name}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-300 ${showProfileDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu Overlay with Liquid Glass Effect */}
            {showProfileDropdown && (
              <div className={`absolute right-0 mt-2 w-56 backdrop-blur-3xl border rounded-sm shadow-[0_24px_60px_rgba(0,0,0,0.22)] z-50 py-1.5 flex flex-col font-mono text-[10px] tracking-wider uppercase transition-all duration-300 ${
                theme === "dark"
                  ? "bg-[#141417]/90 border-white/12 text-zinc-100"
                  : "bg-white border-zinc-300 text-zinc-900"
              }`}>
                <div className={`px-3.5 py-2.5 text-[8px] tracking-[0.15em] font-bold border-b ${
                  theme === "dark" ? "text-zinc-400 border-white/5" : "text-zinc-500 border-zinc-200"
                }`}>
                  Select Profile
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchProfile(p.id);
                      setShowProfileDropdown(false);
                    }}
                    className={`px-3.5 py-2.5 flex items-center space-x-3 text-left w-full hover:bg-zinc-100 transition duration-200 cursor-pointer ${
                      p.id === activeProfile.id 
                        ? "font-bold" 
                        : "opacity-75"
                    }`}
                  >
                    <div className={`w-4 h-4 flex items-center justify-center rounded-xs text-[8px] font-mono font-black ${p.avatarColor}`}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="truncate">{p.name} {p.id === activeProfile.id && "✓"}</span>
                  </button>
                ))}
                
                <div className={`border-t my-1 ${theme === "dark" ? "border-white/5" : "border-[#1A1A1A]/5"}`} />

                <button
                  onClick={() => {
                    onOpenProfileSelector();
                    setShowProfileDropdown(false);
                  }}
                  className={`px-3.5 py-2.5 flex items-center space-x-3 text-left w-full hover:bg-[#1A1A1A]/5 transition duration-200 font-bold ${
                    theme === "dark" ? "text-zinc-200" : "text-neutral-800 hover:text-black"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 opacity-80" />
                  <span>Profiles Wall</span>
                </button>

                <div className={`border-t my-1 ${theme === "dark" ? "border-white/5" : "border-[#1A1A1A]/5"}`} />

                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileDropdown(false);
                  }}
                  className="px-3.5 py-2.5 flex items-center space-x-3 text-left w-full hover:bg-rose-950/20 text-rose-500 hover:text-rose-450 transition duration-200 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
