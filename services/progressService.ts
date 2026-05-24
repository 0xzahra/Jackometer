import { supabase, isSupabaseConfigured } from "./supabaseClient";

export async function saveUserProgress(userId: string, module: string, data: any) {
  localStorage.setItem(`jacko_local_${module}`, JSON.stringify(data));
  if (!isSupabaseConfigured || !userId) return;
  try {
    const { error } = await supabase.from("user_progress").upsert(
      { user_id: userId, module, progress_data: data, updated_at: new Date().toISOString() },
      { onConflict: "user_id,module" }
    );
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase save failed, progress preserved locally:", err);
  }
}

export async function loadUserProgress(userId: string, module: string) {
  const local = localStorage.getItem(`jacko_local_${module}`);
  if (!isSupabaseConfigured || !userId) return local ? JSON.parse(local) : null;
  try {
    const { data, error } = await supabase
      .from("user_progress").select("progress_data")
      .eq("user_id", userId).eq("module", module).maybeSingle();
    if (error) throw error;
    return data ? data.progress_data : (local ? JSON.parse(local) : null);
  } catch { return local ? JSON.parse(local) : null; }
}

export async function saveProject(userId: string, project: any) {
  if (!isSupabaseConfigured || !userId) return;
  try { await supabase.from("projects").upsert({ ...project, user_id: userId }); }
  catch (err) { console.warn("Project save failed:", err); }
}

export async function loadProjects(userId: string) {
  if (!isSupabaseConfigured || !userId) return [];
  try {
    const { data } = await supabase.from("projects").select("*").eq("user_id", userId);
    return data || [];
  } catch { return []; }
}

export async function logEvidence(userId: string, action: string, details: any, projectId?: string) {
  if (!isSupabaseConfigured || !userId) return;
  try {
    await supabase.from("evidence_logs").insert({
      user_id: userId, action, details, project_id: projectId || null
    });
  } catch (err) { console.warn("Evidence log failed:", err); }
}

export async function saveUploadedFileMetadata(userId: string, fileInfo: any) {
  if (!isSupabaseConfigured || !userId) return;
  try { await supabase.from("uploaded_files").insert({ ...fileInfo, user_id: userId }); }
  catch (err) { console.warn("File metadata save failed:", err); }
}
