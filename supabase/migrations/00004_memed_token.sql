-- 1. Adicionar coluna memed_token na tabela de médicos
alter table public.doctors add column if not exists memed_token text;
