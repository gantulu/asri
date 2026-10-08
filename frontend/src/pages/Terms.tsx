import { siteConfig } from "../config/site";

export default function Terms() {
  return (
    <section className="info-page">
      <h1>Syarat & Ketentuan</h1>
      <p>
        Dengan menggunakan website {siteConfig.name}, pelanggan dianggap telah
        membaca dan memahami ketentuan penggunaan toko.
      </p>
      <h2>Produk dan harga</h2>
      <p>
        Informasi produk, harga, varian, dan ketersediaan harus ditampilkan
        secara akurat. Harga transaksi menggunakan {siteConfig.currencyLabel}.
      </p>
      <h2>Pemesanan dan pembayaran</h2>
      <p>
        Pesanan terbentuk melalui proses checkout. Pembayaran diproses melalui
        kanal yang tersedia pada Duitku dan status pembayaran ditentukan oleh
        backend toko.
      </p>
      <h2>Informasi pelanggan</h2>
      <p>
        Pelanggan bertanggung jawab memberikan informasi yang benar untuk
        kebutuhan pemesanan, pembayaran, dan pengiriman.
      </p>
      <h2>Perubahan ketentuan</h2>
      <p>
        Ketentuan dapat diperbarui apabila terdapat perubahan layanan atau
        kebijakan usaha. Versi yang berlaku akan ditampilkan pada halaman ini.
      </p>
    </section>
  );
}
