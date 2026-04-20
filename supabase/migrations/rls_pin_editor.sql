-- RLS endurecida: escritura requiere JWT con claim app_role='editor'
-- (emitido por Edge Function verify-pin tras validar el PIN).
-- Lectura (public_read) queda pública.

drop policy if exists public_write on public.horarios;
drop policy if exists public_update on public.horarios;

create policy "write_with_editor_token" on public.horarios
  for insert
  with check (auth.jwt() ->> 'app_role' = 'editor');

create policy "update_with_editor_token" on public.horarios
  for update
  using (auth.jwt() ->> 'app_role' = 'editor')
  with check (auth.jwt() ->> 'app_role' = 'editor');
