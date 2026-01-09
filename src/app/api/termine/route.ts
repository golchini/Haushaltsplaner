import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, getToday } from '@/lib/db';
import type { Termin } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const today = getToday();

    let allTermine = getAll<Termin>('termine');

    if (upcoming) {
      allTermine = allTermine.filter(t => t.date >= today && !t.done);
    }

    const termine = allTermine.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '').localeCompare(b.time || '');
    });

    return NextResponse.json(termine);
  } catch (error) {
    console.error('Termine GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch termine' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, time, location, notes } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date required' }, { status: 400 });
    }

    const termin = create<Termin>('termine', {
      title,
      date,
      time: time || null,
      location: location || null,
      notes: notes || null,
      done: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(termin, { status: 201 });
  } catch (error) {
    console.error('Termine POST error:', error);
    return NextResponse.json({ error: 'Failed to create termin' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Termin ID required' }, { status: 400 });
    }

    const termin = update<Termin>('termine', id, updates);
    if (!termin) {
      return NextResponse.json({ error: 'Termin not found' }, { status: 404 });
    }

    return NextResponse.json(termin);
  } catch (error) {
    console.error('Termine PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update termin' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Termin ID required' }, { status: 400 });
    }

    const success = remove('termine', parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Termin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Termine DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete termin' }, { status: 500 });
  }
}
