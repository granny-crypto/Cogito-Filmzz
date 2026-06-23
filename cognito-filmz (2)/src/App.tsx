import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Movie, CuratedSections, UserProfile, ContinueWatchingItem, UserAccount } from "./types";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import MovieDetailModal from "./components/MovieDetailModal";
import WatchlistSidebar from "./components/WatchlistSidebar";
import { Play, Star, Compass, Users, User, Plus, X, FolderHeart, Layout, Sparkles, Clock, Pencil, Sun, Moon } from "lucide-react";
import { getCuratedFallbackSections } from "./fallbackData";

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: "john-doe",
    name: "John Doe (Owner)",
    avatarColor: "bg-zinc-900 text-zinc-100 border border-zinc-700",
    watchlistIds: ["interstellar-157336"],
    watchlistMovies: [
      {
        id: "interstellar-157336",
        title: "Interstellar",
        year: "2014",
        type: "movie",
        tmdbId: 157336,
        rating: 8.6,
        genre: ["Sci-Fi", "Drama"],
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole..."
      }
    ],
    continueWatching: [
      {
        movie: {
          id: "interstellar-157336",
          title: "Interstellar",
          year: "2014",
          type: "movie",
          tmdbId: 157336,
          rating: 8.6,
          genre: ["Sci-Fi", "Drama"],
          overview: "The adventures of a group of explorers who make use of a newly discovered wormhole..."
        },
        percent: 68,
        elapsedSeconds: 6890,
        durationSeconds: 10140, // standard duration of interstellar is about 2h 49m
        timestamp: new Date().toLocaleDateString()
      }
    ]
  },
  {
    id: "cinema-enthusiast",
    name: "Cinema Enthusiast",
    avatarColor: "bg-amber-900 text-amber-100 border border-amber-800",
    watchlistIds: [],
    watchlistMovies: [],
    continueWatching: []
  },
  {
    id: "guest-critic",
    name: "Guest Critic",
    avatarColor: "bg-blue-950 text-blue-100 border border-blue-850",
    watchlistIds: [],
    watchlistMovies: [],
    continueWatching: []
  }
];

export default function App() {
  const [curated, setCurated] = useState<CuratedSections | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<{ tmdbActive: boolean; geminiActive: boolean } | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  // Account and session states
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountAction, setAccountAction] = useState<"login" | "signup">("login");
  const [loginError, setLoginError] = useState("");

  // Profile management states under the logged-in account
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileColor, setNewProfileColor] = useState("bg-rose-950 text-rose-100 border border-rose-800");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Fallback states in case no profile active or for initial tracking
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);

  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "series" | "anime">("all");

  const [trendingSort, setTrendingSort] = useState<"default" | "year" | "rating" | "alphabetical">("default");
  const [scifiSort, setScifiSort] = useState<"default" | "year" | "rating" | "alphabetical">("default");
  const [dramaSort, setDramaSort] = useState<"default" | "year" | "rating" | "alphabetical">("default");

  const [failedPosterMovieIds, setFailedPosterMovieIds] = useState<Set<string>>(() => new Set());

  const handlePosterError = useCallback((movieId: string) => {
    setFailedPosterMovieIds((prev) => {
      if (prev.has(movieId)) return prev;
      const next = new Set(prev);
      next.add(movieId);
      return next;
    });
  }, []);

  const isCleanShowcaseMovie = useCallback((m: Movie) => {
    // Show all movies that have some poster URL defined so that the sandbox and live catalogue are full of titles.
    // Individual cards will handle any image loading failures gracefully by displaying a beautiful fallback image.
    if (!m.posterUrl) return false;
    return true;
  }, []);

  useEffect(() => {
    setSelectedGenre("All");
  }, [mediaType]);

  const movieFilteredList = useMemo(() => {
    if (!curated) return [];
    const allMovies = [
      ...curated.trending,
      ...curated.popular,
      ...curated.classics,
      ...curated.scifi,
      ...curated.drama,
    ];
    // De-duplicate movies
    const seen = new Set<string>();
    const deduplicated: Movie[] = [];
    allMovies.forEach(m => {
      const key = m.id || `${m.type}-${m.tmdbId}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(m);
      }
    });

    const isAnime = (m: Movie) => m.genre && m.genre.includes("Anime");
    if (mediaType === "anime") return deduplicated.filter(isAnime);
    if (mediaType === "movie") return deduplicated.filter(m => m.type === "movie" && !isAnime(m));
    if (mediaType === "series") return deduplicated.filter(m => m.type === "tv" && !isAnime(m));
    return deduplicated;
  }, [curated, mediaType]);

  const fullyFilteredUnifiedList = useMemo(() => {
    if (!curated) return [];
    if (selectedGenre === "All") return movieFilteredList;
    return movieFilteredList.filter(
      (m) => m.genre && m.genre.includes(selectedGenre)
    );
  }, [movieFilteredList, selectedGenre, curated]);

  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    movieFilteredList.forEach((m) => {
      if (m.genre && Array.isArray(m.genre)) {
        m.genre.forEach((g) => {
          if (g && g !== "Anime") genresSet.add(g);
        });
      }
    });
    return ["All", ...Array.from(genresSet).sort()];
  }, [movieFilteredList]);

  const filteredTrending = useMemo(() => {
    if (!curated) return [];
    const isAnime = (m: Movie) => m.genre && m.genre.includes("Anime");
    let list = curated.trending;
    
    if (mediaType === "anime") list = list.filter(isAnime);
    else if (mediaType === "movie") list = list.filter(m => m.type === "movie" && !isAnime(m));
    else if (mediaType === "series") list = list.filter(m => m.type === "tv" && !isAnime(m));

    list = list.filter(isCleanShowcaseMovie);

    let sortedList = [...list];
    if (selectedGenre !== "All") {
      sortedList = sortedList.filter(
        (m) => m.genre && m.genre.includes(selectedGenre)
      );
    }

    if (trendingSort === "year") {
      sortedList.sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    } else if (trendingSort === "rating") {
      sortedList.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (trendingSort === "alphabetical") {
      sortedList.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }

    return sortedList;
  }, [curated, selectedGenre, mediaType, isCleanShowcaseMovie, trendingSort]);

  const filteredScifi = useMemo(() => {
    if (!curated) return [];
    const isAnime = (m: Movie) => m.genre && m.genre.includes("Anime");
    let list = curated.scifi;
    
    if (mediaType === "anime") list = list.filter(isAnime);
    else if (mediaType === "movie") list = list.filter(m => m.type === "movie" && !isAnime(m));
    else if (mediaType === "series") list = list.filter(m => m.type === "tv" && !isAnime(m));

    list = list.filter(isCleanShowcaseMovie);

    let sortedList = [...list];
    if (selectedGenre !== "All") {
      sortedList = sortedList.filter(
        (m) => m.genre && m.genre.includes(selectedGenre)
      );
    }

    if (scifiSort === "year") {
      sortedList.sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    } else if (scifiSort === "rating") {
      sortedList.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (scifiSort === "alphabetical") {
      sortedList.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }

    return sortedList;
  }, [curated, selectedGenre, mediaType, isCleanShowcaseMovie, scifiSort]);

  const filteredDrama = useMemo(() => {
    if (!curated) return [];
    const isAnime = (m: Movie) => m.genre && m.genre.includes("Anime");
    let list = curated.drama;
    
    if (mediaType === "anime") list = list.filter(isAnime);
    else if (mediaType === "movie") list = list.filter(m => m.type === "movie" && !isAnime(m));
    else if (mediaType === "series") list = list.filter(m => m.type === "tv" && !isAnime(m));

    list = list.filter(isCleanShowcaseMovie);

    let sortedList = [...list];
    if (selectedGenre !== "All") {
      sortedList = sortedList.filter(
        (m) => m.genre && m.genre.includes(selectedGenre)
      );
    }

    if (dramaSort === "year") {
      sortedList.sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    } else if (dramaSort === "rating") {
      sortedList.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (dramaSort === "alphabetical") {
      sortedList.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }

    return sortedList;
  }, [curated, selectedGenre, mediaType, isCleanShowcaseMovie, dramaSort]);

  // Smooth subtle mouse-parallax positioning tracking for modern interactive liquid glass background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / innerWidth;
      const y = (e.clientY - innerHeight / 2) / innerHeight;
      document.documentElement.style.setProperty('--mouse-offset-x', `${x * 16}px`);
      document.documentElement.style.setProperty('--mouse-offset-y', `${y * 16}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Theme state supporting continuous smooth transitions requested by user
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("cinematheque_theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.backgroundColor = "#09090b";
      document.body.style.backgroundColor = "#09090b";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "#FDFDFC";
      document.body.style.backgroundColor = "#FDFDFC";
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cinematheque_theme", next);
      return next;
    });
  };

  // Available colors for custom profile builder
  const PROFILE_COLORS = [
    { class: "bg-rose-950 text-rose-100 border border-rose-800", name: "Rose Silk" },
    { class: "bg-emerald-950 text-emerald-100 border border-emerald-800", name: "Emerald Forest" },
    { class: "bg-indigo-950 text-indigo-100 border border-indigo-800", name: "Imperial Blue" },
    { class: "bg-amber-900 text-amber-100 border border-amber-800", name: "Amber Ochre" },
    { class: "bg-zinc-900 text-zinc-100 border border-zinc-700", name: "Obsidian Slate" },
    { class: "bg-violet-950 text-violet-100 border border-violet-850", name: "Ametrine Royal" },
  ];

  // Initialize and load accounts/profiles
  useEffect(() => {
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/movies/status");
        if (res.ok) {
          const data = await res.json();
          setApiStatus(data);
        } else {
          setApiStatus({ tmdbActive: false, geminiActive: false });
        }
      } catch (err) {
        console.error("Failed to fetch API status, using offline status:", err);
        setApiStatus({ tmdbActive: false, geminiActive: false });
      }
    };

    const fetchCurated = async () => {
      try {
        const res = await fetch("/api/movies/curated");
        if (res.ok) {
          const data = await res.json();
          setCurated(data);
          
          if (data.trending && data.trending.length > 0) {
            setFeaturedMovie(data.trending[0]);
          }
        } else {
          console.warn("Backend curated list endpoint unavailable. Invoking frontend fallbacks.");
          const fallbackData = getCuratedFallbackSections();
          setCurated(fallbackData);
          if (fallbackData.trending && fallbackData.trending.length > 0) {
            setFeaturedMovie(fallbackData.trending[0]);
          }
        }
      } catch (err) {
        console.error("Network error on fetching curated data. Invoking frontend fallbacks:", err);
        const fallbackData = getCuratedFallbackSections();
        setCurated(fallbackData);
        if (fallbackData.trending && fallbackData.trending.length > 0) {
          setFeaturedMovie(fallbackData.trending[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    fetchCurated();

    // Load active account and profiles from localStorage
    try {
      const storedAccounts = localStorage.getItem("flixr_accounts");
      let currentAccounts: UserAccount[] = [];
      
      if (storedAccounts) {
        if (storedAccounts.toLowerCase().includes("jayden")) {
          // Clear and block pre-existing personal data to maintain strict privacy
          localStorage.removeItem("flixr_accounts");
          localStorage.removeItem("flixr_active_account_id");
        } else {
          try {
            currentAccounts = JSON.parse(storedAccounts);
          } catch (e) {
            currentAccounts = [];
          }
        }
      }
      
      if (currentAccounts.length === 0) {
        currentAccounts = [
          {
            id: "john-account",
            email: "john@flixr.com",
            passwordPlain: "password",
            profiles: DEFAULT_PROFILES,
          },
        ];
        localStorage.setItem("flixr_accounts", JSON.stringify(currentAccounts));
      }
      setAccounts(currentAccounts);

      const storedAccountId = localStorage.getItem("flixr_active_account_id");
      if (storedAccountId) {
        const account = currentAccounts.find((a) => a.id === storedAccountId);
        if (account) {
          setActiveAccount(account);
          setProfiles(account.profiles);

          const storedActiveId = localStorage.getItem(`flixr_active_profile_id_${account.id}`);
          let currentActive: UserProfile | null = null;
          if (storedActiveId) {
            currentActive = account.profiles.find((p) => p.id === storedActiveId) || null;
          }
          
          if (currentActive) {
            setActiveProfile(currentActive);
            setWatchlistIds(currentActive.watchlistIds || []);
            setWatchlistMovies(currentActive.watchlistMovies || []);
            setContinueWatching(currentActive.continueWatching || []);
          } else {
            // Profile selector must be shown for selection
            setShowProfileSelector(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed loading user profiles database:", e);
    }
  }, []);

  // Account login / registration handlers
  const handleAccountLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const emailClean = accountEmail.trim().toLowerCase();
    const passwordClean = accountPassword;

    if (!emailClean || !passwordClean) {
      setLoginError("Credentials cannot be empty.");
      return;
    }

    const matched = accounts.find(
      (a) => a.email.toLowerCase() === emailClean && a.passwordPlain === passwordClean
    );

    if (matched) {
      setActiveAccount(matched);
      setProfiles(matched.profiles);
      localStorage.setItem("flixr_active_account_id", matched.id);

      // Try reading previous active profile for this account
      const storedActiveId = localStorage.getItem(`flixr_active_profile_id_${matched.id}`);
      const prevProfile = matched.profiles.find((p) => p.id === storedActiveId);
      
      if (prevProfile) {
        setActiveProfile(prevProfile);
        setWatchlistIds(prevProfile.watchlistIds || []);
        setWatchlistMovies(prevProfile.watchlistMovies || []);
        setContinueWatching(prevProfile.continueWatching || []);
        setShowProfileSelector(false);
      } else {
        setActiveProfile(null);
        setShowProfileSelector(true);
      }
      
      // Clear inputs
      setAccountEmail("");
      setAccountPassword("");
    } else {
      setLoginError("Invalid email or password. Feel free to use the demo credentials below.");
    }
  };

  const handleAccountSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const emailClean = accountEmail.trim().toLowerCase();
    const passwordClean = accountPassword;

    if (!emailClean || !passwordClean) {
      setLoginError("Credentials cannot be empty.");
      return;
    }

    // Check if email already registered
    const exists = accounts.some((a) => a.email.toLowerCase() === emailClean);
    if (exists) {
      setLoginError("This email address is already registered.");
      return;
    }

    // Create a default starting profile for a newly minted account
    const namePrefix = emailClean.split("@")[0].toUpperCase();
    const initialProfile: UserProfile = {
      id: `profile-owner-${Date.now()}`,
      name: namePrefix.slice(0, 15),
      avatarColor: "bg-rose-950 text-rose-100 border border-rose-800",
      watchlistIds: [],
      watchlistMovies: [],
      continueWatching: [],
    };

    const newAccount: UserAccount = {
      id: `account-${Date.now()}`,
      email: emailClean,
      passwordPlain: passwordClean,
      profiles: [initialProfile],
    };

    const updatedAccountsList = [...accounts, newAccount];
    setAccounts(updatedAccountsList);
    localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));

    // Sign into it immediately
    setActiveAccount(newAccount);
    setProfiles([initialProfile]);
    localStorage.setItem("flixr_active_account_id", newAccount.id);

    // Set fallback active profile to the owner profile we built
    setActiveProfile(initialProfile);
    localStorage.setItem(`flixr_active_profile_id_${newAccount.id}`, initialProfile.id);
    setWatchlistIds([]);
    setWatchlistMovies([]);
    setContinueWatching([]);
    
    // Direct them into the app
    setShowProfileSelector(false);

    // Clear inputs
    setAccountEmail("");
    setAccountPassword("");
  };

  const handleAccountLogout = () => {
    setActiveAccount(null);
    setActiveProfile(null);
    setProfiles([]);
    setWatchlistIds([]);
    setWatchlistMovies([]);
    setContinueWatching([]);
    setSelectedMovie(null);
    localStorage.removeItem("flixr_active_account_id");
  };

  // Sync profile watchlist items as they load
  const handleToggleWatchlist = (movieId: string) => {
    if (!activeProfile || !activeAccount) return;

    let updatedIds = [...watchlistIds];
    let updatedMovies = [...watchlistMovies];

    if (updatedIds.includes(movieId)) {
      updatedIds = updatedIds.filter((id) => id !== movieId);
      updatedMovies = updatedMovies.filter((m) => m.id !== movieId);
    } else {
      updatedIds.push(movieId);
      let found: Movie | undefined;
      if (curated) {
        const allSections = [
          ...curated.trending,
          ...curated.popular,
          ...curated.classics,
          ...curated.scifi,
          ...curated.drama,
        ];
        found = allSections.find((m) => m.id === movieId);
      }
      
      if (!found && selectedMovie && selectedMovie.id === movieId) {
        found = selectedMovie;
      }
      
      if (found) {
        updatedMovies.push(found);
      }
    }

    setWatchlistIds(updatedIds);
    setWatchlistMovies(updatedMovies);

    const updatedProfile = {
      ...activeProfile,
      watchlistIds: updatedIds,
      watchlistMovies: updatedMovies,
    };
    setActiveProfile(updatedProfile);

    // Update profiles state
    const updatedProfilesList = profiles.map((p) => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfilesList);

    // Update activeAccount
    const updatedAccount = {
      ...activeAccount,
      profiles: updatedProfilesList,
    };
    setActiveAccount(updatedAccount);

    // Update accounts array
    const updatedAccountsList = accounts.map((a) => a.id === activeAccount.id ? updatedAccount : a);
    setAccounts(updatedAccountsList);
    localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));
  };

  const handleSetContinueWatching = (
    movie: Movie,
    season?: number,
    episode?: number,
    elapsedSeconds?: number,
    durationSeconds?: number
  ) => {
    if (!activeProfile || !activeAccount) return;

    // Determine default video stream physical duration
    const defaultDuration = movie.type === "tv" ? 2700 : 7200; // default to 45 mins or 2 hours
    const finalDuration = durationSeconds || defaultDuration;
    const finalElapsed = elapsedSeconds !== undefined ? elapsedSeconds : 0;
    const finalPercent = Math.min(100, Math.max(0, Math.round((finalElapsed / finalDuration) * 100)));

    let updated = continueWatching.filter((item) => item.movie.id !== movie.id);
    const newItem: ContinueWatchingItem = {
      movie,
      season,
      episode,
      percent: finalPercent,
      elapsedSeconds: finalElapsed,
      durationSeconds: finalDuration,
      timestamp: new Date().toLocaleDateString(),
    };
    updated.unshift(newItem); // Put on top
    updated = updated.slice(0, 8); // Limit to largest 8 items

    setContinueWatching(updated);

    const updatedProfile = {
      ...activeProfile,
      continueWatching: updated,
    };
    setActiveProfile(updatedProfile);

    const updatedProfilesList = profiles.map((p) => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfilesList);

    const updatedAccount = {
      ...activeAccount,
      profiles: updatedProfilesList,
    };
    setActiveAccount(updatedAccount);

    const updatedAccountsList = accounts.map((a) => a.id === activeAccount.id ? updatedAccount : a);
    setAccounts(updatedAccountsList);
    localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));
  };

  const handleClearContinueWatching = (id: string) => {
    if (!activeProfile || !activeAccount) return;

    const updated = continueWatching.filter((item) => item.movie.id !== id);
    setContinueWatching(updated);

    const updatedProfile = {
      ...activeProfile,
      continueWatching: updated,
    };
    setActiveProfile(updatedProfile);

    const updatedProfilesList = profiles.map((p) => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfilesList);

    const updatedAccount = {
      ...activeAccount,
      profiles: updatedProfilesList,
    };
    setActiveAccount(updatedAccount);

    const updatedAccountsList = accounts.map((a) => a.id === activeAccount.id ? updatedAccount : a);
    setAccounts(updatedAccountsList);
    localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));
  };

  // Switch Profiles Handler
  const handleSwitchProfile = (profileId: string) => {
    if (!activeAccount) return;
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      setActiveProfile(target);
      localStorage.setItem(`flixr_active_profile_id_${activeAccount.id}`, target.id);
      setWatchlistIds(target.watchlistIds || []);
      setWatchlistMovies(target.watchlistMovies || []);
      setContinueWatching(target.continueWatching || []);
      setSelectedMovie(null);
    }
  };

  // Add/Edit Custom Profile Handler
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || !activeAccount) return;

    if (editingProfileId) {
      // Edit mode
      const updatedProfilesList = profiles.map((p) => {
        if (p.id === editingProfileId) {
          return {
            ...p,
            name: newProfileName.trim(),
            avatarColor: newProfileColor,
          };
        }
        return p;
      });

      setProfiles(updatedProfilesList);

      // If edited profile is currently active, sync it
      const updatedActive = updatedProfilesList.find((p) => p.id === editingProfileId);
      if (updatedActive && activeProfile?.id === editingProfileId) {
        setActiveProfile(updatedActive);
        setWatchlistIds(updatedActive.watchlistIds || []);
        setWatchlistMovies(updatedActive.watchlistMovies || []);
        setContinueWatching(updatedActive.continueWatching || []);
      }

      const updatedAccount = {
        ...activeAccount,
        profiles: updatedProfilesList,
      };
      setActiveAccount(updatedAccount);

      const updatedAccountsList = accounts.map((a) => a.id === activeAccount.id ? updatedAccount : a);
      setAccounts(updatedAccountsList);
      localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));
    } else {
      // Create mode
      const newId = `profile-${Date.now()}`;
      const newProfile: UserProfile = {
        id: newId,
        name: newProfileName.trim(),
        avatarColor: newProfileColor,
        watchlistIds: [],
        watchlistMovies: [],
        continueWatching: [],
      };

      const updatedProfilesList = [...profiles, newProfile];
      setProfiles(updatedProfilesList);

      // Sign in to the newly generated profile immediately!
      setActiveProfile(newProfile);
      localStorage.setItem(`flixr_active_profile_id_${activeAccount.id}`, newId);
      setWatchlistIds([]);
      setWatchlistMovies([]);
      setContinueWatching([]);

      const updatedAccount = {
        ...activeAccount,
        profiles: updatedProfilesList,
      };
      setActiveAccount(updatedAccount);

      const updatedAccountsList = accounts.map((a) => a.id === activeAccount.id ? updatedAccount : a);
      setAccounts(updatedAccountsList);
      localStorage.setItem("flixr_accounts", JSON.stringify(updatedAccountsList));
    }
    
    // Reset and close UI controls
    setNewProfileName("");
    setEditingProfileId(null);
    setShowProfileSelector(false);
  };

  // Dynamic background colors depending on movie hover state, matching front page hues (emerald/teal for spotlight animation, customizable per genre)
  const bgColors = (() => {
    const targetMovie = hoveredMovie || featuredMovie;
    if (!targetMovie) {
      return {
        orb1: "from-[#10b981]/10 via-[#14b8a6]/8 to-[#06b6d4]/8",
        orb2: "from-[#06b6d4]/10 via-[#10b981]/8 to-[#14b8a6]/8",
        orb3: "from-[#14b8a6]/8 via-[#06b6d4]/8 to-[#10b981]/8",
      };
    }

    const primaryGenre = targetMovie.genre && targetMovie.genre.length > 0 ? targetMovie.genre[0].toLowerCase() : "";
    const op1 = theme === "dark" ? "14" : "6";
    const op2 = theme === "dark" ? "10" : "4";
    const op3 = theme === "dark" ? "10" : "4";

    if (primaryGenre.includes("animation") || primaryGenre.includes("family") || primaryGenre.includes("fantasy")) {
      // Matches the signature emerald/teal highlights requested for the spotlight movie
      return {
        orb1: `from-emerald-500/${op1} via-teal-400/${op2} to-cyan-400/${op3}`,
        orb2: `from-cyan-400/${op1} via-emerald-500/${op2} to-teal-400/${op3}`,
        orb3: `from-teal-400/${op1} via-cyan-400/${op2} to-emerald-400/${op3}`,
      };
    } else if (primaryGenre.includes("science fiction") || primaryGenre.includes("scifi") || primaryGenre.includes("space")) {
      // Futuristic celestial cyan and deep indigo space tones
      return {
        orb1: `from-cyan-500/${op1} via-blue-500/${op2} to-indigo-500/${op3}`,
        orb2: `from-indigo-500/${op1} via-cyan-500/${op2} to-blue-400/${op3}`,
        orb3: `from-teal-500/${op1} via-blue-600/${op2} to-cyan-500/${op3}`,
      };
    } else if (primaryGenre.includes("drama") || primaryGenre.includes("crime") || primaryGenre.includes("mystery")) {
      // Moody, stylish royal violet and deep slate colors
      return {
        orb1: `from-violet-500/${op1} via-indigo-500/${op2} to-slate-500/${op3}`,
        orb2: `from-slate-500/${op1} via-violet-500/${op2} to-indigo-500/${op3}`,
        orb3: `from-indigo-500/${op1} via-slate-500/${op2} to-violet-500/${op3}`,
      };
    } else if (primaryGenre.includes("action") || primaryGenre.includes("adventure") || primaryGenre.includes("thriller")) {
      // Active high energy orange and gold elements with warm lime contrast
      return {
        orb1: `from-amber-500/${op1} via-orange-500/${op2} to-yellow-500/${op3}`,
        orb2: `from-yellow-500/${op1} via-amber-500/${op2} to-orange-400/${op3}`,
        orb3: `from-orange-400/${op1} via-yellow-500/${op2} to-amber-500/${op3}`,
      };
    } else if (primaryGenre.includes("comedy")) {
      // Joyous solar yellow and lively emerald green accent notes
      return {
        orb1: `from-yellow-400/${op1} via-emerald-500/${op2} to-teal-400/${op3}`,
        orb2: `from-teal-400/${op1} via-yellow-400/${op2} to-emerald-500/${op3}`,
        orb3: `from-emerald-500/${op1} via-teal-400/${op2} to-yellow-300/${op3}`,
      };
    }

    // Dynamic, classy deep teal & cyan defaults
    return {
      orb1: `from-emerald-500/${op1} via-teal-400/${op2} to-cyan-400/${op3}`,
      orb2: `from-cyan-400/${op1} via-emerald-500/${op2} to-teal-400/${op3}`,
      orb3: `from-teal-400/${op1} via-cyan-400/${op2} to-emerald-500/${op3}`,
    };
  })();

  return (
    <div className={`min-h-screen relative flex flex-col antialiased overflow-hidden transition-colors duration-[800ms] ease-in-out ${
      theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-[#FDFDFC] text-[#1A1A1A]"
    }`}>
      {/* Background High-Contrast Fluid Textures - covers the full background with dynamic mouse interactive drift */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-1000"
        style={{
          transform: `translate(calc(-1 * var(--mouse-offset-x, 0px)), calc(-1 * var(--mouse-offset-y, 0px))) scale(1.04)`,
          transition: "transform 0.4s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 1s ease",
        }}
      >
        <img
          src={theme === "dark" 
            ? "/src/assets/images/dark_abstract_fluid_bg_1782134272487.jpg" 
            : "/src/assets/images/light_abstract_texture_1782134725981.jpg"
          }
          alt={theme === "dark" ? "Seamless Dark Liquid Fluid Texture" : "Seamless Light Abstract Texture"}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-1000 will-change-transform ${
            theme === "dark" ? "opacity-25 filter md:blur-[2px] blur-none" : "opacity-[0.80] filter md:blur-[1px] blur-none mix-blend-multiply"
          }`}
        />
        <div className={`absolute inset-0 transition-colors duration-[800ms] ${
          theme === "dark" 
            ? "bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" 
            : "bg-gradient-to-b from-[#FDFDFC]/30 via-[#FDFDFC]/70 to-[#FDFDFC]/90"
        }`} />
      </div>

      {/* Dynamic Background Organic Liquid Orbs for Liquid Glass Effect - responsive to mouse hover parallax (Desktop only to prevent severe low-performance lag) */}
      <div 
        className="fixed inset-0 overflow-hidden pointer-events-none z-0 hidden sm:block"
        style={{
          transform: `translate(calc(1.5 * var(--mouse-offset-x, 0px)), calc(1.5 * var(--mouse-offset-y, 0px)))`,
          transition: "transform 0.5s cubic-bezier(0.1, 0.8, 0.2, 1)",
        }}
      >
        <div className="absolute top-[-5%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-rose-500/20 via-pink-400/20 to-violet-500/10 filter blur-[100px] animate-pulse transition-all duration-[1200ms] ease-in-out" style={{ animationDuration: '14s' }} />
        <div className="absolute bottom-[5%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-450/25 to-sky-400/10 filter blur-[120px] animate-pulse transition-all duration-[1200ms] ease-in-out" style={{ animationDuration: '20s' }} />
        <div className="absolute top-[30%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-r from-teal-400/15 via-cyan-400/20 to-emerald-500/15 filter blur-[110px] animate-pulse transition-all duration-[1200ms] ease-in-out" style={{ animationDuration: '18s' }} />
      </div>

      {!activeAccount ? (
        <>
          {/* Top minimal header */}
          <div className={`border-b text-[10px] sm:text-xs font-mono py-4 px-6 sm:px-12 flex items-center justify-between transition-all duration-750 ease-in-out backdrop-blur-xl relative z-10 ${
            theme === "dark" 
              ? "bg-[#09090b]/60 border-white/8 text-zinc-300"
              : "bg-[#FDFDFC]/65 border-zinc-950/10 text-[#1A1A1A]/70"
          }`}>
            <div className="flex flex-col cursor-pointer" onClick={() => window.location.reload()}>
              <h1 className={`text-sm font-serif italic tracking-tight font-black transition-colors duration-500 ${
                theme === "dark" ? "text-zinc-50" : "text-zinc-950"
              }`}>
                CINÉMATHÈQUE
              </h1>
              <span className={`text-[7.5px] font-mono tracking-widest font-bold uppercase select-none transition-colors duration-500 ${
                theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/50"
              }`}>
                PREMIUM EXHIBITION CATALOG
              </span>
            </div>
            
            <div className="flex items-center space-x-5">
              {/* Login Theme Toggle Button */}
              <div 
                onClick={handleToggleTheme}
                className={`h-7 w-16 rounded-full p-0.5 flex items-center relative select-none border cursor-pointer backdrop-blur-md shadow-xs transition-all duration-500 ${
                  theme === "dark" 
                    ? "bg-white/10 border-white/20 hover:bg-white/12" 
                    : "bg-black/5 border-black/10 hover:bg-black/10"
                }`}
                title="Toggle light/dark layout format"
              >
                <div className={`h-5 w-5 rounded-full absolute transition-all duration-300 flex items-center justify-center ${
                  theme === "dark" ? "left-9 bg-zinc-800 border border-white/10 text-white" : "left-0.5 bg-white border border-zinc-200 text-zinc-950"
                }`}>
                  {theme === "dark" ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                </div>
              </div>

              <div className="text-[9px] sm:text-xs font-mono uppercase tracking-wider font-bold">
                CURATED SELECTION
              </div>
            </div>
          </div>

          {/* Centered Login Box with Liquid Glass Effect */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`max-w-md w-full border backdrop-blur-2xl p-8 sm:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.15)] transition-all duration-750 ease-in-out space-y-8 rounded-[24px] ${
                theme === "dark"
                  ? "border-white/15 bg-zinc-900/40 text-zinc-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]"
                  : "border-white/60 bg-white/40 text-[#1A1A1A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"
              }`}
            >
              <div className="space-y-2">
                <span className={`text-[9px] font-mono tracking-[0.25em] uppercase font-black block transition-colors duration-550 ${
                  theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/40"
                }`}>MEMBERSHIP PORTAL</span>
                <h2 className={`text-3xl sm:text-4xl font-serif italic tracking-tight leading-tight transition-colors duration-550 ${
                  theme === "dark" ? "text-zinc-50" : "text-neutral-900"
                }`}>
                  {accountAction === "login" ? "Welcome back" : "Create Account"}
                </h2>
                <p className={`text-[11px] leading-relaxed font-light transition-colors duration-550 ${
                  theme === "dark" ? "text-zinc-300" : "text-[#1A1A1A]/60"
                }`}>
                  {accountAction === "login" 
                    ? "Sign in to access your custom watchlist, playback progress, and personalized screens."
                    : "Create an account to begin curation of your cinema watchlists and movie histories."}
                </p>
              </div>

              {/* Mode Switcher Buttons */}
              <div className={`grid grid-cols-2 border p-0.5 text-center font-mono text-[9px] uppercase tracking-wider rounded-xl ${
                theme === "dark" ? "border-white/10" : "border-[#1A1A1A]/10"
              }`}>
                <button
                  type="button"
                  onClick={() => { setAccountAction("login"); setLoginError(""); }}
                  className={`py-2 cursor-pointer transition-all duration-300 rounded-[10px] ${
                    accountAction === "login" 
                      ? (theme === "dark" ? "bg-white text-black font-semibold" : "bg-[#1A1A1A] text-white font-bold") 
                      : (theme === "dark" ? "hover:bg-white/5 text-zinc-400" : "hover:bg-[#F5F5F0] text-[#1A1A1A]/60")
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAccountAction("signup"); setLoginError(""); }}
                  className={`py-2 cursor-pointer transition-all duration-300 rounded-[10px] ${
                    accountAction === "signup" 
                      ? (theme === "dark" ? "bg-white text-black font-semibold" : "bg-[#1A1A1A] text-white font-bold") 
                      : (theme === "dark" ? "hover:bg-white/5 text-zinc-400" : "hover:bg-[#F5F5F0] text-[#1A1A1A]/60")
                  }`}
                >
                  Create Account
                </button>
              </div>

              {loginError && (
                <div className={`p-3 border text-[11px] font-mono rounded-none leading-relaxed ${
                  theme === "dark"
                    ? "bg-rose-950/20 border-rose-900/30 text-rose-300"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}>
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-[9px]">Authorization Error</span>
                  {loginError}
                </div>
              )}

              <form onSubmit={accountAction === "login" ? handleAccountLogin : handleAccountSignUp} className="space-y-4">
                <div className="space-y-1">
                  <label className={`text-[9px] font-mono tracking-widest uppercase font-bold block ${
                    theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/55"
                  }`}>
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@flixr.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className={`w-full text-xs px-4 py-3 rounded-md outline-none transition duration-300 ${
                      theme === "dark"
                        ? "bg-zinc-800/60 border border-white/10 text-white placeholder:text-zinc-500 focus:bg-zinc-900/90 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                        : "bg-[#F5F5F0] border border-transparent focus:border-[#1A1A1A] focus:bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:ring-2 focus:ring-zinc-900/5"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[9px] font-mono tracking-widest uppercase font-bold block ${
                    theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/55"
                  }`}>
                    Security Pass Token (Password)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter security password"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className={`w-full text-xs px-4 py-3 rounded-md outline-none transition duration-300 ${
                      theme === "dark"
                        ? "bg-zinc-800/60 border border-white/10 text-white placeholder:text-zinc-500 focus:bg-zinc-900/90 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                        : "bg-[#F5F5F0] border border-transparent focus:border-[#1A1A1A] focus:bg-white text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:ring-2 focus:ring-zinc-900/5"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full h-12 text-xs font-mono font-bold uppercase tracking-widest transition cursor-pointer flex items-center justify-center space-x-2 border-none rounded-md shadow-xs active:scale-98 ${
                    theme === "dark"
                      ? "bg-white text-black hover:bg-zinc-150"
                      : "bg-[#1A1A1A] hover:bg-black text-[#FDFDFC]"
                  }`}
                >
                  <span>{accountAction === "login" ? "Authorize Entry" : "Create Isolated Node"}</span>
                </button>
              </form>

              {/* Convenience Quick Demonstration Autofills */}
              <div className={`border-t pt-6 space-y-2.5 ${
                theme === "dark" ? "border-white/10" : "border-[#1A1A1A]/10"
              }`}>
                <span className={`text-[8px] font-mono tracking-widest uppercase font-bold block ${
                  theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/40"
                }`}>
                  DEMO PASSWORDS (ANYONE CAN LOG IN SHELF)
                </span>
                
                <div 
                  onClick={() => {
                    setAccountEmail("john@flixr.com");
                    setAccountPassword("password");
                    setAccountAction("login");
                    setLoginError("");
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition flex items-center justify-between text-[11px] ${
                    theme === "dark"
                      ? "bg-zinc-800/40 hover:bg-zinc-800/70 border-white/8 text-zinc-300"
                      : "bg-[#F5F5F0] hover:bg-[#EAEAE2] border-[#1A1A1A]/10 text-neutral-800"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className={`font-mono text-[9px] font-bold block ${
                      theme === "dark" ? "text-zinc-100" : "text-[#1A1A1A]"
                    }`}>John Doe's Curated Base</span>
                    <span className={`font-mono text-[9px] font-light block ${
                      theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/60"
                    }`}>
                      Email: <span className="underline font-semibold">john@flixr.com</span> &bull; Pass: <span className="underline font-semibold">password</span>
                    </span>
                  </div>
                  <div className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-sm shrink-0 scale-95 ${
                    theme === "dark" ? "bg-white text-black" : "bg-[#1A1A1A] text-white"
                  }`}>
                    Autofill &rarr;
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <>
          {/* Absolute top minimal status ribbon with editorial tones */}
          <div className={`transition-all duration-750 ease-in-out border-b py-3 px-6 sm:px-12 flex items-center justify-between text-[10px] sm:text-xs font-mono relative z-21 ${
            theme === "dark" 
              ? "bg-[#09090b]/85 border-white/5 text-zinc-400" 
              : "bg-[#FDFDFC]/90 border-zinc-950/5 text-[#1A1A1A]/45"
          }`}>
            <div className="flex items-center space-x-2.5">
              <span className={`w-1.5 h-1.5 rounded-full ${apiStatus?.tmdbActive ? "bg-zinc-400 dark:bg-zinc-600" : "bg-[#1A1A1A]/30"}`} />
              {isIframe ? (
                <span className="flex items-center space-x-2.5">
                  <span className={`${theme === "dark" ? "text-zinc-300" : "text-[#1A1A1A]/60"} font-semibold`}>CINEMATIC STREAM VIEWER</span>
                  <span>&mdash;</span>
                  <button 
                    onClick={() => window.open(window.location.origin, "_blank")}
                    className={`border px-2.5 py-0.5 font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition duration-300 rounded-sm ${
                      theme === "dark" 
                        ? "hover:bg-white hover:text-black border-white/12 text-zinc-100" 
                        : "hover:bg-[#1A1A1A] hover:text-[#FDFDFC] border-[#1A1A1A]/15 text-[#1A1A1A]"
                    }`}
                  >
                    Open player in new tab ↗
                  </button>
                </span>
              ) : (
                <span>Cinema Exhibition Feed Available &bull; Catalog Sync</span>
              )}
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span>{apiStatus?.tmdbActive ? "TMDb API Server Online" : "TMDb Sandbox Active"}</span>
              <span>&bull;</span>
              <span>VOLUME 12</span>
              <span>&bull;</span>
              <span>Zero-buffer embeds</span>
            </div>
          </div>

          {/* Main navigation controller */}
          <Navbar
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onOpenLibrary={() => setIsSidebarOpen(true)}
            savedCount={watchlistIds.length}
            activeProfile={activeProfile}
            profiles={profiles}
            onSwitchProfile={handleSwitchProfile}
            onOpenProfileSelector={() => setShowProfileSelector(true)}
            onLogout={handleAccountLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

      {/* Hero Interactive Billboard Section (Plenty of White Space & Asymmetrical spotlight layout) */}
      <main className="flex-1 pb-24 relative z-10">
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <span className="w-6 h-6 rounded-full border border-zinc-500/20 border-t-zinc-900 animate-spin" />
            <p className={`text-xs font-mono transition-colors duration-500 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}>Loading exhibition catalog...</p>
          </div>
        ) : (
          <div className="space-y-24">
            {featuredMovie && (
              <div 
                id="hero-billboard"
                className="relative px-6 sm:px-12 pt-10 sm:pt-16 pb-12 overflow-hidden"
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                  
                  {/* Left Metadata details as an editorial Spotlight article */}
                  <div className="lg:col-span-7 flex flex-col items-start pt-2">
                    <div className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 transition-colors duration-500 ${
                      theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/50"
                    }`}>
                      CURRENT SPOTLIGHT / Volume 12.0
                    </div>

                    <h2 className={`text-4xl sm:text-7xl font-serif italic font-light leading-[1.05] tracking-tighter mb-8 transition-colors duration-500 ${
                      theme === "dark" ? "text-zinc-50" : "text-[#1A1A1A]"
                    }`}>
                      {featuredMovie.title}
                    </h2>

                    {/* Editorial asymmetric metadata panel */}
                    <div className={`flex flex-wrap gap-8 mb-8 border-b pb-6 w-full transition-colors duration-500 ${
                      theme === "dark" ? "border-white/10" : "border-[#1A1A1A]/10"
                    }`}>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase font-bold font-mono mb-1 transition-colors duration-500 ${
                          theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                        }`}>Director</span>
                        <span className="text-xs font-semibold">{featuredMovie.director || "Altman Code / Crew"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase font-bold font-mono mb-1 transition-colors duration-500 ${
                          theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                        }`}>Release</span>
                        <span className="text-xs font-semibold">{featuredMovie.year}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase font-bold font-mono mb-1 transition-colors duration-500 ${
                          theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                        }`}>Genre</span>
                        <span className="text-xs font-semibold">{featuredMovie.genre ? featuredMovie.genre[0] : "Cinema"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] uppercase font-bold font-mono mb-1 transition-colors duration-500 ${
                          theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                        }`}>Clarity Score</span>
                        <div className="flex items-center space-x-1.5">
                          <Star className={`w-3.5 h-3.5 fill-current ${theme === "dark" ? "text-amber-500" : "text-[#1A1A1A]"}`} />
                          <span className="text-xs font-semibold">{featuredMovie.rating.toFixed(1)} / 10</span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-[15px] sm:text-[16px] leading-relaxed font-light mb-8 max-w-lg transition-colors duration-500 ${
                      theme === "dark" ? "text-zinc-300" : "text-[#1A1A1A]/75"
                    }`}>
                      {featuredMovie.overview}
                    </p>

                    <div className="flex flex-wrap gap-4 items-center">
                      <button
                        onClick={() => setSelectedMovie(featuredMovie)}
                        className={`px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-sm cursor-pointer shadow-sm flex items-center space-x-2 active:scale-98 ${
                          theme === "dark"
                            ? "bg-white text-black hover:bg-zinc-200"
                            : "bg-[#1A1A1A] hover:bg-black text-[#FDFDFC]"
                        }`}
                      >
                        <Play className={`w-3.5 h-3.5 ${theme === "dark" ? "fill-black text-black" : "fill-white text-white"}`} />
                        <span>Play Film</span>
                      </button>

                      <button
                        onClick={() => handleToggleWatchlist(featuredMovie!.id)}
                        className={`px-8 py-3.5 text-xs font-bold uppercase tracking-widest border transition-all rounded-sm cursor-pointer active:scale-98 ${
                          theme === "dark"
                            ? "border-white/15 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-100"
                            : "border-[#1A1A1A] bg-transparent text-[#1A1A1A] hover:bg-[#F5F5F0]"
                        }`}
                      >
                        {watchlistIds.includes(featuredMovie.id) ? "Saved inside library" : "Add to List"}
                      </button>
                    </div>
                  </div>

                  {/* Right side cinematic preview box */}
                  <div className="lg:col-span-5 flex flex-col gap-4 w-full">
                    <div className={`relative w-full aspect-[16/10] overflow-hidden border rounded-sm shadow-md transition-colors duration-500 ${
                      theme === "dark" ? "bg-zinc-900/60 border-white/8" : "bg-[#E5E5E0] border-[#1A1A1A]/10"
                    }`}>
                      <img
                        src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
                        alt={featuredMovie.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-[101%] ${
                          theme === "dark" ? "" : "mix-blend-multiply"
                        }`}
                      />
                      <div className={`absolute bottom-4 left-4 border px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-colors duration-500 backdrop-blur-md ${
                        theme === "dark" ? "bg-black/80 border-white/10 text-zinc-200" : "bg-white/95 border-[#1A1A1A]/10 text-[#1A1A1A]"
                      }`}>
                        {featuredMovie.runtime || "4K Ultra HD"}
                      </div>
                    </div>
                    
                    <div className={`flex justify-between items-center text-[10px] font-mono px-1 transition-colors duration-500 ${
                      theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/40"
                    }`}>
                      <span>Preview Frame Stills / Vol. 12</span>
                      <span className="italic">&ldquo;{featuredMovie.tagline || "Mankind was born to build"}&rdquo;</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Collection Category / Media Type Selector Tabs */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-8 select-none">
              <div className={`flex flex-wrap items-center gap-2 border-b pb-4 transition-colors duration-500 ${
                theme === "dark" ? "border-white/10" : "border-zinc-300"
              }`}>
                {(["all", "movie", "series", "anime"] as const).map((type) => {
                  const isActive = mediaType === type;
                  const label = 
                    type === "all" ? "All Collections" :
                    type === "movie" ? "Feature Films" :
                    type === "series" ? "TV Series" :
                    "Anime Masterpieces";
                  return (
                    <button
                      key={type}
                      onClick={() => setMediaType(type)}
                      className={`px-5 py-2.5 font-mono text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-none outline-none border-b-2 ${
                        isActive
                          ? theme === "dark"
                            ? "text-zinc-50 border-white bg-zinc-800/30"
                            : "text-zinc-950 border-zinc-950 bg-zinc-150"
                          : theme === "dark"
                            ? "text-zinc-400 border-transparent hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/10"
                            : "text-zinc-650 border-transparent hover:text-zinc-950 hover:border-zinc-400 hover:bg-zinc-100/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Genre Filter Tabs Section */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-6">
              <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-6 transition-colors duration-500 ${
                theme === "dark" ? "border-white/10" : "border-zinc-300"
              }`}>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${
                    theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                  }`}>SELECT GENRE</span>
                  <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-[0.15em] transition-colors ${
                    theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                  }`}>Exhibition Index</h3>
                </div>

                {/* Horizontal scroll container for Genre Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                  {availableGenres.map((genre) => {
                    const isActive = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all border outline-none cursor-pointer select-none rounded-none shrink-0 ${
                          isActive
                            ? theme === "dark"
                              ? "bg-zinc-100 text-black border-white font-bold"
                              : "bg-zinc-900 text-white border-zinc-900 font-bold"
                            : theme === "dark"
                              ? "border-white/15 hover:border-white/40 text-zinc-300 hover:text-zinc-100 bg-zinc-800/40"
                              : "border-zinc-300 hover:border-zinc-500 text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/80"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Netflix-Style Continue Watching shelf with Progress Bar & Percentage display */}
            {continueWatching.length > 0 && (
              <div id="continue-watching-shelf" className="max-w-7xl mx-auto px-6 sm:px-12 mb-16 space-y-8 animate-fade-in select-none">
                <div className={`flex justify-between items-end border-b pb-2 transition-colors duration-500 ${
                  theme === "dark" ? "border-white/10" : "border-zinc-300"
                }`}>
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                    }`}>RESUME PLAYBACK</span>
                    <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                      theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                    }`}>Continue Watching</h3>
                    <p className={`text-[9px] font-mono mt-1 transition-colors ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                    }`}>
                      Note: Workspace shared cache coordinates play status across all active profiles on this browser.
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold tracking-wider transition-colors duration-550 ${
                    theme === "dark" ? "text-zinc-300" : "text-zinc-700"
                  }`}>
                    {activeProfile ? `${activeProfile.name.toUpperCase()}'S QUEUE` : "SESSION"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {continueWatching.map((item) => {
                    const progressRatio = item.percent !== undefined ? item.percent : 0;
                    const formattedTimeLabel = (() => {
                      if (item.elapsedSeconds !== undefined) {
                        const elapsedSec = item.elapsedSeconds;
                        const durSec = item.durationSeconds || (item.movie.type === "tv" ? 2700 : 7200);
                        
                        const pad = (n: number) => n.toString().padStart(2, "0");
                        
                        const elHours = Math.floor(elapsedSec / 3600);
                        const elMins = Math.floor((elapsedSec % 3600) / 60);
                        const elSecs = elapsedSec % 60;
                        const durHours = Math.floor(durSec / 3600);
                        const durMins = Math.floor((durSec % 3600) / 60);
                        const durSecs = durSec % 60;
                        
                        if (durHours > 0 || elHours > 0) {
                          return `${pad(elHours)}:${pad(elMins)}:${pad(elSecs)} / ${pad(durHours)}:${pad(durMins)}:${pad(durSecs)}`;
                        } else {
                          return `${pad(elMins)}:${pad(elSecs)} / ${pad(durMins)}:${pad(durSecs)}`;
                        }
                      }
                      return `${progressRatio}% complete`;
                    })();
                    return (
                      <div 
                        key={item.movie.id}
                        onMouseEnter={() => setHoveredMovie(item.movie)}
                        onMouseLeave={() => setHoveredMovie(null)}
                        className={`group flex flex-col border rounded-sm overflow-hidden flex-1 relative transition-all duration-500 shadow-xs hover:shadow-md cursor-pointer ${
                          theme === "dark"
                            ? "bg-zinc-900/40 border-white/8 text-zinc-100 hover:border-zinc-500/30"
                            : "bg-[#F5F5F0] border-[#1A1A1A]/5 text-[#1A1A1A]"
                        }`}
                        onClick={() => setSelectedMovie(item.movie)}
                      >
                        {/* Backdrop image thumbnail */}
                        <div className="relative aspect-video w-full bg-[#E5E5E0] overflow-hidden">
                          <img
                            src={item.movie.backdropUrl || item.movie.posterUrl}
                            alt={item.movie.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-103"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 flex justify-between items-end">
                            <span className="font-mono text-[8px] bg-[#1A1A1A] text-white px-2 py-0.5 tracking-wider rounded-xs uppercase leading-none border border-white/10 font-bold">
                              {item.movie.type === "tv" ? `S${item.season} E${item.episode}` : "MOVIE"}
                            </span>
                            <span className="text-[9px] font-mono font-black text-white bg-[#1A1A1A]/30 px-1 py-0.5 rounded-xs">
                              {progressRatio}%
                            </span>
                          </div>
                        </div>

                        {/* Metadata & Progress details */}
                        <div className={`p-4 flex-1 flex flex-col justify-between space-y-3 transition-colors duration-500 ${
                          theme === "dark" ? "bg-zinc-950/20" : "bg-[#FDFDFC]"
                        }`}>
                          <div className="flex flex-col min-w-0">
                            <h4 className={`font-serif italic font-semibold text-sm truncate leading-tight transition-colors duration-500 ${
                              theme === "dark" ? "text-zinc-100" : "text-[#1A1A1A]"
                            }`}>
                              {item.movie.title}
                            </h4>
                            <span className={`text-[8px] tracking-wider uppercase font-mono mt-0.5 transition-colors duration-550 ${
                              theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/40"
                            }`}>
                              {item.movie.type === "tv" ? `Season ${item.season}, Chapter ${item.episode}` : `Movie - ${item.movie.year}`}
                            </span>
                          </div>

                          {/* Horizontal Progress bar */}
                          <div className="space-y-1">
                            <div className={`w-full h-1.5 rounded-xs overflow-hidden ${
                              theme === "dark" ? "bg-white/10" : "bg-[#1A1A1A]/10"
                            }`}>
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  theme === "dark" ? "bg-zinc-100" : "bg-[#1a1a1a]"
                                }`} 
                                style={{ width: `${progressRatio}%` }} 
                              />
                            </div>
                            <div className={`flex justify-between items-center text-[8px] font-mono transition-colors duration-500 ${
                              theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/40"
                            }`}>
                              <span>{formattedTimeLabel}</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearContinueWatching(item.movie.id);
                                }}
                                className={`tracking-widest uppercase transition-all duration-300 ${
                                  theme === "dark" ? "text-zinc-400 hover:text-rose-400 font-bold" : "hover:text-black hover:font-bold"
                                }`}
                                title="Dismiss entry from queue"
                              >
                                Clear &times;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Swiss Layout grid listings (high white space, spaced layout containers) */}
            {curated && (
              <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-28">
                {(selectedGenre !== "All" || mediaType !== "all") && filteredTrending.length === 0 && filteredScifi.length === 0 && filteredDrama.length === 0 && (
                  <div className="py-24 text-center select-none animate-fade-in border border-dashed border-[#1A1A1A]/15 dark:border-white/10 rounded-sm">
                    <p className={`text-base font-serif italic mb-2 ${theme === "dark" ? "text-zinc-300" : "text-[#1A1A1A]/80"}`}>
                      "A temporary silence fills the screening room."
                    </p>
                    <p className={`text-[10px] font-mono uppercase tracking-wider mb-5 ${theme === "dark" ? "text-zinc-500" : "text-[#1A1A1A]/50"}`}>
                      No cinematic works in our database currently correspond to these filter conditions.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedGenre("All");
                        setMediaType("all");
                      }}
                      className={`px-6 py-2.5 font-mono text-[9px] uppercase tracking-widest border transition-all cursor-pointer font-bold ${
                        theme === "dark"
                          ? "bg-white text-black border-white hover:bg-zinc-200"
                          : "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-950"
                      }`}
                    >
                      Clear Selection Filters
                    </button>
                  </div>
                )}

                {/* 1. Trending list */}
                {filteredTrending.length > 0 && (
                  <div id="section-trending" className="space-y-8">
                    <div className={`flex justify-between items-end border-b pb-2 transition-colors duration-500 ${
                      theme === "dark" ? "border-white/10" : "border-zinc-300"
                    }`}>
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}>Trending Releases / Spotlight</span>
                        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                          theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                        }`}>Popular on current streams</h3>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className={theme === "dark" ? "text-zinc-500" : "text-zinc-400"}>Sort:</span>
                          <select
                            value={trendingSort}
                            onChange={(e) => setTrendingSort(e.target.value as any)}
                            className="bg-transparent text-[9px] font-bold tracking-widest uppercase focus:outline-none cursor-pointer hover:underline transition-all"
                          >
                            <option value="default" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Featured</option>
                            <option value="year" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Release Year</option>
                            <option value="rating" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Rating</option>
                            <option value="alphabetical" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Alphabetical</option>
                          </select>
                        </div>
                        <span className={`hidden sm:inline font-medium underline ${
                          theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                        }`}>Catalogue 01</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                      {filteredTrending.map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelect={(m) => setSelectedMovie(m)}
                          onHover={(m) => setHoveredMovie(m)}
                          onPosterError={handlePosterError}
                          theme={theme}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Science fiction */}
                {filteredScifi.length > 0 && (
                  <div id="section-scifi" className="space-y-8">
                    <div className={`flex justify-between items-end border-b pb-2 transition-colors duration-400 ${
                      theme === "dark" ? "border-white/10" : "border-zinc-300"
                    }`}>
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}>Space Voyages / Futures catalog</span>
                        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                          theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                        }`}>Extraterrestrial journeys</h3>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className={theme === "dark" ? "text-zinc-500" : "text-zinc-400"}>Sort:</span>
                          <select
                            value={scifiSort}
                            onChange={(e) => setScifiSort(e.target.value as any)}
                            className="bg-transparent text-[9px] font-bold tracking-widest uppercase focus:outline-none cursor-pointer hover:underline transition-all"
                          >
                            <option value="default" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Featured</option>
                            <option value="year" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Release Year</option>
                            <option value="rating" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Rating</option>
                            <option value="alphabetical" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Alphabetical</option>
                          </select>
                        </div>
                        <span className={`hidden sm:inline font-medium underline ${
                          theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                        }`}>Catalogue 02</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                      {filteredScifi.map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelect={(m) => setSelectedMovie(m)}
                          onHover={(m) => setHoveredMovie(m)}
                          onPosterError={handlePosterError}
                          theme={theme}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. High Drama */}
                {filteredDrama.length > 0 && (
                  <div id="section-drama" className="space-y-8">
                    <div className={`flex justify-between items-end border-b pb-2 transition-colors duration-500 ${
                      theme === "dark" ? "border-white/10" : "border-zinc-300"
                    }`}>
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}>Drama Masterpieces / Emotional tracks</span>
                        <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                          theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                        }`}>Emotional cinematic diaries</h3>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className={theme === "dark" ? "text-zinc-500" : "text-zinc-400"}>Sort:</span>
                          <select
                            value={dramaSort}
                            onChange={(e) => setDramaSort(e.target.value as any)}
                            className="bg-transparent text-[9px] font-bold tracking-widest uppercase focus:outline-none cursor-pointer hover:underline transition-all"
                          >
                            <option value="default" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Featured</option>
                            <option value="year" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Release Year</option>
                            <option value="rating" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Rating</option>
                            <option value="alphabetical" className={theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Alphabetical</option>
                          </select>
                        </div>
                        <span className={`hidden sm:inline font-medium underline ${
                          theme === "dark" ? "text-zinc-500" : "text-zinc-500"
                        }`}>Catalogue 03</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                      {filteredDrama.map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onSelect={(m) => setSelectedMovie(m)}
                          onHover={(m) => setHoveredMovie(m)}
                          onPosterError={handlePosterError}
                          theme={theme}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clean Editorial footer section */}
      <footer className={`mt-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest border-t pt-8 pb-12 px-12 gap-4 transition-all duration-750 ease-in-out ${
        theme === "dark"
          ? "border-white/5 text-zinc-500 opacity-80"
          : "border-[#1A1A1A]/10 text-[#1A1A1A] opacity-60"
      }`}>
        <div>Curated Catalog of World Cinema / Established 2026</div>
        <div className="flex gap-8">
          <span className="hover:underline cursor-pointer">Twitter</span>
          <span className="hover:underline cursor-pointer">System Catalog</span>
          <span className="hover:underline cursor-pointer">Instagram</span>
          <span className="hover:underline cursor-pointer">Newsletter</span>
          <span className="hover:underline cursor-pointer">Legal</span>
        </div>
      </footer>

      {/* Floating Library Drawer Component */}
      <WatchlistSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        savedMovies={watchlistMovies}
        continueWatching={continueWatching}
        onRemoveWatchlist={handleToggleWatchlist}
        onClearContinueWatching={handleClearContinueWatching}
        onSelectMovie={(movie) => {
          setSelectedMovie(movie);
          setIsSidebarOpen(false);
        }}
        theme={theme}
      />

      {/* Streaming details dialog player */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          watchlist={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          onSetContinueWatching={handleSetContinueWatching}
          continueWatching={continueWatching}
          profileId={activeProfile?.id}
          theme={theme}
        />
      )}

      {/* Accounts & Profile Wall Switcher Modal Overlay */}
      <AnimatePresence>
        {((showProfileSelector || !activeProfile) && activeAccount) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent backdrop-blur-xl z-50 overflow-y-auto flex items-center justify-center p-6 font-sans"
          >
            {/* Liquid Glass Overlay Backdrop Screen */}
            <div className={`absolute inset-0 transition-colors duration-750 ease-in-out pointer-events-none ${
              theme === "dark" ? "bg-[#09090b]/80" : "bg-[#FDFDFC]/70"
            }`} />

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className={`max-w-xl w-full flex flex-col items-center py-10 px-8 relative z-10 border rounded-sm transition-all duration-500 shadow-2xl ${
                theme === "dark" 
                  ? "border-white/8 bg-[#09090b]/85 backdrop-blur-lg text-zinc-100 shadow-zinc-950/80" 
                  : "border-white/50 bg-[#FDFDFC]/80 backdrop-blur-md text-[#1A1A1A] shadow-black/5"
              }`}
            >
            
            <div className={`flex justify-between items-center w-full border-b pb-4 mb-4 transition-colors duration-500 ${
              theme === "dark" ? "border-white/10" : "border-[#1A1A1A]/10"
            }`}>
              <span className={`text-[10px] font-mono tracking-widest uppercase font-black transition-colors ${
                theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/75"
              }`}>
                Account: {activeAccount.email}
              </span>
              {activeProfile ? (
                <button 
                  onClick={() => setShowProfileSelector(false)}
                  className={`p-1 px-3 border font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer rounded-xs ${
                    theme === "dark" 
                      ? "border-white/12 text-zinc-300 hover:text-white hover:border-white/30 hover:bg-white/5" 
                      : "border-[#1A1A1A]/20 text-[#1A1A1A]/80 hover:text-black hover:border-black hover:bg-neutral-100"
                  }`}
                >
                  Close Wall &times;
                </button>
              ) : (
                <button 
                  onClick={handleAccountLogout}
                  className="p-1 px-3 border border-rose-200 text-rose-700 hover:text-rose-900 bg-rose-50/20 hover:bg-rose-50/40 font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
                  title="Return to authentication portal"
                >
                  &larr; Switch Account
                </button>
              )}
            </div>

            <div className="text-center mb-8">
              <h2 className={`text-3xl sm:text-5xl font-serif italic tracking-tight mb-2 transition-colors duration-500 ${
                theme === "dark" ? "text-zinc-50" : "text-[#1A1A1A]"
              }`}>
                Who is watching today?
              </h2>
              <p className={`text-[10px] font-mono uppercase tracking-widest transition-colors duration-500 max-w-xl mx-auto leading-relaxed ${
                theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/75"
              }`}>
                Choose or build an isolated cinema profile &bull; Note: Playback progress is stored in local storage and is shared across profiles when using the same browser.
              </p>
            </div>

            {/* Profile Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12 w-full justify-center">
              {profiles.map((p) => (
                <div 
                  key={p.id}
                  className="group flex flex-col items-center relative space-y-3"
                >
                  <div className="relative group/avatar">
                    <div 
                      onClick={() => {
                        handleSwitchProfile(p.id);
                        setShowProfileSelector(false);
                      }}
                      className={`w-20 h-20 rounded-none flex items-center justify-center text-2xl font-mono font-black border transition-all duration-300 cursor-pointer ${
                        p.id === activeProfile?.id 
                          ? (theme === "dark" ? "border-white scale-105 shadow-md shadow-zinc-950" : "border-[#1A1A1A] scale-105 shadow-md") 
                          : `${theme === "dark" ? "border-white/10 group-hover:border-white/30" : "border-[#1A1A1A]/10 group-hover:border-[#1A1A1A]"} group-hover:scale-102`
                      } ${p.avatarColor}`}
                    >
                      {p.name.charAt(0)}
                    </div>
                    
                    {/* Small Edit pencil icon on top corner */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProfileId(p.id);
                        setNewProfileName(p.name);
                        setNewProfileColor(p.avatarColor);
                      }}
                      className={`absolute -top-1.5 -right-1.5 border p-1.5 shadow-sm transition-all duration-200 cursor-pointer rounded-xs ${
                        theme === "dark" 
                          ? "bg-zinc-900 border-white/10 hover:bg-white hover:text-black text-zinc-300" 
                          : "bg-[#FDFDFC] border-[#1A1A1A]/20 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white"
                      }`}
                      title={`Edit profile ${p.name}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <span 
                    onClick={() => {
                      handleSwitchProfile(p.id);
                      setShowProfileSelector(false);
                    }}
                    className={`text-[11px] font-mono tracking-wider uppercase text-center cursor-pointer transition-colors duration-300 ${
                      p.id === activeProfile?.id 
                        ? (theme === "dark" ? "font-bold text-zinc-200" : "font-bold text-[#1A1A1A]") 
                        : (theme === "dark" ? "text-zinc-400 group-hover:text-white" : "text-[#1A1A1A]/80 group-hover:text-black")
                    }`}
                  >
                    {p.name} {p.id === activeProfile?.id && <span className="block text-[8px] opacity-75">• Active</span>}
                  </span>
                </div>
              ))}
            </div>

            {/* inline Profile Creator / Editor */}
            <form onSubmit={handleCreateProfile} className={`border-t pt-8 w-full max-w-md flex flex-col space-y-4 transition-colors duration-500 ${
              theme === "dark" ? "border-white/10" : "border-[#1A1A1A]/10"
            }`}>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] font-mono tracking-widest uppercase font-bold transition-colors duration-500 ${
                    theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                  }`}>
                    {editingProfileId ? "Edit Existing Profile" : "Create New Profile Account"}
                  </span>
                  {editingProfileId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfileId(null);
                        setNewProfileName("");
                        setNewProfileColor(PROFILE_COLORS[0].class);
                      }}
                      className="text-[9px] font-mono hover:underline uppercase text-rose-500 transition-colors"
                    >
                      Cancel Edit &times;
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Profile name (e.g. John Doe)"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  maxLength={18}
                  className={`w-full text-xs px-4 py-3 rounded-none outline-none transition duration-350 ${
                    theme === "dark" 
                      ? "bg-zinc-900/50 border border-white/8 text-zinc-100 focus:border-white focus:bg-zinc-950" 
                      : "bg-[#F5F5F0] border border-transparent text-[#1A1A1A] focus:border-[#1A1A1A] focus:bg-white"
                  }`}
                />
              </div>

              {/* Color picker */}
              <div className="flex flex-col">
                <span className={`text-[9px] font-mono tracking-widest uppercase font-bold mb-2 transition-colors duration-500 ${
                  theme === "dark" ? "text-zinc-400" : "text-[#1A1A1A]/72"
                }`}>Select Avatar Tone</span>
                <div className="flex flex-wrap gap-2.5">
                  {PROFILE_COLORS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewProfileColor(c.class)}
                      className={`w-8 h-8 rounded-none transition ${c.class} ${
                        newProfileColor === c.class 
                          ? (theme === "dark" ? "scale-110 border-2 border-white" : "scale-110 border-2 border-[#1A1A1A]") 
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newProfileName.trim()}
                className={`w-full disabled:opacity-45 h-11 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer rounded-xs ${
                  theme === "dark" 
                    ? "bg-white text-black hover:bg-zinc-200" 
                    : "bg-[#1A1A1A] hover:bg-black text-[#FDFDFC]"
                }`}
              >
                {editingProfileId ? "Save Profile Changes" : "Generate Profile Account"}
              </button>
            </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}
