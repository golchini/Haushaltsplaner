'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Clock, Users, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { Rezept } from '@/lib/types';

const KATEGORIEN = [
  { key: '', label: 'Alle' },
  { key: 'iranisch', label: 'Iranisch' },
  { key: 'italienisch', label: 'Italienisch' },
  { key: 'japanisch', label: 'Japanisch' },
  { key: 'sonstiges', label: 'Sonstiges' },
];

export default function RezeptePage() {
  const [rezepte, setRezepte] = useState<Rezept[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetchRezepte();
  }, [filter, search]);

  const fetchRezepte = async () => {
    try {
      let url = '/api/rezepte';
      const params = new URLSearchParams();
      if (filter) params.set('kategorie', filter);
      if (search) params.set('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setRezepte(data);
    } catch (error) {
      console.error('Failed to fetch rezepte:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
          <span>Dashboard</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Rezepte</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rezept suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {KATEGORIEN.map(kat => (
          <button
            key={kat.key}
            onClick={() => setFilter(kat.key)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
              filter === kat.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {kat.label}
          </button>
        ))}
      </div>

      {/* Rezepte List */}
      {rezepte.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Keine Rezepte gefunden
        </div>
      ) : (
        <div className="space-y-3">
          {rezepte.map(rezept => (
            <div key={rezept.id} className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === rezept.id ? null : rezept.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div>
                  <div className="font-medium">{rezept.name}</div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {rezept.portionen}P
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {rezept.zubereitungszeit}min
                    </span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                      {rezept.kategorie}
                    </span>
                  </div>
                </div>
                {expanded === rezept.id ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {expanded === rezept.id && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Tags */}
                  {rezept.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {rezept.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Zutaten */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Zutaten</h4>
                    <ul className="space-y-1">
                      {rezept.zutaten.map((zutat, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span>
                            {zutat.menge} {zutat.einheit} {zutat.name}
                            {zutat.optional && (
                              <span className="text-gray-500 ml-1">(optional)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Anleitung */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Anleitung</h4>
                    <ol className="space-y-2">
                      {rezept.anleitung.map((schritt, i) => (
                        <li key={i} className="text-sm flex gap-3">
                          <span className="text-gray-500 flex-shrink-0">{i + 1}.</span>
                          <span>{schritt}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
