import React, { useState } from "react";
import { Link } from "react-router-dom";

const MentionWithPreview = ({ part, username, targetUser, onMentionClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {targetUser ? (
        <Link
          to={`/profile/${targetUser._id || targetUser.id}`}
          className="text-blue-400 font-bold hover:text-blue-300 hover:underline cursor-pointer transition-colors relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      ) : (
        <span
          className="text-blue-400 font-bold hover:text-blue-300 hover:underline cursor-pointer transition-colors relative z-10"
          onClick={(e) => onMentionClick(e, username)}
        >
          {part}
        </span>
      )}

      {isHovered && targetUser && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-[100] animate-fade-in pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                {targetUser.avatar && targetUser.avatar.trim() !== "" ? (
                  <img
                    src={
                      targetUser.avatar.startsWith("http") || targetUser.avatar.startsWith("data:")
                        ? targetUser.avatar
                        : `${import.meta.env.VITE_API_URL || ""}${
                            targetUser.avatar.startsWith("/") ? "" : "/"
                          }${targetUser.avatar}`
                    }
                    alt={targetUser.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        targetUser.name || "User"
                      )}&background=random`;
                    }}
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-400">
                    {targetUser.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="font-extrabold text-slate-900 dark:text-white text-base truncate w-40">
                {targetUser.name}
              </p>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                User Profile
              </span>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-slate-900"></div>
        </div>
      )}
    </span>
  );
};

export default MentionWithPreview;