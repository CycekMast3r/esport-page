import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import { useEffect } from "react";
import "../styles/Header.css";
import Button from "./Button";

function Header({ isHome }) {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const getLinkClass = ({ isActive }) => isActive ? "nav-link active-link" : "nav-link";
    const isTurniejActive = ["/druzyny", "/wyniki", "/sponsorzy"].some(path =>
        location.pathname.startsWith(path)
    );

    const toggleMenu = () => setMenuOpen(prev => !prev);
    const closeMenu = () => setMenuOpen(false);

    const isHomePage = location.pathname === "/";

    return (
        <header className={`header ${isHome ? "transparent-header" : ""}`}>
            <nav className="nav-bar">
                <div className="nav-section left">
                    <Link to="/" className="logo">
                        <img src="/images/logo.png" alt="Logo" />
                    </Link>
                </div>

                <div className="hamburger-icon" onClick={toggleMenu}>
                    <div className={`bar ${menuOpen ? "open" : ""}`}></div>
                    <div className={`bar ${menuOpen ? "open" : ""}`}></div>
                    <div className={`bar ${menuOpen ? "open" : ""}`}></div>
                </div>

                <div className="nav-section center desktop-menu">
                    <NavLink to="/" className={getLinkClass} end>Strona Główna</NavLink>

                    <div className="dropdown">
                        <a className={`nav-link ${isTurniejActive ? "active-link" : ""}`}>Turniej ▾</a>
                        <div className="dropdown-content">
                            <NavLink to="/druzyny" className={getLinkClass}>Drużyny</NavLink>
                            <HashLink smooth to="/wyniki#schedule" className={`nav-link ${location.pathname === "/wyniki" && location.hash === "#schedule" ? "active-link" : ""}`}>Harmonogram</HashLink>
                            <HashLink smooth to="/wyniki#bracket" className={`nav-link ${location.pathname === "/wyniki" && location.hash === "#bracket" ? "active-link" : ""}`}>Drabinka</HashLink>
                            <NavLink to="/sponsorzy" className={getLinkClass}>Sponsorzy</NavLink>
                        </div>
                    </div>

                    <NavLink to="/stream" className={getLinkClass}>Transmisje</NavLink>
                    <NavLink to="/kontakt" className={getLinkClass}>Kontakt</NavLink>
                </div>

                <div className="nav-section right desktop-menu">
                    <Link to="/rejestracja">
                        <Button variant="neon">Zapisz się</Button>
                    </Link>
                </div>
            </nav>

            {menuOpen && (
                <>
                    <div className="menu-backdrop" onClick={closeMenu}></div>

                    <div className={`mobile-menu ${isHomePage ? 'glass' : ''}`}>
                        <NavLink to="/" onClick={closeMenu} className={getLinkClass} end>Strona Główna</NavLink>
                        <NavLink to="/druzyny" onClick={closeMenu} className={getLinkClass}>Drużyny</NavLink>
                        <HashLink smooth to="/wyniki#schedule" onClick={closeMenu} className={`nav-link ${location.pathname === "/wyniki" && location.hash === "#schedule" ? "active-link" : ""}`}>Harmonogram</HashLink>
                        <HashLink smooth to="/wyniki#bracket" onClick={closeMenu} className={`nav-link ${location.pathname === "/wyniki" && location.hash === "#bracket" ? "active-link" : ""}`}>Drabinka</HashLink>
                        <NavLink to="/sponsorzy" onClick={closeMenu} className={getLinkClass}>Sponsorzy</NavLink>
                        <NavLink to="/stream" onClick={closeMenu} className={getLinkClass}>Transmisje</NavLink>
                        <NavLink to="/kontakt" onClick={closeMenu} className={getLinkClass}>Kontakt</NavLink>
                        <Link to="/rejestracja" onClick={closeMenu}>
                            <Button variant="neon">Zapisz się</Button>
                        </Link>
                    </div>
                </>
            )}
        </header>
    );
}

export default Header;
