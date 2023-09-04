import { useEffect, useState } from "react";
import StarRating from "./StarRating";


const KEY = 'a368daec';

const average = (arr) => (
  arr.reduce((acc, curr, i, arr) => (acc += curr), 0) / arr.length
);


export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useState(() => {
    const savedValue = localStorage.getItem("watchedMovies");
    return JSON.parse(savedValue);
  });


  function handleSelectMovie(id) {
    setSelectedId(selectedId => (
      id === selectedId ? null : id)
    );
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter((movie) => (
      movie.imdbID !== id
    )))
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies.");

          const data = await res.json();
          if (data.Response === "False")
            throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        }
        catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        }
        finally {
          setIsLoading(false);
        }
      }

      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      handleCloseMovie();
      fetchMovies();

      return function () {
        controller.abort();
      }
    }, [query]
  );


  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error &&
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          }
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ?
            <MovieDetails selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
            :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          }
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return (<p className="loader">Loading...</p>);
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}


function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input type="text"
      className="search"
      placeholder="Search movies..."
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}




function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main >
  );
}


function Button({ className, onClick, children }) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}


function Box({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="box">
      <Button className="btn-toggle"
        onClick={() => setIsOpen(isOpen => !isOpen)}>
        {isOpen ? "+" : "-"}
      </Button>

      {!isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies.map(movie => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img
        src={movie.Poster}
        alt={`${movie.Title} poster`}
      />

      <h3>{movie.Title}</h3>

      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");


  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;


  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;


  function handleAddMovie() {

    const newlyWatched = {
      title,
      year,
      poster,
      runtime: Number(runtime.split(' ')[0]),
      imdbID: selectedId,
      imdbRating: Number(imdbRating),
      userRating,
    };

    onAddWatched(newlyWatched);

    onCloseMovie();
  }


  useEffect(
    function () {
      localStorage.setItem("watchedMovies", JSON.stringify(watched));

    }, [watched]
  );


  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
          const data = await res.json();

          setMovie(data);

        }
        catch (error) {
          console.error(error);
        }
        finally {
          setIsLoading(false);
        }
      }

      getMovieDetails(selectedId);

    }, [selectedId]);


  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function cleanUp() {
        document.title = "usePopcorn";
      }
    },
    [title]
  );


  useEffect(
    function () {
      function callback(event) {
        if (event.code === "Escape") {
          onCloseMovie();
        }
      }

      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener("keydown", callback)
      }
    }, [onCloseMovie]
  );



  return (
    <div className="details">
      {
        isLoading ?
          <Loader />
          :
          <>
            <header>
              <button className="btn-back" onClick={onCloseMovie}>&larr;</button>

              <img src={poster} alt={`Poster of ${movie}`} />

              <div className="details-overview">
                <h2>{title}</h2>
                <p>{released} &bull; {runtime}</p>
                <p>{genre}</p>
                <p>
                  <span>⭐️</span>
                  <span>{imdbRating} Imdb rating</span>
                </p>
              </div>
            </header>

            <section>
              <div className="rating">
                {isWatched ?
                  <p>You rated this movie {watchedUserRating} <span>⭐</span></p>
                  :
                  <>
                    <StarRating maxRating={10} size={24} onSetRating={setUserRating} />

                    {userRating > 0 && (
                      <button className="btn-add" onClick={handleAddMovie}>+ Add to list</button>
                    )}
                  </>
                }
              </div>

              <p><em>{plot}</em></p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </>
      }
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map(movie => movie.imdbRating)
  );
  const avgRuntime = average(
    watched.map(movie => movie.runtime)
  );
  const avgUserRating = average(
    watched.map(movie => movie.userRating)
  );



  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating ? avgImdbRating.toFixed(2) : 0.00}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating ? avgUserRating.toFixed(2) : 0.00}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime ? avgRuntime.toFixed(0) : 0.00} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map(movie => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img
        src={movie.poster}
        alt={`${movie.Title} poster`}
      />

      <h3>{movie.title}</h3>

      <div>
        <p>
          <span>⭐</span>
          <span>{movie.imdbRating}</span>
        </p>

        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>

        <p>
          <span>⏳</span>
          <span>{movie.runtime} mins</span>
        </p>
      </div>

      <button className="btn-delete" onClick={() => { onDeleteWatched(movie.imdbID) }}>X</button>
    </li>
  );
}