import { useState, useEffect } from "react";
import "./App.css";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function useDebounce(cb, delay) {
  const [debounceValue, setDebounceValue] = useState(cb);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(cb);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [cb, delay]);
  return debounceValue;
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint =
        query?.length > 2
          ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      if (data.Response === "False") {
        setErrorMessage(data.Error || "No movies found");
        setMovies([]);
        return;
      }

      setMovies(data.results);
      setIsLoading(false);
      console.log(data.results);
    } catch (error) {
      setErrorMessage("Error fetching movies:" + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <main className="card-container">
      <div className="pattern"></div>
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>

        <section className="mb-8">
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </section>

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}

          {movies.length === 0 && !isLoading && (
            <p className="text-white">No movies found</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
