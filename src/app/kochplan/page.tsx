'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react';
import type { Rezept, Mahlzeit } from '@/lib/types';

interface MahlzeitWithRezept extends Mahlzeit {
  rezept?: Rezept;
}

interface KochplanData {
  week: string;
  dates: string[];
  mahlzeiten: MahlzeitWithRezept[];
  totalPortionen: number;
  zielPortionen: number;
}

const MEAL_TYPES = [
  { key: 'fruehstueck', label: 'Frühstück' },
  { key: 'mittag', label: 'Mittag' },
  { key: 'abend', label: 'Abend' },
];

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function KochplanPage() {
  const [data, setData] = useState<KochplanData | null>(null);
  const [rezepte, setRezepte] = useState<Rezept[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [showMealForm, setShowMealForm] = useState<{ date: string; typ: string } | null>(null);
  const [selectedRezept, setSelectedRezept] = useState<number | null>(null);
  const [customBeschreibung, setCustomBeschreibung] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
    fetchRezepte();
  }, [currentWeek]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/kochplan?week=${currentWeek}`);
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch kochplan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRezepte = async () => {
    try {
      const res = await fetch('/api/rezepte');
      const data = await res.json();
      setRezepte(data);
    } catch (error) {
      console.error('Failed to fetch rezepte:', error);
    }
  };

  const addMeal = async () => {
    if (!showMealForm) return;
    if (!selectedRezept && !customBeschreibung) return;

    try {
      await fetch('/api/kochplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: showMealForm.date,
          typ: showMealForm.typ,
          rezept_id: selectedRezept || null,
          beschreibung: customBeschreibung || null,
        }),
      });

      setShowMealForm(null);
      setSelectedRezept(null);
      setCustomBeschreibung('');
      fetchData();
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  };

  const deleteMeal = async (id: number) => {
    try {
      await fetch(`/api/kochplan?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const generateShoppingList = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/kochplan/zutatenliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: currentWeek }),
      });
      const result = await res.json();
      alert(`${result.added} Zutaten zur Einkaufsliste hinzugefügt!`);
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getMealForSlot = (date: string, typ: string) => {
    return data?.mahlzeiten.find(m => m.date === date && m.typ === typ);
  };

  const navigateWeek = (direction: number) => {
    const [year, week] = currentWeek.split('-W').map(Number);
    let newWeek = week + direction;
    let newYear = year;

    if (newWeek < 1) {
      newYear--;
      newWeek = 52;
    } else if (newWeek > 52) {
      newYear++;
      newWeek = 1;
    }

    setCurrentWeek(`${newYear}-W${newWeek.toString().padStart(2, '0')}`);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
          <span>Dashboard</span>
        </Link>
        <button
          onClick={generateShoppingList}
          disabled={generating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
        >
          <ShoppingCart size={16} />
          {generating ? 'Wird erstellt...' : 'Einkaufsliste'}
        </button>
      </div>

      {/* Title & Week Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl font-bold mb-4">Kochplan</h1>

        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="font-medium">KW {currentWeek.split('-W')[1]}</div>
            {data && (
              <div className="text-sm text-gray-400">
                {formatDate(data.dates[0])} - {formatDate(data.dates[6])}
              </div>
            )}
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Portions Progress */}
        {data && (
          <div className="mt-4 bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Portionen diese Woche</span>
              <span className={data.totalPortionen >= data.zielPortionen ? 'text-green-400' : 'text-yellow-400'}>
                {data.totalPortionen} / {data.zielPortionen}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  data.totalPortionen >= data.zielPortionen ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min((data.totalPortionen / data.zielPortionen) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Week Grid */}
      {data && (
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="bg-gray-800 rounded p-2 text-sm text-gray-400"></div>
              {data.dates.map((date, i) => (
                <div key={date} className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-sm font-medium">{DAYS[i]}</div>
                  <div className="text-xs text-gray-400">{formatDate(date)}</div>
                </div>
              ))}
            </div>

            {/* Meal Rows */}
            {MEAL_TYPES.map(mealType => (
              <div key={mealType.key} className="grid grid-cols-8 gap-1 mb-1">
                <div className="bg-gray-800 rounded p-2 text-sm text-gray-400 flex items-center">
                  {mealType.label}
                </div>
                {data.dates.map(date => {
                  const meal = getMealForSlot(date, mealType.key);
                  return (
                    <div
                      key={`${date}-${mealType.key}`}
                      className="bg-gray-800 rounded p-2 min-h-[60px] relative group"
                    >
                      {meal ? (
                        <div className="text-xs">
                          <div className="font-medium truncate">
                            {meal.rezept?.name || meal.beschreibung}
                          </div>
                          {meal.rezept && (
                            <div className="text-gray-400 mt-1">
                              {meal.rezept.portionen}P
                            </div>
                          )}
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowMealForm({ date, typ: mealType.key })}
                          className="w-full h-full flex items-center justify-center text-gray-600 hover:text-gray-400 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Meal Modal */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <UtensilsCrossed size={20} />
              Mahlzeit hinzufügen
            </h3>

            <div className="text-sm text-gray-400 mb-4">
              {MEAL_TYPES.find(t => t.key === showMealForm.typ)?.label} am{' '}
              {formatDate(showMealForm.date)}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rezept auswählen</label>
                <select
                  value={selectedRezept || ''}
                  onChange={(e) => {
                    setSelectedRezept(e.target.value ? parseInt(e.target.value) : null);
                    if (e.target.value) setCustomBeschreibung('');
                  }}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="">-- Kein Rezept --</option>
                  {rezepte.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.portionen}P, {r.zubereitungszeit}min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center text-gray-500">oder</div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Freie Beschreibung</label>
                <input
                  type="text"
                  placeholder="z.B. Auswärts essen, Reste..."
                  value={customBeschreibung}
                  onChange={(e) => {
                    setCustomBeschreibung(e.target.value);
                    if (e.target.value) setSelectedRezept(null);
                  }}
                  className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowMealForm(null);
                  setSelectedRezept(null);
                  setCustomBeschreibung('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={addMeal}
                disabled={!selectedRezept && !customBeschreibung}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded disabled:opacity-50"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCurrentWeek(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
