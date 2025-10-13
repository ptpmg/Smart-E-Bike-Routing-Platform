CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','admin')) DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- routes
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  distance_m integer,
  elevation_gain_m integer,
  difficulty text NOT NULL CHECK (difficulty IN ('easy','moderate','hard')) DEFAULT 'moderate',
  visibility text NOT NULL CHECK (visibility IN ('private','unlisted','public')) DEFAULT 'private',
  is_loop boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- route_points
CREATE TABLE IF NOT EXISTS route_points (
  id bigserial PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  seq int NOT NULL,
  lat double precision NOT NULL,
  lon double precision NOT NULL,
  elevation_m double precision,
  ts timestamptz,
  UNIQUE(route_id, seq)
);


CREATE TABLE IF NOT EXISTS attachments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id   uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  filename   text NOT NULL,
  url        text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- likes: “gosto” em rotas
CREATE TABLE IF NOT EXISTS likes (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id   uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);

-- favorites: rotas favoritas
CREATE TABLE IF NOT EXISTS favorites (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id   uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);

-- rides: atividades realizadas (mínimo)
CREATE TABLE IF NOT EXISTS rides (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id     uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  started_at   timestamptz NOT NULL DEFAULT now(),
  duration_sec integer,
  distance_m   integer
);

-- índices úteis
CREATE INDEX IF NOT EXISTS idx_attachments_route ON attachments(route_id);
CREATE INDEX IF NOT EXISTS idx_likes_route ON likes(route_id);
CREATE INDEX IF NOT EXISTS idx_favorites_route ON favorites(route_id);
CREATE INDEX IF NOT EXISTS idx_rides_user ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_route ON rides(route_id);