import express from "express";
import cors from "cors";

import {
  Team,
  Match,
  generateRoundRobinSchedule,
  computeStandings,
  validateAndCreateMatchResult,
} from "@vtm/engine";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/**
 * In-memory tournament store (temporary)
 */
const tournaments = new Map<
  string,
  {
    teams: Team[];
    matches: Match[];
  }
>();

app.post("/tournaments", (req, res) => {
  const { name, teams, courts } = req.body;

  const tournamentId = crypto.randomUUID();

  const schedule = generateRoundRobinSchedule(teams, courts);
  const matches = schedule.flatMap((r) => r.matches);

  tournaments.set(tournamentId, {
    teams,
    matches,
  });

  res.json({
    tournamentId,
    matches,
  });
});

app.get("/tournaments/:id/standings", (req, res) => {
  const tournament = tournaments.get(req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  const standings = computeStandings(tournament.teams, tournament.matches);

  res.json(standings);
});

app.post("/tournaments/:id/matches/:matchId/result", (req, res) => {
  const tournament = tournaments.get(req.params.id);
  if (!tournament) {
    return res.status(404).json({ error: "Tournament not found" });
  }

  const match = tournament.matches.find((m) => m.id === req.params.matchId);

  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  try {
    const { sets } = req.body;

    if (!sets) {
      return res.status(400).json({ error: "Missing sets" });
    }

    match.result = validateAndCreateMatchResult(
      match.teamAId,
      match.teamBId,
      sets
    );

    res.json({ ok: true, result: match.result });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
