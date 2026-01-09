import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove } from '@/lib/db';
import type { Rezept } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategorie = searchParams.get('kategorie');
    const search = searchParams.get('search')?.toLowerCase();

    let rezepte = getAll<Rezept>('rezepte');

    if (kategorie) {
      rezepte = rezepte.filter(r => r.kategorie === kategorie);
    }

    if (search) {
      rezepte = rezepte.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.tags.some(t => t.toLowerCase().includes(search))
      );
    }

    rezepte.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(rezepte);
  } catch (error) {
    console.error('Rezepte GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch rezepte' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, kategorie, portionen, zubereitungszeit, zutaten, anleitung, tags } = body;

    if (!name || !zutaten || !anleitung) {
      return NextResponse.json({ error: 'Name, zutaten, and anleitung required' }, { status: 400 });
    }

    const rezept = create<Rezept>('rezepte', {
      name,
      kategorie: kategorie || 'sonstiges',
      portionen: portionen || 4,
      zubereitungszeit: zubereitungszeit || 30,
      zutaten,
      anleitung,
      tags: tags || [],
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(rezept, { status: 201 });
  } catch (error) {
    console.error('Rezepte POST error:', error);
    return NextResponse.json({ error: 'Failed to create rezept' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rezept ID required' }, { status: 400 });
    }

    const rezept = update<Rezept>('rezepte', id, updates);
    if (!rezept) {
      return NextResponse.json({ error: 'Rezept not found' }, { status: 404 });
    }

    return NextResponse.json(rezept);
  } catch (error) {
    console.error('Rezepte PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update rezept' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rezept ID required' }, { status: 400 });
    }

    const success = remove('rezepte', parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Rezept not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rezepte DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete rezept' }, { status: 500 });
  }
}
