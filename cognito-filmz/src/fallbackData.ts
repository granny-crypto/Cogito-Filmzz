import { Movie, CuratedSections } from "./types";

export const FALLBACK_MOVIES: Movie[] = [
  {
    id: "interstellar-157336",
    title: "Interstellar",
    year: "2014",
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
    year: "2008",
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
    year: "2010",
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
    year: "2024",
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
    year: "2001",
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
    year: "2017",
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
    year: "2019",
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
    year: "1972",
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
    year: "1994",
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
    year: "2014",
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
    year: "2018",
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
    year: "2008",
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
    year: "2018",
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
    year: "2016",
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
    year: "2019",
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
    year: "2011",
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
    year: "2013",
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
    year: "2019",
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
    year: "2006",
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
    year: "2020",
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
    year: "2022",
    type: "tv",
    tmdbId: 108179,
    imdbId: "tt12590166",
    rating: 8.6,
    genre: ["Animation", "Action & Adventure", "Science Fiction", "Anime"],
    overview: "A street kid trying to survive in a technology and body modification-obsessed city of the future. Having everything to lose, he chooses to stay alive by becoming an edgerunner.",
    posterUrl: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&q=80&w=500",
    backdropUrl: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=1200",
    runtime: "1 Season",
    tagline: "Get high or die trying.",
    cast: ["KENN", "Aoi Yuki", "Hiroki Touchi", "Michiko Kaiden"],
    director: "Hiroyuki Imaishi"
  },
  {
    id: "my-neighbor-totoro-8392",
    title: "My Neighbor Totoro",
    year: "1988",
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

export const getCuratedFallbackSections = (): CuratedSections => {
  return {
    trending: FALLBACK_MOVIES.slice(0, 8),
    popular: FALLBACK_MOVIES.slice(5, 13),
    classics: [
      FALLBACK_MOVIES[7], // Godfather
      FALLBACK_MOVIES[0], // Interstellar
      FALLBACK_MOVIES[4], // Spirited Away
      FALLBACK_MOVIES[11], // Breaking Bad
      FALLBACK_MOVIES[12], // Succession
    ],
    scifi: FALLBACK_MOVIES.filter(m =>
      m.genre.some(g =>
        g.toLowerCase().includes("science fiction") ||
        g.toLowerCase().includes("sci-fi") ||
        g.toLowerCase().includes("fantasy")
      )
    ),
    drama: FALLBACK_MOVIES.filter(m =>
      m.genre.some(g => g.toLowerCase().includes("drama"))
    )
  };
};

export const searchLocalMovies = (query: string): Movie[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return FALLBACK_MOVIES.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.overview.toLowerCase().includes(q) ||
    m.genre.some(g => g.toLowerCase().includes(q))
  );
};

export const getMockEpisodes = (season: number, showTitle: string) => {
  const episodes = [];
  const epCount = season === 1 ? 8 : 6;
  for (let i = 1; i <= epCount; i++) {
    episodes.push({
      episode_number: i,
      name: `Exposition: Part ${i}`,
      overview: `A deep, moving narrative exploring character arcs inside ${showTitle} season ${season}, chapter ${i}.`,
      still_path: null,
      air_date: `Air Date ${i}`,
      vote_average: 8.5
    });
  }
  return { episodes };
};
