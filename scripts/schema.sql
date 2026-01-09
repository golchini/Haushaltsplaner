-- SQL Schema for Haushaltsplaner

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    scheduled_time TIME,
    done BOOLEAN NOT NULL DEFAULT false,
    date DATE NOT NULL,
    category TEXT CHECK (category IN ('training', 'haushalt', 'arbeit', 'sozial', 'sonstiges')),
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Termine Table
CREATE TABLE termine (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    "time" TIME,
    location TEXT,
    notes TEXT,
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE termine ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON termine FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Rezepte Table
CREATE TABLE rezepte (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    kategorie TEXT CHECK (kategorie IN ('iranisch', 'italienisch', 'japanisch', 'sonstiges')),
    portionen INTEGER,
    zubereitungszeit INTEGER,
    zutaten JSONB,
    anleitung TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rezepte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON rezepte FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Gerichte Table
CREATE TABLE gerichte (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    rezept_id INTEGER REFERENCES rezepte(id),
    rezept_name TEXT,
    portionen INTEGER,
    woche TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE gerichte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON gerichte FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Mahlzeiten Table
CREATE TABLE mahlzeiten (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    typ TEXT CHECK (typ IN ('fruehstueck', 'mittag', 'abend')),
    beschreibung TEXT,
    rezept_id INTEGER REFERENCES rezepte(id),
    done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE mahlzeiten ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON mahlzeiten FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Einkaufsliste Table
CREATE TABLE einkaufsliste (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    menge TEXT,
    kategorie TEXT CHECK (kategorie IN ('dringend', 'diese_woche', 'sonstiges')),
    done BOOLEAN NOT NULL DEFAULT false,
    auto_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE einkaufsliste ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON einkaufsliste FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- Trainingsplaene Table
CREATE TABLE trainingsplaene (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT,
    tag TEXT CHECK (tag IN ('mo', 'di', 'mi', 'do', 'fr', 'sa', 'so')),
    uebungen JSONB
);
ALTER TABLE trainingsplaene ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for users based on user_id" ON trainingsplaene FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);