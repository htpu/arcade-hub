# AGENTS.md - Arcade Hub

## Project Overview

Modular HTML/JS/CSS arcade game hub with multiple browser-based games.
Live URL: [https://arcade.htpu.net](https://arcade.htpu.net)

## Deployment

### GitHub Pages (Current)

The project uses **GitHub Pages** with custom domain `arcade.htpu.net`.

**Setup:**
1. Repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main`, Folder: `/ (root)`
4. Custom domain: `arcade.htpu.net` (force HTTPS after DNS propagates)

**DNS Configuration:**
- Add CNAME record in DNS provider:
  - Type: CNAME
  - Name: arcade
  - Value: `<username>.github.io`

**Deployment:**
- Push to main branch → auto-deploys to GitHub Pages
- Custom domain `arcade.htpu.net` will work automatically

**No Scripts Required:**
GitHub Pages auto-deploys on push. No workflow scripts needed.

---

## Commands

### Running the Project
```bash
# Simply open index.html in a browser
open index.html
# Or serve with any HTTP server
npx serve .
```

### No Build/Lint/Test Commands
This is a vanilla HTML project with no build system, linter, or test framework.

## Code Style Guidelines

### General Structure
- Modular architecture with `index.html`, `styles.css`, `css/` directory, and `js/` directory
- Core logic and games are organized into separate files within the `js/` directory
- CSS modules in `css/` subdirectory
- JavaScript files are loaded via `<script>` tags in `index.html`
- Styles are defined in `styles.css` which imports modules from `css/`

### JavaScript Conventions
- **Module Pattern**: Use IIFE (Immediately Invoked Function Expressions) for namespacing
  ```javascript
  const ModuleName = (() => {
      // private variables
      // return public API
      return { init, method };
  })();
  ```
- **Constants**: Use UPPER_SNAKE_CASE for configuration constants
- **Variables**: Use camelCase
- **Functions**: Use descriptive names, prefer verb prefixes (`init`, `run`, `play`, `load`, `save`)

### Naming Conventions
- Game IDs: lowercase with numbers (e.g., `snake`, `c2048`, `racer`)
- DOM element IDs: camelCase (e.g., `gameCanvas`, `overlay`)
- CSS classes: kebab-case with Tailwind utility classes
- Internal objects: PascalCase (e.g., `Games`, `StatsManager`, `AudioManager`)

### HTML/CSS Style
- Use Tailwind CSS utilities via CDN (`https://cdn.tailwindcss.com`)
- Custom styles in `styles.css` using CSS custom properties
- Prefer Tailwind classes over custom CSS where possible
- Use semantic HTML elements (`aside`, `main`, `section`, `nav`)

### Canvas Games
- Fixed canvas dimensions: 800x500px (16:10 aspect ratio)
- Use `requestAnimationFrame` or `setInterval` for game loops
- Store game state in objects (e.g., `Games.snake`, `Games.tetris`)
- Each game should have: `init`, `run`, and appropriate input handlers

### Error Handling
- Wrap async operations in try-catch blocks
- Use defensive coding for localStorage access
- Provide fallback values when parsing fails

### Performance
- Use `const` over `let` where possible
- Cache DOM element references
- Use event delegation where appropriate
- Minimize DOM updates during game loops

### Code Organization
1. `index.html`: Main layout and module inclusion
2. `styles.css`: Main CSS file that imports modules
3. `css/`: CSS modules
   - `css/base.css`: Variables, fonts, global styles
   - `css/layout.css`: Layout, sidebar, header
   - `css/components.css`: Reusable components
   - `css/screens.css`: Screen/page styles
   - `css/game.css`: Game canvas and controls
4. `js/constants.js`: Configuration constants
5. `js/utils.js`: Shared helper functions
6. `js/StatsManager.js`, `js/AudioManager.js`, `js/UIManager.js`: Core service modules
7. `js/games/*.js`: Individual game modules
8. `js/app.js`: Application entry point and coordination

### Best Practices
- Always call `StatsManager.load()` on startup
- Initialize audio context on first user interaction
- Use `localStorage` with try-catch for quota exceeded errors
- Keep UI text in Chinese (simplified) as per existing codebase
- Use consistent color palette: cyan (#06b6d4), slate (#0f172a), rose (#f43f5e)
