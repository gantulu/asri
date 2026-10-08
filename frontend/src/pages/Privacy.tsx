import { siteConfig } from "../config/site";

export default function Privacy() {
  return (
    <section className="info-page">
      <h1>Kebijakan Privasi</h1>
      <p>
        {siteConfig.name} menggunakan informasi pelanggan seperlunya untuk
        menyediakan layanan toko, pemesanan, pembayaran, dan pengiriman.
      </p>
      <h2>Data yang digunakan</h2>
      <p>
        Data akun yang digunakan oleh aplikasi saat ini mencakup nama, nomor
        telepon, dan kredensial sesuai kontrak autentikasi proyek.
      </p>
      <h2>Penggunaan data</h2>
      <p>
        Data digunakan untuk autentikasi, pengelolaan pesanan, komunikasi
        layanan, dan pemenuhan transaksi sesuai kebutuhan sistem.
      </p>
      <h2>Pihak ketiga</h2>
      <p>
        Pembayaran dapat melibatkan Duitku sebagai payment gateway. Data yang
        dikirim untuk transaksi harus dibatasi pada data yang diperlukan oleh
        kontrak pembayaran.
      </p>
      <h2>Kontak privasi</h2>
      <p>
        Pertanyaan mengenai privasi dapat disampaikan melalui kontak resmi
        yang tercantum pada halaman Kontak.
      </p>
    </section>
  );
}
