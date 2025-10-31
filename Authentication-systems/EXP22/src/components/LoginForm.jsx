import React, { useState } from "react";

const LoginForm = () => {
  // local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple validation
    if (!username || !password) {
      setMessage("⚠️ Please fill in both fields.");
      return;
    }

    // on success: log to console (or send to API)
    console.log("Username:", username);
    console.log("Password:", password);

    setMessage(`✅ Login submitted for ${username}`);
    // optionally clear fields:
    // setUsername("");
    // setPassword("");
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label} htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setMessage(""); // clear message while typing
          }}
          style={styles.input}
          placeholder="Enter username"
        />

        <label style={styles.label} htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setMessage("");
          }}
          style={styles.input}
          placeholder="Enter password"
        />

        <button type="submit" style={styles.button}>Login</button>
      </form>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: { width: 320, margin: "40px auto", padding: 16, border: "1px solid #ddd", borderRadius: 8 },
  form: { display: "flex", flexDirection: "column" },
  label: { marginTop: 8, marginBottom: 4, textAlign: "left" },
  input: { padding: 8, borderRadius: 4, border: "1px solid #ccc" },
  button: { marginTop: 16, padding: 10, borderRadius: 4, cursor: "pointer" },
  message: { marginTop: 12 },
};

export default LoginForm;
