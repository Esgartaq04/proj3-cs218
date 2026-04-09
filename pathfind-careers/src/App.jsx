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
        <circle cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 0.05s linear" }} />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: "28px", fontWeight: 700, fill: color, fontFamily: "'DM Sans', sans-serif" }}>
          {val}
        </text>
      </svg>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </div>
  );
}

// --- Accordion ---
function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 0", color: "#e8e4df",
        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, textAlign: "left",
      }}>
        {title}
        <span style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.25s ease", fontSize: 22, color: "#8b7cf7", lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 0 18px 0", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.7 }}>{children}</div>
      )}
    </div>
  );
}

// --- Section wrapper ---
function Section({ title, delay = 0, children }) {
  return (
    <section style={{ animation: `fadeUp 0.5s ease ${delay}s both`, marginBottom: 48 }}>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400, marginBottom: 20, color: "#e8e4df" }}>{title}</h2>
      {children}
    </section>
  );
}

// --- Card wrapper ---
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, padding: "24px 28px", ...style,
    }}>{children}</div>
  );
}

const bodyFont = { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 };

export default function App() {
  const [phase, setPhase] = useState("input");
  const [resume, setResume] = useState("");
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
    "Scoring ATS compatibility…",
    "Crafting cover letter…",
    "Preparing interview questions…",
    "Building your dashboard…",
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
    if (!resume.trim()) {
      setError("Please paste your resume text.");
      return;
    }
    setError("");
    setPhase("loading");

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resume }),
      });
      const data = await res.json();
      // allIncomingItems returns an array — unwrap it
      let payload = Array.isArray(data) ? data[0] : data;
      if (payload && payload.json) payload = payload.json;
      setResults(payload);
      setPhase("results");
    } catch (e) {
      setError("Something went wrong. Please check your webhook URL and try again.");
      setPhase("input");
    }
  };

  // ── DEMO MODE: uncomment to preview dashboard without backend ──
  // useEffect(() => {
  //   setResults({
  //     status: "success",
  //     original_score: 42, new_score: 91,
  //     candidate_name: "Jane Doe",
  //     candidate_summary: "Experienced full-stack developer with 5 years in React and Node.js.",
  //     market_insights: "The software engineering market remains strong with high demand for React and cloud skills.",
  //     improvement_notes: "Added quantified achievements, ATS-friendly formatting, and tailored keywords.",
  //     jobs: [
  //       { title: "Software Engineer", company: "Acme Corp", salary: "$120k", url: "#", location: "Chicago, IL" },
  //       { title: "Frontend Developer", company: "Widget Inc", salary: "$110k", url: "#", location: "Remote" },
  //       { title: "Full Stack Dev", company: "StartupXYZ", salary: "$130k", url: "#", location: "NYC" },
  //     ],
  //     top_job: { title: "Software Engineer", company: "Acme Corp", match_score: 92, why_good_fit: "Strong React and Node.js match." },
  //     cover_letter: "Dear Hiring Manager,\n\nI am excited to apply for the Software Engineer position at Acme Corp. With 5 years of experience building scalable web applications...\n\nSincerely,\nJane Doe",
  //     interview_questions: [
  //       "Tell me about a time you optimized a production pipeline.",
  //       "How do you approach debugging a microservices architecture?",
  //       "Describe your experience with CI/CD tooling.",
  //       "What's your approach to writing testable code?",
  //       "How do you handle disagreements in code review?",
  //     ],
  //     questions_to_ask_employer: [
  //       "What does the onboarding process look like for new engineers?",
  //       "How does the team approach technical debt?",
  //       "What are the biggest challenges the engineering team faces right now?",
  //     ],
  //     linkedin_headline_suggestions: [
  //       "Full-Stack Engineer | React & Node.js | Building Scalable Web Apps",
  //       "Software Engineer | 5+ Years | Cloud-Native Development",
  //     ],
  //     skill_development: {
  //       immediate_actions: ["Update LinkedIn with new keywords", "Practice STAR method answers"],
  //       short_term_goals: ["Get AWS Solutions Architect cert", "Contribute to an open-source React project"],
  //       resources: [
  //         { skill: "System Design", resource: "Designing Data-Intensive Applications (book)", estimated_time: "4 weeks" },
  //         { skill: "AWS", resource: "A Cloud Guru - AWS SAA Course", estimated_time: "6 weeks" },
  //       ],
  //     },
  //     resume_html: "<div style='padding:40px;font-family:Arial,sans-serif;'><h1 style='font-size:14pt;font-weight:bold;'>JANE DOE</h1><hr/><h2 style='font-size:12pt;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #ccc;'>EXPERIENCE</h2><p><strong>Software Engineer</strong> — Acme Corp (2019–2024)</p><ul style='list-style-type:disc;padding-left:16px;margin:0;'><li>Accomplished 40% faster page loads as measured by Lighthouse scores, by migrating the frontend to React with code splitting.</li><li>Accomplished 99.9% uptime as measured by PagerDuty SLA reports, by implementing automated failover for microservices.</li></ul></div>",
  //     score_breakdown: {
  //       original: { keywords: 8, structure: 6, achievements: 4, relevance: 7 },
  //       new: { keywords: 22, structure: 23, achievements: 24, relevance: 22 },
  //     },
  //   });
  //   setPhase("results");
  // }, []);

  const r = results || {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Instrument+Serif&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0e11; color: #e8e4df; min-height: 100vh; }
        ::selection { background: #8b7cf7; color: #0e0e11; }
        textarea:focus, input:focus { outline: none; }
        @keyframes grain { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 30%{transform:translate(3%,2%)} 50%{transform:translate(-1%,4%)} 70%{transform:translate(2%,-2%)} 90%{transform:translate(-3%,1%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .job-card:hover { border-color: rgba(139,124,247,0.35) !important; transform: translateY(-2px) !important; }
      `}</style>

      {/* grain overlay */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:0.04, background:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", animation:"grain 8s steps(10) infinite" }} />

      {/* subtle glow */}
      <div style={{ position:"fixed",top:"-30%",left:"50%",transform:"translateX(-50%)", width:"120vw",height:"60vh",borderRadius:"50%", background:"radial-gradient(ellipse,rgba(139,124,247,0.08) 0%,transparent 70%)", zIndex:0,pointerEvents:"none" }} />

      <div style={{ position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center", justifyContent:phase==="results"?"flex-start":"center", padding:"48px 20px" }}>

        {/* HEADER */}
        <header style={{ textAlign:"center", marginBottom:phase==="results"?48:40, animation:"fadeUp 0.7s ease both" }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700, letterSpacing:"0.18em",textTransform:"uppercase",color:"#8b7cf7",marginBottom:12 }}>Pathfind Careers</div>
          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:phase==="results"?32:44, fontWeight:400,lineHeight:1.15,color:"#e8e4df",maxWidth:520, transition:"font-size 0.4s ease" }}>
            {phase === "results" ? (r.candidate_name ? `Results for ${r.candidate_name}` : "Your Results") : "Land your next role."}
          </h1>
          {phase === "input" && (
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:15,color:"rgba(255,255,255,0.4)", marginTop:14,maxWidth:400,lineHeight:1.6 }}>
              Paste your resume. Our AI agents will find matching jobs, rewrite your CV for ATS, and build you a complete career toolkit.
            </p>
          )}
        </header>

        {/* INPUT */}
        {phase === "input" && (
          <div style={{ width:"100%",maxWidth:520, animation:"fadeUp 0.7s ease 0.15s both" }}>
            <textarea value={resume} onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume text here…" rows={10}
              style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)", borderRadius:12,padding:"18px 20px",color:"#e8e4df",fontSize:14, fontFamily:"'DM Sans',sans-serif",lineHeight:1.7,resize:"vertical", transition:"border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor="rgba(139,124,247,0.4)"}
              onBlur={(e) => e.target.style.borderColor="rgba(255,255,255,0.08)"} />
            {error && <p style={{ color:"#f87171",fontSize:13,fontFamily:"'DM Sans',sans-serif",marginTop:10 }}>{error}</p>}
            <button onClick={handleSubmit} style={{
              width:"100%",marginTop:16,padding:"15px 0",
              background:"linear-gradient(135deg,#8b7cf7 0%,#6c5ce7 100%)",
              border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,
              fontFamily:"'DM Sans',sans-serif",cursor:"pointer",letterSpacing:"0.02em",
              transition:"transform 0.15s,box-shadow 0.2s",
              boxShadow:"0 4px 24px rgba(139,124,247,0.25)" }}
              onMouseEnter={(e) => { e.target.style.transform="translateY(-1px)"; e.target.style.boxShadow="0 6px 32px rgba(139,124,247,0.35)"; }}
              onMouseLeave={(e) => { e.target.style.transform="translateY(0)"; e.target.style.boxShadow="0 4px 24px rgba(139,124,247,0.25)"; }}>
              Analyze & Match
            </button>
          </div>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease both" }}>
            <div style={{ display:"flex",gap:6,justifyContent:"center",marginBottom:28 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width:8,height:8,borderRadius:"50%",background:"#8b7cf7", animation:`pulse-dot 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:16,color:"rgba(255,255,255,0.6)",minHeight:28 }}>
              {loadingMessages[loadingMsg]}
            </p>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && results && (
          <div style={{ width:"100%",maxWidth:760 }}>

            {/* Candidate summary + market insights */}
            {(r.candidate_summary || r.market_insights) && (
              <Section title="Overview" delay={0}>
                <Card>
                  {r.candidate_summary && <p style={bodyFont}>{r.candidate_summary}</p>}
                  {r.market_insights && <p style={{ ...bodyFont, marginTop: r.candidate_summary ? 12 : 0, fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>{r.market_insights}</p>}
                </Card>
              </Section>
            )}

            {/* ATS Scores */}
            <Section title="ATS Score Comparison" delay={0.1}>
              <div style={{ display:"flex",gap:48,justifyContent:"center",flexWrap:"wrap" }}>
                <ScoreRing label="Original" score={r.original_score ?? 0} color="#f87171" delay={200} />
                <ScoreRing label="Optimized" score={r.new_score ?? 0} color="#22c55e" delay={600} />
              </div>
              {r.improvement_notes && (
                <p style={{ ...bodyFont, textAlign:"center", marginTop:20, color:"rgba(255,255,255,0.4)", fontSize:13 }}>{r.improvement_notes}</p>
              )}
            </Section>

            {/* Rewritten Resume Preview */}
            {r.resume_html && (
              <Section title="Your Optimized Resume" delay={0.15}>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{
                    background: "#fff", borderRadius: 12, padding: 0,
                    maxHeight: 600, overflowY: "auto",
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: r.resume_html }} />
                  </div>
                </Card>
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <button onClick={() => {
                    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title><style>@media print{body{margin:0;padding:0}@page{size:letter;margin:0.5in}}</style></head><body>${r.resume_html}</body></html>`], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "Pathfind_Resume.html"; a.click();
                    URL.revokeObjectURL(url);
                  }} style={{
                    background:"none",border:"1px solid rgba(139,124,247,0.3)",borderRadius:10,
                    padding:"10px 24px",color:"#8b7cf7",fontSize:13,fontWeight:600,
                    fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all 0.2s"
                  }}
                    onMouseEnter={(e) => { e.target.style.background="rgba(139,124,247,0.1)"; }}
                    onMouseLeave={(e) => { e.target.style.background="none"; }}>
                    Download Resume HTML
                  </button>
                  <p style={{ fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:8,fontFamily:"'DM Sans',sans-serif" }}>
                    Open in browser → Print → Save as PDF
                  </p>
                </div>
              </Section>
            )}

            {/* Top Job Match */}
            {r.top_job && (
              <Section title="Best Match" delay={0.2}>
                <Card style={{ borderColor: "rgba(139,124,247,0.2)" }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:"#e8e4df",marginBottom:6 }}>{r.top_job.title}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:8 }}>{r.top_job.company} {r.top_job.location ? `· ${r.top_job.location}` : ""}</div>
                  {r.top_job.match_score && (
                    <div style={{ display:"inline-block",background:"rgba(139,124,247,0.15)",borderRadius:20,padding:"4px 14px", fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:"#8b7cf7",marginBottom:10 }}>
                      {r.top_job.match_score}% Match
                    </div>
                  )}
                  {r.top_job.why_good_fit && <p style={bodyFont}>{r.top_job.why_good_fit}</p>}
                  {r.top_job.url && (
                    <a href={r.top_job.url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block",marginTop:12,color:"#8b7cf7",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600,textDecoration:"none" }}>
                      Apply →
                    </a>
                  )}
                </Card>
              </Section>
            )}

            {/* Job Board */}
            {r.jobs && r.jobs.length > 0 && (
              <Section title="All Matching Jobs" delay={0.25}>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14 }}>
                  {r.jobs.map((job, i) => (
                    <a key={i} href={job.url || "#"} target="_blank" rel="noopener noreferrer" className="job-card" style={{
                      display:"block",textDecoration:"none",
                      background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
                      borderRadius:12,padding:"18px 20px",transition:"border-color 0.2s,transform 0.15s" }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#e8e4df",marginBottom:4 }}>{job.title}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:2 }}>{job.company}</div>
                      {job.location && <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:6 }}>{job.location}</div>}
                      {job.salary && job.salary !== "Not listed" && <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#8b7cf7",fontWeight:600 }}>{job.salary}</div>}
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Cover Letter */}
            {r.cover_letter && (
              <Section title="Cover Letter" delay={0.3}>
                <Card>
                  <div style={{ ...bodyFont, whiteSpace:"pre-wrap" }}>{r.cover_letter}</div>
                </Card>
                <div style={{ textAlign:"right",marginTop:8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(r.cover_letter); }} style={{
                    background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:12,
                    fontFamily:"'DM Sans',sans-serif",cursor:"pointer",padding:"4px 8px" }}>
                    Copy to clipboard
                  </button>
                </div>
              </Section>
            )}

            {/* Interview Prep */}
            {r.interview_questions && r.interview_questions.length > 0 && (
              <Section title="Interview Prep" delay={0.35}>
                {r.interview_questions.map((q, i) => (
                  <Accordion key={i} title={`Q${i + 1}: ${typeof q === "string" ? q : q.question || q}`}>
                    <em>Prepare a structured answer using the STAR method — Situation, Task, Action, Result.</em>
                  </Accordion>
                ))}
              </Section>
            )}

            {/* Questions to Ask */}
            {r.questions_to_ask_employer && r.questions_to_ask_employer.length > 0 && (
              <Section title="Questions Asked by the Employer" delay={0.4}>
                <Card>
                  <ul style={{ ...bodyFont, paddingLeft: 20, margin: 0 }}>
                    {r.questions_to_ask_employer.map((q, i) => (
                      <li key={i} style={{ marginBottom: 8 }}>{q}</li>
                    ))}
                  </ul>
                </Card>
              </Section>
            )}

            {/* LinkedIn Tips */}
            {r.linkedin_headline_suggestions && r.linkedin_headline_suggestions.length > 0 && (
              <Section title="LinkedIn Optimization" delay={0.45}>
                <Card>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:12 }}>Headline Suggestions</div>
                  {r.linkedin_headline_suggestions.map((h, i) => (
                    <div key={i} style={{ ...bodyFont, background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"10px 14px",marginBottom:8,color:"#e8e4df",fontSize:13 }}>{h}</div>
                  ))}
                </Card>
              </Section>
            )}

            {/* Skill Development Plan */}
            {r.skill_development && (
              <Section title="Skill Development Plan" delay={0.5}>
                {r.skill_development.immediate_actions && r.skill_development.immediate_actions.length > 0 && (
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#22c55e",marginBottom:12 }}>This Week</div>
                    <ul style={{ ...bodyFont, paddingLeft:20, margin:0 }}>
                      {r.skill_development.immediate_actions.map((a, i) => <li key={i} style={{ marginBottom:6 }}>{a}</li>)}
                    </ul>
                  </Card>
                )}
                {r.skill_development.short_term_goals && r.skill_development.short_term_goals.length > 0 && (
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#8b7cf7",marginBottom:12 }}>1–3 Months</div>
                    <ul style={{ ...bodyFont, paddingLeft:20, margin:0 }}>
                      {r.skill_development.short_term_goals.map((g, i) => <li key={i} style={{ marginBottom:6 }}>{g}</li>)}
                    </ul>
                  </Card>
                )}
                {r.skill_development.resources && r.skill_development.resources.length > 0 && (
                  <Card>
                    <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:12 }}>Recommended Resources</div>
                    {r.skill_development.resources.map((res, i) => (
                      <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"8px 0",borderBottom:i < r.skill_development.resources.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                        <div>
                          <span style={{ ...bodyFont, color:"#e8e4df",fontWeight:500 }}>{res.skill}</span>
                          <span style={{ ...bodyFont, marginLeft:8 }}>{res.resource}</span>
                        </div>
                        {res.estimated_time && <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap",marginLeft:12 }}>{res.estimated_time}</span>}
                      </div>
                    ))}
                  </Card>
                )}
              </Section>
            )}

            {/* Reset */}
            <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease 0.55s both", paddingBottom:48 }}>
              <button onClick={() => { setPhase("input"); setResults(null); setResume(""); }} style={{
                background:"none",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,
                padding:"12px 32px",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:500,
                fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"border-color 0.2s,color 0.2s" }}
                onMouseEnter={(e) => { e.target.style.borderColor="rgba(139,124,247,0.4)"; e.target.style.color="#e8e4df"; }}
                onMouseLeave={(e) => { e.target.style.borderColor="rgba(255,255,255,0.12)"; e.target.style.color="rgba(255,255,255,0.5)"; }}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}