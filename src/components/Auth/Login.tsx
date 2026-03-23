import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export const Login = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white p-12 border-2 border-black">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-8 text-black">
            ADMIN PANEL
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-red-600"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-red-600"
                placeholder="••••••••"
              />
            </div>

            {/* Error Messages */}
            {(localError || error) && (
              <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-sm font-semibold">
                {localError || error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white border-2 border-black font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-100 border-2 border-black text-xs text-gray-700">
            <p className="font-bold mb-2">DEMO CREDENTIALS:</p>
            <p>Email: admin@liga.com</p>
            <p>Password: (Check Supabase console)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
