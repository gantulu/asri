export default function Shipping() {
  return (
    <section className="info-page">
      <h1>Pengiriman</h1>
      <p>
        Pesanan barang fisik akan diproses setelah pembayaran dan pesanan
        terkonfirmasi oleh sistem toko.
      </p>
      <h2>Proses pengiriman</h2>
      <p>
        Detail kurir, biaya pengiriman, estimasi waktu, dan nomor resi akan
        ditampilkan setelah kontrak order dan tracking backend tersedia.
      </p>
      <h2>Pelacakan</h2>
      <p>
        Nomor resi dan status pengiriman harus berasal dari backend toko.
        Jangan menganggap redirect pembayaran sebagai bukti pengiriman.
      </p>
    </section>
  );
}
