import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Home from "../pages/Home";
import Clothes from "../pages/Clothes";
import Bag from "../pages/Bag";
import Shoes from "../pages/Shoes";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import User from "../pages/User";
import { useUserStore } from "../stores/userStore";

function Placeholder({ title }: { title: string }) {
  return (
    <section className="p-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Feature requires a verified backend contract.
      </p>
    </section>
  );
}

export default function App() {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="app-root">
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/clothes" element={<Clothes />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/shoes" element={<Shoes />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/profile/login" element={<Login />} />
        <Route path="/profile/register" element={<Register />} />
        <Route path="/profile/user" element={<User />} />
        <Route path="/product/:productId" element={<Placeholder title="Product Detail" />} />
        <Route path="/checkout" element={<Placeholder title="Checkout" />} />
        <Route path="/tracking/:orderId" element={<Placeholder title="Tracking" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
