export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Asesmen Excel</h3>
            <p className="text-gray-400 text-sm">
              Platform asesmen online untuk pelatihan Microsoft Excel
              dari level Basic hingga Intermediate.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Level Asesmen</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Basic - 15 Soal (45 menit)</li>
              <li>Intermediate - 15 Soal (60 menit)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Topik</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Fungsi Dasar Excel</li>
              <li>VLOOKUP & INDEX-MATCH</li>
              <li>Pivot Table</li>
              <li>Charts & Conditional Formatting</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Asesmen Excel. Dibuat untuk Pelatihan Excel.</p>
        </div>
      </div>
    </footer>
  );
}
