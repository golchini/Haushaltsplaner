'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';

interface EinkaufsItem {
  id: number;
  name: string;
  menge: string | null;
  kategorie: string;
  done: boolean;
}

export default function Einkaufen() {
  const [items, setItems] = useState<EinkaufsItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newKategorie, setNewKategorie] = useState('sonstiges');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch('/api/einkaufsliste');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      await fetch('/api/einkaufsliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem, kategorie: newKategorie }),
      });
      setNewItem('');
      fetchItems();
    } catch (error) {
      console.error('Failed to add:', error);
    }
  }

  async function toggleItem(id: number, done: boolean) {
    try {
      await fetch('/api/einkaufsliste', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done: done ? 1 : 0 }),
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  }

  async function deleteItem(id: number) {
    try {
      await fetch(`/api/einkaufsliste?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  async function clearDone() {
    try {
      await fetch('/api/einkaufsliste?clearDone=true', { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Failed to clear:', error);
    }
  }

  const grouped = {
    dringend: items.filter(i => i.kategorie === 'dringend'),
    diese_woche: items.filter(i => i.kategorie === 'diese_woche'),
    sonstiges: items.filter(i => i.kategorie === 'sonstiges'),
  };

  const hasDone = items.some(i => i.done);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Einkaufsliste</h2>
        {hasDone && (
          <button onClick={clearDone} className="btn btn-secondary text-sm flex items-center gap-1">
            <X className="w-4 h-4" />
            Erledigte löschen
          </button>
        )}
      </div>

      {/* Add form */}
      <form onSubmit={addItem} className="card flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Neuer Artikel..."
          className="input flex-1"
        />
        <select
          value={newKategorie}
          onChange={(e) => setNewKategorie(e.target.value)}
          className="input w-36"
        >
          <option value="dringend">Dringend</option>
          <option value="diese_woche">Diese Woche</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        <button type="submit" className="btn btn-primary flex items-center gap-1">
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Dringend */}
      {grouped.dringend.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-700 mb-3">Dringend</h3>
          <ItemList items={grouped.dringend} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {/* Diese Woche */}
      {grouped.diese_woche.length > 0 && (
        <div className="card border-l-4 border-l-yellow-500">
          <h3 className="font-semibold text-yellow-700 mb-3">Diese Woche</h3>
          <ItemList items={grouped.diese_woche} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {/* Sonstiges */}
      {grouped.sonstiges.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Sonstiges</h3>
          <ItemList items={grouped.sonstiges} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {items.length === 0 && (
        <p className="text-center text-gray-400 py-8">Einkaufsliste ist leer</p>
      )}
    </div>
  );
}

function ItemList({
  items,
  onToggle,
  onDelete,
}: {
  items: EinkaufsItem[];
  onToggle: (id: number, done: boolean) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-2 rounded-lg ${
            item.done ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <button
            onClick={() => onToggle(item.id, !item.done)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              item.done
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {item.done && <Check className="w-4 h-4" />}
          </button>
          <span className={`flex-1 ${item.done ? 'line-through text-gray-400' : ''}`}>
            {item.name}
            {item.menge && <span className="text-gray-400 ml-1">({item.menge})</span>}
          </span>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
