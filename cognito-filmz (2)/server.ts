import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Curated Fallback Movie Data
const curatedMovies = [
  {
    id: "interstellar-157336",
    title: "Interstellar",
    type: "movie",
    tmdbId: 157336,
    imdbId: "tt0814155",
    rating: 8.6,
    genre: ["Adventure", "Drama", "Science Fiction"],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2Qv2ilv87gRh0v7dgvYdjg67.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/rAi96fW7UNvtyg76H6v6isgIY8A.jpg",
    runtime: "169 min",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    director: "Christopher Nolan"
  },
  {
    id: "the-dark-knight-155",
    title: "The Dark Knight",
    type: "movie",
    tmdbId: 155,
    imdbId: "tt0468569",
    rating: 8.9,
    genre: ["Action", "Crime", "Drama"],
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW7beR7P8wu8g0ehI0Y7XgK6.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/nMK08g6bwhgG68XvT69gYpOCU2.jpg",
    runtime: "152 min",
    tagline: "Why So Serious?",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Maggie Gyllenhaal"],
    director: "Christopher Nolan"
  },
  {
    id: "inception-27205",
    title: "Inception",
    type: "movie",
    tmdbId: 27205,
    imdbId: "tt1375666",
    rating: 8.4,
    genre: ["Action", "Science Fiction", "Adventure"],
    overview: "Cobb, a skilled thief who is absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state.",
    posterUrl: "https://image.tmdb.org/t/p/w500/o0qq2gYu8BMv8gCOFGSuZ2Sg6or.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8Zg0iBSgA5AonbZ96g29goy72D8.jpg",
    runtime: "148 min",
    tagline: "Your mind is the scene of the crime.",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    director: "Christopher Nolan"
  },
  {
    id: "dune-part-two-693134",
    title: "Dune: Part Two",
    type: "movie",
    tmdbId: 693134,
    imdbId: "tt15239678",
    rating: 8.5,
    genre: ["Science Fiction", "Adventure"],
    overview: "Follow the next chapter of Paul Atreides' journey as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    posterUrl: "https://image.tmdb.org/t/p/w500/czembIDgZPg6PzAd9g36589iLV0.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/xOM0Z626m06ST26iZ4gTXvL66Y5.jpg",
    runtime: "166 min",
    tagline: "Long live the fighters.",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    director: "Denis Villeneuve"
  },
  {
    id: "spirited-away-129",
    title: "Spirited Away",
    type: "movie",
    tmdbId: 129,
    imdbId: "tt0245429",
    rating: 8.5,
    genre: ["Animation", "Family", "Fantasy", "Anime"],
    overview: "A young girl wandering into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    posterUrl: "https://image.tmdb.org/t/p/w500/39wmItIWsgS46gHg97A62ZFF0g0.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/Ab8Z00Ijl3vgy9L6z9K6v6liIor.jpg",
    runtime: "125 min",
    tagline: "Nothing that happens is ever forgotten, even if you can't remember it.",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Takashi Naito"],
    director: "Hayao Miyazaki"
  },
  {
    id: "blade-runner-2049-335984",
    title: "Blade Runner 2049",
    type: "movie",
    tmdbId: 335984,
    imdbId: "tt1856101",
    rating: 8.2,
    genre: ["Science Fiction", "Drama"],
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret.",
    posterUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
    runtime: "164 min",
    tagline: "There is still a page left.",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks"],
    director: "Denis Villeneuve"
  },
  {
    id: "parasite-496243",
    title: "Parasite",
    type: "movie",
    tmdbId: 496243,
    imdbId: "tt6751668",
    rating: 8.5,
    genre: ["Comedy", "Thriller", "Drama"],
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood.",
    posterUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
    runtime: "132 min",
    tagline: "Act like you own the place.",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    director: "Bong Joon Ho"
  },
  {
    id: "the-godfather-238",
    title: "The Godfather",
    type: "movie",
    tmdbId: 238,
    imdbId: "tt0068646",
    rating: 8.7,
    genre: ["Drama", "Crime"],
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj6scSgpaH8g7GJYpGvSTg0.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/tmU70CgZ76gI7QTg7b9zbG95Z6k.jpg",
    runtime: "175 min",
    tagline: "An offer you can't refuse.",
    cast: ["Marlon Brando", "Al Pacino", "James Caan", "Richard S. Castellano"],
    director: "Francis Ford Coppola"
  },
  {
    id: "pulp-fiction-680",
    title: "Pulp Fiction",
    type: "movie",
    tmdbId: 680,
    imdbId: "tt0110912",
    rating: 8.5,
    genre: ["Thriller", "Crime"],
    overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this highly influential crime masterpiece.",
    posterUrl: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1585647347384-2593bc35716b?auto=format&fit=crop&q=80&w=1200",
    runtime: "154 min",
    tagline: "Just because you are a character doesn't mean that you have character.",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    director: "Quentin Tarantino"
  },
  {
    id: "whiplash-244786",
    title: "Whiplash",
    type: "movie",
    tmdbId: 244786,
    imdbId: "tt2582802",
    rating: 8.4,
    genre: ["Drama", "Music"],
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins his obsessive, intense pursuit of rhythmic perfection.",
    posterUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
    runtime: "106 min",
    tagline: "Not quite my tempo.",
    cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    director: "Damien Chazelle"
  },
  {
    id: "spiderman-spiderverse-324857",
    title: "Spider-Man: Into the Spider-Verse",
    type: "movie",
    tmdbId: 324857,
    imdbId: "tt4633694",
    rating: 8.4,
    genre: ["Animation", "Action", "Adventure", "Science Fiction"],
    overview: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions.",
    posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200",
    runtime: "117 min",
    tagline: "More than one wears the mask.",
    cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld", "Mahershala Ali"],
    director: "Bob Persichetti"
  },
  {
    id: "breaking-bad-1396",
    title: "Breaking Bad",
    type: "tv",
    tmdbId: 1396,
    imdbId: "tt1210166",
    rating: 9.5,
    genre: ["Drama", "Crime", "Thriller"],
    overview: "Walter White, a chemistry teacher, discovers that he has cancer and decides to cook premium crystal meth to secure his family's future.",
    posterUrl: "https://image.tmdb.org/t/p/w500/gg9g7v8v49OInG9.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200",
    runtime: "5 Seasons",
    tagline: "Remember my name.",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk"],
    director: "Vince Gilligan"
  },
  {
    id: "succession-1153",
    title: "Succession",
    type: "tv",
    tmdbId: 1153,
    imdbId: "tt7660850",
    rating: 8.4,
    genre: ["Drama", "Comedy"],
    overview: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
    posterUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200",
    runtime: "4 Seasons",
    tagline: "The war for succession is on.",
    cast: ["Brian Cox", "Jeremy Strong", "Sarah Snook", "Kieran Culkin"],
    director: "Jesse Armstrong"
  },
  {
    id: "stranger-things-66732",
    title: "Stranger Things",
    type: "tv",
    tmdbId: 66732,
    imdbId: "tt5027774",
    rating: 8.6,
    genre: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0mS7asO6v6g6r7v8i9.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1200",
    runtime: "4 Seasons",
    tagline: "One summer can change everything.",
    cast: ["Winona Ryder", "David Harbour", "Millie Bobby Brown", "Finn Wolfhard"],
    director: "The Duffer Brothers"
  },
  {
    id: "chernobyl-87108",
    title: "Chernobyl",
    type: "tv",
    tmdbId: 87108,
    imdbId: "tt8162428",
    rating: 8.7,
    genre: ["Drama", "History"],
    overview: "The true story of the 1986 nuclear accident, one of the worst man-made catastrophes in history.",
    posterUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=1200",
    runtime: "1 Season",
    tagline: "What is the cost of lies?",
    cast: ["Jared Harris", "Stellan Skarsgård", "Emily Watson", "Paul Ritter"],
    director: "Craig Mazin"
  },
  {
    id: "game-of-thrones-1399",
    title: "Game of Thrones",
    type: "tv",
    tmdbId: 1399,
    imdbId: "tt0944947",
    rating: 8.4,
    genre: ["Sci-Fi & Fantasy", "Action & Adventure", "Drama"],
    overview: "Seven noble families fight for control of the mythical land of Westeros, while an ancient enemy returns.",
    posterUrl: "https://image.tmdb.org/t/p/w500/1XS1ZmqvTHvLEg6FiZgV76Vv9Mh.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200",
    runtime: "8 Seasons",
    tagline: "Winter is coming.",
    cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage", "Lena Headey"],
    director: "David Benioff"
  },
  {
    id: "attack-on-titan-1429",
    title: "Attack on Titan",
    type: "tv",
    tmdbId: 1429,
    imdbId: "tt2560140",
    rating: 8.9,
    genre: ["Animation", "Sci-Fi & Fantasy", "Action & Adventure", "Anime"],
    overview: "Several hundred years ago, humans were nearly exterminated by Giants. Now, a young Eren Yeager vows to cleanse the earth of them.",
    posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200",
    runtime: "4 Seasons",
    tagline: "To achieve freedom, we must fight.",
    cast: ["Yuki Kaji", "Yui Ishikawa", "Marina Inoue", "Hiroshi Kamiya"],
    director: "Tetsurō Araki"
  },
  {
    id: "demon-slayer-85937",
    title: "Demon Slayer: Kimetsu no Yaiba",
    type: "tv",
    tmdbId: 85937,
    imdbId: "tt9335498",
    rating: 8.7,
    genre: ["Animation", "Action & Adventure", "Fantasy", "Anime"],
    overview: "Tanjiro Kamado finds his family slaughtered by a demon. To make things worse, his younger sister Nezuko has been turned into a demon herself.",
    posterUrl: "https://image.tmdb.org/t/p/w500/x7Cc7vDeYg06fwhgSpxv0pXPxpD.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1200",
    runtime: "4 Seasons",
    tagline: "Destroy the status, protect the innocent.",
    cast: ["Natsuki Hanae", "Akari Kito", "Yoshitsugu Matsuoka", "Hiro Shimono"],
    director: "Haruo Sotozaki"
  },
  {
    id: "death-note-31351",
    title: "Death Note",
    type: "tv",
    tmdbId: 31351,
    imdbId: "tt0877057",
    rating: 8.7,
    genre: ["Animation", "Mystery", "Drama", "Anime"],
    overview: "An intelligent student goes on a secret crusade to eliminate criminals from the world using a supernatural notebook.",
    posterUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=1200",
    runtime: "1 Season",
    tagline: "Justice will prevail.",
    cast: ["Mamoru Miyano", "Kappei Yamaguchi", "Shidou Nakamura", "Aya Hirano"],
    director: "Tetsurō Araki"
  },
  {
    id: "jujutsu-kaisen-95479",
    title: "Jujutsu Kaisen",
    type: "tv",
    tmdbId: 95479,
    imdbId: "tt12343534",
    rating: 8.6,
    genre: ["Animation", "Action & Adventure", "Fantasy", "Anime"],
    overview: "Yuji Itadori, a high school student with extraordinary physical abilities, swallows a cursed finger to save his friends, becoming the host of the powerful curse Ryomen Sukuna.",
    posterUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200",
    runtime: "2 Seasons",
    tagline: "Cursed curses fight with curses.",
    cast: ["Junya Enoki", "Yuma Uchida", "Asami Seto", "Yuichi Nakamura"],
    director: "Sunghoo Park"
  },
  {
    id: "cyberpunk-edgerunners-108179",
    title: "Cyberpunk: Edgerunners",
    type: "tv",
    tmdbId: 108179,
    imdbId: "tt12590166",
    rating: 8.6,
    genre: ["Animation", "Action & Adventure", "Science Fiction", "Anime"],
    overview: "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner.",
    posterUrl: "https://image.tmdb.org/t/p/w500/fSg5W9uYv7u7X29JVvY6rEBpZp76A.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=1200",
    runtime: "1 Season",
    tagline: "Get high or die trying.",
    cast: ["KENN", "Aoi Yuki", "Hiroki Touchi", "Michiko Kaiden"],
    director: "Hiroyuki Imaishi"
  },
  {
    id: "my-neighbor-totoro-8392",
    title: "My Neighbor Totoro",
    type: "movie",
    tmdbId: 8392,
    imdbId: "tt0096283",
    rating: 8.1,
    genre: ["Animation", "Family", "Fantasy", "Anime"],
    overview: "Two young sisters, Satsuki and Mei, move to an old country house with their father and discover the nearby forest is inhabited by friendly spirits, including Totoro.",
    posterUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200",
    runtime: "86 min",
    tagline: "An enchanting forest tale for all ages.",
    cast: ["Noriko Hidaka", "Chika Sakamoto", "Shigesato Itoi", "Sumi Shimamoto"],
    director: "Hayao Miyazaki"
  }
];

// Reusable formatting tool to clean poster and backdrop URL keys
const formatMovieUrls = (movie: any) => {
  // Ensure the ID has tmdb suffix if absent
  if (!movie.id) {
    movie.id = `${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${movie.tmdbId}`;
  }
  
  // Format Poster
  if (movie.posterUrl) {
    if (movie.posterUrl.startsWith("/")) {
      movie.posterUrl = `https://image.tmdb.org/t/p/w500${movie.posterUrl}`;
    } else if (!movie.posterUrl.startsWith("http")) {
      movie.posterUrl = `https://image.tmdb.org/t/p/w500/${movie.posterUrl}`;
    }
  } else {
    movie.posterUrl = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500`;
  }

  // Format Backdrop
  if (movie.backdropUrl) {
    if (movie.backdropUrl.startsWith("/")) {
      movie.backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdropUrl}`;
    } else if (!movie.backdropUrl.startsWith("http")) {
      movie.backdropUrl = `https://image.tmdb.org/t/p/original/${movie.backdropUrl}`;
    }
  } else {
    movie.backdropUrl = `https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200`;
  }

  return movie;
};

// Clean curates layout
const formattedCurated = curatedMovies.map(formatMovieUrls);

// Merging helper to combine TMDB records and sandbox ones without duplicates
const mergeAndDeduplicate = (tmdbList: any[], localList: any[]) => {
  const seenTitles = new Set<string>();
  const seenIds = new Set<string>();
  const result: any[] = [];
  
  tmdbList.forEach(m => {
    if (!m) return;
    const titleKey = m.title.toLowerCase().trim();
    const idKey = m.id;
    if (!seenTitles.has(titleKey) && !seenIds.has(idKey)) {
      seenTitles.add(titleKey);
      seenIds.add(idKey);
      result.push(m);
    }
  });
  
  localList.forEach(m => {
    if (!m) return;
    const titleKey = m.title.toLowerCase().trim();
    const idKey = m.id;
    if (!seenTitles.has(titleKey) && !seenIds.has(idKey)) {
      seenTitles.add(titleKey);
      seenIds.add(idKey);
      result.push(m);
    }
  });
  
  return result;
};

// TMDB genres mapping
const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

// Robust fetch wrapper for TMDb API
const fetchTMDB = async (endpoint: string, queryParams: Record<string, string> = {}) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY missing");
  }

  let url = `https://api.themoviedb.org/3${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const isJWT = apiKey.trim().startsWith("eyJ");
  if (isJWT) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  } else {
    queryParams["api_key"] = apiKey.trim();
  }

  const queryStr = new URLSearchParams(queryParams).toString();
  if (queryStr) {
    url += `?${queryStr}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`TMDb Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

// Map TMDb Movie objects to standard types
const mapTMDBMovie = (item: any, typeOverride?: "movie" | "tv"): any => {
  const type = typeOverride || item.media_type || (item.first_air_date ? "tv" : "movie");
  const id = `${type}-${item.id}`;
  const tmdbId = item.id;
  const title = item.title || item.name || "Untitled Cinema";
  
  const dateStr = item.release_date || item.first_air_date || "";
  const year = dateStr ? dateStr.substring(0, 4) : "N/A";
  
  const rating = item.vote_average || 7.0;
  
  const genreNames = (item.genre_ids || [])
    .map((gid: number) => TMDB_GENRES[gid])
    .filter(Boolean);

  if (item.genres) {
    item.genres.forEach((g: any) => {
      if (g.name && !genreNames.includes(g.name)) {
        genreNames.push(g.name);
      }
    });
  }

  // Detect and inject "Anime" genre tag for Japanese animations
  if (
    genreNames.includes("Animation") && 
    (
      item.original_language === "ja" || 
      (item.origin_country && item.origin_country.includes("JP"))
    )
  ) {
    if (!genreNames.includes("Anime")) {
      genreNames.push("Anime");
    }
  }

  if (genreNames.length === 0) {
    genreNames.push(type === "tv" ? "TV Series" : "Feature Film");
  }

  const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=500";
  const backdropPath = item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200";

  let runtimeStr = "";
  if (type === "tv") {
    const seasons = item.number_of_seasons || 1;
    runtimeStr = `${seasons} Season${seasons > 1 ? "s" : ""}`;
  } else {
    const rt = item.runtime || 112;
    runtimeStr = `${rt} min`;
  }

  let cast: string[] = [];
  let director = "";

  if (item.credits) {
    if (item.credits.cast) {
      cast = item.credits.cast.slice(0, 4).map((c: any) => c.name);
    }
    if (item.credits.crew) {
      const dirObj = item.credits.crew.find((crew: any) => crew.job === "Director" || crew.department === "Directing");
      if (dirObj) {
        director = dirObj.name;
      }
    }
  }

  if (type === "tv" && item.created_by && item.created_by.length > 0) {
    director = item.created_by[0].name;
  }

  if (!director) {
    director = type === "tv" ? "Executive Producers" : "Production Crew";
  }

  return {
    id,
    title,
    year,
    type,
    tmdbId,
    imdbId: item.imdb_id || "",
    rating,
    genre: genreNames,
    overview: item.overview || "No synopsis available for this cinema chronicle.",
    posterUrl: posterPath,
    backdropUrl: backdropPath,
    runtime: runtimeStr,
    tagline: item.tagline || "",
    cast: cast.length > 0 ? cast : ["Screenplay Crew", "Ensemble Cast"],
    director
  };
};

// Endpoint to fetch TMDB or local connection status
app.get("/api/movies/status", (req, res) => {
  return res.json({
    tmdbActive: !!process.env.TMDB_API_KEY,
    geminiActive: !!process.env.GEMINI_API_KEY,
    currentTime: new Date().toISOString()
  });
});

// 1. GET CURATED SECTIONS (TMDB WITH SANDBOX FALLBACKS)
app.get("/api/movies/curated", async (req, res) => {
  const hasTMDB = !!process.env.TMDB_API_KEY;

  if (!hasTMDB) {
    console.log("[Server] Serving fallbacks from Sandbox Catalogue.");
    try {
      const sections = {
        trending: formattedCurated.slice(0, 15),
        popular: [
          ...formattedCurated.slice(5, 18),
          ...formattedCurated.slice(0, 3)
        ],
        classics: [
          formattedCurated[7],  // The Godfather
          formattedCurated[0],  // Interstellar
          formattedCurated[4],  // Spirited Away
          formattedCurated[11], // Breaking Bad
          formattedCurated[12], // Succession
          formattedCurated[14], // Chernobyl
          formattedCurated[18], // Death Note
          formattedCurated[21], // My Neighbor Totoro
        ],
        scifi: formattedCurated.filter(m => 
          m.genre.some(g => 
            g.toLowerCase().includes("science fiction") || 
            g.toLowerCase().includes("sci-fi") || 
            g.toLowerCase().includes("fantasy")
          )
        ),
        drama: formattedCurated.filter(m => 
          m.genre.some(g => g.toLowerCase().includes("drama"))
        ),
      };
      return res.json(sections);
    } catch (error) {
      return res.status(500).json({ error: "Failed to load curated lists" });
    }
  }

  try {
    console.log("[Server] Querying Live TMDb API to build sections.");
    
    // Perform all requests concurrently using Promise.allSettled for failure resilience
    const [trendingRes, popularRes, classicsRes, scifiRes, dramaRes] = await Promise.allSettled([
      fetchTMDB("/trending/all/week"),
      fetchTMDB("/movie/popular"),
      fetchTMDB("/discover/movie", { sort_by: "vote_average.desc", "vote_count.gte": "12000" }),
      fetchTMDB("/discover/movie", { with_genres: "878", sort_by: "popularity.desc" }),
      fetchTMDB("/discover/movie", { with_genres: "18", sort_by: "popularity.desc" })
    ]);

    const mappedTrending = trendingRes.status === "fulfilled" 
      ? trendingRes.value.results.map((m: any) => mapTMDBMovie(m)) 
      : formattedCurated.slice(0, 15);

    const mappedPopular = popularRes.status === "fulfilled" 
      ? popularRes.value.results.map((m: any) => mapTMDBMovie(m, "movie")) 
      : formattedCurated;

    const mappedClassics = classicsRes.status === "fulfilled" 
      ? classicsRes.value.results.map((m: any) => mapTMDBMovie(m, "movie")) 
      : formattedCurated;

    const mappedScifi = scifiRes.status === "fulfilled" 
      ? scifiRes.value.results.map((m: any) => mapTMDBMovie(m, "movie")) 
      : formattedCurated;

    const mappedDrama = dramaRes.status === "fulfilled" 
      ? dramaRes.value.results.map((m: any) => mapTMDBMovie(m, "movie")) 
      : formattedCurated;

    // Define local equivalents to merge so there is always plenty of content under filters
    const localClassics = [
      formattedCurated[7],  // The Godfather
      formattedCurated[0],  // Interstellar
      formattedCurated[4],  // Spirited Away
      formattedCurated[11], // Breaking Bad
      formattedCurated[12], // Succession
      formattedCurated[14], // Chernobyl
      formattedCurated[18], // Death Note
      formattedCurated[21], // My Neighbor Totoro
    ].filter(Boolean);

    const localScifi = formattedCurated.filter(m => 
      m.genre && m.genre.some((g: any) => 
        g.toLowerCase().includes("science fiction") || 
        g.toLowerCase().includes("sci-fi") || 
        g.toLowerCase().includes("fantasy")
      )
    );

    const localDrama = formattedCurated.filter(m => 
      m.genre && m.genre.some((g: any) => g.toLowerCase().includes("drama"))
    );

    const mergedTrending = mergeAndDeduplicate(mappedTrending, formattedCurated.slice(0, 15));
    const mergedPopular = mergeAndDeduplicate(mappedPopular, formattedCurated);
    const mergedClassics = mergeAndDeduplicate(mappedClassics, localClassics);
    const mergedScifi = mergeAndDeduplicate(mappedScifi, localScifi);
    const mergedDrama = mergeAndDeduplicate(mappedDrama, localDrama);

    return res.json({
      trending: mergedTrending,
      popular: mergedPopular,
      classics: mergedClassics,
      scifi: mergedScifi,
      drama: mergedDrama
    });
  } catch (error: any) {
    console.error("[Server] Curated lists TMDB error, falling back:", error);
    const sections = {
      trending: formattedCurated.slice(0, 15),
      popular: [
        ...formattedCurated.slice(5, 18),
        ...formattedCurated.slice(0, 3)
      ],
      classics: [
        formattedCurated[7],  // The Godfather
        formattedCurated[0],  // Interstellar
        formattedCurated[4],  // Spirited Away
        formattedCurated[11], // Breaking Bad
        formattedCurated[12], // Succession
        formattedCurated[14], // Chernobyl
        formattedCurated[18], // Death Note
        formattedCurated[21], // My Neighbor Totoro
      ],
      scifi: formattedCurated.filter(m => 
        m.genre.some(g => 
          g.toLowerCase().includes("science fiction") || 
          g.toLowerCase().includes("sci-fi") || 
          g.toLowerCase().includes("fantasy")
        )
      ),
      drama: formattedCurated.filter(m => 
        m.genre.some(g => g.toLowerCase().includes("drama"))
      ),
    };
    return res.json(sections);
  }
});

// JSON Schema definition for movie object returned by Gemini API
const movieResponseSchema = {
  type: Type.ARRAY,
  description: "A list of movies matches or resolved by search and metadata query",
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "A unique slug ID starting with title e.g. 'interstellar-157336'" },
      title: { type: Type.STRING },
      year: { type: Type.STRING },
      type: { type: Type.STRING, description: "Must be 'movie' or 'tv'" },
      tmdbId: { type: Type.INTEGER, description: "The TMDB ID of the film. Highly critical. Please look up real tmdb id" },
      imdbId: { type: Type.STRING, description: "Optional IMDB ID" },
      rating: { type: Type.NUMBER, description: "A floating number rating out of 10 e.g., 8.4" },
      genre: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      overview: { type: Type.STRING },
      posterUrl: { type: Type.STRING, description: "The TMDB poster path starting with '/', e.g. '/gEU2Qv2ilv87gRh0v7dgvYdjg67.jpg'" },
      backdropUrl: { type: Type.STRING, description: "The TMDB backdrop path starting with '/', e.g. '/xJH6Y7pQu6v7O8N769fUr7u68S8.jpg'" },
      runtime: { type: Type.STRING, description: "e.g., '148 min' or '5 Seasons'" },
      tagline: { type: Type.STRING },
      cast: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      director: { type: Type.STRING }
    },
    required: ["title", "year", "type", "tmdbId", "rating", "genre", "overview"]
  }
};

// 2. SEARCH MOVIES VIA TMDB OR SEMANTIC GEMINI API
app.get("/api/movies/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.json([]);
  }

  // Local/curated match lookup
  const localMatch = formattedCurated.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
  );

  const hasTMDB = !!process.env.TMDB_API_KEY;

  if (hasTMDB) {
    try {
      console.log(`[Server] Searching TMDb for "${query}".`);
      const searchRes = await fetchTMDB("/search/multi", { query });
      const mappedResults = searchRes.results
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .map((item: any) => mapTMDBMovie(item));

      // Append matches
      const merged = [...mappedResults];
      localMatch.forEach(l => {
        if (!merged.some(m => m.tmdbId === l.tmdbId)) {
          merged.unshift(l);
        }
      });
      return res.json(merged.slice(0, 10));
    } catch (err) {
      console.error("[Server] TMDB search failed, fallback to Gemini:", err);
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("Missing GEMINI_API_KEY. Returning local search results only.");
    return res.json(localMatch);
  }

  try {
    const prompt = `Search and resolve movie/TV show metadata matching the user query: "${query}".
Suggest up to 6 highly matching or highly relevant titles.
Provide real TMDB IDs, titles, ratings, genres, overviews, and exact TMDB image keys if you know them.
You can include any movies or TV series in the universe! Ensure you search through the entire catalog of movies to find matching titles.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional movie database assistant. You return high-quality movie lists matching the user's criteria. Make sure you use real TMDB IDs.",
        responseMimeType: "application/json",
        responseSchema: movieResponseSchema
      }
    });

    const textOutput = response.text || "[]";
    const movies = JSON.parse(textOutput);
    const parsedAndFormatted = movies.map(formatMovieUrls);

    const finalResults = [...parsedAndFormatted];
    localMatch.forEach(l => {
      if (!finalResults.some(m => m.tmdbId === l.tmdbId)) {
        finalResults.unshift(l);
      }
    });

    return res.json(finalResults.slice(0, 8));
  } catch (err: any) {
    console.error("Gemini Search Error:", err);
    return res.json(localMatch);
  }
});

// 3. GET SPECIFIC MOVIE DETAILS (TMDB WITH DYNAMIC FALLBACKS)
app.get("/api/movies/details/:id", async (req, res) => {
  const { id } = req.params;

  // Split type and integer id
  const parts = id.split("-");
  const parsedType = (parts[0] === "movie" || parts[0] === "tv") ? parts[0] : null;
  const tmdbIdStr = parts[parts.length - 1];
  const isValidTmdbId = /^\d+$/.test(tmdbIdStr);

  const hasTMDB = !!process.env.TMDB_API_KEY;

  if (hasTMDB && isValidTmdbId) {
    try {
      const actualType = parsedType || "movie";
      const actualId = tmdbIdStr;
      console.log(`[Server] Querying TMDb for details: ${actualType} ID ${actualId}`);

      const details = await fetchTMDB(`/${actualType}/${actualId}`, { append_to_response: "credits" });
      const mapped = mapTMDBMovie(details, actualType);
      return res.json(mapped);
    } catch (err) {
      console.error(`[Server] TMDb details query failed for ${id}:`, err);
    }
  }

  // Pre-selected Local search fallback
  const localMatch = formattedCurated.find(m => m.id === id);
  if (localMatch) {
    return res.json(localMatch);
  }

  // Gemini dynamic generation backup
  if (!process.env.GEMINI_API_KEY) {
    return res.status(404).json({ error: "Movie not found and AI engine is offline" });
  }

  try {
    const hasNumericId = /^\d+$/.test(tmdbIdStr);
    let prompt = `Provide the full detailed metadata for film ID/slug "${id}". `;
    if (hasNumericId) {
      prompt += `The TMDB ID is likely ${tmdbIdStr}. `;
    }

    prompt += `Return as an array containing exactly 1 highly detailed movie object matching this exact movie/show. 
Ensure you provide correct casting, overview, director, year, runtime, tagline and precise TMDB / IMDb IDs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a movie database assistant. Return exactly 1 element in the array representing the queried movie.",
        responseMimeType: "application/json",
        responseSchema: movieResponseSchema
      }
    });

    const textOutput = response.text || "[]";
    const movies = JSON.parse(textOutput);
    if (movies.length > 0) {
      const formatted = formatMovieUrls(movies[0]);
      return res.json(formatted);
    }
    
    return res.status(404).json({ error: "Movie details could not be resolved" });
  } catch (err) {
    console.error("Gemini Details Error:", err);
    return res.status(500).json({ error: "Internal server error resolving movie details" });
  }
});


// 4. GET TV SHOW SEASON EPISODES (TMDB / GEMINI AI / PROCEDURAL FALLBACKS)
app.get("/api/tv/:tmdbId/season/:season", async (req, res) => {
  const { tmdbId, season } = req.params;
  const showTitle = req.query.showTitle as string || "";
  const seasonNum = parseInt(season) || 1;

  // 1. Try TMDb API if key is present
  const hasTMDB = !!process.env.TMDB_API_KEY;
  if (hasTMDB && /^\d+$/.test(tmdbId)) {
    try {
      console.log(`[Server] Querying TV Show ${tmdbId} Season ${seasonNum} from TMDb`);
      const data = await fetchTMDB(`/tv/${tmdbId}/season/${seasonNum}`);
      if (data && data.episodes && Array.isArray(data.episodes)) {
        const mapped = data.episodes.map((ep: any) => ({
          episode_number: ep.episode_number,
          name: ep.name || `Episode ${ep.episode_number}`,
          overview: ep.overview || "",
          runtime: ep.runtime || 45,
        }));
        return res.json({ episodes: mapped });
      }
    } catch (err) {
      console.error(`[Server] TMDb season query failed for tv ${tmdbId} season ${seasonNum}:`, err);
    }
  }

  // 2. Try Gemini AI generation if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const showName = showTitle || (tmdbId === "1396" ? "Breaking Bad" : tmdbId === "1153" ? "Succession" : "Curated TV Series");
      console.log(`[Server] Generating season episodes via Gemini for: ${showName} Season ${seasonNum}`);
      const prompt = `Provide an accurate or highly realistic episodic guide for the TV show "${showName}", Season ${seasonNum}.
Return a JSON object with exactly one field "episodes", which is an array of objects. 
Each object in the array represents an episode and must contain:
1. "episode_number": integer
2. "name": string representing the accurate/best title of that episode (e.g. "Pilot" or "Crazy Handful of Nothin'" for Breaking Bad S1)
3. "overview": string of 1-2 sentences summarizing the episode's plot
4. "runtime": integer (average runtime in minutes, e.g. 45 or 60)

If it is a real show, please use the exact real episode titles and details. Return between 6 and 16 episodes depending on the normal season size.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a TV guide data assistant. Return a JSON object with an 'episodes' array containing realistic or real episode titles and metadata.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              episodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    episode_number: { type: Type.INTEGER },
                    name: { type: Type.STRING },
                    overview: { type: Type.STRING },
                    runtime: { type: Type.INTEGER }
                  },
                  required: ["episode_number", "name"]
                }
              }
            },
            required: ["episodes"]
          }
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      if (parsed.episodes && Array.isArray(parsed.episodes) && parsed.episodes.length > 0) {
        return res.json({ episodes: parsed.episodes });
      }
    } catch (err) {
      console.error("[Server] Gemini episodes generation error:", err);
    }
  }

  // 3. Procedural hardcoded / fitting fallback if offline or failed
  const hardcodedEpisodes: Record<string, string[]> = {
    "1396": [ // Breaking Bad S1
      "Pilot", 
      "Cat's in the Bag...", 
      "...And the Bag's in the River", 
      "Cancer Man", 
      "Gray Matter", 
      "Crazy Handful of Nothin'", 
      "A No-Rough-Stuff-Type-Deal"
    ],
    "1153": [ // Succession S1
      "Celebration",
      "Shit Show at the Fuck Factory",
      "Lifeboats",
      "Sad Sack Wasp Trap",
      "I Went to Market",
      "Which Side Are You On?",
      "Prague",
      "Chiantishire",
      "Pre-Takeover",
      "Nobody Is Ever Missing"
    ]
  };

  const defaultTitles = [
    "Chapter I: Catalyst",
    "Chapter II: The Rift",
    "Chapter III: Deep Echoes",
    "Chapter IV: Dark Alignment",
    "Chapter V: Precipice",
    "Chapter VI: The Paradigm",
    "Chapter VII: False Dawn",
    "Chapter VIII: Apex Point",
    "Chapter IX: Critical Mass",
    "Chapter X: Redemption"
  ];

  const targetTitles = hardcodedEpisodes[tmdbId] || defaultTitles;
  const episodes = targetTitles.map((title, idx) => ({
    episode_number: idx + 1,
    name: title,
    overview: `Chronicle details of chapter ${idx + 1} exploring character arcs and plot shifts.`,
    runtime: 50
  }));

  return res.json({ episodes });
});


// Vite middleware configuration and static delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Config Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Server middleware mounted.");
  } else {
    // Statics for Production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Flixr server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
