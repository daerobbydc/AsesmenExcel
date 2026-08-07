import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-excel-green to-excel-darkgreen text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Placement Test Microsoft Excel
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto">
            Tentukan level kemampuan Excel Anda melalui tes interaktif.
            Kerjakan langsung di browser tanpa perlu download file.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-excel-green hover:bg-green-50 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              Mulai Placement Test
            </Link>
            <Link
              href="/login"
              className="border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa Placement Test?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-excel-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interaktif di Browser</h3>
              <p className="text-gray-600">
                Kerjakan soal langsung di spreadsheet web.
                Tidak perlu download atau upload file Excel.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-excel-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Penilaian Otomatis</h3>
              <p className="text-gray-600">
                Sistem menilai jawaban secara real-time.
                Skor dihitung per section Basic dan Intermediate.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-excel-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hasil Instan</h3>
              <p className="text-gray-600">
                Lihat level Anda (Basic/Intermediate) segera setelah tes selesai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Daftar Akun", desc: "Buat akun gratis untuk mengakses placement test" },
              { step: 2, title: "Mulai Tes", desc: "Klik tombol mulai dan timer akan berjalan" },
              { step: 3, title: "Kerjakan Soal", desc: "Isi sel hijau dengan rumus Excel yang benar" },
              { step: 4, title: "Lihat Hasil", desc: "Sistem tentukan level Anda (Basic/Intermediate)" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-excel-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Topik Yang Diuji</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic */}
            <div className="card border-2 border-excel-green">
              <div className="flex items-center justify-between mb-4">
                <span className="badge-green text-sm">Basic</span>
                <span className="text-sm text-gray-500">10 Soal</span>
              </div>
              <h3 className="text-xl font-bold text-excel-green mb-3">Level Basic</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-excel-green mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fungsi SUM, AVERAGE, COUNT
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-excel-green mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fungsi MIN, MAX
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-excel-green mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Operasi Dasar Sel
                </li>
              </ul>
            </div>

            {/* Intermediate */}
            <div className="card border-2 border-primary-500">
              <div className="flex items-center justify-between mb-4">
                <span className="badge-blue text-sm">Intermediate</span>
                <span className="text-sm text-gray-500">10 Soal</span>
              </div>
              <h3 className="text-xl font-bold text-primary-600 mb-3">Level Intermediate</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SUMIF & COUNTIF
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Fungsi Lanjutan
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Kategori & Filtering Data
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
