-- 1. Tabela de Configurações da Clínica (Apenas 1 linha)
create table public.clinic_settings (
  id integer primary key default 1,
  clinic_name text not null default 'Clínica Evah',
  cnpj text default '00.000.000/0001-00',
  address text default 'Endereço da Sede, 123 - Cidade, UF',
  phone text default '(00) 0000-0000',
  email text default 'contato@evah.health',
  tech_responsible_name text default 'Dr. Administrador',
  tech_responsible_crm text default 'CRM/UF 000000',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Garantir que apenas uma linha exista (ID sempre 1)
alter table public.clinic_settings add constraint single_row check (id = 1);

-- Inserir dados padrão (Se ainda não existir)
insert into public.clinic_settings (id) values (1) on conflict (id) do nothing;

-- 2. Tabela de Histórico de Prescrições
create table public.prescriptions (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  doc_hash text not null unique,
  medications jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Configurações da Clínica (Todos podem ver, Admin pode alterar)
alter table public.clinic_settings enable row level security;
create policy "Anyone can view clinic settings" on public.clinic_settings for select using (true);

create policy "Admins can update clinic settings" on public.clinic_settings for update
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

create policy "Admins can insert clinic settings" on public.clinic_settings for insert
  with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- RLS: Prescrições (Pacientes vêem as suas, Médicos vêem e criam as suas)
alter table public.prescriptions enable row level security;

create policy "Patients can view own prescriptions" on public.prescriptions for select
  using (auth.uid() = patient_id);

create policy "Doctors can view own created prescriptions" on public.prescriptions for select
  using (auth.uid() = doctor_id);

create policy "Doctors can create prescriptions" on public.prescriptions for insert
  with check (auth.uid() = doctor_id);
