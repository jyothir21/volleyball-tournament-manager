import axios from "axios";

const API_BASE = "http://localhost:3000";

export async function createTournament(data: {
  name: string;
  teams: { id: string; name: string }[];
  courts: string[];
}) {
  const res = await axios.post(`${API_BASE}/tournaments`, data);
  return res.data;
}

export async function submitMatchResult(
  tournamentId: string,
  matchId: string,
  sets: { teamA: number; teamB: number }[]
) {
  await axios.post(
    `${API_BASE}/tournaments/${tournamentId}/matches/${matchId}/result`,
    { sets }
  );
}

export async function getStandings(tournamentId: string) {
  const res = await axios.get(
    `${API_BASE}/tournaments/${tournamentId}/standings`
  );
  return res.data;
}

export async function lockMatch(tournamentId: string, matchId: string) {
  await axios.post(
    `${API_BASE}/tournaments/${tournamentId}/matches/${matchId}/lock`
  );
}
