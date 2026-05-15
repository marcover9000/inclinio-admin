/** @type {import('tailwindcss').Config} */

/* Genera l'escala d'un token semàntic a partir dels seus graons.
   Cada color apunta a la CSS var corresponent en canals RGB, de manera que
   els modificadors d'opacitat de Tailwind (`bg-brand-600/50`) continuen
   funcionant i el theming es fa només redefinint variables. */
const token = (name, shades) =>
  Object.fromEntries(
    shades.map((s) => [s, `rgb(var(--color-${name}-${s}) / <alpha-value>)`]),
  );

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // Preparat per dark mode / white-label: redefinir les CSS vars sota `.dark`.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: token('brand', [50, 100, 200, 500, 600, 700, 800, 900]),
        neutral: token('neutral', [50, 100, 200, 300, 500, 600, 700, 800]),
        success: token('success', [50, 100, 200, 600, 800]),
        warning: token('warning', [100, 800]),
        danger: token('danger', [50, 200, 300, 400, 500, 600, 700, 800]),
        info: token('info', [100, 800]),
        accent: token('accent', [100, 600, 800]),
      },
    },
  },
  plugins: [],
};
