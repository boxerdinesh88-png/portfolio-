# Dinesh Kumar — Portfolio

Personal portfolio of **Dinesh Kumar**, Full Stack Developer (Python · Django · React · Next.js · WordPress).

**Live:** https://boxerdinesh88-png.github.io/portfolio-/

## Highlights

- Interactive **Three.js** hero — a shader-driven, noise-displaced 3D object with orbit rings and a particle field that reacts to the mouse and moves through the page as you scroll
- **GSAP ScrollTrigger** choreography — split-text reveals, word-by-word bio highlight, pinned horizontal project showcase, drawn experience timeline
- **Lenis** smooth scrolling, magnetic buttons, custom cursor, preloader
- Fully responsive, respects `prefers-reduced-motion`, no build step

## Structure

```
index.html
assets/
  css/style.css
  js/data.js     ← all content (profile, projects, experience, skills) — edit this to update the site
  js/scene.js    ← Three.js scene
  js/main.js     ← rendering, smooth scroll and animations
  projects/      ← project screenshots
  Dinesh-Kumar-Resume.pdf
```

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.
