import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from './lib/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    navigate('/dtail-admin');
  };

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-black border border-white/10 p-8 rounded-2xl">
        <h1 className="text-3xl font-black mb-6 uppercase">Admin Login</h1>

        <input
          className="w-full mb-4 p-4 bg-white text-black rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-4 bg-white text-black rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="text-red-400 mb-4 text-sm">{errorMsg}</p>}

        <button className="w-full bg-brand text-black font-black p-4 rounded uppercase">
          Login
        </button>
      </form>
    </div>
  );
}