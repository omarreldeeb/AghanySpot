# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# AghanySpot

## Add Songs Manually

The browser cannot discover new files from your computer automatically. To add a song yourself:

1. Put the MP3 in `Songs/`.
2. Put its cover in `Songs/Covers/` as a `.jpg` with the exact same filename, changing only `.mp3` to `.jpg`.
3. Add the MP3 filename to `MANUAL_FILES` in `src/data/manualSongs.js`.
4. Use this filename format:

	```text
	English Title by Artist Arabic Title Arabic Artist difficulty era.mp3
	```

	Example:

	```text
	Ana Ghaltan by Bahaa Sultan انا غلطان بهاء سلطان easy 2020s.mp3
	```

	Use `easy`, `medium`, `hard`, `expert`, or `impossible`, followed by `2000s`, `2010s`, or `2020s`.

5. Run `npm run build` to check that the filename can be parsed and the cover path exists.
6. Commit and push the changes so GitHub Pages deploys them:

	```bash
	git add Songs src/data/manualSongs.js src/data/songs.js README.md
	git commit -m "Add song"
	git push origin main
	```

Keep the English title and artist separated by the exact ` by ` separator. Keep the Arabic title and Arabic artist separated by spaces, and make sure the Arabic artist is one of the supported artist forms in `src/data/manualSongs.js`.
