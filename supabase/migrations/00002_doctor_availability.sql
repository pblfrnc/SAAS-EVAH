-- Migration: Add availability to doctors table
ALTER TABLE public.doctors ADD COLUMN availability JSONB DEFAULT '{"days": [1,2,3,4,5], "start": "08:00", "end": "17:30"}';
