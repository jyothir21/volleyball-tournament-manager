import express from "express";
import cors from "cors";

import { Team, generateRoundRobinSchedule, TournamentState } from "@vtm/engine";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/**
 * In-memory tournament store (temporary)
 * Now stores TournamentState instead of raw data
 */
const tournaments = new Map<string, TournamentState>();

/**
 * Create a tournament
 */
app.post("/tournaments", (req, res) => {
  const { name, teams, courts } = req.body as {
    name: string;
    teams: Team[];
    courts: string[];
  };

  if (!teams || teams.length < 2) {
    return res.status(400).json({ error: "At least 2 teams are required" });
  }

  const tournamentId = crypto.randomUUID();

  const schedule = generateRoundRobinSchedule(teams, courts);
  const matches = schedule.flatMap((r) => r.matches);

  const state = new TournamentState({
    id: tournamentId,
    name,
    teams,
    matches,
  });

  tournaments.set(tournamentId, state);

  res.json({
    tournamentId,
    matches: state.getMatches(),
  });
});

/**
 * Get standings
 */
app.get("/tournaments/:id/standings", (req, res) => {
  const state = tournaments.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  res.json(state.getStandings());
});

/**
 * Submit match result
 * Server derives winner + validates sets
 */
app.post("/tournaments/:id/matches/:matchId/result", (req, res) => {
  const state = tournaments.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  try {
    const { sets } = req.body;

    if (!sets) {
      return res.status(400).json({ error: "Missing sets" });
    }

    state.submitMatchResult(req.params.matchId, sets);

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post("/tournaments/:id/matches/:matchId/lock", (req, res) => {
  const state = tournaments.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  try {
    state.lockMatch(req.params.matchId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

/**
 * (Optional) Health check
 */
app.get("/", (_req, res) => {
  res.send("Volleyball Tournament API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/tournaments/:id/playoffs", (req, res) => {
  const state = tournaments.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  try {
    const bracket = state.generatePlayoffs();
    res.json(bracket);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.get("/tournaments/:id/playoffs", (req, res) => {
  const state = tournaments.get(req.params.id);
  if (!state) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  const bracket = state.getPlayoffs();
  if (!bracket) {
    return res.status(404).json({ error: "Playoffs not generated" });
  }

  res.json(bracket);
});

