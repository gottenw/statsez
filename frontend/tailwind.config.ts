import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app*.{js,ts,jsx,tsx,mdx}",
    "./components*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        muted: '#737373',
        'muted-foreground': '#a3a3a3',
        border: '#262626',
        'grid-line': '#1a1a1a',
        accent: '#e5e5e5',
        'accent-foreground': '#0a0a0a',
        data: {
          primary: '#00ff88',
          secondary: '#0088ff',
          tertiary: '#ff0055',
          quaternary: '#ffaa00',
        }
      },
    },
  },
  plugins: [],
};

export default config;
