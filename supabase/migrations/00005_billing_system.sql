-- Add payment columns to appointments
ALTER TABLE public.appointments 
ADD COLUMN payment_id text,
ADD COLUMN payment_status text default 'pending' not null;

-- Add consultation_fee to doctors
ALTER TABLE public.doctors
ADD COLUMN consultation_fee numeric(10, 2) default 150.00 not null;

-- Add split tracking table (for future platform fee)
create table public.payouts (
  id uuid default uuid_generate_v4() primary key,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  amount_total numeric(10, 2) not null,
  platform_fee numeric(10, 2) not null,
  doctor_amount numeric(10, 2) not null,
  status text default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for payouts
alter table public.payouts enable row level security;
create policy "Doctors can view their own payouts" on public.payouts
  for select using (doctor_id = auth.uid());
