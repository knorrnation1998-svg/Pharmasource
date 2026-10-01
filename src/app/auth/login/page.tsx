"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authorizedStaff } from "@/data/staffAccounts";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const staffMember = authorizedStaff[normalizedEmail];

      if (staffMember && staffMember.password === password) {
        // Store session and redirect
        localStorage.setItem("keyani_staff_session", JSON.stringify(staffMember));
        router.push("/staff");
      } else {
        setError("Invalid credentials. Please check your institutional email and password.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-sterile flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-manifest-100 p-8 sm:p-10 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions</span>
          <h1 className="text-2xl font-bold text-manifest-900">Staff Portal Login</h1>
          <p className="text-xs text-manifest-600">Enter your authorized institutional staff credentials.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1.5">Staff Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. douala.dispatch@keyanisupply.cm"
              className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-manifest-900 hover:bg-manifest-800 text-white font-semibold py-3.5 rounded-xl shadow-md transition-all text-sm tracking-wide disabled:opacity-50"
          >
            {isLoading ? "Verifying Credentials..." : "Access Fulfillment Portal"}
          </button>
        </form>

        <div className="pt-4 border-t border-manifest-100 text-center">
          <a href="/catalog" className="text-xs text-manifest-500 hover:text-manifest-800 transition-colors">
            &larr; Return to Public Procurement Catalogue
          </a>
        </div>
      </div>
    </div>
  );
}