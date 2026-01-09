'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Clock, Calendar, ChefHat, AlertCircle, ShoppingCart, BookOpen, UtensilsCrossed } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  scheduled_time: string | null;
  done: boolean;
  category: string;
  priority: string;
}

interface Termin {
  id: number;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
}

interface Mahlzeit {
  id: number;
  typ: string;
  beschreibung: string;
}

interface DashboardData {
  datum: string;
  tasks: Task[];
  termine_heute: Termin[];
  termine_bald: Termin[];
  mahlzeiten: Mahlzeit[];
  fortschritt: {
    erledigt: number;
    total: number;
    prozent: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(id: number, done: boolean) {
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done }),
      });
      fetchDashboard();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neutral-500">Laden...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neutral-500">Keine Daten verfügbar</div>
      </div>
    );
  }

  const getFormattedDate = (date: string, formatString: string) => {
    try {
      if (!date || isNaN(new Date(date).getTime())) {
        return 'Ungültiges Datum';
      }
      return format(new Date(date), formatString, { locale: de });
    } catch {
      return 'Fehlerhaftes Datum';
    }
  };

  const heute = getFormattedDate(data.datum, 'EEEE, d. MMMM');

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Heute</h1>
          <p className="text-neutral-500 capitalize">{heute}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-light">{format(currentTime, 'HH:mm')}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        <Link href="/termine" className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center hover:border-neutral-700 transition-colors">
          <Calendar size={24} className="mx-auto mb-1 text-white" />
          <span className="text-xs text-neutral-400">Termine</span>
        </Link>
        <Link href="/kochplan" className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center hover:border-neutral-700 transition-colors">
          <UtensilsCrossed size={24} className="mx-auto mb-1 text-white" />
          <span className="text-xs text-neutral-400">Kochplan</span>
        </Link>
        <Link href="/rezepte" className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center hover:border-neutral-700 transition-colors">
          <BookOpen size={24} className="mx-auto mb-1 text-white" />
          <span className="text-xs text-neutral-400">Rezepte</span>
        </Link>
        <Link href="/einkaufen" className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center hover:border-neutral-700 transition-colors">
          <ShoppingCart size={24} className="mx-auto mb-1 text-white" />
          <span className="text-xs text-neutral-400">Einkaufen</span>
        </Link>
      </div>

      {/* Progress */}
      {data.fortschritt && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">Fortschritt</span>
            <span className="text-sm text-neutral-400">
              {data.fortschritt.erledigt} / {data.fortschritt.total}
            </span>
          </div>
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${data.fortschritt.prozent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Clock size={14} />
          Zeitplan
        </h2>
        {data.tasks.length === 0 ? (
          <p className="text-neutral-600 text-center py-4">Keine Tasks für heute</p>
        ) : (
          <div className="space-y-1">
            {data.tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  task.done
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id, !task.done)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.done
                      ? 'bg-white border-white text-black'
                      : 'border-neutral-600 hover:border-white'
                  }`}
                >
                  {task.done && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={task.done ? 'line-through text-neutral-600' : 'text-white'}>
                    {task.title}
                  </p>
                </div>
                {task.scheduled_time && (
                  <span className="text-sm text-neutral-500 flex-shrink-0">
                    {task.scheduled_time}
                  </span>
                )}
                {task.priority === 'high' && !task.done && (
                  <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mahlzeiten */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <ChefHat size={14} />
          Mahlzeiten
        </h2>
        {data.mahlzeiten.length === 0 ? (
          <p className="text-neutral-600 text-center py-4">Keine Mahlzeiten geplant</p>
        ) : (
          <div className="space-y-1">
            {data.mahlzeiten.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <span className="text-sm text-neutral-500 w-20">
                  {m.typ === 'fruehstueck' ? 'Frühstück' : m.typ === 'mittag' ? 'Mittag' : 'Abend'}
                </span>
                <span className="text-white">{m.beschreibung}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Termine heute */}
      {data.termine_heute.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Termine heute
          </h2>
          <div className="space-y-1">
            {data.termine_heute.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <p className="font-medium text-white">{t.title}</p>
                {t.time && <p className="text-sm text-neutral-400">{t.time} Uhr</p>}
                {t.location && <p className="text-xs text-neutral-500">{t.location}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Termine bald */}
      {data.termine_bald.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Bald
          </h2>
          <div className="space-y-2">
            {data.termine_bald.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <span className="text-neutral-600 w-12">
                  {getFormattedDate(t.date, 'd.M.')}
                </span>
                <span className="text-white truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
