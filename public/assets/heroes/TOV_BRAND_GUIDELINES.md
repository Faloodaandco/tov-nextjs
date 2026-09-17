# Taste of Village (Hayes) - Brand & Design Guidelines

## Core Identity
**Project:** Taste of Village (TOV)
**Location:** 260 Farnham Road, Slough, SL1 4XL
**Aesthetic Theme:** "Village Heritage meets London Luxury" - blending rustic, earthy tones with high-end, premium materials like marble and glassmorphism UI.

## Logo System
1. **Primary Logo:** Features an arched window/doorway containing a multi-leaf tree, seated above the typography "TASTE OF VILLAGE".
2. **Secondary Logo / Stacked:** The arched tree icon centered above the typography.
3. **Submark / Icon:** The arched window and tree alone.
4. **Typography Features:** The wordmark uses a distinct serif font with bespoke ligatures:
   - The 'A' connects and overlaps with the 'S'.
   - The 'O' in "OF" is tucked elegantly inside the 'F'.
   - The 'A' in VILLAGE has a distinct crossbar.

## Color Palette
The color system is derived directly from the interior architectural materials:
*   **Terracotta / Rust (Primary):** Inspired by the "Mutina Celosia Terracota Tile" and the terracotta painted feature walls. Use for primary buttons, arch accents, and background gradients. Approximate hex: `#7A3222` or `#8C3A27`.
*   **Sand / Cream (Background):** A warm, off-white/cream matching the interior cement boards and light wood effects ("Volte Beech Woven Wood Effect"). Use for primary app backgrounds. Approximate hex: `#F9F4E5` or `#F5F1EA`.
*   **Forest / Pine Green (Accent):** Seen in the seating fabrics and green marble finishes ("Levanto Marble"). Use for secondary accents, success states, or deep contrast typography. Approximate hex: `#2A4B41`.
*   **Charcoal / Dark Wood (Text):** Deep brown or grey-black for primary text, inspired by the "Industrial Gray Paint Finish" and dark wood slats.

## Architectural Elements & Patterns (The "Soul")
When designing UI components for TOV, integrate these architectural elements to match the physical restaurant:
1. **The Arch:** Use arched borders, `rounded-t-full` on cards or images, mirroring the "Arch Feature Wall" design.
2. **CNC Cutting Pattern:** The restaurant features a bespoke geometric/star CNC cut pattern (detailed in the architectural CAD). Use this pattern as a subtle background texture with low opacity (e.g., `opacity-5`).
3. **The Submark Pattern:** The arched tree submark can be used in a repeating grid pattern (like the food photography backdrop) for loading screens or empty states.
4. **Material Textures:** Emulate the "Levanto Marble" or "Terracotta Tile" using subtle CSS grain textures or shadows (e.g., drop-shadows with a terracotta tint).

## Digital Application Rules
- **DO NOT** use generic UI. Every page must feel like stepping into the physical restaurant.
- Apply the Terracotta and Sand color palette strictly.
- Use the arched tree Submark as the favicon and loading spinner.
- Apply CSS glassmorphism over the CNC patterns for modal windows and overlays.
