/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  corePlugins: {
    preflight: false,
  },
  // 所有工具类仅作用于 #calendar-react-container 内部，不污染 Obsidian 及其他插件样式
  important: "#calendar-react-container",
  theme: {
    extend: {},
  },
  plugins: [],
};
