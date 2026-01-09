import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, getWeek } from '@/lib/db';
import type { Mahlzeit, Rezept, EinkaufsItem, Zutat } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Generate shopping list from Kochplan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const week = body.week || getWeek();

    // Get start and end dates for the week
    const [year, weekNum] = week.split('-W').map(Number);
    const startDate = getDateOfWeek(weekNum, year);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const allMahlzeiten = getAll<Mahlzeit>('mahlzeiten');
    const allRezepte = getAll<Rezept>('rezepte');
    const existingItems = getAll<EinkaufsItem>('einkaufsliste');

    // Get mahlzeiten for the week with rezept_id
    const mahlzeiten = allMahlzeiten.filter(m => dates.includes(m.date) && m.rezept_id);

    // Collect all ingredients
    const zutatMap = new Map<string, { menge: number; einheit: string }>();

    for (const mahlzeit of mahlzeiten) {
      const rezept = allRezepte.find(r => r.id === mahlzeit.rezept_id);
      if (!rezept) continue;

      for (const zutat of rezept.zutaten) {
        if (zutat.optional) continue;

        const key = zutat.name.toLowerCase();
        const existing = zutatMap.get(key);

        if (existing && existing.einheit === zutat.einheit) {
          existing.menge += zutat.menge;
        } else {
          zutatMap.set(key, { menge: zutat.menge, einheit: zutat.einheit });
        }
      }
    }

    // Add to shopping list (skip if already exists)
    const addedItems: EinkaufsItem[] = [];

    for (const [name, { menge, einheit }] of zutatMap) {
      const existingItem = existingItems.find(
        i => i.name.toLowerCase().includes(name) || name.includes(i.name.toLowerCase())
      );

      if (!existingItem) {
        const mengeStr = `${menge} ${einheit}`;
        const item = create<EinkaufsItem>('einkaufsliste', {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          menge: mengeStr,
          kategorie: 'diese_woche',
          auto_generated: true,
          done: false,
          created_at: new Date().toISOString(),
        });
        addedItems.push(item);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedItems.length,
      items: addedItems,
    });
  } catch (error) {
    console.error('Zutatenliste error:', error);
    return NextResponse.json({ error: 'Failed to generate zutatenliste' }, { status: 500 });
  }
}

function getDateOfWeek(week: number, year: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  const result = new Date(firstMonday);
  result.setDate(firstMonday.getDate() + (week - 1) * 7);
  return result;
}
