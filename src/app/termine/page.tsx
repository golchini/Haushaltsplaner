'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Calendar, MapPin, Check, Trash2 } from 'lucide-react';
import type { Termin } from '@/lib/types';

// Hardcoded USER_ID for testing purposes
const HARDCODED_USER_ID = 'f2476673-e4d0-486f-b9b6-99923c3ba0b6';

export default function TerminePage() {
  const [termine, setTermine] = useState<Termin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTermin, setNewTermin] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchTermine();
  }, []);

  const fetchTermine = async () => {
    try {
      const res = await fetch('/api/termine?upcoming=true', {
        headers: {
          'x-user-id': HARDCODED_USER_ID,
        },
      });
      const data = await res.json();
      setTermine(data);
    } catch (error) {
      console.error('Failed to fetch termine:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTermin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermin.title || !newTermin.date) return;

    try {
      const res = await fetch('/api/termine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': HARDCODED_USER_ID,
        },
        body: JSON.stringify({
          title: newTermin.title,
          date: newTermin.date,
          time: newTermin.time || null,
          location: newTermin.location || null,
          notes: newTermin.notes || null,
        }),
      });

      if (res.ok) {
        setNewTermin({ title: '', date: '', time: '', location: '', notes: '' });
        setShowForm(false);
        fetchTermine();
      } else {
        const errorData = await res.json();
        console.error('Failed to add termin:', errorData);
      }
    } catch (error) {
      console.error('Failed to add termin:', error);
    }
  };

  const toggleDone = async (termin: Termin) => {
    try {
      const res = await fetch('/api/termine', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': HARDCODED_USER_ID,
        },
        body: JSON.stringify({ id: termin.id, done: !termin.done }),
      });
      if (res.ok) {
        fetchTermine();
      } else {
        const errorData = await res.json();
        console.error('Failed to toggle termin:', errorData);
      }
    } catch (error) {
      console.error('Failed to toggle termin:', error);
    }
  };

  const deleteTermin = async (id: number) => {
    try {
      const res = await fetch(`/api/termine?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': HARDCODED_USER_ID,
        },
      });
      if (res.ok) {
        fetchTermine();
      } else {
        const errorData = await res.json();
        console.error('Failed to delete termin:', errorData);
      }
    } catch (error) {
      console.error('Failed to delete termin:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const day = days[date.getDay()];
    return `${day}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.`;
  };

  const groupByDate = (termine: Termin[]) => {
    const groups: Record<string, Termin[]> = {};
    for (const termin of termine) {
      if (!groups[termin.date]) {
        groups[termin.date] = [];
      }
      groups[termin.date].push(termin);
    }
    return groups;
  };

  const grouped = groupByDate(termine);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
          <span>Dashboard</span>
        </Link>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm"
        >
          <Plus size={16} />
          Neu
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Termine</h1>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={addTermin} className="bg-gray-800 rounded-lg p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Titel *"
            value={newTermin.title}
            onChange={(e) => setNewTermin({ ...newTermin, title: e.target.value })}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
            required
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={newTermin.date}
              onChange={(e) => setNewTermin({ ...newTermin, date: e.target.value })}
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-white"
              required
            />
            <input
              type="time"
              value={newTermin.time}
              onChange={(e) => setNewTermin({ ...newTermin, time: e.target.value })}
              className="w-24 bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <input
            type="text"
            placeholder="Ort"
            value={newTermin.location}
            onChange={(e) => setNewTermin({ ...newTermin, location: e.target.value })}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
          />
          <textarea
            placeholder="Notizen"
            value={newTermin.notes}
            onChange={(e) => setNewTermin({ ...newTermin, notes: e.target.value })}
            className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* Termine List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Keine anstehenden Termine
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, termineForDate]) => (
            <div key={date}>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Calendar size={14} />
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              <div className="space-y-2">
                {termineForDate.map((termin) => (
                  <div
                    key={termin.id}
                    className={`bg-gray-800 rounded-lg p-3 ${termin.done ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleDone(termin)}
                        className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                          termin.done
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {termin.done && <Check size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {termin.time && (
                            <span className="text-xs text-gray-400">{termin.time}</span>
                          )}
                          <span className={termin.done ? 'line-through text-gray-400' : ''}>
                            {termin.title}
                          </span>
                        </div>
                        {termin.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPin size={12} />
                            <span>{termin.location}</span>
                          </div>
                        )}
                        {termin.notes && (
                          <div className="text-xs text-gray-500 mt-1">{termin.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTermin(termin.id)}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
