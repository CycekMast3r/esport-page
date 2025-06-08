import { useEffect, useState } from "react";
import "../styles/Teams.css";
import Button from "./Button";
import { Link } from "react-router-dom";

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [flippedIndex, setFlippedIndex] = useState(null);

    const totalSlots = 16;

    useEffect(() => {
        fetch("/uploads/teams.json")
            .then(res => res.json())
            .then(data => setTeams(data))
            .catch(() => console.error("Nie udało się pobrać drużyn."));
    }, []);

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
                        className={`flip-card ${flippedIndex === index ? "flipped" : ""} ${team ? "filled" : "empty"}`}
                        onClick={() => team && toggleFlip(index)}
                    >
                        <div className="flip-inner">
                            {team ? (
                                <>
                                    <div className="flip-front">
                                        <img src={`/uploads/${team.logo}`} alt={team.name} className="team-logo" />
                                        <h3 className="team-name">{team.name}</h3>
                                    </div>
                                    <div className="flip-back">
                                        <img src={`/uploads/${team.logo}`} alt={team.name} className="team-logo small" />
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
                                </>
                            ) : (
                                <>
                                    <div className="flip-front empty-card">
                                        <p className="empty-text">Wolne miejsce</p>
                                        <Link to="/rejestracja">
                                            <Button variant="primary">Zgłoś drużynę</Button>
                                        </Link>
                                    </div>
                                    <div className="flip-back empty-card">
                                        <p className="empty-text">Czekamy na drużynę...</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default TeamsPage;
