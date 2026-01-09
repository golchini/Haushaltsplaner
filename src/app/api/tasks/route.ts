import { NextRequest, NextResponse } from 'next/server';
import { getAll, create, update, remove, getToday } from '@/lib/db';
import type { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getToday();

    const allTasks = getAll<Task>('tasks');
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
    const body = await request.json();
    const { title, scheduled_time, date, category, priority } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date required' }, { status: 400 });
    }

    const task = create<Task>('tasks', {
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
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const task = update<Task>('tasks', id, updates);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Tasks PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const success = remove('tasks', parseInt(id));
    if (!success) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
