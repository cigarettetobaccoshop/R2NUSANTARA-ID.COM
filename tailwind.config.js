/** Config ini dipakai KHUSUS saat build produksi via GitHub Actions
 * (bukan yang di index.html — itu tetap ada untuk mode preview/dev tanpa build).
 * Nilai di sini harus SAMA PERSIS dengan tailwind.config di <script> index.html. */
module.exports = {
  content: ['./index.html', './app.js'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#8A96A8', dark: '#5C6B85', light: '#D7DEE6' },
        deep: '#0F3D6E',
        ivory: '#F6F8FA',
        brand: { 400: '#8FA8C9', 700: '#1E5FA8' }
      },
      borderRadius: {
        '3xl': '0.75rem',
        '2xl': '0.75rem',
        xl: '0.5rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
