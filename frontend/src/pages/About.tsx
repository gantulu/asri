import { siteConfig } from "../config/site";

export default function About() {
  return (
    <section className="info-page">
      <h1>Tentang {siteConfig.name}</h1>
      <p>{siteConfig.businessDescription}</p>
      <h2>Produk</h2>
      <p>
        Katalog Asri Collection mencakup kategori pakaian dan sepatu. Detail
        produk, harga, dan ketersediaan akan ditampilkan dari backend toko
        setelah kontrak API produk diverifikasi.
      </p>
      <h2>Informasi usaha</h2>
      <p>
        Informasi usaha dan kontak resmi harus tetap akurat dan diperbarui
        sebelum website digunakan untuk verifikasi merchant production.
      </p>
    </section>
  );
}
