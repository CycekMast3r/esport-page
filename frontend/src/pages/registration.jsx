// src/pages/registration.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Registration.css'; // Importujemy dedykowany plik CSS
import Button from './Button'; // Importujemy Twój komponent Button

function Registration() {
    // Stany do przechowywania danych z formularza
    const [teamName, setTeamName] = useState('');
    const [teamMembers, setTeamMembers] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // Zapobiegamy domyślnemu przeładowaniu strony
        setError('');
        setSuccessMessage('');

        // Prosta walidacja
        if (!teamName || !teamMembers || !age) {
            setError('Wszystkie pola są wymagane!');
            return;
        }
        if (age < 16) {
            setError('Kapitan musi mieć co najmniej 16 lat.');
            return;
        }

        // Tworzymy obiekt z danymi do wysłania
        const formData = {
            teamName: teamName,
            members: teamMembers.split(',').map(member => member.trim()), // Dzielimy członków po przecinku
            captainAge: parseInt(age, 10),
        };

        // --- WYSYŁKA DANYCH DO BACKENDU ---
        try {
            // Używamy Twojego endpointu, ale wysyłamy nowy obiekt formData
            const response = await axios.post("http://localhost:5000/api/register", formData);
            setSuccessMessage(response.data.message || 'Drużyna została pomyślnie zarejestrowana!');
            
            // Czyszczenie formularza po sukcesie
            setTeamName('');
            setTeamMembers('');
            setAge('');

        } catch (err) {
            // Obsługa błędów z serwera
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
        }
    };

    return (
        <main className="registration-page">
            <div className="registration-container">
                <h1>Zapisz się do turnieju</h1>
                <p>Wypełnij formularz, aby zgłosić swoją drużynę do Łódź Rocket Masters!</p>
                
                <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-group">
                        <label htmlFor="team-name">Nazwa drużyny:</label>
                        <input
                            type="text"
                            id="team-name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="np. Cyber Sokoły"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="team-members">Członkowie drużyny (nicki, oddzielone przecinkiem):</label>
                        <input
                            type="text"
                            id="team-members"
                            value={teamMembers}
                            onChange={(e) => setTeamMembers(e.target.value)}
                            placeholder="np. Gracz1, Gracz2, Gracz3"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age">Wiek kapitana:</label>
                        <input
                            type="number"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Minimum 16 lat"
                            required
                            min="16"
                        />
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