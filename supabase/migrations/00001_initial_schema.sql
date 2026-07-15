-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for User Roles
create type user_role as enum ('patient', 'doctor', 'admin');

-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role user_role not null default 'patient',
  full_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Patients Table
create table public.patients (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  cpf text unique,
  birth_date date,
  phone text,
  address text,
  emergency_contact text,
  -- LGPD: Consentimento de uso de dados
  data_processing_consent boolean default false not null,
  consent_date timestamp with time zone
);

-- 3. Doctors Table
create table public.doctors (
  id uuid references public.profiles(id) on delete cascade not null primary key,
  crm text unique not null,
  specialization text not null,
  bio text,
  consultation_fee numeric(10, 2),
  is_active boolean default true not null
);

-- 4. Appointments Table
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled');

create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status appointment_status default 'scheduled' not null,
  telemedicine_url text, -- Link para a sala de video
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Medical Records Table (Highly Sensitive - LGPD)
create table public.medical_records (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id) on delete set null,
  notes text not null, -- Anotações clínicas
  diagnosis text,
  attachments text[], -- URLs para exames armazenados no Storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) - LGPD Compliance
-- ==========================================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;

-- PROFILES: Users can read their own profile. Everyone can see doctors profiles.
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Doctors profiles are public" on public.profiles for select using (role = 'doctor');
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- PATIENTS: Only the patient or a doctor who has an appointment with them can view.
create policy "Patients can view own data" on public.patients for select using (auth.uid() = id);
create policy "Doctors can view their patients" on public.patients for select 
  using (exists (
    select 1 from public.appointments 
    where appointments.patient_id = patients.id 
    and appointments.doctor_id = auth.uid()
  ));

-- DOCTORS: Publicly viewable for booking.
create policy "Doctors are viewable by everyone" on public.doctors for select using (true);

-- APPOINTMENTS: Viewable by the involved patient and doctor.
create policy "Users view own appointments" on public.appointments for select
  using (auth.uid() = patient_id or auth.uid() = doctor_id);

create policy "Patients can insert appointments" on public.appointments for insert
  with check (auth.uid() = patient_id);
  
create policy "Doctors can update appointments" on public.appointments for update
  using (auth.uid() = doctor_id);

-- MEDICAL RECORDS: Strictly restricted. Patient can view own. Doctor can view/create for own appointments.
create policy "Patients can view own records" on public.medical_records for select
  using (auth.uid() = patient_id);
  
create policy "Doctors can view and create records for their patients" on public.medical_records for all
  using (auth.uid() = doctor_id);
