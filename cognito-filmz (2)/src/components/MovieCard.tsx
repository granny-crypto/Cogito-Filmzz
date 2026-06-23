import { Movie } from "../types";
import { Star } from "lucide-react";
import { motion } from "motion/react";

interface MovieCardProps {
  key?: string | number;
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onHover?: (movie: Movie | null) => void;
  onPosterError?: (movieId: string) => void;
  theme: string;
}

export default function MovieCard({ movie, onSelect, onHover, onPosterError, theme }: MovieCardProps) {
  const displayGenre = movie.genre ? movie.genre[0] : "Movie";

  const isDark = theme === "dark";

  return (
    <motion.div
      id={`movie-card-${movie.tmdbId}`}
      onClick={() => onSelect(movie)}
      onMouseEnter={() => onHover?.(movie)}
      onMouseLeave={() => onHover?.(null)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ 
        y: -6,
        scale: 1.02,
      }}
      className={`group cursor-pointer flex flex-col space-y-3 backdrop-blur-md border rounded-sm overflow-hidden transition-all duration-500 ${
        isDark
          ? "bg-zinc-900/40 border-white/8 text-zinc-100 hover:border-white/20 hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)]"
          : "bg-[#FDFDFC]/65 border-[#1A1A1A]/12 hover:border-[#1A1A1A]/20 hover:shadow-[0_22px_50px_rgba(26,26,26,0.08)] text-[#1A1A1A]"
      }`}
    >
      {/* Poster Image Stage */}
      <div className={`relative aspect-[2/3] w-full overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-zinc-950 border-b border-white/5" : "bg-[#E5E5E0] border-b border-[#1A1A1A]/5"
      }`}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-104 filter grayscale-[10%] group-hover:grayscale-0"
          onError={(e) => {
            // Fallback image
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500";
            if (onPosterError) {
              onPosterError(movie.id);
            }
          }}
        />
        {/* Play Overlay Hover effect: clean minimal dark editorial mask */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold font-mono transform scale-95 group-hover:scale-100 transition-all duration-300 ${
            isDark ? "bg-white text-black" : "bg-[#1A1A1A]/95 text-white"
          }`}>
            Play Stream
          </div>
        </div>

        {/* Dynamic score tag - sharp, minimal */}
        <div className={`absolute top-3 left-3 backdrop-blur-xs border px-2.5 py-1 rounded-sm flex items-center space-x-1 shadow-xs transition-colors duration-500 ${
          isDark
            ? "bg-black/85 border-white/10 text-white"
            : "bg-[#FDFDFC]/95 border-[#1A1A1A]/10 text-[#1A1A1A]"
        }`}>
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          <span className={`text-[10px] font-mono font-bold transition-colors ${
            isDark ? "text-zinc-200" : "text-[#1A1A1A]"
          }`}>
            {movie.rating ? movie.rating.toFixed(1) : "N/A"}
          </span>
        </div>
      </div>

      {/* Metadata Panel */}
      <div className="px-3 pb-3.5 flex flex-col space-y-1.5">
        <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold transition-colors duration-500 ${
          isDark ? "text-zinc-500" : "text-[#1A1A1A]/40"
        }`}>
          {displayGenre} &bull; {movie.year}
        </span>
        <h3 className={`text-[14px] font-serif italic font-bold group-hover:underline line-clamp-1 leading-snug transition-colors duration-500 ${
          isDark ? "text-zinc-50 group-hover:text-white" : "text-[#1A1A1A] group-hover:text-black"
        }`}>
          {movie.title}
        </h3>
        <p className={`text-[11px] line-clamp-2 leading-relaxed font-light transition-colors duration-500 ${
          isDark ? "text-zinc-300" : "text-[#1A1A1A]/60"
        }`}>
          {movie.overview}
        </p>
      </div>
    </motion.div>
  );
}
