/**
 * PostCSS config for admin panel - Tailwind v4
 */
const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
        'custom-media-queries': true,
      },
    },
  },
}

export default postcssConfig
