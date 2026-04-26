/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // numeric-route easter eggs — /67, /420, /6767, /6769, /677777 all land
    // on /6969 with a hash the HuntProvider catches and fires the "numbers"
    // lore egg. /6969 itself stays the canonical credits page.
    return [
      { source: "/67",     destination: "/6969#number-67",     permanent: false },
      { source: "/420",    destination: "/6969#number-420",    permanent: false },
      { source: "/6767",   destination: "/6969#number-6767",   permanent: false },
      { source: "/6769",   destination: "/6969#number-6769",   permanent: false },
      { source: "/677777", destination: "/6969#number-677777", permanent: false },

      // Surface-rename 301s — old portfolio sub-paths → new top-level routes.
      // Anything shared before the rename keeps working forever.
      { source: "/portfolio/personal",   destination: "/stocks",     permanent: true },
      { source: "/portfolio/art",        destination: "/art",        permanent: true },
      { source: "/portfolio/prediction", destination: "/prediction", permanent: true },
      { source: "/portfolio/external",   destination: "/external",   permanent: true },
      { source: "/archives",             destination: "/eggs",       permanent: true },
      { source: "/archives/v3",          destination: "/eggs",       permanent: true },
    ];
  },
};
export default nextConfig;
