import { siteConfig } from "../config/site";

export default function Contact() {
  return (
    <section className="info-page">
      <h1>Kontak</h1>
      <p>Hubungi {siteConfig.name} melalui informasi resmi berikut.</p>
      <div className="info-list">
        <p><strong>Telepon:</strong> {siteConfig.contact.phone}</p>
        <p><strong>Email:</strong> {siteConfig.contact.email}</p>
        <p><strong>Alamat:</strong> {siteConfig.contact.address}</p>
      </div>
      <p className="info-warning">
        Ganti semua nilai bertanda [LENGKAPI ...] dengan informasi usaha yang
        benar sebelum website dipublikasikan untuk verifikasi merchant.
      </p>
    </section>
  );
}
