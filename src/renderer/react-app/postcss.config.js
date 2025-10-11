// Tailwind CSS v4 uses a different approach - it doesn't need PostCSS configuration
// CSS minification is handled by Vite's cssMinify option in vite.config.js
export default {
  plugins: {
    autoprefixer: {},
    // Add cssnano for production builds to further minify CSS
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
}
