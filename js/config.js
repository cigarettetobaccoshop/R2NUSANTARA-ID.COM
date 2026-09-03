tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                // Stack font ala Apple / Microsoft
                sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
                mono: ['"IBM Plex Mono"', 'monospace']
            },
            colors: {
                brand: {
                    900: '#0f172a', // Slate 900
                    800: '#1e293b', // Slate 800
                    700: '#334155', // Slate 700
                    600: '#2563eb', // Blue 600
                    500: '#3b82f6', // Blue 500
                    400: '#60a5fa', // Blue 400
                    300: '#93c5fd', // Blue 300
                    200: '#bfdbfe', // Blue 200
                    100: '#dbeafe', // Blue 100
                    50: '#eff6ff'   // Blue 50
                }
            }
        }
    }
}