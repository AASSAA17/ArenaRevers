-- Enable btree_gist extension if not already enabled
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add EXCLUDE constraint to prevent overlapping bookings for the same arena
-- This constraint ensures that no two bookings can have overlapping time ranges
-- for the same arena_id, preventing double bookings at the database level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'prevent_overlapping_bookings'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT prevent_overlapping_bookings
        EXCLUDE USING gist (
          arena_id WITH =,
          tstzrange(start_datetime, end_datetime) WITH &&
        )
        WHERE (status IN ('pending', 'confirmed', 'hold'));
    END IF;
END $$;

