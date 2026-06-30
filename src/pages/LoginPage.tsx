// components/LoginForm.tsx
import { useState, type SetStateAction } from 'react'
import logo from '@/iongridlogo.png'

export function LoginPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('Login')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('name', name)
    formData.append('email', email)
    formData.append('code', code)

    if (type === 'Login') {
      await fetch('api/login', { method: 'POST', body: formData })
    } else {
      await fetch('api/register', { method: 'POST', body: formData })
    }
    window.location.assign('/')
  }

  function handleChangeUsername(e: {
    target: { value: SetStateAction<string> }
  }) {
    setUsername(e.target.value)
  }
  function handleChangeCode(e: { target: { value: SetStateAction<string> } }) {
    setCode(e.target.value)
  }
  function handleChangeName(e: { target: { value: SetStateAction<string> } }) {
    setName(e.target.value)
  }
  function handleChangeEmail(e: { target: { value: SetStateAction<string> } }) {
    setEmail(e.target.value)
  }
  function handleChangePassword(e: {
    target: { value: SetStateAction<string> }
  }) {
    setPassword(e.target.value)
  }

  function switchFormType(e: any) {
    e.preventDefault()
    const isLogin = type === 'Login'
    setType(isLogin ? 'Register' : 'Login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 antialiased">
      <div
        className="absolute inset-0 z-0 bg-[url('planettp2.png')] bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <form
        className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col gap-5 text-left"
        onSubmit={submit}
      >
        <div className="mb-2 flex items-center gap-5">
          <img
            src={logo}
            className="border rounded-xl border-purple-500"
            width={120}
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight">
              {type}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {type === 'Login'
                ? 'Access your prioritization boards'
                : 'Create an account'}
            </p>
          </div>
        </div>

        {type === 'Register' && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Registration code *
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150"
                id="reg-code"
                placeholder="Enter code"
                onChange={handleChangeCode}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Name *
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150"
                id="reg-name"
                placeholder="Enter name"
                onChange={handleChangeName}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email *
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150"
                id="reg-email"
                placeholder="Enter email"
                onChange={handleChangeEmail}
                type="email"
                required
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Username *
          </label>
          <input
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150"
            id="username"
            placeholder="Enter username"
            onChange={handleChangeUsername}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Password *
          </label>
          <input
            className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm placeholder-slate-600 outline-none transition-all duration-150"
            id="password"
            placeholder="••••••••"
            onChange={handleChangePassword}
            type="password"
            required
          />
        </div>

        <button
          id="submit-btn"
          className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/10 transition-all duration-200 cursor-pointer flex items-center justify-center text-sm"
          type="submit"
        >
          Submit
        </button>

        <div className="text-center mt-2">
          {type === 'Login' && (
            <a
              href="#"
              onClick={switchFormType}
              className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors cursor-pointer"
            >
              Don't have an account? Register here
            </a>
          )}
          {type === 'Register' && (
            <a
              href="#"
              onClick={switchFormType}
              className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors cursor-pointer"
            >
              Switch back to login
            </a>
          )}
        </div>
      </form>
    </div>
  )
}
