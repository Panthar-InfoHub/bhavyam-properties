# Design System: Bhavyam Properties — "Majestic Heritage"

**Project ID:** `9201326407984821461`
**Screen ID:** `578e514cf45946b6a06ee5c0a46901ae`

---

## 1. Visual Theme & Atmosphere

**Creative North Star: "The Digital Estate Curator"**

A bespoke, editorial experience — less database, more high-end physical brochure. We achieve this through **Intentional Asymmetry** and **Tonal Depth**: wide gutters, overlapping "floating" images, and high-contrast typographic scale to create a sense of architectural space. The user should feel like walking through a gallery.

**Vibe:** Sophisticated, elegant, premium Indian real estate. Luxury meets cutting-edge web.

---

## 2. Color Palette & Roles

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Deep Navy | `#001229` / `#112743` | Headers, dark sections, trust & authority |
| Secondary | Emerald Heritage | `#006B54` | CTAs, interactive accents |
| Tertiary | Electric Mint | `#00ECBD` / `#38FECE` | Highlights, hover states, "New" badges — use sparingly |
| Accent | Emerald Mint | `#00B48F` | Secondary accent, links |
| Background | Warm Ivory | `#F9FAF8` | Page canvas |
| Surface Low | Cloud | `#F3F4F2` | Section alternate backgrounds |
| Surface Lowest | Pure White | `#FFFFFF` | Card backgrounds |
| Text Primary | Near-Black | `#191C1B` | Headings, primary text |
| Text Secondary | Slate | `#44474D` | Body copy, descriptions |
| Outline | Ghost | `#C4C6CE` at 15% | Borders (ghost style only) |
| Error | Crimson | `#BA1A1A` | Error states |

### The "No-Line" Rule
Do NOT use 1px solid borders. Use background shifts and whitespace to define boundaries.

### The "Glass & Gradient" Rule
For hero headers and CTAs: `linear-gradient(135deg, #001229, #112743)`. Prevents flat navy feel.

---

## 3. Typography Rules

| Role | Font | Weight | Size Range | Tracking |
|---|---|---|---|---|
| Display/Headlines | Inter | Black (900) | 48px–72px | -0.04em (tight) |
| Subheadings | Inter | ExtraBold (800) | 24px–36px | -0.025em |
| Body | Inter | Medium (500) | 16px | normal |
| Labels | Inter | Bold (700) | 10px–13px | 0.05em–0.2em (wide), UPPERCASE |

---

## 4. Component Stylings

### Buttons
- **Primary:** Pill-shaped (`rounded-full`), bg `#006B54`, text white. Hover: scale 102%, shift to `#38FECE` glow.
- **Secondary:** Pill-shaped, bg `#E1E3E1`, text dark.

### Cards & Containers
- Corner radius: 16px–24px (generously rounded)
- No divider lines — use background contrast
- Whisper-soft ambient shadows: `Y:24px, Blur:80px, Color: #191C1B at 4%`
- Images overhang padding for editorial feel

### Input Fields
- Minimalist soft-fill with `#F3F4F2` background
- Focus: subtle transition to `#006B54` accent

### Glass Overlays
- `background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.3);`

---

## 5. Layout Principles

- Max content width: 1280px centered
- Generous vertical padding (96px–128px between sections)
- Intentional asymmetry in margins
- Alternating surface backgrounds for rhythm
- High-quality imagery — the UI is the frame, properties are the art
- Never use `#000000` — always `#001229` for dark text
