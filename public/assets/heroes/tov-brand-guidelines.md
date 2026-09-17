# Taste of Village (TOV) - Brand Guidelines & UI Aesthetic

*This document serves as the absolute source of truth for the software's UI/UX design, meticulously derived from the official architectural PDF and deep ML Vision analysis of the interior design renders.*

## 1. Core Philosophy & The Logo
The Taste of Village aesthetic is a fusion of **premium modern dining** and **authentic cultural heritage**. 

**The Logo Concept (The Arch + The Tree):**
The official logo is a literal combination of an architectural Arch and a flourishing Tree. It represents growth, groundedness, and "Terracotta Earth." Whenever building UI, think of these core tenets: rooted, warm, and structured. 

## 2. Color Palette (Physical to Digital Translation)

### Primary Brand Colors
*   **Terracotta Earth (The Core Brand Color):** `#8C3A27` or `#B35A42`. This is the exact color of the logo, the leather dining chairs, and the upper walls. It should be used for primary call-to-actions, active states, and dominant brand fills.
*   **Metro Forest Green:** `#1E4233` or `#285943`. Derived from the glossy lower-wall tiles. Used for secondary accents, success states, and lush contrast against the terracotta.
*   **Warm Sand / Plaster:** `#F4F1EA` or `#EFE9E1`. The color of the glowing arches and the terrazzo floor. Use this as the primary app background instead of stark white `#FFFFFF`.
*   **Cacao / Charcoal:** `#1A1A1A`. Derived from the exposed ceiling voids and shopfront. Used for text and deep dark-mode panels (like the Master Dashboard).

## 3. UI Textures & Architectural Motifs

The vision analysis revealed massive, intricate physical textures that MUST be translated into digital UI elements:

*   **The Glowing Arches & Tribal Diamonds:**
    The walls feature massive, backlit arches. Inside each arch is a glowing green-and-terracotta geometric/tribal diamond motif. 
    *   *UI Application:* Cards and modals should feature rounded, arched tops (`rounded-t-[40px]`). Subtle glowing drop-shadows should replace harsh flat shadows to mimic the LED backlighting.

*   **The CNC Feature Wall:**
    One entire wall is a massive CNC-cut wood panel featuring a grid of alternating motifs: eight-pointed stars, mihrab arches, and geometric diamonds. 
    *   *UI Application:* This specific grid pattern should be exported as a faint SVG background and used behind sidebars, hero sections, and login screens to provide rich depth (`opacity-5`).

*   **Ribbed Wood Ceilings:**
    *   *UI Application:* When using dividers or separating sections, consider using tight, repeating vertical or horizontal lines instead of single solid borders.

## 4. Typography
*   **Brand / Headings:** A classic, high-contrast Serif (e.g., *Playfair Display*). Must be used for H1s and the logo.
*   **Body / UI:** A clean Sans-Serif (e.g., *Inter* or *Outfit*).

## 5. UI Implementation Directives
When implementing or modifying React/Tailwind code for Taste of Village:
1.  **NEVER** use generic Tailwind colors (e.g., `bg-blue-500`).
2.  **ECHO THE ARCH:** Default to heavy top-radii for cards to mimic the physical wall arches.
3.  **USE THE TREE:** If you need a placeholder icon for the brand, use a sophisticated tree or leaf motif inside an arch.
4.  **TEXTURE IS EVERYTHING:** A flat white background is a failure. Always layer the Sand color with a subtle CNC geometric noise pattern.
