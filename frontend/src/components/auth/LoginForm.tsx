"use client";
import { useState } from 'react';
import { Briefcase, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setAuth } from "@/lib/auth";

type Mode = 'login' | 'register';

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const reset = (m: Mode) => {
    setMode(m); setError('');
    setEmail(''); setPassword(''); setConfirm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!email.trim() || !password) { setError("Email and password are required."); return; }
      if (mode === "register") {
        if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
        if (password !== confirm) { setError("Passwords do not match."); return; }
        const res = await apiFetch<{ token: string; user: { id: string; email: string } }>(
          "/api/auth/register", { method: "POST", body: { email, password } },
        );
        setAuth(res); router.push("/board"); return;
      }
      const res = await apiFetch<{ token: string; user: { id: string; email: string } }>(
        "/api/auth/login", { method: "POST", body: { email, password } },
      );
      setAuth(res); router.push("/board");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    background: hasError ? "rgba(201,107,107,0.05)" : "#f4f2ee",
    border: `1px solid ${hasError ? "rgba(201,107,107,0.4)" : "#e8e4dc"}`,
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "'Instrument Sans', sans-serif",
    color: "#1a1916",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#8a8474",
    fontWeight: 600,
    fontFamily: "'DM Mono', monospace",
    marginBottom: "7px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes card-in { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
        .lf-card { animation: card-in 0.28s ease both; }
        .lf-bg { animation: fade-in 0.4s ease both; }
        .lf-input:focus { border-color: rgba(184,130,10,0.45) !important; }
      `}</style>

      {/* Page background — warm off-white with a very subtle grid texture */}
      <div
        className="lf-bg"
        style={{
          minHeight: "100vh",
          background: "#faf9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'Instrument Sans', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative amber orbs — muted, not neon */}
        <div style={{
          position: "absolute", top: "-120px", right: "-120px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(184,130,10,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-120px", left: "-120px",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(90,158,122,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="lf-card" style={{ width: "100%", maxWidth: "380px", position: "relative" }}>

          {/* ── Card ── */}
          <div style={{
            background: "#fff",
            border: "1px solid #e8e4dc",
            borderRadius: "6px",
            overflow: "hidden",
          }}>
            {/* Amber top bar */}
            <div style={{ height: "2px", background: "#b8820a" }} />

            <div style={{ padding: "36px 32px 32px" }}>

              {/* Brand */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  background: "#b8820a",
                  borderRadius: "4px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "14px",
                }}>
                  <Briefcase size={18} color="#fff" />
                </div>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px", fontWeight: 600,
                  color: "#1a1916", margin: "0 0 5px",
                  letterSpacing: "-0.02em",
                }}>
                  JobTracker
                </h1>
                <p style={{
                  fontSize: "11px", color: "#8a8474",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.06em",
                  margin: 0,
                }}>
                  {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
                </p>
              </div>

              {/* Mode tabs */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                background: "#f4f2ee",
                border: "1px solid #e8e4dc",
                borderRadius: "4px",
                padding: "3px",
                marginBottom: "24px",
                gap: "3px",
              }}>
                {(['login', 'register'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => reset(m)}
                    style={{
                      padding: "7px",
                      borderRadius: "3px",
                      border: "none",
                      background: mode === m ? "#fff" : "transparent",
                      boxShadow: mode === m ? "0 1px 3px rgba(26,25,22,0.08)" : "none",
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: mode === m ? "#b8820a" : "#8a8474",
                      fontWeight: mode === m ? 500 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: "18px",
                  padding: "10px 14px",
                  background: "rgba(201,107,107,0.07)",
                  border: "1px solid rgba(201,107,107,0.2)",
                  borderLeft: "3px solid #c96b6b",
                  borderRadius: "0 4px 4px 0",
                  fontSize: "12px",
                  fontFamily: "'DM Mono', monospace",
                  color: "#a84848",
                }}>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="lf-input"
                    style={inputStyle()}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder={mode === 'register' ? 'Min. 8 characters' : 'Your password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="lf-input"
                      style={{ ...inputStyle(), paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      tabIndex={-1}
                      style={{
                        position: "absolute", right: "10px", top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#b8b2a4", padding: 0, display: "flex",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#b8820a")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#b8b2a4")}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password (register only) */}
                {mode === 'register' && (
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(''); }}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className="lf-input"
                      style={inputStyle(!!error && error.includes("match"))}
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "11px",
                    background: loading ? "#d4a84b" : "#b8820a",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase" as const,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#a07010"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#b8820a"; }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 12, height: 12,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    </>
                  ) : mode === 'login' ? (
                    <><LogIn size={13} /> Sign In</>
                  ) : (
                    <><UserPlus size={13} /> Create Account</>
                  )}
                </button>
              </form>

              {/* Toggle */}
              <div style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #f0ede8",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: "12px", color: "#8a8474",
                  fontFamily: "'DM Mono', monospace",
                  margin: 0,
                }}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => reset(mode === 'login' ? 'register' : 'login')}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#b8820a", fontSize: "12px",
                      fontFamily: "'DM Mono', monospace",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      padding: 0,
                    }}
                  >
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: "center",
            fontSize: "10px",
            fontFamily: "'DM Mono', monospace",
            color: "#b8b2a4",
            letterSpacing: "0.06em",
            marginTop: "14px",
          }}>
            Token stored locally in your browser
          </p>
        </div>
      </div>
    </>
  );
}