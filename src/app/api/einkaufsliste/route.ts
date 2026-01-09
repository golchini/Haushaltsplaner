import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, clearDone } from '@/lib/db';
import type { EinkaufsItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getAll<EinkaufsItem>('einkaufsliste');

    // Sort by kategorie priority, then done status, then created_at
    const sorted = items.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        dringend: 1,
        diese_woche: 2,
        sonstiges: 3,
      };
      const priorityA = priorityOrder[a.kategorie] || 3;
      const priorityB = priorityOrder[b.kategorie] || 3;

      if (priorityA !== priorityB) return priorityA - priorityB;
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Einkaufsliste GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch einkaufsliste' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID header missing' }, { status: 401 });
    }

    const body = await request.json();
    const { name, menge, kategorie, auto_generated } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const item = await create<EinkaufsItem>('einkaufsliste', {
      user_id: userId,
      name,
      menge: menge || null,
      kategorie: kategorie || 'sonstiges',
      auto_generated: auto_generated || false,
      done: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Einkaufsliste POST error:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID header missing' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const item = await update<EinkaufsItem>('einkaufsliste', id, { ...updates, user_id: userId });
    if (!item) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Einkaufsliste PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID header missing' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearDoneItems = searchParams.get('clearDone') === 'true';

    if (clearDoneItems) {
      await clearDone('einkaufsliste', userId);
      return NextResponse.json({ success: true, message: 'Cleared done items' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const success = await remove('einkaufsliste', parseInt(id), userId);
    if (!success) {
      return NextResponse.json({ error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Einkaufsliste DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
