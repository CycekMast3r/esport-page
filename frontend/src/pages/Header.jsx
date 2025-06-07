// src/pages/Header.jsx

import { NavLink, Link } from "react-router-dom"; // Zmieniamy import, dodajemy NavLink
import { HashLink } from 'react-router-hash-link';
import "../styles/Header.css";
import Button from "./Button";

function Header({ isHome }) {
    // Funkcja, która doda klasę 'active-link' do aktywnego NavLinka
    const getLinkClass = ({ isActive }) => isActive ? "nav-link active-link" : "nav-link";

    return (
        <header className={`header ${isHome ? "transparent-header" : ""}`}>
            {/* Usunęliśmy header-overlay, bo efekt szkła go zastąpi */}
            <nav className="nav-bar">
                <div className="nav-section left">
                    <Link to="/" className="logo">
                        <img src="/images/logo.png" alt="Logo" />
                    </Link>
                </div>
                <div className="nav-section center">
                    {/* Zamieniamy Link na NavLink i używamy naszej funkcji dla 'className' */}
                    <NavLink to="/" className={getLinkClass} end>Strona Główna</NavLink>

                    <div className="dropdown">
                        <a className="nav-link">Turniej ▾</a>
                        <div className="dropdown-content">
                            <NavLink to="/druzyny" className={getLinkClass}>Drużyny</NavLink>
                            <HashLink smooth to="/wyniki#schedule" className="nav-link">Harmonogram</HashLink>
                            <HashLink smooth to="/wyniki#bracket" className="nav-link">Drabinka</HashLink>
                            <NavLink to="/sponsorzy" className={getLinkClass}>Sponsorzy</NavLink>
                        </div>
                    </div>

                    <NavLink to="/stream" className={getLinkClass}>Transmisje</NavLink>
                    <NavLink to="/kontakt" className={getLinkClass}>Kontakt</NavLink>
                </div>

                <div className="nav-section right">
                    <Link to="/rejestracja">
                        <Button variant="neon">Zapisz się</Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
}

export default Header;