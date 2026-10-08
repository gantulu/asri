import { Link } from "react-router-dom";
import { siteConfig } from "../../config/site";

const links = [
  ["/about", "Tentang Kami"],
  ["/contact", "Kontak"],
  ["/payment", "Pembayaran"],
  ["/shipping", "Pengiriman"],
  ["/refund", "Pengembalian & Pembatalan"],
  ["/terms", "Syarat & Ketentuan"],
  ["/privacy", "Kebijakan Privasi"],
] as const;

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="site-footer-business">
        <strong>{siteConfig.name}</strong>
        <p>{siteConfig.businessDescription}</p>
        <p>Harga dan pembayaran menggunakan {siteConfig.currencyLabel}.</p>
      </section>

      <nav className="site-footer-links" aria-label="Informasi toko">
        {links.map(([to, label]) => (
          <Link key={to} to={to}>{label}</Link>
        ))}
      </nav>

      <section className="site-footer-contact">
        <strong>Kontak resmi</strong>
        <p>Telepon: {siteConfig.contact.phone}</p>
        <p>Email: {siteConfig.contact.email}</p>
        <p>Alamat: {siteConfig.contact.address}</p>
      </section>

      <small>© {new Date().getFullYear()} {siteConfig.name}. Semua hak dilindungi.</small>
    </footer>
  );
}
