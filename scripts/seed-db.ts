import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface JsonStore<T> {
  items: T[];
  lastId: number;
}

function writeStore<T>(name: string, items: T[]): void {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  const store: JsonStore<T> = {
    items: items.map((item, index) => ({ ...item, id: index + 1 })),
    lastId: items.length,
  };
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

console.log('Seeding database...');

// ============ REZEPTE ============

const rezepte = [
  {
    name: 'Fesenjān',
    kategorie: 'iranisch',
    portionen: 6,
    zubereitungszeit: 90,
    zutaten: [
      { name: 'Hühnerkeulen', menge: 6, einheit: 'Stück', optional: false },
      { name: 'Walnüsse (gemahlen)', menge: 200, einheit: 'g', optional: false },
      { name: 'Granatapfelsirup', menge: 4, einheit: 'EL', optional: false },
      { name: 'Zwiebeln', menge: 2, einheit: 'Stück', optional: false },
      { name: 'Kurkuma', menge: 1, einheit: 'TL', optional: false },
    ],
    anleitung: [
      'Zwiebeln anbraten bis goldbraun',
      'Hühnerkeulen anbraten',
      'Gemahlene Walnüsse dazu, kurz rösten',
      'Wasser dazu (ca. 500ml)',
      'Granatapfelsirup, Kurkuma, Salz',
      '1-1.5h köcheln lassen',
      'Abschmecken (süß-sauer Balance)',
    ],
    tags: ['iranisch', 'meal-prep', 'huhn'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Ghormeh Sabzi',
    kategorie: 'iranisch',
    portionen: 6,
    zubereitungszeit: 120,
    zutaten: [
      { name: 'Lammfleisch', menge: 500, einheit: 'g', optional: false },
      { name: 'Kräutermischung', menge: 400, einheit: 'g', optional: false },
      { name: 'Kidneybohnen', menge: 1, einheit: 'Dose', optional: false },
      { name: 'Getrocknete Limetten', menge: 4, einheit: 'Stück', optional: false },
      { name: 'Zwiebeln', menge: 2, einheit: 'Stück', optional: false },
    ],
    anleitung: [
      'Fleisch mit Zwiebeln und Kurkuma anbraten',
      'Kräuter separat anbraten',
      'Alles zusammen mit Wasser köcheln',
      'Limetten einstechen und dazugeben',
      'Bohnen dazu, 1.5-2h köcheln',
    ],
    tags: ['iranisch', 'meal-prep', 'lamm'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Bolognese',
    kategorie: 'italienisch',
    portionen: 6,
    zubereitungszeit: 180,
    zutaten: [
      { name: 'Hackfleisch', menge: 500, einheit: 'g', optional: false },
      { name: 'Zwiebeln', menge: 2, einheit: 'Stück', optional: false },
      { name: 'Karotten', menge: 2, einheit: 'Stück', optional: false },
      { name: 'Sellerie', menge: 2, einheit: 'Stangen', optional: false },
      { name: 'Tomatenmark', menge: 2, einheit: 'EL', optional: false },
      { name: 'Passierte Tomaten', menge: 400, einheit: 'ml', optional: false },
      { name: 'Rotwein', menge: 200, einheit: 'ml', optional: false },
      { name: 'Milch', menge: 100, einheit: 'ml', optional: false },
    ],
    anleitung: [
      'Soffritto anbraten',
      'Hackfleisch krümelig braten',
      'Tomatenmark rösten',
      'Rotwein ablöschen',
      'Tomaten + Milch dazu',
      'Mind. 2h köcheln',
    ],
    tags: ['italienisch', 'meal-prep', 'pasta'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Miso-Suppe',
    kategorie: 'japanisch',
    portionen: 4,
    zubereitungszeit: 15,
    zutaten: [
      { name: 'Misopaste', menge: 2, einheit: 'EL', optional: false },
      { name: 'Brühe', menge: 500, einheit: 'ml', optional: false },
      { name: 'Karotten', menge: 2, einheit: 'Stück', optional: false },
      { name: 'Sellerie', menge: 2, einheit: 'Stangen', optional: false },
      { name: 'Tofu', menge: 200, einheit: 'g', optional: true },
    ],
    anleitung: [
      'Gemüse kleinschneiden',
      'In Brühe kochen (10 Min)',
      'Vom Herd nehmen',
      'Misopaste einrühren (nicht kochen!)',
    ],
    tags: ['japanisch', 'schnell', 'vegetarisch'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Pasta Aglio e Olio',
    kategorie: 'italienisch',
    portionen: 2,
    zubereitungszeit: 20,
    zutaten: [
      { name: 'Spaghetti', menge: 200, einheit: 'g', optional: false },
      { name: 'Knoblauch', menge: 6, einheit: 'Zehen', optional: false },
      { name: 'Olivenöl', menge: 80, einheit: 'ml', optional: false },
      { name: 'Peperoncino', menge: 2, einheit: 'Stück', optional: false },
      { name: 'Petersilie', menge: 1, einheit: 'Bund', optional: false },
    ],
    anleitung: [
      'Knoblauch in Scheiben schneiden',
      'In Olivenöl langsam anbraten',
      'Peperoncino dazu',
      'Pasta al dente kochen',
      'Mit Öl und Pastawasser vermengen',
      'Petersilie dazu',
    ],
    tags: ['italienisch', 'schnell', 'vegetarisch'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Kuku Sabzi',
    kategorie: 'iranisch',
    portionen: 4,
    zubereitungszeit: 30,
    zutaten: [
      { name: 'Eier', menge: 6, einheit: 'Stück', optional: false },
      { name: 'Frische Kräuter', menge: 300, einheit: 'g', optional: false },
      { name: 'Walnüsse', menge: 50, einheit: 'g', optional: true },
      { name: 'Berberitzen', menge: 30, einheit: 'g', optional: true },
      { name: 'Kurkuma', menge: 1, einheit: 'TL', optional: false },
    ],
    anleitung: [
      'Kräuter fein hacken',
      'Mit Eiern mischen',
      'Kurkuma dazu',
      'In Pfanne langsam stocken lassen',
      'Wenden, fertig backen',
    ],
    tags: ['iranisch', 'schnell', 'vegetarisch'],
    created_at: new Date().toISOString(),
  },
  {
    name: 'Carbonara',
    kategorie: 'italienisch',
    portionen: 2,
    zubereitungszeit: 25,
    zutaten: [
      { name: 'Spaghetti', menge: 200, einheit: 'g', optional: false },
      { name: 'Guanciale', menge: 150, einheit: 'g', optional: false },
      { name: 'Eigelb', menge: 4, einheit: 'Stück', optional: false },
      { name: 'Pecorino', menge: 80, einheit: 'g', optional: false },
      { name: 'Schwarzer Pfeffer', menge: 1, einheit: 'TL', optional: false },
    ],
    anleitung: [
      'Guanciale knusprig braten',
      'Eigelb + Käse + Pfeffer mischen',
      'Pasta al dente kochen',
      'Pasta zu Guanciale, vom Herd',
      'Ei-Käse-Mischung schnell unterrühren',
      'Mit Pastawasser cremig machen',
    ],
    tags: ['italienisch', 'schnell', 'pasta'],
    created_at: new Date().toISOString(),
  },
];

writeStore('rezepte', rezepte);
console.log(`Inserted ${rezepte.length} rezepte`);

// ============ TRAINING ============

const trainings = [
  {
    name: 'Push',
    tag: 'mo',
    uebungen: [
      { name: 'Bankdrücken', saetze: 4, wiederholungen: '8-10' },
      { name: 'Schrägbank Kurzhantel', saetze: 3, wiederholungen: '10-12' },
      { name: 'Schulterdrücken', saetze: 4, wiederholungen: '8-10' },
      { name: 'Seitheben', saetze: 3, wiederholungen: '12-15' },
      { name: 'Dips', saetze: 3, wiederholungen: 'max' },
      { name: 'Trizeps Pushdown', saetze: 3, wiederholungen: '12-15' },
    ],
  },
  {
    name: 'Pull',
    tag: 'di',
    uebungen: [
      { name: 'Klimmzüge', saetze: 4, wiederholungen: 'max' },
      { name: 'Rudern', saetze: 4, wiederholungen: '8-10' },
      { name: 'Latzug', saetze: 3, wiederholungen: '10-12' },
      { name: 'Face Pulls', saetze: 3, wiederholungen: '15' },
      { name: 'Bizeps Curls', saetze: 3, wiederholungen: '10-12' },
      { name: 'Hammer Curls', saetze: 3, wiederholungen: '10-12' },
    ],
  },
  {
    name: 'Legs',
    tag: 'do',
    uebungen: [
      { name: 'Kniebeugen', saetze: 4, wiederholungen: '8-10' },
      { name: 'Beinpresse', saetze: 3, wiederholungen: '10-12' },
      { name: 'Romanian Deadlift', saetze: 3, wiederholungen: '10-12' },
      { name: 'Beinbeuger', saetze: 3, wiederholungen: '12-15' },
      { name: 'Wadenheben', saetze: 4, wiederholungen: '15' },
      { name: 'Planks', saetze: 3, wiederholungen: '60 Sek' },
    ],
  },
  {
    name: 'Upper',
    tag: 'fr',
    uebungen: [
      { name: 'Bankdrücken (leichter)', saetze: 3, wiederholungen: '10' },
      { name: 'Rudern', saetze: 3, wiederholungen: '10' },
      { name: 'Schulterdrücken', saetze: 3, wiederholungen: '10' },
      { name: 'Klimmzüge', saetze: 3, wiederholungen: 'max' },
      { name: 'Bizeps + Trizeps Superset', saetze: 3, wiederholungen: '12' },
    ],
  },
];

writeStore('trainingsplaene', trainings);
console.log(`Inserted ${trainings.length} trainingsplaene`);

// ============ SAMPLE TASKS ============

const today = getToday();

const tasks = [
  { title: 'Legs Training', scheduled_time: '18:45', date: today, category: 'training', priority: 'high', done: false, created_at: new Date().toISOString() },
  { title: 'Bettwäsche waschen', scheduled_time: '17:30', date: today, category: 'haushalt', priority: 'medium', done: false, created_at: new Date().toISOString() },
  { title: 'Müll rausbringen', scheduled_time: '16:00', date: today, category: 'haushalt', priority: 'medium', done: false, created_at: new Date().toISOString() },
  { title: 'Sauna', scheduled_time: '20:00', date: today, category: 'training', priority: 'medium', done: false, created_at: new Date().toISOString() },
  { title: 'Wäsche abhängen', scheduled_time: '17:00', date: today, category: 'haushalt', priority: 'low', done: false, created_at: new Date().toISOString() },
  { title: 'Journaling', scheduled_time: '22:30', date: today, category: 'sonstiges', priority: 'low', done: false, created_at: new Date().toISOString() },
];

writeStore('tasks', tasks);
console.log(`Inserted ${tasks.length} tasks for today`);

// ============ TERMINE ============

const termine = [
  { title: 'Treffen mit Claudia', date: '2026-01-14', time: '18:00', location: null, notes: null, done: false, created_at: new Date().toISOString() },
  { title: 'Upper Training mit Bruder', date: '2026-01-11', time: '08:00', location: 'Gym', notes: 'Meal Prep danach', done: false, created_at: new Date().toISOString() },
  { title: 'ARBEITSLOSENGELD KLÄREN', date: '2026-01-12', time: null, location: null, notes: 'Wichtig!', done: false, created_at: new Date().toISOString() },
];

writeStore('termine', termine);
console.log(`Inserted ${termine.length} termine`);

// ============ MAHLZEITEN ============

const mahlzeiten = [
  { date: today, typ: 'fruehstueck', beschreibung: 'Müsli + Milch + Banane', rezept_id: null },
  { date: today, typ: 'mittag', beschreibung: 'Miso-Suppe (Rest)', rezept_id: 4 },
  { date: today, typ: 'abend', beschreibung: 'Schmortopf (letztes!)', rezept_id: null },
];

writeStore('mahlzeiten', mahlzeiten);
console.log(`Inserted ${mahlzeiten.length} mahlzeiten for today`);

// ============ EINKAUFSLISTE ============

const einkaufsliste = [
  { name: 'Reis', menge: null, kategorie: 'dringend', auto_generated: false, done: false, created_at: new Date().toISOString() },
  { name: 'Brot', menge: null, kategorie: 'dringend', auto_generated: false, done: false, created_at: new Date().toISOString() },
  { name: 'Granatapfelsirup (Rob-e Anar)', menge: null, kategorie: 'diese_woche', auto_generated: false, done: false, created_at: new Date().toISOString() },
  { name: 'Walnüsse (200g)', menge: null, kategorie: 'diese_woche', auto_generated: false, done: false, created_at: new Date().toISOString() },
  { name: 'Hühnerkeulen (4-6 Stück)', menge: null, kategorie: 'diese_woche', auto_generated: false, done: false, created_at: new Date().toISOString() },
  { name: 'Destilliertes Wasser', menge: null, kategorie: 'sonstiges', auto_generated: false, done: false, created_at: new Date().toISOString() },
];

writeStore('einkaufsliste', einkaufsliste);
console.log(`Inserted ${einkaufsliste.length} einkaufsliste items`);

console.log('\nDatabase seeded successfully!');
console.log(`Data files created in: ${DATA_DIR}`);
