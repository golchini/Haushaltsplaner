import { NextResponse } from 'next/server';
import { getAll, getToday } from '@/lib/db';
import type { Task, Termin, Mahlzeit, DashboardData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = getToday();

    // Get today's tasks
    const allTasks = await getAll<Task>('tasks');
    const tasks = allTasks
      .filter(t => t.date === today)
      .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''));

    // Get today's termine
    const allTermine = await getAll<Termin>('termine');
    const termine_heute = allTermine
      .filter(t => t.date === today)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    // Get upcoming termine (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const termine_bald = allTermine
      .filter(t => t.date > today && t.date <= nextWeek.toISOString().split('T')[0])
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get today's meals
    const allMahlzeiten = await getAll<Mahlzeit>('mahlzeiten');
    const mahlzeiten = allMahlzeiten.filter(m => m.date === today);

    // Calculate progress
    const erledigt = tasks.filter(t => t.done).length;
    const total = tasks.length;

    const data: DashboardData = {
      datum: today,
      tasks,
      termine_heute,
      termine_bald,
      mahlzeiten,
      fortschritt: {
        erledigt,
        total,
        prozent: total > 0 ? Math.round((erledigt / total) * 100) : 0,
      },
      aufbrauchen: [],
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
