export default function Refund() {
  return (
    <section className="info-page">
      <h1>Pengembalian & Pembatalan</h1>
      <p>
        Ketentuan pengembalian, penukaran, dan pembatalan berlaku sesuai
        kebijakan toko yang ditampilkan kepada pelanggan sebelum checkout.
      </p>
      <h2>Pembatalan pesanan</h2>
      <p>
        Permintaan pembatalan diproses berdasarkan status order dan pembayaran.
        Status pembayaran tidak boleh diubah hanya berdasarkan navigasi atau
        redirect browser.
      </p>
      <h2>Pengembalian dana</h2>
      <p>
        Pengembalian dana hanya diproses melalui alur backend yang terverifikasi
        dan sesuai transaksi terkait. Detail SLA refund harus diisi sebelum
        production.
      </p>
      <p className="info-warning">
        Lengkapi aturan refund, penukaran, kondisi barang, biaya kirim balik,
        dan estimasi penyelesaian sesuai kebijakan usaha sebelum production.
      </p>
    </section>
  );
}
