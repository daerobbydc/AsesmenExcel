export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-excel-green/20 p-2 rounded-xl">
                <svg className="w-5 h-5 text-excel-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9.5,11V13H7.5V11H9.5M16.5,11V13H14.5V11H16.5M9.5,15V17H7.5V15H9.5M16.5,15V17H14.5V15H16.5Z" />
                </svg>
              </div>
              <span className="text-white font-semibold">Asesmen Excel</span>
            </div>
            <p className="text-sm leading-relaxed">
              Platform asesmen online untuk pelatihan Microsoft Excel
              dari level Basic hingga Intermediate.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Level Asesmen</h3>
            <ul className="text-sm space-y-2.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-excel-green rounded-full"></span>
                Basic - 20 Soal (55 poin)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                Intermediate - 15 Soal (45 poin)
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Topik</h3>
            <ul className="text-sm space-y-2.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                Fungsi Dasar Excel
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                SUMIF, COUNTIF, COUNTA
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                VLOOKUP, HLOOKUP
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                INDEX-MATCH
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Asesmen Excel. Dibuat untuk Pelatihan Excel.
          </p>
          <p className="text-xs text-gray-600">
            Built with Next.js + Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
