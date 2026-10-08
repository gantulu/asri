import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function Register() {
  const navigate = useNavigate();
  const register = useUserStore((state) => state.register);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, phone, password);
      navigate("/profile/user", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="standalone-page">
      <div className="page-card">
        <h1>Register</h1>
        <p className="page-muted">Buat akun dengan name, phone, dan password.</p>

        <form onSubmit={submit} className="auth-form">
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>

          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Register"}
          </button>
        </form>

        <p className="page-muted">
          Sudah punya akun? <Link to="/profile/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
