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

function getFilePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

function readStore<T>(name: string): JsonStore<T> {
  const filePath = getFilePath(name);
  if (!fs.existsSync(filePath)) {
    return { items: [], lastId: 0 };
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeStore<T>(name: string, store: JsonStore<T>): void {
  const filePath = getFilePath(name);
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

// Generic CRUD operations
export function getAll<T>(storeName: string): T[] {
  return readStore<T>(storeName).items;
}

export function getById<T extends { id: number }>(storeName: string, id: number): T | undefined {
  const store = readStore<T>(storeName);
  return store.items.find(item => item.id === id);
}

export function create<T extends { id?: number }>(storeName: string, item: Omit<T, 'id'>): T {
  const store = readStore<T>(storeName);
  const newId = store.lastId + 1;
  const newItem = { ...item, id: newId } as T;
  store.items.push(newItem);
  store.lastId = newId;
  writeStore(storeName, store);
  return newItem;
}

export function update<T extends { id: number }>(storeName: string, id: number, updates: Partial<T>): T | undefined {
  const store = readStore<T>(storeName);
  const index = store.items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  store.items[index] = { ...store.items[index], ...updates };
  writeStore(storeName, store);
  return store.items[index];
}

export function remove(storeName: string, id: number): boolean {
  const store = readStore<{ id: number }>(storeName);
  const index = store.items.findIndex(item => item.id === id);
  if (index === -1) return false;
  store.items.splice(index, 1);
  writeStore(storeName, store);
  return true;
}

export function query<T>(storeName: string, predicate: (item: T) => boolean): T[] {
  return readStore<T>(storeName).items.filter(predicate);
}

export function clearDone(storeName: string): void {
  const store = readStore<{ id: number; done: boolean }>(storeName);
  store.items = store.items.filter(item => !item.done);
  writeStore(storeName, store);
}

// Helper functions
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeek(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
