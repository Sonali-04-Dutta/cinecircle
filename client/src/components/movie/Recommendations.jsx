import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

const Recommendations = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    api.get("/api/movies/recommendations/me").then(res => setMovies(res.data));
  }, []);

  if (!movies.length) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-3">🤖 Recommended For You</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {movies.map(m => (
          <Link key={m.id} to={`/movie/${m.id}`}>
            <img
              src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
              className="rounded"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
