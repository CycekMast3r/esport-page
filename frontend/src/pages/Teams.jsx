import { useState } from "react";
import "../styles/Teams.css";
import Button from "./Button";
import { Link } from "react-router-dom";

const teams = [
    {
        name: "Cyber Wolves",
        logo: "/teams/team1.png",
        captain: "ShadowFox",
        players: [
            { name: "ShadowFox", G: 12, A: 4, S: 3, MVP: 2 },
            { name: "Byte", G: 8, A: 6, S: 2, MVP: 1 },
            { name: "Nitro", G: 5, A: 3, S: 7, MVP: 0 }
        ]
    },
    {
        name: "Rocket Kings",
        logo: "/teams/team2.png",
        captain: "Blaze",
        players: [
            { name: "Blaze", G: 10, A: 5, S: 2, MVP: 2 },
            { name: "Jet", G: 7, A: 2, S: 5, MVP: 1 },
            { name: "Flash", G: 6, A: 4, S: 4, MVP: 1 }
        ]
    },
    {
        name: "Pixel Raiders",
        logo: "/teams/team3.png",
        captain: "Bitman",
        players: [
            { name: "Bitman", G: 9, A: 6, S: 3, MVP: 2 },
            { name: "Zero", G: 6, A: 5, S: 1, MVP: 1 },
            { name: "Glitch", G: 4, A: 3, S: 6, MVP: 0 }
        ]
    },
    {
        name: "Dark Phoenix",
        logo: "/teams/team4.png",
        captain: "Inferno",
        players: [
            { name: "Inferno", G: 11, A: 4, S: 2, MVP: 3 },
            { name: "Ash", G: 7, A: 3, S: 5, MVP: 1 },
            { name: "Cinder", G: 5, A: 6, S: 3, MVP: 0 }
        ]
    },
    {
        name: "Turbo Titans",
        logo: "/teams/team5.png",
        captain: "Overboost",
        players: [
            { name: "Overboost", G: 13, A: 5, S: 1, MVP: 4 },
            { name: "Rev", G: 6, A: 3, S: 4, MVP: 0 },
            { name: "Torque", G: 4, A: 6, S: 2, MVP: 1 }
        ]
    },
    {
        name: "Neon Strikers",
        logo: "/teams/team6.png",
        captain: "Nova",
        players: [
            { name: "Nova", G: 8, A: 5, S: 2, MVP: 1 },
            { name: "Blip", G: 7, A: 3, S: 3, MVP: 1 },
            { name: "Zap", G: 5, A: 4, S: 5, MVP: 0 }
        ]
    },
    {
        name: "Ceramika Opoczno Esports",
        logo: "/teams/team7.png",
        captain: "Nova",
        players: [
            { name: "Pasha", G: 0, A: 0, S: 0, MVP: 0 },
            { name: "Snax", G: 0, A: 0, S: 0, MVP: 0 },
            { name: "Taz", G: 0, A: 0, S: 0, MVP: 0 }
        ]
    }
];

function TeamsPage() {
    const [flippedIndex, setFlippedIndex] = useState(null);

    const totalSlots = 16;
    const emptySlots = Array.from({ length: totalSlots - teams.length }, () => null);
    const allCards = [...teams, ...emptySlots];

    const toggleFlip = (index) => {
        setFlippedIndex(flippedIndex === index ? null : index);
    };

    return (
        <section className="teams-page">
            <h2 className="teams-title">Drużyny turniejowe</h2>
            <p className="teams-subtitle">Kliknij na kartę, aby zobaczyć skład drużyny</p>

            <div className="teams-grid">
                {allCards.map((team, index) => (
                    <div
                        key={index}
                        className={`flip-card ${flippedIndex === index ? "flipped" : ""}`}
                        onClick={() => team && toggleFlip(index)}
                    >
                        <div className="flip-inner">
                            {/* Front – drużyna */}
                            {team ? (
                                <div className="flip-front">
                                    <img src={team.logo} alt={team.name} className="team-logo" />
                                    <h3 className="team-name">{team.name}</h3>
                                </div>
                            ) : (
                                <div className="flip-front empty-card">
                                    <p className="empty-text">Wolne miejsce</p>
                                    <Link to="/rejestracja">
                                        <Button variant="primary">Zgłoś drużynę</Button>
                                    </Link>
                                </div>
                            )}

                            {/* Back – szczegóły tylko dla drużyn */}
                            {team ? (
                                <div className="flip-back">
                                    <p className="team-captain"><img src={team.logo} alt={team.name} className="team-logo" /></p>
                                    <table className="player-stats">
                                        <thead>
                                            <tr>
                                                <th>Zawodnik</th>
                                                <th>G</th>
                                                <th>A</th>
                                                <th>S</th>
                                                <th>MVP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {team.players.map((player, i) => (
                                                <tr key={i}>
                                                    <td>{player.name}</td>
                                                    <td>{player.G}</td>
                                                    <td>{player.A}</td>
                                                    <td>{player.S}</td>
                                                    <td>{player.MVP}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flip-back empty-card">
                                    <p className="empty-text">Czekamy na drużynę...</p>

                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TeamsPage;