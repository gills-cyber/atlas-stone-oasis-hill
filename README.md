# Panel Fox

Manga page editor. Draw panels, letter speech bubbles, and read the page.

## Run

```bash
npm install
npm run dev
```

Open the local dev URL Vite prints.

## Do not break

- Speech-bubble text stays inside the bubble, centered, and wraps on whole words.
- Font size must not jump while typing.
- Read mode zoom must redraw the page sharp, not stretch a small bitmap.
- Do not put Windows, Mac, or iPhone installer zips back into `public/` or the web build. They are too large to publish.
