import "../styles/Button.css";

function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    className = "",
    disabled = false,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variant} ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;