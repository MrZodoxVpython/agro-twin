import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" agar aset dimuat benar di GitHub Pages (https://USER.github.io/REPO/)
export default defineConfig({ base: "./", plugins:[react()], server:{ proxy:{ "/api":"http://localhost:4000" } } });
