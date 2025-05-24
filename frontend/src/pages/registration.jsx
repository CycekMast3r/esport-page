import { useState } from "react";
import axios from "axios";

function Registration() {
    const [name, setName] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post("http://localhost:5000/api/register", {
            name: name,
        });
        alert(response.data.message);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Imię gracza:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit">Zarejestruj</button>
        </form>
    );
}

export default Registration;
