import "../styles/Button.css";

function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
    icon = null, 
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variant} ${className}`}
        >
            {/* Jeśli ikona istnieje, wyświetl ją */}
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    );
}

export default Button;