import logo from '@/iongridlogo.png'

export default function LogoutPage() {
  function goToLogin() {
    window.location.replace('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased">
      <div
        className="absolute inset-0 z-0 bg-[url('planettp2.png')] bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col gap-5 text-center text-white">
        <div className="mb-4 flex items-center gap-5">
          <img
            src={logo}
            className="border rounded-xl border-purple-500"
            width={120}
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Logged Out
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              You have been logged out.
            </p>
          </div>
        </div>
        <button
          onClick={goToLogin}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/10 transition-all duration-200 cursor-pointer"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}
