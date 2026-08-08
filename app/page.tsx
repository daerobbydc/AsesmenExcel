import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-excel-green via-excel-darkgreen to-primary-800 text-white pt-32 pb-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-excel-light rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-white/90">Placement Test Online</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up tracking-tight">
            Placement Test
            <br />
            <span className="bg-gradient-to-r from-excel-light to-primary-300 bg-clip-text text-transparent">
              Microsoft Excel
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up text-balance leading-relaxed">
            Tentukan level kemampuan Excel Anda melalui tes interaktif.
            Kerjakan langsung di browser tanpa perlu download file.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              href="/register"
              className="bg-white text-excel-green hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-lg shadow-glass-lg hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              Mulai Placement Test
            </Link>
            <Link
              href="/login"
              className="border-2 border-white/30 hover:border-white/60 hover:bg-white/10 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="section-title mb-4">Kenapa Placement Test?</h2>
            <p className="section-subtitle">Solusi modern untuk mengukur kemampuan Excel Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.495V5.25" />
                ),
                title: "Interaktif di Browser",
                desc: "Kerjakan soal langsung di spreadsheet web. Tidak perlu download atau upload file Excel.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
                title: "Penilaian Otomatis",
                desc: "Sistem menilai jawaban secara real-time. Skor dihitung per section Basic dan Intermediate.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                ),
                title: "Hasil Instan",
                desc: "Lihat level Anda (Basic/Intermediate) segera setelah tes selesai dengan analisis detail.",
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group card text-center hover:scale-[1.02] hover:shadow-card-hover cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-excel-green/10 to-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Cara Kerja</h2>
            <p className="section-subtitle">4 langkah mudah mengetahui level Excel Anda</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Daftar Akun", desc: "Buat akun gratis untuk mengakses placement test" },
              { step: 2, title: "Mulai Tes", desc: "Klik tombol mulai dan timer akan berjalan" },
              { step: 3, title: "Kerjakan Soal", desc: "Isi sel hijau dengan rumus Excel yang benar" },
              { step: 4, title: "Lihat Hasil", desc: "Sistem tentukan level Anda (Basic/Intermediate)" },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-excel-green to-excel-darkgreen text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-excel-green/20 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-excel-green/30 to-transparent"></div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Topik Yang Diuji</h2>
            <p className="section-subtitle">Soal mencakup fungsi dasar hingga lanjutan</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic */}
            <div className="card-static border-2 border-excel-green/20 hover:border-excel-green/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-excel-green/5 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <span className="badge-green text-sm">Basic</span>
                  <span className="text-sm text-gray-400 font-medium">20 Soal (55 poin)</span>
                </div>
                <h3 className="text-xl font-bold text-excel-green mb-4">Level Basic</h3>
                <ul className="space-y-3">
                  {["Fungsi SUM, AVERAGE, COUNT", "Fungsi MIN, MAX", "Operasi Dasar Sel"].map((topic, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <div className="w-5 h-5 bg-excel-green/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-excel-green" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Intermediate */}
            <div className="card-static border-2 border-primary-500/20 hover:border-primary-500/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <span className="badge-blue text-sm">Intermediate</span>
                  <span className="text-sm text-gray-400 font-medium">15 Soal (45 poin)</span>
                </div>
                <h3 className="text-xl font-bold text-primary-600 mb-4">Level Intermediate</h3>
                <ul className="space-y-3">
                  {["SUMIF, COUNTIF, COUNTA", "VLOOKUP & HLOOKUP", "INDEX-MATCH & Operasi Lanjutan"].map((topic, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <div className="w-5 h-5 bg-primary-500/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-excel-green/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Siap Menguji Kemampuan Excel Anda?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">Mulai placement test sekarang dan temukan level Anda</p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-excel-green to-excel-light text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-excel-green/30 hover:shadow-xl hover:shadow-excel-green/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            Mulai Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
