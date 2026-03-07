CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE, name TEXT, points INTEGER DEFAULT 0,
  citizenship_level TEXT DEFAULT 'guest',
  passport_number TEXT UNIQUE DEFAULT 'ETH-' || LPAD(FLOOR(RANDOM()*99999)::TEXT,5,'0'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, service_name TEXT,
  date_from DATE, date_to DATE,
  status TEXT DEFAULT 'pending', amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);
