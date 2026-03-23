export default function manifest() {
  return {
    name: "Aurum Bites",
    short_name: "Aurum Bites",
    description: "Premium dairy ordering and enquiries from Aurum Bites.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#171717",
    icons: [
      {
        src: "/logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
