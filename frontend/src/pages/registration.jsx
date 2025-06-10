import React, { useState } from 'react';
import { registerTeam } from '../api';
import { Link } from 'react-router-dom';
import '../styles/registration.css';
import Button from './Button';

function Registration() {
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState({ player1: '', player2: '', player3: '' });
    const [captainEmail, setCaptainEmail] = useState('');
    const [captainDob, setCaptainDob] = useState('');
    const [teamLogo, setTeamLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const todayString = new Date().toISOString().split('T')[0];

    const handlePlayerChange = (e, playerNumber) => {
        setPlayers({ ...players, [playerNumber]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTeamLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!teamName || !players.player1 || !players.player2 || !players.player3 || !captainEmail || !captainDob) {
            setError('Wszystkie pola tekstowe oraz data urodzenia są wymagane!');
            return;
        }

        const today = new Date();
        const birthDate = new Date(captainDob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 16) {
            setError('Kapitan musi mieć ukończone 16 lat.');
            return;
        }

        if (!teamLogo) {
            setError('Proszę dodać plik z logiem drużyny.');
            return;
        }

        if (!termsAccepted) {
            setError('Musisz zaakceptować regulamin turnieju.');
            return;
        }

        const formData = new FormData();
        formData.append('teamName', teamName);
        formData.append('player1', players.player1);
        formData.append('player2', players.player2);
        formData.append('player3', players.player3);
        formData.append('captainEmail', captainEmail);
        formData.append('dateOfBirth', captainDob);
        formData.append('logo', teamLogo);

        try {
            const response = await registerTeam(formData);
            setSuccessMessage(response.data.message || 'Drużyna została pomyślnie zarejestrowana!');

            setTeamName('');
            setPlayers({ player1: '', player2: '', player3: '' });
            setCaptainEmail('');
            setCaptainDob('');
            setTeamLogo(null);
            setLogoPreview(null);
            setTermsAccepted(false);
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji.');
        }
    };

    return (
        <main className="registration-page">
            <div className="registration-container">
                <h1>Zapisz się do turnieju</h1>
                <p>Wypełnij formularz, aby zgłosić swoją drużynę!</p>

                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-group">
                        <label htmlFor="team-name">Nazwa drużyny:</label>
                        <input type="text" id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                    </div>

                    <div className="form-group player-inputs">
                        <label>Nicki graczy:</label>
                        <input type="text" placeholder="Gracz 1" value={players.player1} onChange={(e) => handlePlayerChange(e, 'player1')} required />
                        <input type="text" placeholder="Gracz 2" value={players.player2} onChange={(e) => handlePlayerChange(e, 'player2')} required />
                        <input type="text" placeholder="Gracz 3" value={players.player3} onChange={(e) => handlePlayerChange(e, 'player3')} required />
                    </div>

                    <div className="form-group captain-fields">
                        <div>
                            <label htmlFor="captain-email">Email kontaktowy kapitana:</label>
                            <input type="email" id="captain-email" value={captainEmail} onChange={(e) => setCaptainEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="captain-dob">Data urodzenia kapitana:</label>
                            <input
                                type="date"
                                id="captain-dob"
                                value={captainDob}
                                onChange={(e) => setCaptainDob(e.target.value)}
                                required
                                max={todayString}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="team-logo">Logo drużyny (max 2MB, format .png):</label>
                        <input type="file" id="team-logo" accept="image/png" onChange={handleLogoChange} />
                        {logoPreview && (
                            <div className="logo-preview-wrapper">
                                <img src={logoPreview} alt="Podgląd logo" className="logo-preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-group terms-group">
                        <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
                        <label htmlFor="terms">
                            Wyrażam zgodę na <Link to="/regulamin" target="_blank" rel="noopener noreferrer">Regulamin Turnieju</Link>.
                        </label>
                    </div>

                    {error && <p className="message error-message">{error}</p>}
                    {successMessage && <p className="message success-message">{successMessage}</p>}

                    <Button type="submit" variant="neon">Zgłoś drużynę</Button>
                </form>
            </div>
        </main>
    );
}

export default Registration;