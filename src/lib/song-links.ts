// Small helper so song attributions across the trailer + verdict can link
// to a streaming search. YouTube search URLs are used because they resolve
// without an account, always return the song + artist results, and don't
// depend on a fabricated track-specific URL that could break.

export type Song = {
  name: string;
  artist: string;
  year?: number;
};

function encode(s: string) {
  return encodeURIComponent(s.toLowerCase().trim());
}

export function youtubeSearchLink(song: Song): string {
  const q = `${song.name} ${song.artist}`;
  return `https://www.youtube.com/results?search_query=${encode(q)}`;
}

export function spotifySearchLink(song: Song): string {
  const q = `${song.name} ${song.artist}`;
  return `https://open.spotify.com/search/${encode(q)}`;
}

// Prebuilt metadata for the three trailer tracks + the /arc pair.
export const SONGS = {
  a_lot:       { name: "a lot",               artist: "21 savage ft. j. cole", year: 2018 },
  just_like_me:{ name: "just like me",        artist: "metro boomin + future", year: 2022 },
  nuevayol:    { name: "nuevayol",            artist: "bad bunny",             year: 2025 },
  ghost_town:  { name: "ghost town",          artist: "kanye west",            year: 2018 },
  let_down:    { name: "let down",            artist: "radiohead",             year: 1997 },
} as const;
