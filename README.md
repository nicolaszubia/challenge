# Spectra

Visual accessibility QA for product teams. An experiment by LaunchPad Lab.

Upload a screenshot, simulate visual conditions, compare the result with the original, and inspect potential low-contrast regions. Spectra is a design-review tool, not a medical diagnostic product and not a complete WCAG compliance scanner.

## Features

- Local screenshot upload (PNG, JPG, WebP)
- Color vision approximations for protanopia, deuteranopia, and tritanopia
- Achromatopsia, low visual acuity, and low contrast-sensitivity approximations
- Simulation intensity control
- Side-by-side and comparison-slider views
- Deterministic WCAG contrast measurement from pixels
- Issue markers linked to a findings panel
- Export simulation PNG, annotated PNG, and a text summary
- Optional AI explanations that never invent measurements

## How it works

1. A screenshot is decoded and processed in the browser with the Canvas API.
2. Vision simulations use published color-transformation matrices or controlled image filters. They are approximations.
3. Accessibility analysis samples the screenshot for regions that appear to contain two colors with a contrast ratio below 4.5:1.
4. Findings are labeled as potential issues because Spectra cannot see DOM structure, font size, or component semantics.
5. If `OPENAI_API_KEY` is configured, a server route may rewrite explanations from structured finding metadata. Contrast numbers still come from the local analyzer.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Browser Canvas API
- Vitest for contrast and matrix utilities
- Optional OpenAI API for explanations

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## Environment variables

Create `.env.local` from `.env.example` if you want AI explanations:

```bash
OPENAI_API_KEY=
```

AI recommendations are optional. Spectra is fully usable without a key. Never expose this value to the browser.

When AI is enabled, Spectra sends finding metadata (issue type, contrast ratio, sampled colors). The screenshot itself stays in your browser.

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Framework preset: Next.js.
4. Optionally add `OPENAI_API_KEY` in the Vercel project environment variables.
5. Deploy.

No database, authentication, or object storage is required.

## Accessibility methodology

- Relative luminance and contrast ratio follow WCAG 2.2.
- Normal-text AA is treated as 4.5:1. UI / large-text AA is 3:1.
- Color vision simulations use Machado, Oliveira, and Fernandes (2009) matrices in linear sRGB.
- Suggested replacement colors are verified against the stated contrast target before they are shown.

Severity in V1:

- **High**: measured contrast below 3:1
- **Medium**: measured contrast below 4.5:1 but at least 3:1

## Limitations

- Spectra analyzes pixels, not the live DOM.
- It cannot reliably know whether a region is text, the font size, or the semantic role.
- Simulations are not a substitute for testing with real users.
- Results are potential accessibility issues, not a compliance certificate.

## Future roadmap

Not implemented in V1:

- URL capture and live-page analysis
- Figma integration
- Saved projects and version comparison
- CI / GitHub accessibility regression checks
- Organization-level history
