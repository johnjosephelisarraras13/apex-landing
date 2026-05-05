import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// APEX LANDING PAGE — v2
// Their structure (mobile-first, real Stripe links, 4-tier ladder)
// + my cinematic ambient layer (orbs, cursor glow, scroll progress)
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#07080B",
  bgAlt: "#0C1017",
  surface: "rgba(16,18,26,0.75)",
  card: "rgba(20,22,32,0.85)",
  border: "rgba(212,168,83,0.10)",
  borderHover: "rgba(212,168,83,0.25)",
  text: "#B8B4AE",
  textMuted: "#706C66",
  textDim: "#3E3A34",
  white: "#FBF7F0",
  cream: "#F0EBE3",
  gold: "#D4A853",
  goldLight: "#EEDBA0",
  goldDim: "rgba(212,168,83,0.12)",
  goldGlow: "rgba(212,168,83,0.35)",
  green: "#5BC49F",
  cyan: "#0EA5E9",
  red: "#D45B5B",
  purple: "#A78AFF",
  serif: "'Playfair Display',Georgia,serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
  sans: "'Outfit',system-ui,sans-serif",
};

// LIVE LINKS — verified 2026-04-30 against Stripe live mode
const LINKS = {
  scorecard: "https://apex-scorecard.vercel.app",
  calendly: "https://bit.ly/4uhiMV2",
  toolkit: "https://buy.stripe.com/dRm7sNgxG5797jffpm6sw00",
  course: "https://buy.stripe.com/4gMcN75T25799rncda6sw01",
  mastermind: "https://buy.stripe.com/aFa00la9i9np32Z90Y6sw02",
  newsletter: "https://bit.ly/491bxsa",
};

// ─── Hooks ────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useMouse() {
  const [pos, setPos] = useState({ x: -1000, y: -1000, hasMoved: false });
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY, hasMoved: true });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return p;
}

// ─── Primitives ───────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

function Badge({ children, color = C.gold }) {
  return (
    <div style={{
      display: "inline-block", padding: "4px 14px", borderRadius: "2px",
      border: `1px solid ${color}40`,
      fontFamily: C.mono, fontSize: "8px", letterSpacing: "4px", color,
    }}>{children}</div>
  );
}

function SectionDivider() {
  return (
    <div style={{
      width: "48px", height: "1px", margin: "0 auto",
      background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`,
    }} />
  );
}

function CTAButton({ children, href, variant = "primary", style: s = {} }) {
  const styles = variant === "primary" ? {
    padding: "16px 32px", borderRadius: "4px", border: "none",
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
    color: C.bg, fontSize: "11px", fontWeight: 700,
    fontFamily: C.mono, letterSpacing: "3px",
    boxShadow: `0 4px 20px ${C.goldGlow}`,
    cursor: "pointer", textDecoration: "none", display: "inline-block",
    textAlign: "center",
  } : {
    padding: "14px 28px", borderRadius: "4px",
    border: `1px solid ${C.gold}40`, background: "transparent",
    color: C.gold, fontSize: "11px", fontWeight: 600,
    fontFamily: C.mono, letterSpacing: "2px",
    cursor: "pointer", textDecoration: "none", display: "inline-block",
    textAlign: "center",
  };
  return <a href={href} target="_blank" rel="noopener" style={{ ...styles, ...s }}>{children}</a>;
}

// ─── Cinematic ambient layers ─────────────────────────────────────────────

function Orbs() {
  const orbs = [
    { size: 480, x: "10%", y: "5%", anim: "orb0", dur: 28, delay: 0, opacity: 50 },
    { size: 320, x: "85%", y: "20%", anim: "orb1", dur: 22, delay: 4, opacity: 35 },
    { size: 240, x: "20%", y: "55%", anim: "orb2", dur: 26, delay: 8, opacity: 40 },
    { size: 360, x: "75%", y: "65%", anim: "orb0", dur: 32, delay: 2, opacity: 30 },
    { size: 200, x: "50%", y: "85%", anim: "orb1", dur: 18, delay: 6, opacity: 45 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${o.size}px`, height: `${o.size}px`,
          left: o.x, top: o.y,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.gold}${o.opacity.toString(16).padStart(2, "0")}, transparent 70%)`,
          filter: "blur(40px)",
          animation: `${o.anim} ${o.dur}s ease-in-out infinite`,
          animationDelay: `${o.delay}s`,
        }} />
      ))}
    </div>
  );
}

function CursorGlow({ x, y, hasMoved }) {
  if (!hasMoved) return null;
  return (
    <div style={{
      position: "fixed",
      left: x, top: y,
      width: "600px", height: "600px",
      marginLeft: "-300px", marginTop: "-300px",
      borderRadius: "50%",
      background: `radial-gradient(circle, ${C.gold}10, transparent 60%)`,
      pointerEvents: "none",
      zIndex: 1,
      mixBlendMode: "screen",
    }} />
  );
}

function ScrollProgress({ p }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "2px", zIndex: 100,
      background: "rgba(212,168,83,0.06)",
    }}>
      <div style={{
        height: "100%", width: `${p * 100}%`,
        background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
        boxShadow: `0 0 12px ${C.goldGlow}`,
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────

function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "60px 20px 80px",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 40%, rgba(212,168,83,0.08), transparent 60%)`,
      }} />
      <div style={{
        maxWidth: "480px", margin: "0 auto", position: "relative",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 1s cubic-bezier(0.16,1,0.3,1)",
        textAlign: "center",
      }}>
        <Badge>APEX · BUILT BY JJ</Badge>
        <h1 style={{
          fontFamily: C.serif, fontStyle: "italic", fontSize: "clamp(32px,7.5vw,48px)",
          fontWeight: 400, color: C.cream, lineHeight: 1.1,
          margin: "28px 0 0", letterSpacing: "-0.5px",
        }}>
          Build wealth that doesn&apos;t
        </h1>
        <h1 style={{
          fontFamily: C.serif, fontStyle: "italic", fontSize: "clamp(32px,7.5vw,48px)",
          fontWeight: 400, color: C.gold, lineHeight: 1.1,
          margin: "0 0 28px", letterSpacing: "-0.5px",
        }}>
          require your time.
        </h1>
        <div style={{
          width: "48px", height: "1px", margin: "0 auto 28px",
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        }} />
        <p style={{
          fontSize: "16px", lineHeight: 1.65, color: C.text,
          fontWeight: 300, margin: "0 auto 8px", maxWidth: "400px",
        }}>
          An autonomous profit engine for high earners ready to build their exit.
        </p>
        <p style={{
          fontSize: "15px", lineHeight: 1.65, color: C.textMuted,
          fontWeight: 400, margin: "0 auto 40px", maxWidth: "400px",
        }}>
          Built quietly, in public, by someone who&apos;s been where you are.
        </p>
        <CTAButton href={LINKS.scorecard}>TAKE THE SCORECARD →</CTAButton>
        <div style={{ marginTop: "12px" }}>
          <CTAButton href="#how" variant="secondary">HOW IT WORKS</CTAButton>
        </div>
        <p style={{
          fontFamily: C.mono, fontSize: "10px", color: C.textDim,
          letterSpacing: "1.5px", marginTop: "20px",
        }}>
          10 QUESTIONS · 3 MINUTES · NO SPAM
        </p>
      </div>
      <div style={{
        position: "absolute", bottom: "30px", left: "50%",
        transform: "translateX(-50%)", textAlign: "center",
        animation: "float 3s ease-in-out infinite",
      }}>
        <div style={{ fontFamily: C.mono, fontSize: "8px", color: C.textDim, letterSpacing: "2px", marginBottom: "6px" }}>SCROLL</div>
        <div style={{ fontSize: "14px", color: C.textDim }}>↓</div>
      </div>
    </section>
  );
}

// ─── PROBLEM ──────────────────────────────────────────────────────────────

function Problem() {
  const pains = [
    "You earn $100K+ but still feel stuck",
    "You\u2019ve missed family moments you can\u2019t get back",
    "Your income stops the second you stop working",
    "You\u2019ve Googled \u201Cpassive income\u201D at 11 PM",
    "You know you\u2019re capable of more but don\u2019t know where to start",
  ];
  return (
    <section style={{ padding: "80px 20px", background: C.bgAlt, position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Badge color={C.red}>THE PROBLEM</Badge>
          <h2 style={{
            fontFamily: C.serif, fontStyle: "italic", fontSize: "32px",
            fontWeight: 400, color: C.cream, margin: "20px 0 32px",
            lineHeight: 1.15,
          }}>
            Sound familiar?
          </h2>
        </FadeIn>
        {pains.map((pain, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div style={{
              padding: "14px 0",
              borderBottom: i < pains.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: "15px", color: C.cream, lineHeight: 1.5, fontWeight: 300 }}>{pain}</span>
            </div>
          </FadeIn>
        ))}
        <FadeIn delay={0.5}>
          <p style={{
            fontSize: "14px", color: C.textMuted, lineHeight: 1.6,
            marginTop: "28px", fontStyle: "italic",
          }}>
            If you checked 3 or more, you&apos;re wearing golden handcuffs.
            <br />And the key is closer than you think.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── SCORECARD ────────────────────────────────────────────────────────────

function Scorecard() {
  const features = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Takes 3 minutes",
      desc: "10 honest questions. No fluff. Your score tells you exactly where you stand.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: "Personalized results",
      desc: "Different scores get different advice. Your escape plan is built for YOUR situation.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      ),
      title: "Free 7-day email series",
      desc: "After the scorecard, get daily lessons on building AI-powered income.",
    },
  ];
  return (
    <section id="how" style={{ padding: "80px 20px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Badge>THE ASSESSMENT</Badge>
          <h2 style={{
            fontFamily: C.serif, fontSize: "30px", fontWeight: 400,
            color: C.cream, margin: "20px 0 8px", lineHeight: 1.2,
          }}>
            The Golden Handcuffs
          </h2>
          <h2 style={{
            fontFamily: C.serif, fontStyle: "italic", fontSize: "30px",
            fontWeight: 400, color: C.gold, margin: "0 0 20px",
          }}>
            Scorecard
          </h2>
          <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.6, margin: "0 0 36px" }}>
            A free 10-question self-assessment that reveals exactly how trapped you are in your career — and gives you a personalized escape plan based on your score.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "18px",
                backdropFilter: "blur(12px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{f.icon}</div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: C.cream }}>{f.title}</span>
                </div>
                <p style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.5, margin: 0, paddingLeft: "28px" }}>
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <div style={{ marginTop: "32px" }}>
            <CTAButton href={LINKS.scorecard}>TAKE THE SCORECARD FREE →</CTAButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── AUDIENCE ─────────────────────────────────────────────────────────────

function Audience() {
  const profiles = [
    {
      title: "THE FINANCE PRO",
      desc: "Making great money in banking, insurance, real estate, or consulting. Excellent skills. Zero ownership. Ready to point those skills at something you own.",
      color: C.gold,
    },
    {
      title: "THE CORPORATE CLIMBER",
      desc: "Senior role, good benefits, great on paper. But the Sunday scaries hit different when you realize you\u2019re building someone else\u2019s dream.",
      color: C.cyan,
    },
    {
      title: "THE PARENT",
      desc: "You got into this career to provide. Now you realize providing isn\u2019t just financial. Your kids need your time more than your money.",
      color: C.red,
    },
  ];
  return (
    <section style={{ padding: "80px 20px", background: C.bgAlt, position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Badge>WHO THIS IS FOR</Badge>
          <h2 style={{
            fontFamily: C.serif, fontStyle: "italic", fontSize: "28px",
            fontWeight: 400, color: C.cream, margin: "20px 0 32px",
            lineHeight: 1.2,
          }}>
            Built for high-earners<br />who want out.
          </h2>
        </FadeIn>
        {profiles.map((p, i) => (
          <FadeIn key={i} delay={i * 0.15}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", padding: "20px", marginBottom: "10px",
              backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "40px", height: "2px",
                background: p.color,
              }} />
              <div style={{
                fontFamily: C.mono, fontSize: "9px", letterSpacing: "3px",
                color: p.color, marginBottom: "8px", marginTop: "4px",
              }}>{p.title}</div>
              <p style={{
                fontSize: "14px", color: C.cream, lineHeight: 1.6,
                margin: 0, fontWeight: 300,
              }}>{p.desc}</p>
            </div>
          </FadeIn>
        ))}
        <FadeIn delay={0.5}>
          <p style={{
            fontSize: "13px", color: C.textDim, lineHeight: 1.6,
            marginTop: "20px", textAlign: "center", fontStyle: "italic",
          }}>
            This isn&apos;t for people looking for beer money. This is for professionals earning $100K+ who&apos;ve realized that a high salary isn&apos;t wealth — it&apos;s a well-decorated trap.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────

function Products() {
  const tiers = [
    {
      label: "FREE", name: "Golden Handcuffs Scorecard",
      price: "$0", desc: "3-minute assessment + personalized escape plan + 7-day email series",
      color: C.green, link: LINKS.scorecard, cta: "TAKE THE SCORECARD",
    },
    {
      label: "TOOLKIT", name: "AI Income Toolkit",
      price: "$47", desc: "25+ AI prompts, 30-day content calendar, email blueprint, product ladder worksheet, landing page swipe file",
      color: C.cyan, link: LINKS.toolkit, cta: "GET THE TOOLKIT",
      founding: true,
    },
    {
      label: "COURSE", name: "AI Wealth Escape Plan",
      price: "$497", desc: "6-week system: 18 video lessons, prompt library, templates, private community. Founding member pricing.",
      color: C.purple, link: LINKS.course, cta: "JOIN FOUNDING CLASS",
      founding: true, badge: "COMING SOON",
    },
    {
      label: "MASTERMIND", name: "APEX Mastermind",
      price: "$5,000", desc: "12 weeks. Max 10 seats. Weekly coaching calls, direct access to JJ, custom AI business blueprint.",
      color: C.gold, link: LINKS.calendly, cta: "BOOK DISCOVERY CALL",
      founding: true, badge: "10 SEATS",
    },
  ];
  return (
    <section style={{ padding: "80px 20px", background: C.bgAlt, position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <Badge>THE ECOSYSTEM</Badge>
          <h2 style={{
            fontFamily: C.serif, fontStyle: "italic", fontSize: "28px",
            fontWeight: 400, color: C.cream, margin: "20px 0 32px",
          }}>
            Your escape ladder.
          </h2>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
          {tiers.map((tier, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div style={{
                background: C.surface, border: `1px solid ${tier.color}20`,
                borderRadius: "10px", padding: "20px",
                backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
              }}>
                {tier.badge && (
                  <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    fontFamily: C.mono, fontSize: "7px", letterSpacing: "1.5px",
                    padding: "3px 8px", borderRadius: "2px",
                    background: `${tier.color}18`, color: tier.color,
                  }}>{tier.badge}</div>
                )}
                <div style={{
                  fontFamily: C.mono, fontSize: "8px", letterSpacing: "3px",
                  color: tier.color, marginBottom: "6px",
                }}>{tier.label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{
                    fontFamily: C.serif, fontSize: "18px", fontWeight: 600, color: C.cream,
                  }}>{tier.name}</span>
                  <span style={{
                    fontFamily: C.serif, fontSize: "22px", fontWeight: 700, color: tier.color,
                  }}>{tier.price}</span>
                </div>
                <p style={{
                  fontSize: "12px", color: C.textMuted, lineHeight: 1.5, margin: "0 0 14px",
                }}>{tier.desc}</p>
                <a href={tier.link} target="_blank" rel="noopener" style={{
                  display: "block", textAlign: "center", padding: "10px",
                  borderRadius: "4px",
                  background: i === 3 ? `linear-gradient(135deg, ${tier.color}, ${C.goldLight})` : "transparent",
                  border: i === 3 ? "none" : `1px solid ${tier.color}40`,
                  color: i === 3 ? C.bg : tier.color,
                  fontFamily: C.mono, fontSize: "9px", letterSpacing: "2px",
                  fontWeight: 700, textDecoration: "none",
                  boxShadow: i === 3 ? `0 4px 16px ${C.goldGlow}` : "none",
                }}>{tier.cta}</a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────

function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const submit = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch("/api/submit-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, name, score: 0, tier: "newsletter_signup",
          answers: {}, income_range: "", biggest_obstacle: "",
          freedom_timeline: "", buying_temperature: "warm",
        }),
      });
      const data = await response.json();
      if (data.success) setSent(true);
      else window.open(LINKS.newsletter, "_blank");
    } catch {
      window.open(LINKS.newsletter, "_blank");
    }
    setSending(false);
  };
  return (
    <section style={{ padding: "80px 20px", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{
            background: `linear-gradient(135deg, ${C.goldDim}, rgba(212,168,83,0.04))`,
            border: `1px solid ${C.gold}28`,
            borderRadius: "14px", padding: "32px 24px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
              background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            }} />
            <Badge>WEEKLY</Badge>
            <h2 style={{
              fontFamily: C.serif, fontStyle: "italic", fontSize: "26px",
              fontWeight: 400, color: C.cream, margin: "16px 0 8px",
            }}>
              The escape plan.<br />Delivered weekly.
            </h2>
            <p style={{
              fontSize: "13px", color: C.textMuted, lineHeight: 1.6,
              margin: "0 0 24px",
            }}>
              Real numbers. Real lessons. No guru energy. Every week I share what I&apos;m building, what&apos;s working, and what&apos;s not.
            </p>
            {!sent ? (
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    style={{
                      flex: 1, padding: "14px 16px",
                      background: "rgba(7,8,11,0.6)", border: `1px solid ${C.border}`,
                      borderRadius: "5px", color: C.cream, fontSize: "14px",
                      fontFamily: C.sans, outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Your email"
                    type="email"
                    style={{
                      flex: 1, padding: "14px 16px",
                      background: "rgba(7,8,11,0.6)", border: `1px solid ${C.border}`,
                      borderRadius: "5px", color: C.cream, fontSize: "14px",
                      fontFamily: C.sans, outline: "none",
                    }}
                  />
                  <button onClick={submit} disabled={!email.trim() || sending} style={{
                    padding: "14px 20px", borderRadius: "5px", border: "none",
                    background: email.trim() ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` : C.textDim,
                    color: C.bg, fontSize: "11px", fontWeight: 700,
                    fontFamily: C.mono, letterSpacing: "2px",
                    cursor: email.trim() ? "pointer" : "default",
                    boxShadow: email.trim() ? `0 4px 16px ${C.goldGlow}` : "none",
                  }}>{sending ? "..." : "JOIN"}</button>
                </div>
                <p style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, marginTop: "10px" }}>
                  Join high-earners building their exit. Unsubscribe anytime.
                </p>
              </div>
            ) : (
              <div style={{ padding: "12px 0" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
                <div style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "20px", color: C.cream, marginBottom: "6px" }}>
                  You&apos;re in.
                </div>
                <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
                  Check your inbox. Your first email is on its way.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      padding: "48px 20px 40px", borderTop: `1px solid ${C.border}`,
      textAlign: "center", position: "relative", zIndex: 2,
    }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ fontSize: "14px", color: C.gold, filter: `drop-shadow(0 0 6px ${C.goldGlow})` }}>◈</span>
          <span style={{
            fontFamily: C.serif, fontSize: "14px", fontWeight: 700,
            color: C.cream, letterSpacing: "4px",
          }}>APEX</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "24px" }}>
          {[
            { label: "Scorecard", href: LINKS.scorecard },
            { label: "Newsletter", href: LINKS.newsletter },
          ].map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noopener" style={{
              fontFamily: C.mono, fontSize: "9px", letterSpacing: "1.5px",
              color: C.textMuted, textDecoration: "none",
              textTransform: "uppercase",
            }}>{link.label}</a>
          ))}
        </div>
        <p style={{
          fontFamily: C.mono, fontSize: "8px", color: C.textDim,
          letterSpacing: "1px", margin: 0,
        }}>
          © 2026
        </p>
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────

export default function APEXLanding() {
  const mouse = useMouse();
  const scrollP = useScrollProgress();

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: C.sans, position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Outfit:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Cinematic ambient layers (z-index 0 / 1) */}
      <ScrollProgress p={scrollP} />
      <Orbs />
      <CursorGlow x={mouse.x} y={mouse.y} hasMoved={mouse.hasMoved} />

      {/* Subtle grain texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
      }} />

      {/* Content (z-index 2) */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Hero />
        <SectionDivider />
        <Problem />
        <SectionDivider />
        <Scorecard />
        <SectionDivider />
        <Audience />
        <SectionDivider />
        <Products />
        <SectionDivider />
        <Newsletter />
        <Footer />
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; }
        ::-webkit-scrollbar { display: none; }
        ::selection { background: ${C.gold}; color: ${C.bg}; }
        input::placeholder { color: ${C.textDim}; }
        button:hover, a:hover { opacity: 0.92; }

        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes orb0 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(60px, -40px) scale(1.15); opacity: 0.3; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(-50px, 50px) scale(0.85); opacity: 0.6; }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.4; }
          50% { transform: translate(80px, 30px) scale(1); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}
