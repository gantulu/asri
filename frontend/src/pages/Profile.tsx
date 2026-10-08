import { Link } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

export default function Profile() {
  const status = useUserStore((state) => state.status);
  const user = useUserStore((state) => state.user);

  if (status === "UNKNOWN") {
    return <section className="p-4">Memuat profil...</section>;
  }

  if (status === "AUTHENTICATED" && user) {
    return (
      <section className="p-4">
        <h1 className="text-xl font-semibold">{user.name}</h1>
        <p className="mt-2 text-sm text-neutral-500">{user.phone}</p>
        <Link className="profile-link" to="/profile/user">
          Buka profil
        </Link>
      </section>
    );
  }

  return (
    <section className="p-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Login atau register untuk melanjutkan.
      </p>
      <div className="profile-actions">
        <Link className="profile-link" to="/profile/login">Login</Link>
        <Link className="profile-link" to="/profile/register">Register</Link>
      </div>
    </section>
  );
}
