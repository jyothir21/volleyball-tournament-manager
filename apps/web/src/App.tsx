import { useState } from "react";
import {
  createTournament,
  submitMatchResult,
  getStandings,
  lockMatch,
  generatePlayoffs,
} from "./api";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  teamAId: string;
  teamBId: string;
  status: "scheduled" | "completed" | "locked";
};

export default function App() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([
    { id: "A", name: "Team A" },
    { id: "B", name: "Team B" },
    { id: "C", name: "Team C" },
  ]);
  const [scores, setScores] = useState<
    Record<string, { a: number; b: number }>
  >({});
  const [playoffs, setPlayoffs] = useState<any | null>(null);

  async function handleCreateTournament() {
    const result = await createTournament({
      name: "Web Tournament",
      teams,
      courts: ["Court 1"],
    });

    setTournamentId(result.tournamentId);
    setMatches(result.matches);
    setStandings([]);
  }

  async function handleSubmitResult(match: Match) {
    if (!tournamentId) return;

    const score = scores[match.id];
    if (!score) return;

    await submitMatchResult(tournamentId, match.id, [
      { teamA: score.a, teamB: score.b },
    ]);

    const updatedStandings = await getStandings(tournamentId);
    setStandings(updatedStandings);

    setMatches((prev) =>
      prev.map((m) => (m.id === match.id ? { ...m, status: "completed" } : m))
    );
  }

  function updateTeamName(id: string, name: string) {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }

  function updateScore(matchId: string, side: "a" | "b", value: number) {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value,
      },
    }));
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Volleyball Tournament Organizer</h1>

      <h2>Teams</h2>
      {teams.map((team) => (
        <div key={team.id}>
          <input
            value={team.name}
            onChange={(e) => updateTeamName(team.id, e.target.value)}
          />
        </div>
      ))}

      <button onClick={handleCreateTournament}>Create Tournament</button>

      {tournamentId && (
        <>
          <h2>Matches</h2>
          <ul>
            {matches.map((m) => (
              <li key={m.id}>
                <strong>
                  {m.teamAId} vs {m.teamBId}
                </strong>{" "}
                ({m.status})
                <div>
                  <input
                    type="number"
                    placeholder="Team A score"
                    disabled={m.status !== "scheduled"}
                    onChange={(e) =>
                      updateScore(m.id, "a", Number(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Team B score"
                    disabled={m.status !== "scheduled"}
                    onChange={(e) =>
                      updateScore(m.id, "b", Number(e.target.value))
                    }
                  />
                  <button
                    disabled={m.status !== "scheduled"}
                    onClick={() => handleSubmitResult(m)}
                  >
                    Submit Result
                  </button>

                  <button
                    disabled={m.status !== "completed"}
                    onClick={async () => {
                      if (!tournamentId) return;

                      await lockMatch(tournamentId, m.id);

                      setMatches((prev) =>
                        prev.map((x) =>
                          x.id === m.id ? { ...x, status: "locked" } : x
                        )
                      );
                    }}
                  >
                    Lock Match
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h2>Standings</h2>
          <table border={1} cellPadding={6}>
            <thead>
              <tr>
                <th>Team</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Sets Won</th>
                <th>Sets Lost</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.teamId}>
                  <td>{s.teamId}</td>
                  <td>{s.wins}</td>
                  <td>{s.losses}</td>
                  <td>{s.setsWon}</td>
                  <td>{s.setsLost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            disabled={!tournamentId}
            onClick={async () => {
              if (!tournamentId) return;
              const bracket = await generatePlayoffs(tournamentId);
              setPlayoffs(bracket);
            }}
          >
            Generate Playoffs
          </button>

          {playoffs && (
            <>
              <h2>Playoffs</h2>
              {playoffs.rounds.map((round: any) => (
                <div key={round.roundNumber}>
                  <h3>Round {round.roundNumber}</h3>
                  <ul>
                    {round.matches.map((m: any) => (
                      <li key={m.id}>
                        {m.teamAId} vs {m.teamBId}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
