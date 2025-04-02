# Guide - Math Learning Application

Guide is an interactive web-based educational application designed to help users master addition through progressive levels of practice. Built as a Progressive Web App (PWA), Guide works on both desktop and mobile devices, and can be installed for offline use.

## Features

- **Modern App-like Interface**: Redesigned UI with dashboard homepage, bottom navbar, and improved visual styling.
- **Progressive Level System**: Levels grouped into stages (e.g., Stage A, Stage B).
- **Tabbed Exercise Categories**: Browse exercises by category (Addition, Subtraction) on a dedicated screen.
- **Accordion UI**: Stages within categories are presented in collapsible accordions.
- **Star-based Achievement System**: Earn up to 4 stars (including a crown) based on speed and accuracy.
- **Responsive & Ergonomic Practice Screen**: Touch-friendly fixed keypad (1-2-3 layout) with integrated check button.
- **Detailed Level Completion Screen**: Full-screen view showing accuracy, average time, and earned stars, with social sharing options.
- **Performance Tracking**: Track your progress across sessions with persistent storage.
- **Immediate Feedback**: Get instant feedback with visual cues, sound effects, and haptic feedback (on supported devices).
- **Offline Support & Auto-Updates**: Fully functional as a PWA with improved caching and automatic updates.
- **Gamification Elements**: Includes daily streak counter and placeholder for daily challenges.

## How to Use

1.  Open the application by accessing `index.html` in your browser or by deploying it to a static host (like GitHub Pages).
2.  **Homepage**: View your progress summary, streak, and access different sections.
    *   Click "Continuar" on the Quick Resume card to start the next recommended level.
    *   Tap category cards (e.g., "Adição") to browse specific exercises.
    *   Use the bottom navbar to navigate between Home, Exercises, Stats (coming soon), and Settings (coming soon).
3.  **Exercises Screen**: Select a category tab (e.g., "Adição"). Expand a stage accordion to view its levels. Click "Praticar" on a level card.
4.  **Practice Screen**: Enter answers to the addition problems using the fixed keypad at the bottom. Click the integrated "Verificar" button.
5.  **Level Complete Screen**: Review your accuracy, average time, and earned stars. Choose to continue to the next level or return home.
6.  Progress through all levels to master addition fundamentals.

## Development Information

### Technology Stack

- Pure JavaScript (ES6+)
- HTML5 & CSS3
- Progressive Web App (PWA) features (Service Worker, Manifest)
- FontAwesome for icons

### Project Structure

```
guide/
├── public/                 # Other public assets
│   ├── css/                # Stylesheet files
│   │   └── style.css       # Main styles
│   └── images/             # Images and icons
│       └── icons/          # Application icons
├── src/                    # Source code
│   └── js/                 # JavaScript files
│       ├── main.js         # Entry point
│       ├── config/         # Configuration files
│       │   └── constants.js # App constants
│       ├── core/           # Core functionality
│       │   ├── gameLogic.js # Game mechanics
│       │   ├── levels.js   # Level definitions
│       │   └── state.js    # State management
│       ├── ui/             # User interface 
│       │   ├── domElements.js # DOM references
│       │   └── ui.js       # UI manipulation
│       └── utils/          # Utilities
│           ├── audio.js    # Sound effects
│           └── utils.js    # Helper functions (incl. haptics, throttle)
│   └── tests/              # (Placeholder for future tests)
├── index.html              # Main application HTML (entry point)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline functionality & caching
├── 404.html                # Basic 404 page (useful for some hosting)
├── README.md               # Project documentation
└── roadmap.md              # Development roadmap
```

## Deployment (e.g., GitHub Pages)

1. Ensure all file paths use relative paths suitable for your hosting setup.
2. Push the code to your GitHub repository.
3. Go to Repository Settings > Pages.
4. Select the branch to deploy from (e.g., `main`).
5. Select the `/ (root)` folder as the source.
6. GitHub Pages will build and host your site at `https://<your-username>.github.io/<repository-name>/`.

## Installation as a PWA

1. Visit the deployed Guide application in a compatible browser (Chrome, Edge, etc.).
2. Look for the install icon in the address bar or menu.
3. Follow the prompts to install the application.
4. The app will be available on your home screen or start menu for offline use.

## Future Development Ideas

See `roadmap.md` for detailed future plans.

## License

[Add license information here]

## Contact

[Add contact information here] 