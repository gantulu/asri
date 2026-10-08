import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(phone, password);
      navigate("/profile/user", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="standalone-page">
      <div className="page-card">
        <h1>Login</h1>
        <p className="page-muted">Masuk dengan phone dan password.</p>

        <form onSubmit={submit} className="auth-form">
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
              autoComplete="current-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="page-muted">
          Belum punya akun? <Link to="/profile/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
