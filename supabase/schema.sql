CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  email text, name text, role text, avatar text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  module text NOT NULL, progress_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text, type text, content jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS evidence_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid, action text, details jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid, file_name text, file_type text,
  file_size numeric, module text, storage_path text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner profiles"  ON profiles        FOR ALL USING (auth.uid() = id);
CREATE POLICY "Owner progress"  ON user_progress   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner projects"  ON projects        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner evidence"  ON evidence_logs   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owner files"     ON uploaded_files  FOR ALL USING (auth.uid() = user_id);
