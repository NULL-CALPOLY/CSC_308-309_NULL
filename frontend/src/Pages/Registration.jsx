import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";

export default function Registration() {
  const[name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const[dateOfBirth, setDateOfBirth] = useState("");
  const[gender, setGender] = useState("");
  const[interests, setInterests] = useState("");
  const[homeTown, setHomeTown] = useState("");
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
      const res = await fetch("http://localhost:3000/logins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      console.log(data);
      navigate('/');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className = "container">
    <div className="registration-container">
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Register</h2>

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

        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="phoneNumber"
          id="phoneNumber"
          autoComplete="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter your phone number(0000000000)"
          required
        />

        <label htmlFor="dateOfBirth">Date Of Birth:</label>
        <input 
          type="dateOfBirth"
          id="dateOfBirth"
          autoComplete="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          placeholder="Enter your date of birth(MMDDYYYY)"
          required
        />

        <label htmlFor="gender">Gender:</label>
        <input
          type="gender"
          id="gender"
          autoComplete="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Enter your gender"
          required
        />
        <label htmlFor="homeTown">Home Town:</label>
        <input
          type="homeTown"
          id="homeTown"
          autoComplete="homeTown"
          value={homeTown}
          onChange={(e) => setHomeTown(e.target.value)}
          placeholder="Enter your home town"
          required
        />
        <label htmlFor="interests">Interests:</label>
        <input
          type="interest"
          id="interest"
          autoComplete="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="Enter your Interests"
          required
        />/*Set a column in css to list interests figure out how to scroll for identifiable interests */

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

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

        <button type="submit" disabled={loading}>
          {loading ? "Registring..." : "Register"}
        </button>

        {errorMsg && (
          <p style={{ marginTop: "0.75rem", color: "#ff6b6b" }}>{errorMsg}</p>
        )}
      </form>
    </div>
   </div>
  );
}
