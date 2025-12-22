import { useState } from "react";
import { createTournament, submitMatchResult, getStandings } from "./api";

type Team = { id: string; name: string };
type Match = {
  id: string;
  teamAId: string;
  teamBId: string;
  status: string;
};

export default function App() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  async function handleCreateTournament() {
    const result = await createTournament({
      name: "Web Tournament",
      teams: [
        { id: "A", name: "Team A" },
        { id: "B", name: "Team B" },
        { id: "C", name: "Team C" },
      ],
      courts: ["Court 1"],
    });

    setTournamentId(result.tournamentId);
    setMatches(result.matches);
    setStandings([]);
  }

  async function handleSubmitResult(matchId: string) {
    if (!tournamentId) return;

    await submitMatchResult(tournamentId, matchId, [
      { teamA: 25, teamB: 20 },
      { teamA: 25, teamB: 18 },
    ]);

    const updatedStandings = await getStandings(tournamentId);
    setStandings(updatedStandings);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Volleyball Tournament Organizer</h1>

      <button onClick={handleCreateTournament}>Create Tournament</button>

      {tournamentId && (
        <>
          <h2>Matches</h2>
          <ul>
            {matches.map((m) => (
              <li key={m.id}>
                {m.teamAId} vs {m.teamBId} ({m.status})
                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => handleSubmitResult(m.id)}
                >
                  Submit Result
                </button>
              </li>
            ))}
          </ul>

          <h2>Standings</h2>
          <pre>{JSON.stringify(standings, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
