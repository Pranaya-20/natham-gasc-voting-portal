import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-white selection:bg-amber-500 selection:text-slate-900">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Placeholder logo with College Seal aesthetics */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/20">
              NG
            </div>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                NATHAM GOVERNMENT ARTS COLLEGE
              </h1>
              <p className="text-xs text-slate-400 tracking-wider">
                Natham, Dindigul - 624 401, Tamil Nadu | Affiliated to Madurai Kamaraj University
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400 tracking-wider">
            Election Year 2026-27
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex-1 flex flex-col justify-center items-center text-center">
        {/* Decorative Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Secure Digital Voting System
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-2xl mb-6">
          GASC Student Union <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
            Election Portal
          </span>
        </h2>

        <p className="text-slate-400 text-base md:text-lg max-w-lg mb-12">
          Cast your vote securely for the election of College Secretary, Joint Secretary, Cultural Secretary, and Office-Bearers.
        </p>

        {/* Portal Entry Buttons */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Student Entrance */}
          <Link
            href="/student/login"
            className="group relative flex flex-col items-start p-6 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-amber-500/40 hover:bg-slate-950/80 transition-all duration-300 text-left shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84a50.58 50.58 0 00-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-100 mb-1 group-hover:text-amber-400 transition-colors">
              Student Login
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Enter your Register Number and Date of Birth to access the voting ballot.
            </p>
            <div className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:translate-x-1 transition-transform">
              Access Ballot
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>

          {/* Admin Entrance */}
          <Link
            href="/admin/login"
            className="group relative flex flex-col items-start p-6 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-amber-500/40 hover:bg-slate-950/80 transition-all duration-300 text-left shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
            <div className="mb-4 p-3 bg-slate-800 border border-slate-700 text-amber-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-slate-100 mb-1 group-hover:text-amber-400 transition-colors">
              Admin Portal
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Authorized admin portal to configure positions, candidates, and release final tallies.
            </p>
            <div className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-amber-500 group-hover:translate-x-1 transition-transform">
              Admin Login
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 text-center text-xs text-slate-500 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Natham Government Arts College. All Rights Reserved.</p>
          <p className="text-slate-400">Developed for College Election Office & Auditing Committee</p>
        </div>
      </footer>
    </div>
  );
}
