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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Keine Daten verfügbar</div>
      </div>
    );
  }

  const getFormattedDate = (date: string, formatString: string) => {
    try {
      if (!date || isNaN(new Date(date).getTime())) {
        console.error('Invalid date value:', date);
        return 'Ungültiges Datum';
      }
      return format(new Date(date), formatString, { locale: de });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fehlerhaftes Datum';
    }
  };

  const heute = getFormattedDate(data.datum, 'EEEE, d. MMMM');


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Heute</h1>
          <p className="text-gray-400 capitalize">{heute}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{format(currentTime, 'HH:mm')}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Link href="/termine" className="bg-gray-800 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors">
          <Calendar size={24} className="mx-auto mb-1 text-blue-400" />
          <span className="text-xs">Termine</span>
        </Link>
        <Link href="/kochplan" className="bg-gray-800 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors">
          <UtensilsCrossed size={24} className="mx-auto mb-1 text-orange-400" />
          <span className="text-xs">Kochplan</span>
        </Link>
        <Link href="/rezepte" className="bg-gray-800 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors">
          <BookOpen size={24} className="mx-auto mb-1 text-green-400" />
          <span className="text-xs">Rezepte</span>
        </Link>
        <Link href="/einkaufen" className="bg-gray-800 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors">
          <ShoppingCart size={24} className="mx-auto mb-1 text-purple-400" />
          <span className="text-xs">Einkaufen</span>
        </Link>
      </div>

      {/* Progress */}
      {data.fortschritt && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Fortschritt</span>
            <span className="text-sm">
              {data.fortschritt.erledigt} / {data.fortschritt.total}
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${data.fortschritt.prozent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{data.fortschritt.prozent}% erledigt</p>
        </div>
      )}

      {/* Tasks */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} />
          Zeitplan
        </h2>
        {data.tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Keine Tasks für heute</p>
        ) : (
          <div className="space-y-2">
            {data.tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  task.done ? 'bg-gray-700/50' : 'bg-gray-700'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id, !task.done)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.done
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-green-400'
                  }`}
                >
                  {task.done && <Check size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={task.done ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </p>
                </div>
                {task.scheduled_time && (
                  <span className="text-sm text-gray-400 flex-shrink-0">
                    {task.scheduled_time}
                  </span>
                )}
                {task.priority === 'high' && !task.done && (
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mahlzeiten */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <ChefHat size={18} />
          Mahlzeiten
        </h2>
        {data.mahlzeiten.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Keine Mahlzeiten geplant</p>
        ) : (
          <div className="space-y-2">
            {data.mahlzeiten.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded bg-gray-700">
                <span className="text-sm text-gray-400 w-20">
                  {m.typ === 'fruehstueck' ? 'Frühstück' : m.typ === 'mittag' ? 'Mittag' : 'Abend'}
                </span>
                <span>{m.beschreibung}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Termine heute */}
      {data.termine_heute.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar size={18} />
            Termine heute
          </h2>
          <div className="space-y-2">
            {data.termine_heute.map((t) => (
              <div key={t.id} className="p-2 bg-blue-900/30 rounded">
                <p className="font-medium">{t.title}</p>
                {t.time && <p className="text-sm text-blue-400">{t.time} Uhr</p>}
                {t.location && <p className="text-xs text-gray-400">{t.location}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Termine bald */}
      {data.termine_bald.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Bald</h2>
          <div className="space-y-2">
            {data.termine_bald.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-gray-400">
                  {getFormattedDate(t.date, 'd.M.')}
                </span>
                <span className="truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
