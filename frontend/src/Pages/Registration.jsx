import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SmallMapComponent from '../Components/SmallMapComponent.jsx'
import "./Registration.css";

export default function Registration() {
  const[name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const[dateOfBirth, setDateOfBirth] = useState("");
  const[gender, setGender] = useState("");
  const[interests, setInterests] = useState([]);
  const[city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber, gender, dateOfBirth, city, email, interests}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }

      const data = await res.json();
      console.log(data);
      navigate('/register');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="container">
  <div className="registration-container">
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>Register</h2>
      <div className="form-grid"> 
        <div className="form-field">
          <label htmlFor="name">Name:</label>
          <input
            type="name"
            id="name"
            autoComplete="username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="phoneNumber"
            id="phoneNumber"
            autoComplete="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="dateOfBirth">Date Of Birth:</label>
          <input 
            type="date"
            id="dateOfBirth"
            autoComplete="bday"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="gender">Gender:</label>
          <input
            type="text"
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Enter your gender"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter your city"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="interests">Interests:</label>
          <input
            type="text"
            id="interests"
            value={interests.join(", ")}
            onChange={(e) => setInterests(
            e.target.value.split(",").map((i) => i.trim())
            )}
            placeholder="Enter your interests"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      
      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {errorMsg && (
        <p style={{ marginTop: "0.75rem", color: "#ff6b6b" }}>{errorMsg}</p>
      )}
    </form>
    <div className="map-column">
        <SmallMapComponent />
    </div>
  </div>
</div>
);
}
