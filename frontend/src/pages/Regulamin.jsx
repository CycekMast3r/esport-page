// src/pages/Regulamin.jsx

import React from 'react';
import '../styles/regulamin.css';
function Regulamin() {
    return (
        <main className="rules-page">
            <div className="rules-container">
                <h1>Regulamin Turnieju Łódź Rocket Masters 2025</h1>

                <h2>§1. Postanowienia Ogólne</h2>
                <ol>
                    <li>Organizatorem turnieju jest "Organizator Turnieju Łódź Rocket Masters 2025".</li>
                    <li>Gra turniejowa: Rocket League.</li>
                    <li>Platforma: PC (Steam/Epic), PlayStation, Xbox, Nintendo Switch (Cross-Platform Play włączone).</li>
                    <li>Termin turnieju: 14.06.2025 – 21.06.2025.</li>
                    <li>Celem regulaminu jest zapewnienie sprawiedliwego i sportowego przebiegu rozgrywek.</li>
                    <li>Każdy uczestnik, rejestrując się do turnieju, akceptuje postanowienia niniejszego regulaminu.</li>
                </ol>

                <h2>§2. Rejestracja i Uczestnictwo</h2>
                <ol>
                    <li>W turnieju biorą udział drużyny składające się z 3 (trzech) graczy głównych oraz opcjonalnie 1 (jednego) gracza rezerwowego.</li>
                    <li>Wszyscy gracze muszą mieć ukończone 16 lat najpóźniej w dniu rozpoczęcia turnieju.</li>
                    <li>Rejestracja jest otwarta do 13.06.2025, do godziny 23:59.</li>
                    <li>Nazwa oraz logo drużyny nie mogą zawierać treści wulgarnych, obraźliwych ani chronionych prawem autorskim osób trzecich.</li>
                    <li>Kapitan drużyny jest głównym punktem kontaktowym i jest odpowiedzialny za komunikację z organizatorami.</li>
                </ol>

                <h2>§3. Format Rozgrywek</h2>
                <ol>
                    <li>Tryb gry: Standard (Soccar), 3 na 3.</li>
                    <li>Arena: DFH Stadium (wszystkie mecze).</li>
                    <li>Region serwera: Europa (Europe).</li>
                    <li>System rozgrywek:
                        <ul>
                            <li>Faza Grupowa: "Best of 3" (do dwóch wygranych).</li>
                            <li>Faza Pucharowa (Play-off): "Best of 5" (do trzech wygranych).</li>
                        </ul>
                    </li>
                </ol>

                <h2>§4. Zasady Meczu</h2>
                <ol>
                    <li>Drużyny mają 15 minut spóźnienia na umówiony mecz. Po tym czasie drużyna nieobecna przegrywa mecz walkowerem.</li>
                    <li>Gospodarzem lobby meczowego jest drużyna wymieniona jako pierwsza w drabince. Nazwa i hasło do lobby zostaną podane przez administratora na serwerze Discord turnieju.</li>
                    <li>W przypadku rozłączenia gracza, mecz jest kontynuowany. Dozwolone jest jednorazowe użycie pauzy taktycznej (5 minut) na prośbę kapitana.</li>
                    <li>Wyniki meczów są zgłaszane przez kapitanów obu drużyn na wyznaczonym kanale Discord, wraz ze zrzutem ekranu z wynikiem końcowym.</li>
                </ol>

                <h2>§5. Kodeks Postępowania</h2>
                <ol>
                    <li>Zabronione jest używanie jakichkolwiek cheatów, hacków, skryptów oraz wykorzystywanie błędów gry.</li>
                    <li>Obowiązuje zasada "zero tolerancji" dla toksyczności, mowy nienawiści, rasizmu i wszelkich form niesportowego zachowania.</li>
                    <li>Złamanie zasad Kodeksu Postępowania będzie karane ostrzeżeniem, przegraną walkowerem, a w skrajnych przypadkach dyskwalifikacją całej drużyny z turnieju.</li>
                </ol>

                <h2>§6. Postanowienia Końcowe</h2>
                <ol>
                    <li>Organizator zastrzega sobie prawo do zmiany regulaminu w dowolnym momencie.</li>
                    <li>Decyzje administratorów turnieju są ostateczne i niepodważalne.</li>
                    <li>Wszelkie pytania należy kierować do organizatorów poprzez oficjalny serwer Discord turnieju lub na adres email: <strong>kontakt@rocketmasters.pl</strong>.</li>
                </ol>
            </div>
        </main>
    );
}

export default Regulamin;