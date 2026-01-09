# Haushaltsplaner App

Erfans persönlicher Haushaltsplaner mit strukturierten Daten.

## Features

- **Dashboard**: Tagesübersicht mit Tasks, Terminen, Mahlzeiten
- **Termine**: Sortierte Liste aller Termine
- **Kochplaner**: Wochenplan mit automatischer Einkaufsliste
- **Rezepte**: Datenbank aller Rezepte
- **Einkaufsliste**: Mit Clear-Funktion

## Setup

```bash
# Dependencies installieren
npm install

# Datenbank initialisieren und mit Daten befüllen
npm run db:init
npm run db:seed

# Development Server starten
npm run dev
```

App läuft auf http://localhost:3000

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)

## API Endpoints

- `GET /api/dashboard` - Tagesübersicht
- `GET/POST/PATCH/DELETE /api/tasks` - Tasks verwalten
- `GET/POST/PATCH/DELETE /api/termine` - Termine verwalten
- `GET/POST/PATCH/DELETE /api/rezepte` - Rezepte verwalten
- `GET/POST/PATCH/DELETE /api/einkaufsliste` - Einkaufsliste verwalten

## AI Integration

Die strukturierten API Endpoints ermöglichen es jeder AI (Claude, Gemini, etc.),
die Daten korrekt zu lesen und zu schreiben, ohne das System durcheinander zu bringen.
