import "../styles/Bracket.css";

let counter = 1;
const groupData = {
    A: [
        { team: "Cyber Wolves", points: 6 },
        { team: "Rocket Kings", points: 3 },
        { team: "Shadow Hounds", points: 0 },
        { team: "Phantom Squad", points: 0 },
    ],
    B: [
        { team: "Dark Phoenix", points: 4 },
        { team: "Pixel Raiders", points: 4 },
        { team: "Code Crushers", points: 1 },
        { team: "Byte Breakers", points: 0 },
    ],
    C: [
        { team: "Turbo Titans", points: 5 },
        { team: "Neon Strikers", points: 3 },
        { team: "Binary Brawlers", points: 1 },
        { team: "Digital Fury", points: 0 },
    ],
    D: [
        { team: "Quantum Ninjas", points: 6 },
        { team: "AI Annihilators", points: 2 },
        { team: "Data Demons", points: 1 },
        { team: "Glitch Mob", points: 0 },
    ],
};

const quarterfinals = [
    { teamA: "Cyber Wolves", teamB: "Pixel Raiders", score: "2 : 0" },
    { teamA: "Rocket Kings", teamB: "Dark Phoenix", score: "1 : 2" },
    { teamA: "Turbo Titans", teamB: "AI Annihilators", score: "2 : 1" },
    { teamA: "Neon Strikers", teamB: "Quantum Ninjas", score: "0 : 2" },
];

const semifinals = [
    { teamA: "Cyber Wolves", teamB: "Dark Phoenix", score: "2 : 1" },
    { teamA: "Turbo Titans", teamB: "Quantum Ninjas", score: "– : –" },
];

const final = {
    teamA: "Cyber Wolves",
    teamB: "???",
    score: "– : –",
};

function TournamentBracket() {
    return (
        <section className="bracket-page">
            <h2 className="schedule-title">Faza Grupowa</h2>
            <div className="groups-container">
                {Object.entries(groupData).map(([groupName, teams]) => (
                    <div className="group-card" key={groupName}>
                        <h3>Grupa {groupName}</h3>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Zespół</th>
                                    <th>Punkty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, idx) => (
                                    <tr key={idx} className={idx < 2 ? "qualified" : ""}>
                                        <td>{idx + 1}</td>
                                        <td className="team-cell">
                                            <img
                                                // src={`/teams/${team.team.toLowerCase().replaceAll(" ", "")}.png`}
                                                src={`/teams/team${counter + idx}.png`}
                                                alt={team.team}
                                            />
                                            <span>{team.team}</span>
                                        </td>
                                        <td>{team.points}</td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                ))}
            </div>

            <h2 className="schedule-title">Faza Pucharowa</h2>
            <div className="bracket-wrapper">

                {/* Ćwierćfinały */}
                <div className="round quarter">
                    <h3 className="round-title">Ćwierćfinały</h3>
                    {quarterfinals.map((match, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img
                                    src={`/teams/team${counter + i}.png`}
                                    alt={match.teamB}
                                    className="team-logo"
                                />
                                {match.teamA}
                            </div>
                            <div className="score">{match.score}</div>
                            <div className="team">
                                <img
                                    src={`/teams/team${counter + i}.png`}
                                    alt={match.teamB}
                                    className="team-logo"
                                />
                                {match.teamB}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Półfinały */}
                <div className="round semi">
                    <h3 className="round-title">Półfinały</h3>
                    {semifinals.map((match, i) => (
                        <div className="match" key={i}>
                            <div className="team">
                                <img
                                    src={`/teams/team${counter + i}.png`}
                                    alt={match.teamA}
                                    className="team-logo"
                                />
                                {match.teamA}
                            </div>
                            <div className="score">{match.score}</div>
                            <div className="team">
                                <img
                                    src={`/teams/team${counter + i}.png`}
                                    alt={match.teamB}
                                    className="team-logo"
                                />
                                {match.teamB}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Finał */}
                <div className="round final">
                    <h3 className="round-title">Finał</h3>
                    <div className="match">
                        <div className="team">
                            <img
                                src={`/teams/team${counter + 4}.png`}
                                alt={final.teamA}
                                className="team-logo"
                            />
                            {final.teamA}
                        </div>
                        <div className="score">{final.score}</div>
                        <div className="team">{final.teamB}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TournamentBracket;
