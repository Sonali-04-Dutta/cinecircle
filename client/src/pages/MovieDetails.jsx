import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import StreamingProviders from "../components/movie/StreamingProviders";
import ReviewSection from "../components/movie/ReviewSection";



const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    api.get(`/api/movies/${id}`).then((res) => setMovie(res.data));
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl">{movie.title}</h1>
      <p className="mt-2">{movie.overview}</p>

      <StreamingProviders movieId={movie.id} />
      <ReviewSection movieId={movie.id} />
    </div>
  );
};

export default MovieDetails;
