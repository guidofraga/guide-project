# Guide - Math Learning Application

Guide is an interactive web-based educational application designed to help users master addition through progressive levels of practice. Built as a Progressive Web App (PWA), Guide works on both desktop and mobile devices, and can be installed for offline use.

## Features

- **Progressive Level System**: Levels grouped into stages (e.g., Stage A, Stage B).
- **Stage Mastery Progress**: Visual progress bars show mastery for each stage.
- **Accordion UI**: Stages are presented in collapsible accordions for a clean interface.
- **Star-based Achievement System**: Earn up to 4 stars (including a crown) based on speed and accuracy.
- **Responsive Interface**: Works on mobile devices with a touch-friendly keypad interface.
- **Performance Tracking**: Track your progress across sessions with persistent storage.
- **Immediate Feedback**: Get instant feedback on your answers with visual and audio cues.
- **Level Selection Grid**: Easily navigate between levels within each stage.
- **Offline Support**: Fully functional as a PWA for offline learning.
- **UI Animations**: Smooth animations for accordion open/close and hover effects.

## How to Use

1. Open the application by accessing `index.html` in your browser or by deploying it to a static host (like GitHub Pages).
2. On the home screen, click "Continuar Jornada" to start the recommended level.
3. Alternatively, expand a stage accordion to view its levels.
4. Select a specific level from the grid by clicking "Praticar".
5. Practice by entering answers to the addition problems.
6. Complete the session to see your score and earn stars.
7. Progress through all levels to master addition fundamentals.

## Development Information

### Technology Stack

- Pure JavaScript (ES6+)
- HTML5 & CSS3
- Progressive Web App (PWA) features

### Project Structure

The project is structured for better organization and maintainability:

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
│           └── utils.js    # Helper functions
│   └── tests/              # (Placeholder for future tests)
├── index.html              # Main application HTML (entry point)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline functionality
├── 404.html                # Basic 404 page (useful for some hosting)
└── README.md               # Project documentation
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

- Add multiplication and division levels.
- Include more gamification elements.
- Develop a statistics dashboard to track progress over time.
- Add timed challenge modes.
- Support for multiple users/profiles.

## License

[Add license information here]

## Contact

[Add contact information here] 