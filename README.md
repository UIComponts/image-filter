# Image Filter (HTML · CSS · JS)

Simple client-side project to upload an image, apply filters, preview and download.

Features
- Upload any image (`.jpg`, `.png`, etc.)
- Adjust filters: grayscale, sepia, blur, brightness, contrast, hue, saturate, invert
- Preset filters and reset
- Download result as PNG

How to use
1. Open `index.html` in your browser (double-click or `Open With`).
2. Or run a simple local server and visit `http://localhost:8000`:

```pwsh
# from repository folder
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes
- Modern browsers support `canvas` and `CanvasRenderingContext2D.filter` used to export filtered image. If your browser is old, filters may apply visually but export might be unfiltered.
- This is pure front-end — no backend required.

Want enhancements?
- Add rotate/crop/resize tools
- Add mobile-friendly UI refinements
- Save/load filter presets

Enjoy! If you want, I can add any of the above features next.