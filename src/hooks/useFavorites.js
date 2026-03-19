import { useState, useEffect } from "react";

const KEY = "chemviz_favorites";

export function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favs));
  }, [favs]);

  const toggle = (id) => {
    setFavs(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFav = (id) => favs.includes(id);

  return { favs, toggle, isFav };
}