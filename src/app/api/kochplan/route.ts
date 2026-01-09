import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, getWeek } from '@/lib/db';
import type { Mahlzeit, Rezept, EinkaufsItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface MahlzeitWithRezept extends Mahlzeit {
  rezept?: Rezept;
}

// GET meals for a week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || getWeek();

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

    // Get mahlzeiten for the week, enriched with rezept data
    const mahlzeiten: MahlzeitWithRezept[] = allMahlzeiten
      .filter(m => dates.includes(m.date))
      .map(m => ({
        ...m,
        rezept: m.rezept_id ? allRezepte.find(r => r.id === m.rezept_id) : undefined,
      }));

    // Calculate total portions
    const totalPortionen = mahlzeiten.reduce((sum, m) => {
      return sum + (m.rezept?.portionen || 1);
    }, 0);

    return NextResponse.json({
      week,
      dates,
      mahlzeiten,
      totalPortionen,
      zielPortionen: 14,
    });
  } catch (error) {
    console.error('Kochplan GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch kochplan' }, { status: 500 });
  }
}

// Add a meal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, typ, beschreibung, rezept_id } = body;

    if (!date || !typ) {
      return NextResponse.json({ error: 'Date and typ required' }, { status: 400 });
    }

    const mahlzeit = create<Mahlzeit>('mahlzeiten', {
      date,
      typ,
      beschreibung: beschreibung || null,
      rezept_id: rezept_id || null,
    });

    return NextResponse.json(mahlzeit, { status: 201 });
  } catch (error) {
    console.error('Kochplan POST error:', error);
    return NextResponse.json({ error: 'Failed to add meal' }, { status: 500 });
  }
}

// Update a meal
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Meal ID required' }, { status: 400 });
    }

    const mahlzeit = update<Mahlzeit>('mahlzeiten', id, updates);
    if (!mahlzeit) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json(mahlzeit);
  } catch (error) {
    console.error('Kochplan PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}

// Delete a meal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Meal ID required' }, { status: 400 });
    }

    const success = remove('mahlzeiten', parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kochplan DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}

// Helper to get the Monday of a given ISO week
function getDateOfWeek(week: number, year: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);
  const result = new Date(firstMonday);
  result.setDate(firstMonday.getDate() + (week - 1) * 7);
  return result;
}
