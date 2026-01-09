'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Plus, Trash2, ChevronLeft, X } from 'lucide-react';

const HARDCODED_USER_ID = 'f2476673-e4d0-486f-b9b6-99923c3ba0b6';

interface EinkaufsItem {
  id: number;
  name: string;
  menge: string | null;
  kategorie: string;
  done: boolean;
  auto_generated: boolean;
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
      const res = await fetch('/api/einkaufsliste', {
        headers: { 'x-user-id': HARDCODED_USER_ID },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
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
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': HARDCODED_USER_ID,
        },
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
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': HARDCODED_USER_ID,
        },
        body: JSON.stringify({ id, done }),
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  }

  async function deleteItem(id: number) {
    try {
      await fetch(`/api/einkaufsliste?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': HARDCODED_USER_ID },
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  async function clearDone() {
    try {
      await fetch('/api/einkaufsliste?clearDone=true', {
        method: 'DELETE',
        headers: { 'x-user-id': HARDCODED_USER_ID },
      });
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neutral-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white">
          <ChevronLeft size={20} />
          <span>Zurück</span>
        </Link>
        {hasDone && (
          <button
            onClick={clearDone}
            className="flex items-center gap-1 text-neutral-400 hover:text-white text-sm"
          >
            <X size={16} />
            Erledigte löschen
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-6">Einkaufsliste</h1>

      {/* Add form */}
      <form onSubmit={addItem} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Neuer Artikel..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
        />
        <select
          value={newKategorie}
          onChange={(e) => setNewKategorie(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-white"
        >
          <option value="dringend">Dringend</option>
          <option value="diese_woche">Diese Woche</option>
          <option value="sonstiges">Sonstiges</option>
        </select>
        <button
          type="submit"
          className="bg-white text-black px-4 py-3 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* Dringend */}
      {grouped.dringend.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Dringend
          </h2>
          <ItemList items={grouped.dringend} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {/* Diese Woche */}
      {grouped.diese_woche.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Diese Woche
          </h2>
          <ItemList items={grouped.diese_woche} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {/* Sonstiges */}
      {grouped.sonstiges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Sonstiges
          </h2>
          <ItemList items={grouped.sonstiges} onToggle={toggleItem} onDelete={deleteItem} />
        </div>
      )}

      {items.length === 0 && (
        <p className="text-center text-neutral-500 py-12">Einkaufsliste ist leer</p>
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
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            item.done
              ? 'bg-neutral-900/50 border-neutral-800'
              : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          <button
            onClick={() => onToggle(item.id, !item.done)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.done
                ? 'bg-white border-white text-black'
                : 'border-neutral-600 hover:border-white'
            }`}
          >
            {item.done && <Check size={12} strokeWidth={3} />}
          </button>
          <span className={`flex-1 ${item.done ? 'line-through text-neutral-600' : 'text-white'}`}>
            {item.name}
            {item.menge && <span className="text-neutral-500 ml-2">({item.menge})</span>}
          </span>
          {item.auto_generated && (
            <span className="text-xs text-neutral-600">auto</span>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-neutral-600 hover:text-white p-1 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
