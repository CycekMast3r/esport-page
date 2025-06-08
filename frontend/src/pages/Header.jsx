import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import "../styles/Header.css";
import Button from "./Button";

function Header({ isHome }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Efekt blokujący scrollowanie strony, gdy menu jest otwarte
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Funkcja czyszcząca, przywraca scrollowanie po opuszczeniu komponentu
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);

    const getLinkClass = ({ isActive }) => isActive ? "nav-link active-link" : "nav-link";

    // Zamyka oba menu po kliknięciu w jakikolwiek link
    const handleLinkClick = () => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    // Przełącza widoczność tylko podmenu "Turniej" w widoku mobilnym
    const toggleDropdown = (e) => {
        e.preventDefault();
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className={`header ${isHome ? "transparent-header" : ""}`}>
            {/* Nakładka renderowana warunkowo, gdy menu jest otwarte */}
            {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
            
            <nav className="nav-bar">
                <div className="nav-section left">
                    <Link to="/" className="logo" onClick={handleLinkClick}>
                        <img src="/images/logo.png" alt="Logo" />
                    </Link>
                </div>

                <div className={`nav-section center ${isMenuOpen ? "mobile-menu-open" : ""}`}>
                    <NavLink to="/" className={getLinkClass} onClick={handleLinkClick} end>Strona Główna</NavLink>

                    <div className={`dropdown ${isDropdownOpen ? "submenu-open" : ""}`}>
                        <a href="#" className="nav-link dropdown-toggle" onClick={toggleDropdown}>
                            <span>Turniej</span>
                            <span className="arrow">▾</span>
                        </a>
                        <div className="dropdown-content">
                            <NavLink to="/druzyny" className="nav-link" onClick={handleLinkClick}>Drużyny</NavLink>
                            <HashLink smooth to="/wyniki#schedule" className="nav-link" onClick={handleLinkClick}>Harmonogram</HashLink>
                            <HashLink smooth to="/wyniki#bracket" className="nav-link" onClick={handleLinkClick}>Drabinka</HashLink>
                            <NavLink to="/sponsorzy" className="nav-link" onClick={handleLinkClick}>Sponsorzy</NavLink>
                        </div>
                    </div>

                    <NavLink to="/stream" className={getLinkClass} onClick={handleLinkClick}>Transmisje</NavLink>
                    <NavLink to="/kontakt" className={getLinkClass} onClick={handleLinkClick}>Kontakt</NavLink>
                    
                    <Link to="/rejestracja" className="mobile-signup-btn" onClick={handleLinkClick}>
                        <Button variant="neon">Zapisz się</Button>
                    </Link>
                </div>

                <div className="nav-section right">
                    <Link to="/rejestracja" className="desktop-signup-btn">
                        <Button variant="neon">Zapisz się</Button>
                    </Link>
                    
                    <button
                        className={`burger-menu-button ${isMenuOpen ? "open" : ""}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Header;