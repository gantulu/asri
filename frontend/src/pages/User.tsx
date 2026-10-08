import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function User() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  if (!user) {
    return (
      <main className="standalone-page">
        <div className="page-card">
          <h1>Login required</h1>
          <Link to="/profile/login">Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="standalone-page">
      <div className="page-card">
        <h1>{user.name}</h1>
        <p className="page-muted">{user.phone}</p>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/profile", { replace: true });
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}
