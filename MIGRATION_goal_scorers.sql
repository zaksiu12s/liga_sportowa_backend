-- Migration: Add goal_scorers column to matches table
-- This adds support for tracking goal scorers with team, player, and time information

-- Add goal_scorers column if it doesn't exist
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS goal_scorers JSONB DEFAULT '{"goals": []}';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_goal_scorers ON matches USING GIN (goal_scorers);

-- Example of the goal_scorers structure:
-- {
--   "goals": [
--     {
--       "team_id": "550e8400-e29b-41d4-a716-446655440000",
--       "player_id": "660e8400-e29b-41d4-a716-446655440111",
--       "time": 23
--     },
--     {
--       "team_id": "770e8400-e29b-41d4-a716-446655440222",
--       "player_id": "880e8400-e29b-41d4-a716-446655440333",
--       "time": 67
--     }
--   ]
-- }
