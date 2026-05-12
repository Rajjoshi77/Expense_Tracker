export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#111827',
          secondary: '#374151',
          muted: '#6B7280',
          subtle: '#9CA3AF',
          disabled: '#D1D5DB',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          500: '#F59E0B',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      boxShadow: {
        'xs':   '0 1px 2px 0 rgba(0,0,0,0.05)',
        'sm':   '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        'md':   '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        'lg':   '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.07)',
        'xl':   '0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.06)',
        '2xl':  '0 25px 50px -12px rgba(0,0,0,0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'inset-sm': 'inset 0 1px 2px rgba(0,0,0,0.05)',
        'primary': '0 4px 14px rgba(79,70,229,0.25)',
        'primary-lg': '0 8px 24px rgba(79,70,229,0.3)',
      },
      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
        'pill': '9999px',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
        'gradient-mesh': `
          radial-gradient(at 20% 20%, rgba(79,70,229,0.06) 0px, transparent 50%),
          radial-gradient(at 80% 80%, rgba(124,58,237,0.04) 0px, transparent 50%),
          radial-gradient(at 50% 50%, rgba(99,102,241,0.03) 0px, transparent 70%)
        `,
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease-out both',
        'fade-in':   'fadeIn 0.3s ease-out both',
        'scale-in':  'scaleIn 0.2s ease-out both',
        'shimmer':   'shimmer 1.5s infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.8)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
