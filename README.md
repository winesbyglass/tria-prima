# TRIA PRIMA — Film & Media (v1, homepage)

Live: https://winesbyglass.github.io/tria-prima/

Static site, no build step. Served by GitHub Pages from the `main` branch root.

```
  index.html
  css/style.css
  js/main.js
  assets/featured-poster.jpg   # hero poster shown until the film loads
```

## Placeholders to replace

| Where | Placeholder | Replace with |
|---|---|---|
| `index.html` `.logo-placeholder` | three-circle SVG + "YOUR LOGO" | real logo (SVG preferred) |
| `index.html` `.aside-foot` | `EST. [YEAR] · [CITY]` | founding year / city |
| `index.html` `#heroVideo` `data-vimeo-id` | `1116019493` (Distant and Known) | featured film Vimeo ID |
| `index.html` Works gallery | `[Project Two/Three/Four]` | title, type, `data-vimeo="ID"`, thumbnail via `style="background-image:url(...)"` |
| `index.html` Process / Contact | generic copy, `hello@example.com` | real copy and email |

When changing CSS/JS, bump the `?v=` number in `index.html` so browsers fetch the new file.
