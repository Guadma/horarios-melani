-- RLS endurecida: escritura requiere JWT con claim app_role='editor'
-- (emitido por Edge Function verify-pin tras validar el PIN).
-- Lectura queda pública.

drop policy if exists "Escritura pública MVP" on public.horarios;
drop policy if exists "Actualización pública MVP" on public.horarios;

create policy "Escritura con token" on public.horarios
  for insert
  with check (auth.jwt() ->> 'app_role' = 'editor');

create policy "Actualización con token" on public.horarios
  for update
  using (auth.jwt() ->> 'app_role' = 'editor')
  with check (auth.jwt() ->> 'app_role' = 'editor');
