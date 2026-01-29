import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Watchlist from "./pages/Watchlist";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/movie/:id" element={<MovieDetails />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/watchlist" element={<Watchlist />} />
    <Route path="/friends" element={<Friends />} />
    <Route path="/chat/:id" element={<Chat />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:id" element={<Profile />} />
    <Route path="/notifications" element={<Notifications />} />
  </Routes>
);

export default AppRoutes;
