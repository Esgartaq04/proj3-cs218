import { useState, useEffect, useRef } from "react";

const WEBHOOK_URL = "https://n8n.ctc.uic.edu/webhook/pathfind-careers-v2";

// --- Animated circular score ring ---
function ScoreRing({ label, score, color, delay = 0 }) {
  const [val, setVal] = useState(0);
  const radius = 54;
  const circ = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 1;
        if (start > score) return;
        setVal(start);
        requestAnimationFrame(step);
      };
      step();
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const offset = circ - (val / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: "28px", fontWeight: 700, fill: color, fontFamily: "'DM Sans', sans-serif" }}>
          {val}
        </text>
      </svg>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)"
      }}>{label}</span>
    </div>
  );
}

// --- Accordion for interview prep ---
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      marginBottom: 0,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 0", color: "#e8e4df",
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
        textAlign: "left",
      }}>
        {title}
        <span style={{
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease", fontSize: 22, color: "#8b7cf7", lineHeight: 1
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: "0 0 18px 0", color: "rgba(255,255,255,0.6)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7,
        }}>{children}</div>
      )}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("input"); // input | loading | results
  const [resume, setResume] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const intervalRef = useRef(null);

  const loadingMessages = [
    "Analyzing your CV…",
    "Extracting skills & experience…",
    "Clarifying candidate profile…",
    "Searching Adzuna for matching jobs…",
    "Ranking opportunities…",
    "Rewriting resume for ATS…",
    "Generating styled PDF…",
    "Scoring ATS compatibility…",
    "Crafting cover letter…",
    "Preparing interview questions…",
    "Sending results to your inbox…",
  ];

  useEffect(() => {
    if (phase === "loading") {
      intervalRef.current = setInterval(() => {
        setLoadingMsg((p) => (p + 1) % loadingMessages.length);
      }, 3200);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const handleSubmit = async () => {
    if (!resume.trim() || !email.trim()) {
      setError("Please provide both your resume and email.");
      return;
    }
    setError("");
    setPhase("loading");

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume, email_address: email }),
      });
      const data = await res.json();
      setResults(data);
      setPhase("results");
    } catch (e) {
      setError("Something went wrong. Please check your webhook URL and try again.");
      setPhase("input");
    }
  };

  // ── DEMO MODE: uncomment below to preview the results dashboard without a live backend ──
  // useEffect(() => {
  //   setResults({
  //     original_score: 42,
  //     new_score: 91,
  //     email_address: "demo@example.com",
  //     jobs: [
  //       { title: "Software Engineer", company: "Acme Corp", salary: "$120k", url: "#" },
  //       { title: "Frontend Developer", company: "Widget Inc", salary: "$110k", url: "#" },
  //       { title: "Full Stack Dev", company: "StartupXYZ", salary: "$130k", url: "#" },
  //     ],
  //     cover_letter: "Dear Hiring Manager,\n\nI am excited to apply for the Software Engineer position at Acme Corp...\n\nSincerely,\nCandidate",
  //     interview_questions: [
  //       "Tell me about a time you optimized a production pipeline.",
  //       "How do you approach debugging a microservices architecture?",
  //       "Describe your experience with CI/CD tooling.",
  //       "What's your approach to writing testable code?",
  //     ],
  //   });
  //   setPhase("results");
  // }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Instrument+Serif&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0e11; color: #e8e4df; min-height: 100vh; }
        ::selection { background: #8b7cf7; color: #0e0e11; }
        textarea:focus, input:focus { outline: none; }
        @keyframes grain {
          0%, 100% { transform: translate(0,0) }
          10% { transform: translate(-2%,-3%) }
          30% { transform: translate(3%,2%) }
          50% { transform: translate(-1%,4%) }
          70% { transform: translate(2%,-2%) }
          90% { transform: translate(-3%,1%) }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* grain overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.04,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        animation: "grain 8s steps(10) infinite",
      }} />

      {/* subtle gradient glow */}
      <div style={{
        position: "fixed", top: "-30%", left: "50%", transform: "translateX(-50%)",
        width: "120vw", height: "60vh", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(139,124,247,0.08) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: phase === "results" ? "flex-start" : "center", padding: "48px 20px" }}>

        {/* ─── HEADER ─── */}
        <header style={{ textAlign: "center", marginBottom: phase === "results" ? 48 : 40, animation: "fadeUp 0.7s ease both" }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", color: "#8b7cf7", marginBottom: 12,
          }}>Pathfind Careers</div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontSize: phase === "results" ? 32 : 44,
            fontWeight: 400, lineHeight: 1.15, color: "#e8e4df", maxWidth: 520,
            transition: "font-size 0.4s ease",
          }}>
            {phase === "results" ? "Your Results" : "Land your next role."}
          </h1>
          {phase === "input" && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.4)",
              marginTop: 14, maxWidth: 400, lineHeight: 1.6,
            }}>
              Paste your resume. Our AI agents will find matching jobs, rewrite your CV for ATS, and email you a polished PDF.
            </p>
          )}
        </header>

        {/* ─── INPUT PHASE ─── */}
        {phase === "input" && (
          <div style={{ width: "100%", maxWidth: 520, animation: "fadeUp 0.7s ease 0.15s both" }}>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here…"
              rows={10}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "18px 20px", color: "#e8e4df", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, resize: "vertical",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(139,124,247,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "14px 20px", color: "#e8e4df", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", marginTop: 12,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(139,124,247,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
            {error && (
              <p style={{ color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 10 }}>{error}</p>
            )}
            <button onClick={handleSubmit} style={{
              width: "100%", marginTop: 16, padding: "15px 0",
              background: "linear-gradient(135deg, #8b7cf7 0%, #6c5ce7 100%)",
              border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", letterSpacing: "0.02em",
              transition: "transform 0.15s, box-shadow 0.2s",
              boxShadow: "0 4px 24px rgba(139,124,247,0.25)",
            }}
              onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 32px rgba(139,124,247,0.35)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(139,124,247,0.25)"; }}
            >
              Analyze &amp; Match
            </button>
          </div>
        )}

        {/* ─── LOADING PHASE ─── */}
        {phase === "loading" && (
          <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease both" }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%", background: "#8b7cf7",
                  animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)",
              minHeight: 28,
            }}>
              {loadingMessages[loadingMsg]}
            </p>
          </div>
        )}

        {/* ─── RESULTS PHASE ─── */}
        {phase === "results" && results && (
          <div style={{ width: "100%", maxWidth: 720 }}>

            {/* Success banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(139,124,247,0.08) 100%)",
              border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "20px 24px",
              marginBottom: 36, animation: "fadeUp 0.5s ease both",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6,
            }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>✓ Delivered.</span>{" "}
              Your newly formatted PDF and cover letter have been emailed to{" "}
              <strong style={{ color: "#e8e4df" }}>{results.email_address || email}</strong>.
            </div>

            {/* ATS Scores */}
            <section style={{ animation: "fadeUp 0.5s ease 0.1s both", marginBottom: 48 }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 28, color: "#e8e4df",
              }}>ATS Score Comparison</h2>
              <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
                <ScoreRing label="Original" score={results.original_score ?? 0} color="#f87171" delay={200} />
                <ScoreRing label="Optimized" score={results.new_score ?? 0} color="#22c55e" delay={600} />
              </div>
            </section>

            {/* Job Board */}
            {results.jobs && results.jobs.length > 0 && (
              <section style={{ animation: "fadeUp 0.5s ease 0.2s both", marginBottom: 48 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 20, color: "#e8e4df",
                }}>Matching Jobs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
                  {results.jobs.map((job, i) => (
                    <a key={i} href={job.url || "#"} target="_blank" rel="noopener noreferrer" style={{
                      display: "block", textDecoration: "none",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 12, padding: "18px 20px",
                      transition: "border-color 0.2s, transform 0.15s",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,124,247,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#e8e4df", marginBottom: 6 }}>{job.title}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{job.company}</div>
                      {job.salary && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8b7cf7", fontWeight: 600 }}>{job.salary}</div>}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Cover Letter */}
            {results.cover_letter && (
              <section style={{ animation: "fadeUp 0.5s ease 0.3s both", marginBottom: 48 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 20, color: "#e8e4df",
                }}>Cover Letter</h2>
                <div style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "24px 28px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.8, whiteSpace: "pre-wrap",
                }}>{results.cover_letter}</div>
              </section>
            )}

            {/* Interview Prep */}
            {results.interview_questions && results.interview_questions.length > 0 && (
              <section style={{ animation: "fadeUp 0.5s ease 0.4s both", marginBottom: 64 }}>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 16, color: "#e8e4df",
                }}>Interview Prep</h2>
                {results.interview_questions.map((q, i) => (
                  <Accordion key={i} title={`Q${i + 1}: ${q}`}>
                    <em>Prepare a structured answer using the STAR method — Situation, Task, Action, Result.</em>
                  </Accordion>
                ))}
              </section>
            )}

            {/* Reset */}
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease 0.5s both", paddingBottom: 32 }}>
              <button onClick={() => { setPhase("input"); setResults(null); setResume(""); setEmail(""); }} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                padding: "12px 32px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
              }}
                onMouseEnter={(e) => { e.target.style.borderColor = "rgba(139,124,247,0.4)"; e.target.style.color = "#e8e4df"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; e.target.style.color = "rgba(255,255,255,0.5)"; }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}