# Sindibad BBQ & Grill — grill-to-plate scroll scene

Vite + React 19 + TypeScript, Tailwind CSS 4, GSAP 3 (ScrollTrigger, SplitText, MotionPath maths), Lenis, Fontsource.

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build into dist/
```

## Where things live
- `src/data/` — all content, positions and timing as plain data (percentages, not pixels). Swap images or tweak numbers here.
  - `scene.ts` content, grill item order, motion timing windows/eases
  - `grill.ts` grill slot boxes (% of the grill photo)
  - `food.ts` plates and travelling pieces (% of each image)
- `src/lib/gsap.ts` — registers plugins once, gsap defaults, `ScrollTrigger.config({ ignoreMobileResize: true })`, reduced-motion queries
- `src/lib/smooth-scroll.ts` — Lenis on GSAP's ticker (one clock), disabled for reduced motion
- `src/lib/journey-math.ts` — pure geometry of the flight (no DOM)
- `src/lib/measure.ts` — offsetLeft/offsetTop anchor measurement (transforms never leak in)
- `src/components/GrillToPlateScene.tsx` — the signature scroll animation
- `src/hooks/useReveal.ts` — `data-split` / `data-reveal` reveals
- `#owner` — owner image editor (browser-only overrides), lazy-loaded

## Animation rules
One timeline per moving element, each scrubbed (`scrub: 0.6`) over the pin's range with function-based values and `invalidateOnRefresh`. Only transform and opacity animate. React never re-renders during scroll.
