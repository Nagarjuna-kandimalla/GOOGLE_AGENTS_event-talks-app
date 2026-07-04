# BigQuery Release Notes Hub & Sharing Tool

A modern, responsive single-page web application built with Python Flask and vanilla HTML5, CSS3, and JavaScript. This tool fetches the official Google Cloud BigQuery release notes feed, presents them in an elegant glassmorphism dark-themed dashboard, and allows you to select updates and tweet them to X (formerly Twitter) instantly with automated character constraint validation.

---

## Features

- **Live XML Fetch & Parse**: Uses a backend Flask proxy to fetch and parse the official Atom XML feed, avoiding browser CORS limitations.
- **Modern Premium Design**: Dark theme utilizing CSS variables, responsive card grids, glow animations, Outfit typography, and custom loading skeletons (shimmer state).
- **Interactive Share Modal**: Choose any release update, tweak the pre-filled post, view a real-time 280-character limit counter, and post straight to X/Twitter using Web Intents.
- **Live Refresh**: Fast, one-click manual synchronization featuring a smooth loading spinner.

---

## File Structure

```text
bq-release-notes/
├── app.py                 # Flask server & Feed parsing logic
├── templates/
│   └── index.html         # Frontend template and DOM elements
├── static/
│   ├── css/
│   │   └── style.css      # Core styles, glassmorphism, animations
│   └── js/
│       └── app.js         # Fetch requests, character counters, modals
├── requirements.txt       # Python dependencies
└── .gitignore             # Git ignore definitions
```

---

## Prerequisites

- **Python 3.8+**
- **pip** (Python package installer)

---

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nagarjuna-kandimalla/GOOGLE_AGENTS_DAY2-event-talks-app.git
   cd GOOGLE_AGENTS_DAY2-event-talks-app
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application**:
   ```bash
   python app.py
   ```

4. **Access the application**:
   Open your browser and navigate to **`http://127.0.0.1:5000`**.

---

## How It Works

1. **Fetching**: The client browser requests notes from the `/api/release-notes` route. The Flask backend downloads the feed XML, extracts structural fields, and replies with parsed JSON.
2. **Formatting**: JavaScript reads the JSON payload, strips the raw HTML description of tag noise to obtain readable text, and loads cards onto the screen.
3. **Sharing**: Clicking **Tweet Update** opens the editor. It pre-calculates the space needed for hashtags and URLs, dynamically crops description snippets to fit the standard 280-character limits, and opens the Twitter Web Intent editor when confirmed.
