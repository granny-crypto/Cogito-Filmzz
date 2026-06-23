import { Movie, ContinueWatchingItem } from "../types";
import { X, Play, Trash2, Bookmark, CornerDownRight } from "lucide-react";

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedMovies: Movie[];
  continueWatching: ContinueWatchingItem[];
  onRemoveWatchlist: (movieId: string) => void;
  onClearContinueWatching: (movieId: string) => void;
  onSelectMovie: (movie: Movie) => void;
  theme: string;
}

export default function WatchlistSidebar({
  isOpen,
  onClose,
  savedMovies,
  continueWatching,
  onRemoveWatchlist,
  onClearContinueWatching,
  onSelectMovie,
  theme
}: WatchlistSidebarProps) {
  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div id="watchlist-sidebar" className="fixed inset-0 z-40 flex justify-end animate-fade-in">
      {/* Dim backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-xs" />

      {/* Sidebar stage drawer with warm paper white background and sharp layout */}
      <div className={`relative w-full max-w-md h-full flex flex-col shadow-2xl animate-fade-in overflow-hidden transition-all duration-500 border-l ${
        isDark
          ? "bg-[#09090b]/95 border-white/8 text-zinc-100 backdrop-blur-xl"
          : "bg-[#FDFDFC] border-[#1A1A1A]/12 text-[#1A1A1A]"
      }`}>
        {/* Header panel with refined serif text */}
        <div className={`p-6 border-b flex items-center justify-between transition-colors duration-500 ${
          isDark ? "border-white/10" : "border-[#1A1A1A]/10"
        }`}>
          <div className="flex flex-col">
            <h2 className="text-lg font-serif italic font-bold">Personal Library</h2>
            <p className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${
              isDark ? "text-zinc-500" : "text-[#1A1A1A]/40"
            }`}>Active streams & collections</p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-sm border transition-all cursor-pointer ${
              isDark 
                ? "border-white/12 hover:bg-white/5 hover:border-white/30 text-zinc-300" 
                : "border-[#1A1A1A]/15 hover:bg-[#F5F5F0] text-[#1A1A1A]"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Content panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Continue Watching Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold transition-colors ${
                isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
              }`}>Recently Live Streamed</span>
              <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-sm transition-all ${
                isDark 
                  ? "text-zinc-200 bg-white/5 border-white/10" 
                  : "text-[#1A1A1A] bg-[#F5F5F0] border-[#1A1A1A]/15"
              }`}>
                {continueWatching.length} Items
              </span>
            </div>

            {continueWatching.length === 0 ? (
              <div className={`border border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center space-y-2.5 transition-colors duration-500 ${
                isDark ? "border-white/10" : "border-[#1A1A1A]/15"
              }`}>
                <Play className="w-5 h-5 text-zinc-600" />
                <p className={`text-xs font-serif italic transition-colors ${
                  isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                }`}>No recently streamed media tracks.</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {continueWatching.map((item, index) => (
                  <div
                    key={index}
                    className={`group border rounded-sm p-3 flex transition-all duration-400 flex-col space-y-2 ${
                      isDark
                        ? "bg-zinc-900/40 border-white/8 hover:bg-zinc-900/80 border-l-2 border-l-emerald-500 hover:border-l-emerald-400"
                        : "bg-[#F5F5F0] hover:bg-[#FDFDFC] border-[#1A1A1A]/10 border-l-2 border-l-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectMovie(item.movie)}>
                        <img
                          src={item.movie.posterUrl}
                          alt={item.movie.title}
                          loading="lazy"
                          className={`w-10 aspect-[2/3] rounded-sm object-cover border transition-colors ${
                            isDark ? "border-white/10" : "border-[#1A1A1A]/10"
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=150";
                          }}
                        />
                        <div className="flex flex-col space-y-0.5 font-sans">
                          <span className={`text-xs font-semibold group-hover:underline leading-tight line-clamp-1 transition-colors ${
                            isDark ? "text-zinc-100" : "text-[#1A1A1A]"
                          }`}>
                            {item.movie.title}
                          </span>
                          <span className={`text-[9px] flex items-center gap-1 font-mono uppercase transition-colors ${
                            isDark ? "text-zinc-400" : "text-[#1A1A1A]/60"
                          }`}>
                            <CornerDownRight className={`w-2.5 h-2.5 ${isDark ? "text-zinc-600" : "text-[#1A1A1A]/40"}`} />
                            {item.movie.type === "tv"
                              ? `Season ${item.season}, Ep ${item.episode}`
                              : "Feature Film"}
                          </span>
                          <span className={`text-[8px] font-mono uppercase tracking-widest block font-bold transition-colors ${
                            isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                          }`}>
                            {item.percent}% Played
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onClearContinueWatching(item.movie.id)}
                        className={`p-1.5 rounded-sm transition shrink-0 cursor-pointer ${
                          isDark 
                            ? "text-zinc-500 hover:text-rose-500 hover:bg-white/5" 
                            : "text-neutral-400 hover:text-rose-600 hover:bg-[#F5F5F0]"
                        }`}
                        title="Delete track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Compact Editorial Progress Slider Bar */}
                    <div className={`w-full h-1 rounded-none overflow-hidden select-none transition-colors ${
                      isDark ? "bg-white/10" : "bg-[#1A1A1A]/15"
                    }`}>
                      <div className={`h-full transition-all duration-300 ${
                        isDark ? "bg-emerald-500" : "bg-[#1A1A1A]"
                      }`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Watchlist Bookmark Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold transition-colors ${
                isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
              }`}>Saved Watchlist</span>
              <Bookmark className={`w-3.5 h-3.5 transition-colors ${isDark ? "text-zinc-600" : "text-[#1A1A1A]/50"}`} />
            </div>

            {savedMovies.length === 0 ? (
              <div className={`border border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center space-y-2.5 transition-colors ${
                isDark ? "border-white/10" : "border-[#1A1A1A]/15"
              }`}>
                <Bookmark className="w-5 h-5 text-zinc-700" />
                <p className={`text-xs font-serif italic transition-colors ${
                  isDark ? "text-zinc-500" : "text-[#1A1A1A]/50"
                }`}>Your saved watchlist remains empty.</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-2.5">
                {savedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className={`flex p-2.5 rounded-sm items-center justify-between transition-all duration-300 border ${
                      isDark 
                        ? "bg-zinc-900/30 hover:bg-zinc-900/60 border-white/8 hover:border-white/15" 
                        : "bg-[#FDFDFC] hover:bg-[#F5F5F0] border-[#1A1A1A]/10"
                    }`}
                  >
                    <div className="flex items-center space-x-3 cursor-pointer overflow-hidden flex-1" onClick={() => onSelectMovie(movie)}>
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        loading="lazy"
                        className={`w-9 aspect-[2/3] rounded-sm object-cover border transition-colors ${
                          isDark ? "border-white/10" : "border-[#1A1A1A]/10"
                        }`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=150";
                        }}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-xs font-serif italic font-bold truncate leading-snug transition-colors ${
                          isDark ? "text-zinc-100" : "text-[#1A1A1A]"
                        }`}>
                          {movie.title}
                        </span>
                        <span className={`text-[9px] font-mono text-neutral-400 uppercase tracking-wider transition-colors ${
                          isDark ? "text-zinc-500" : "text-neutral-400"
                        }`}>
                          {movie.genre ? movie.genre[0] : "Movie"} &bull; {movie.year}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveWatchlist(movie.id)}
                      className={`p-1.5 rounded-sm cursor-pointer transition-colors ${
                        isDark 
                          ? "text-zinc-400 hover:text-white hover:bg-white/5" 
                          : "text-[#1A1A1A]/55 hover:text-black hover:bg-[#F5F5F0]"
                      }`}
                      title="Remove Bookmark"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className={`p-6 border-t text-[9px] text-center font-mono uppercase tracking-widest transition-all duration-500 ${
          isDark 
            ? "bg-black/40 border-white/8 text-zinc-600" 
            : "bg-[#F5F5F0] border-[#1A1A1A]/10 text-[#1A1A1A]/40"
        }`}>
          FLIXR ARCHIVE INTEGRATION &bull; VOL. 12
        </div>
      </div>
    </div>
  );
}
