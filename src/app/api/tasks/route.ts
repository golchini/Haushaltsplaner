import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, getToday } from '@/lib/db';
import type { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getToday();

    const allTasks = await getAll<Task>('tasks');
    const tasks = allTasks
      .filter(t => t.date === date)
      .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID header missing' }, { status: 401 });
    }

    const body = await request.json();
    const { title, scheduled_time, date, category, priority } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date required' }, { status: 400 });
    }

    const task = await create<Task>('tasks', {
      user_id: userId,
      title,
      scheduled_time: scheduled_time || null,
      date,
      category: category || 'sonstiges',
      priority: priority || 'medium',
      done: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
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
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const task = await update<Task>('tasks', id, updates, userId); // Pass user_id for RLS check
    if (!task) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Tasks PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const success = await remove('tasks', parseInt(id), userId);
    if (!success) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
