import { siteConfig } from "../config/site";

export default function Payment() {
  return (
    <section className="info-page">
      <h1>Pembayaran</h1>
      <p>
        Pembayaran pesanan Asri Collection diproses melalui Duitku setelah
        backend payment contract siap digunakan.
      </p>
      <h2>Mata uang</h2>
      <p>Seluruh harga dan nominal transaksi toko menggunakan {siteConfig.currencyLabel}.</p>
      <h2>Metode pembayaran</h2>
      <p>
        Metode yang tersedia akan mengikuti payment method yang aktif pada
        project Duitku merchant. Jangan menampilkan metode yang belum
        dikonfirmasi aktif oleh backend.
      </p>
      <h2>Status pembayaran</h2>
      <p>
        Status pembayaran ditentukan oleh backend melalui callback/status
        Duitku, bukan oleh hasil redirect browser.
      </p>
    </section>
  );
}
