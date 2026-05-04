import { useState, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// APEX LANDING — Cinematic v1
// Single-file React landing page. Multi-layered ambient effects:
//   • Animated orb field (5 orbs, varying speeds)
//   • Cursor-following gold glow (desktop only)
//   • Scroll-progress gold bar (sticky top)
//   • Parallax hero (mouse tilt on hero elements)
//   • Scroll-triggered fade-up reveals (IntersectionObserver)
//   • Animated number counters
//   • Glassmorphism cards (backdrop-filter blur)
//   • Marquee strip (CSS animation)
//   • Section dividers with animated gold dots
// ═══════════════════════════════════════════════════════════════════════════

const C = {
  bg: "#07080B",
  bgDeep: "#04050A",
  bgGlow: "#0C1017",
  surface: "rgba(16,18,26,0.55)",
  surfaceSolid: "#0F1420",
  border: "rgba(212,168,83,0.10)",
  borderActive: "rgba(212,168,83,0.40)",
  text: "#B8B4AE",
  textMuted: "#706C66",
  textDim: "#3E3A34",
  white: "#FBF7F0",
  cream: "#F0EBE3",
  gold: "#D4A853",
  goldLight: "#EEDBA0",
  goldDeep: "#A88040",
  goldDim: "rgba(212,168,83,0.12)",
  goldGlow: "rgba(212,168,83,0.35)",
  green: "#5BC49F",
  red: "#D45B5B",
  serif: "'Playfair Display','Instrument Serif',Georgia,serif",
  sans: "'Outfit',system-ui,sans-serif",
  mono: "'JetBrains Mono','SF Mono',monospace",
};

const SCORECARD_URL = "https://apex-scorecard.vercel.app";
const CALENDLY_URL = "https://calendly.com/johnjosephelisarraras/apex-discovery-call";
const NEWSLETTER_FORM_URL = "https://dashboard.mailerlite.com/forms/2248812/185066180386490097/share";

// ─── Hooks ────────────────────────────────────────────────────────────────

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

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useMouse() {
  const [pos, setPos] = useState({ x: -1000, y: -1000, hasMoved: false });
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY, hasMoved: true });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return pos;
}

function useViewport() {
  const [size, setSize] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

// ─── Primitives ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 24, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color = C.gold, style = {} }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "5px 14px",
        borderRadius: "2px",
        border: `1px solid ${color}40`,
        background: `${color}10`,
        fontFamily: C.mono,
        fontSize: "9px",
        letterSpacing: "4px",
        color,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SerifTitle({ children, size = 56, italic = false, color = C.cream, style = {} }) {
  return (
    <h1
      style={{
        fontFamily: C.serif,
        fontWeight: italic ? 400 : 800,
        fontStyle: italic ? "italic" : "normal",
        fontSize: `clamp(32px, ${size * 0.06}vw, ${size}px)`,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

function GoldButton({ href, children, primary = true, onClick, style = {} }) {
  const [hover, setHover] = useState(false);
  const Comp = href ? "a" : "button";
  return (
    <Comp
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        padding: primary ? "16px 32px" : "14px 26px",
        background: primary ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` : "transparent",
        border: primary ? "none" : `1px solid ${hover ? C.gold : C.border}`,
        borderRadius: "3px",
        color: primary ? C.bg : C.cream,
        fontFamily: C.mono,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "3px",
        textTransform: "uppercase",
        cursor: "pointer",
        textDecoration: "none",
        boxShadow: primary
          ? `0 8px 32px ${C.goldGlow}, inset 0 1px 0 rgba(255,255,255,0.2)${hover ? `, 0 0 60px ${C.goldGlow}` : ""}`
          : "none",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        ...style,
      }}
    >
      {children}
    </Comp>
  );
}

function GlassCard({ children, accent = C.gold, style = {} }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: C.surface,
        border: `1px solid ${hover ? `${accent}50` : C.border}`,
        borderRadius: "8px",
        padding: "32px 28px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: hover ? `0 16px 48px rgba(0,0,0,0.4), 0 0 32px ${accent}20` : "0 8px 24px rgba(0,0,0,0.3)",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
          opacity: hover ? 1 : 0.4,
          transition: "opacity 0.4s",
        }}
      />
      {children}
    </div>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", dur = 1600 }) {
  const [ref, visible] = useReveal(0.5);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = null;
    let raf;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible, value, dur]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function GoldDivider({ length = 80 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: `${length}px`,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${C.gold}80)`,
        }}
      />
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.gold, boxShadow: `0 0 12px ${C.goldGlow}` }} />
      <div
        style={{
          width: `${length}px`,
          height: "1px",
          background: `linear-gradient(90deg, ${C.gold}80, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Background layers ────────────────────────────────────────────────────

function Orbs() {
  const orbs = useMemo(
    () => [
      { size: 480, x: "10%", y: "5%", anim: "orb0", dur: 28, delay: 0, opacity: 0.5 },
      { size: 320, x: "85%", y: "20%", anim: "orb1", dur: 22, delay: 4, opacity: 0.35 },
      { size: 240, x: "20%", y: "55%", anim: "orb2", dur: 26, delay: 8, opacity: 0.4 },
      { size: 360, x: "75%", y: "65%", anim: "orb0", dur: 32, delay: 2, opacity: 0.3 },
      { size: 200, x: "50%", y: "85%", anim: "orb1", dur: 18, delay: 6, opacity: 0.45 },
    ],
    []
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${o.size}px`,
            height: `${o.size}px`,
            left: o.x,
            top: o.y,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.gold}${Math.round(o.opacity * 100).toString(16).padStart(2, "0")}, transparent 70%)`,
            filter: "blur(40px)",
            animation: `${o.anim} ${o.dur}s ease-in-out infinite`,
            animationDelay: `${o.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function CursorGlow({ x, y, hasMoved }) {
  if (!hasMoved) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: "600px",
        height: "600px",
        marginLeft: "-300px",
        marginTop: "-300px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}10, transparent 60%)`,
        pointerEvents: "none",
        zIndex: 1,
        transition: "transform 0.05s linear",
        mixBlendMode: "screen",
      }}
    />
  );
}

function ScrollProgress({ p }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        zIndex: 100,
        background: "rgba(212,168,83,0.06)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${p * 100}%`,
          background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`,
          boxShadow: `0 0 12px ${C.goldGlow}`,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.03,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────

function Nav({ scrolled }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? "14px 32px" : "24px 32px",
        background: scrolled ? "rgba(7,8,11,0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
        <span
          style={{
            fontFamily: C.serif,
            fontWeight: 800,
            fontSize: "18px",
            color: C.gold,
            letterSpacing: "-0.5px",
            textShadow: `0 0 20px ${C.goldGlow}`,
          }}
        >
          APEX
        </span>
        <span style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, letterSpacing: "2px" }}>EST. 2026</span>
      </div>
      <a
        href={SCORECARD_URL}
        style={{
          fontFamily: C.mono,
          fontSize: "10px",
          color: C.cream,
          textDecoration: "none",
          letterSpacing: "2px",
          textTransform: "uppercase",
          padding: "8px 18px",
          border: `1px solid ${C.gold}40`,
          borderRadius: "2px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = C.goldDim;
          e.currentTarget.style.borderColor = C.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = `${C.gold}40`;
        }}
      >
        Scorecard →
      </a>
    </div>
  );
}

function Hero({ mouseX, mouseY, vw, vh }) {
  const tilt = useMemo(() => {
    if (vw === 0 || vh === 0) return { rx: 0, ry: 0 };
    const rx = (mouseY / vh - 0.5) * -4;
    const ry = (mouseX / vw - 0.5) * 4;
    return { rx, ry };
  }, [mouseX, mouseY, vw, vh]);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
      }}
    >
      <Reveal delay={0}>
        <Eyebrow style={{ marginBottom: "32px" }}>APEX · BUILT BY JJ</Eyebrow>
      </Reveal>

      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <Reveal delay={120}>
          <SerifTitle italic size={92} style={{ marginBottom: "8px" }}>
            Build wealth that doesn&apos;t
          </SerifTitle>
        </Reveal>
        <Reveal delay={260}>
          <SerifTitle size={92} color={C.gold} style={{ marginBottom: "32px", textShadow: `0 0 60px ${C.goldGlow}` }}>
            require your time.
          </SerifTitle>
        </Reveal>

        <Reveal delay={400}>
          <GoldDivider length={56} />
        </Reveal>

        <Reveal delay={500}>
          <p
            style={{
              fontFamily: C.sans,
              fontSize: "clamp(15px, 1.5vw, 19px)",
              fontWeight: 300,
              color: C.cream,
              lineHeight: 1.55,
              maxWidth: "560px",
              margin: "32px auto 0",
            }}
          >
            An autonomous profit engine for high earners ready to escape the comp.
            <br />
            Built quietly, in public, by a finance closer who&apos;s been where you are.
          </p>
        </Reveal>
      </div>

      <Reveal delay={680} style={{ marginTop: "48px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <GoldButton href={SCORECARD_URL} primary>
              Take the Scorecard <span style={{ fontSize: "14px" }}>→</span>
            </GoldButton>
            <GoldButton href="#how" primary={false}>
              How it works
            </GoldButton>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textDim, letterSpacing: "2px" }}>
            10 QUESTIONS · 3 MINUTES · NO SPAM
          </div>
        </div>
      </Reveal>

      <Reveal delay={900} style={{ position: "absolute", bottom: "48px", left: 0, right: 0 }}>
        <div style={{ textAlign: "center", fontFamily: C.mono, fontSize: "9px", color: C.textDim, letterSpacing: "3px" }}>
          ↓ SCROLL
        </div>
      </Reveal>
    </section>
  );
}

function Marquee() {
  const items = [
    "BUILT IN PUBLIC",
    "$200K → $1M",
    "NO FACE ON CAMERA",
    "FATHER OF 4",
    "FINANCE CLOSER TURNED FOUNDER",
    "AI · LEVERAGE · COMPOUNDING",
    "REAL NUMBERS · NO HYPE",
  ];
  const looped = [...items, ...items, ...items];
  return (
    <div
      style={{
        position: "relative",
        padding: "32px 0",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(7,8,11,0.6)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "64px",
          animation: "marquee 50s linear infinite",
          width: "max-content",
        }}
      >
        {looped.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              fontFamily: C.mono,
              fontSize: "11px",
              letterSpacing: "4px",
              color: C.textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {s}
            <span style={{ color: C.gold, fontSize: "8px" }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Problem() {
  const pains = [
    { num: "01", text: "Your income is high enough to trap you. Not high enough to free you." },
    { num: "02", text: "Sunday-night dread is now a personality trait." },
    { num: "03", text: "Your kid describes your job as \u201Cmy dad goes to work and comes home tired.\u201D" },
    { num: "04", text: "You\u2019ve thought about quitting at least once this month. You won\u2019t." },
    { num: "05", text: "You know you\u2019re capable of more. You just don\u2019t know where to start." },
  ];
  return (
    <section style={{ position: "relative", padding: "140px 24px 100px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <Reveal>
          <Eyebrow color={C.red}>THE TRAP</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <SerifTitle italic size={64} style={{ margin: "24px auto 0", maxWidth: "780px" }}>
            If you&apos;re reading this,
            <br />
            <span style={{ color: C.gold }}>you&apos;ve felt it.</span>
          </SerifTitle>
        </Reveal>
      </div>
      <div style={{ display: "grid", gap: "16px", maxWidth: "760px", margin: "0 auto" }}>
        {pains.map((p, i) => (
          <Reveal key={p.num} delay={80 * i}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "24px",
                padding: "24px 28px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: "11px",
                  letterSpacing: "2px",
                  color: C.gold,
                  minWidth: "32px",
                  paddingTop: "3px",
                }}
              >
                {p.num}
              </div>
              <div style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "clamp(15px, 1.6vw, 19px)", color: C.cream, lineHeight: 1.5 }}>
                {p.text}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ScorecardSection() {
  return (
    <section id="how" style={{ position: "relative", padding: "120px 24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "60px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Reveal>
            <Eyebrow>THE DIAGNOSTIC</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <SerifTitle italic size={64} style={{ margin: "24px auto 16px", maxWidth: "760px" }}>
              10 questions. 3 minutes.
              <br />
              <span style={{ color: C.gold }}>The truth.</span>
            </SerifTitle>
          </Reveal>
          <Reveal delay={260}>
            <p
              style={{
                fontFamily: C.sans,
                fontSize: "16px",
                color: C.cream,
                lineHeight: 1.65,
                maxWidth: "640px",
                margin: "0 auto 40px",
                fontWeight: 300,
              }}
            >
              The Golden Handcuffs Scorecard tells you exactly how trapped you are right now \u2014
              and gives you a tier-matched escape plan based on where you actually stand.
            </p>
          </Reveal>

          {/* Score gauge mockup */}
          <Reveal delay={380}>
            <div
              style={{
                position: "relative",
                width: "240px",
                height: "240px",
                margin: "0 auto 40px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${C.gold}25, transparent 65%)`,
                  animation: "pulseR 4s ease-in-out infinite",
                  filter: "blur(20px)",
                }}
              />
              <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "relative" }}>
                <defs>
                  <linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={C.green} />
                    <stop offset="50%" stopColor={C.gold} />
                    <stop offset="100%" stopColor={C.red} />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="120" r="96" fill="none" stroke={C.border} strokeWidth="2" />
                <circle
                  cx="120"
                  cy="120"
                  r="96"
                  fill="none"
                  stroke="url(#ringG)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 96}`}
                  strokeDashoffset={`${2 * Math.PI * 96 * (1 - 0.64)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 120 120)"
                  style={{ filter: `drop-shadow(0 0 12px ${C.goldGlow})` }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontFamily: C.serif, fontSize: "64px", fontWeight: 700, color: C.gold, lineHeight: 1 }}>
                  <AnimatedNumber value={32} dur={1800} />
                </div>
                <div style={{ fontFamily: C.mono, fontSize: "10px", color: C.textMuted, letterSpacing: "3px", marginTop: "6px" }}>
                  / 50
                </div>
                <div style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "14px", color: C.cream, marginTop: "8px" }}>
                  Handcuffs Tightening
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                maxWidth: "780px",
                margin: "0 auto 40px",
              }}
            >
              {[
                { label: "Comfortable But Aware", range: "0\u201320", color: C.green },
                { label: "Handcuffs Tightening", range: "21\u201335", color: C.gold },
                { label: "Ready to Break Free", range: "36\u201350", color: C.red },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    padding: "16px 18px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "6px",
                    backdropFilter: "blur(12px)",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "2px", color: t.color, marginBottom: "6px" }}>
                    {t.range}
                  </div>
                  <div style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "14px", color: C.cream }}>{t.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={640}>
            <GoldButton href={SCORECARD_URL} primary>
              Take the Scorecard <span style={{ fontSize: "14px" }}>→</span>
            </GoldButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Audience() {
  const personas = [
    {
      tag: "01 / FINANCE PRO",
      title: "The closer",
      body: "Brokerage, IB, F&I, banking. You sell other people\u2019s products and watch the spread go to someone else\u2019s P&L. You know how to close. You\u2019ve never built something that pays you while you sleep.",
      hook: "Build something you own.",
      accent: C.gold,
    },
    {
      tag: "02 / CORPORATE CLIMBER",
      title: "The next-promotion myth",
      body: "VP, Director, top 5%. You\u2019ve been told \u201Cone more level\u201D for the last 8 years. The compensation got bigger. The cage got smaller. Sundays got worse.",
      hook: "The next promotion isn\u2019t the answer.",
      accent: C.goldLight,
    },
    {
      tag: "03 / PRESENT PARENT",
      title: "The one who noticed",
      body: "Whether your kid is 4 or 14, they noticed. They asked why you always look tired. You said something to make it okay. It didn\u2019t make it okay.",
      hook: "Your time is the P&L.",
      accent: C.cream,
    },
  ];
  return (
    <section style={{ position: "relative", padding: "120px 24px", maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <Reveal>
          <Eyebrow>BUILT FOR</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <SerifTitle italic size={56} style={{ margin: "24px auto 0", maxWidth: "720px" }}>
            Three kinds of people read this far.
          </SerifTitle>
        </Reveal>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {personas.map((p, i) => (
          <Reveal key={p.tag} delay={120 * i}>
            <GlassCard accent={p.accent} style={{ height: "100%" }}>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "3px", color: p.accent, marginBottom: "20px" }}>
                {p.tag}
              </div>
              <SerifTitle size={32} italic style={{ marginBottom: "16px" }}>
                {p.title}
              </SerifTitle>
              <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, lineHeight: 1.65, marginBottom: "20px", fontWeight: 300 }}>
                {p.body}
              </p>
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: `1px solid ${C.border}`,
                  fontFamily: C.serif,
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: p.accent,
                }}
              >
                {p.hook}
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section style={{ position: "relative", padding: "120px 24px", maxWidth: "920px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <Reveal>
          <Eyebrow>WHO BUILT THIS</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <SerifTitle italic size={56} style={{ margin: "24px auto 0", maxWidth: "780px" }}>
            JJ. <span style={{ color: C.gold }}>Finance closer.</span> Father of 4.
            <br />
            Quietly building his exit in public.
          </SerifTitle>
        </Reveal>
      </div>

      <Reveal delay={260}>
        <div
          style={{
            position: "relative",
            padding: "48px 40px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "32px",
              fontSize: "80px",
              color: C.gold,
              fontFamily: C.serif,
              lineHeight: 1,
              opacity: 0.4,
            }}
          >
            \u201C
          </div>
          <p style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "clamp(17px, 1.8vw, 22px)", color: C.cream, lineHeight: 1.6, margin: "0 0 24px" }}>
            I made $230K a year and sat in my truck for 40 extra minutes on a Friday because I couldn&apos;t face the disappointment on my 7-year-old&apos;s face one more time. That was the night APEX was born. Not from a vision board. From a parking lot.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "24px", borderTop: `1px solid ${C.border}` }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: C.serif,
                fontWeight: 800,
                fontSize: "18px",
                color: C.bg,
              }}
            >
              JJ
            </div>
            <div>
              <div style={{ fontFamily: C.sans, fontSize: "14px", fontWeight: 600, color: C.cream }}>JJ Elisarraras</div>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "2px", color: C.textMuted }}>FOUNDER · APEX</div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={400} style={{ marginTop: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
          {[
            { v: 4, prefix: "", suffix: "", label: "Kids who notice" },
            { v: 230, prefix: "$", suffix: "K", label: "F&I salary" },
            { v: 6, prefix: "", suffix: "", label: "AI engine layers" },
            { v: 1, prefix: "$", suffix: "M", label: "Target by year 2" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "20px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                backdropFilter: "blur(12px)",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: C.serif, fontSize: "32px", fontWeight: 800, color: C.gold, lineHeight: 1, marginBottom: "8px" }}>
                <AnimatedNumber value={s.v} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "2px", color: C.textMuted, textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Products() {
  const tiers = [
    {
      name: "AI Income Toolkit",
      tag: "LAUNCH PRICE",
      price: "$47",
      original: "$97",
      desc: "Everything you need to generate your first $1K in AI-powered side income. Plug-and-play prompts, 30-day plan, email templates.",
      features: ["25+ plug-and-play AI prompts", "30-day content calendar", "Email automation templates", "Lifetime access + updates"],
      color: C.green,
      cta: "Get Instant Access",
    },
    {
      name: "AI Wealth Escape Plan",
      tag: "FOUNDING MEMBER",
      price: "$497",
      original: "$997",
      desc: "The 6-week system for high-earners to build AI-powered income. Self-paced video course built by a finance closer who escaped his own cuffs.",
      features: ["18 video lessons (6 modules)", "50+ AI prompt library", "Content & email templates", "Founding member pricing locked", "Self-paced lifetime access"],
      color: C.gold,
      featured: true,
      cta: "Reserve My Spot",
    },
    {
      name: "APEX Mastermind",
      tag: "FOUNDING MEMBER",
      price: "$5,000",
      original: "$8,000",
      desc: "12 weeks. 10 seats max. Weekly group coaching with JJ. Personalized escape plan, executed alongside the cohort.",
      features: ["Weekly 90-min group calls", "Private Slack with JJ + cohort", "1:1 monthly strategy session", "Personalized escape-plan review", "Lifetime access to recordings"],
      color: C.red,
      cta: "Apply for a Spot",
    },
  ];
  return (
    <section style={{ position: "relative", padding: "120px 24px", maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "72px" }}>
        <Reveal>
          <Eyebrow>THE PATH</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <SerifTitle italic size={56} style={{ margin: "24px auto 16px" }}>
            Three rungs. <span style={{ color: C.gold }}>Pick yours.</span>
          </SerifTitle>
        </Reveal>
        <Reveal delay={260}>
          <p style={{ fontFamily: C.sans, fontSize: "15px", color: C.textMuted, maxWidth: "560px", margin: "0 auto", fontWeight: 300, lineHeight: 1.6 }}>
            The Scorecard tells you which rung. You can also pick yourself.
          </p>
        </Reveal>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={140 * i}>
            <div
              style={{
                position: "relative",
                height: "100%",
                padding: "36px 28px",
                background: t.featured ? `linear-gradient(180deg, ${C.goldDim}, ${C.surface})` : C.surface,
                border: `1px solid ${t.featured ? `${t.color}50` : C.border}`,
                borderRadius: "10px",
                backdropFilter: "blur(16px)",
                boxShadow: t.featured ? `0 16px 64px ${t.color}20, 0 0 32px ${t.color}15` : "0 8px 24px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {t.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: "-1px",
                    left: "20px",
                    right: "20px",
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                    boxShadow: `0 0 16px ${t.color}80`,
                  }}
                />
              )}
              <div
                style={{
                  display: "inline-block",
                  alignSelf: "flex-start",
                  padding: "4px 12px",
                  borderRadius: "2px",
                  background: `${t.color}20`,
                  border: `1px solid ${t.color}40`,
                  fontFamily: C.mono,
                  fontSize: "8px",
                  letterSpacing: "3px",
                  color: t.color,
                  marginBottom: "20px",
                }}
              >
                {t.tag}
              </div>
              <SerifTitle size={28} style={{ marginBottom: "8px", color: C.cream }}>
                {t.name}
              </SerifTitle>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontFamily: C.serif, fontSize: "44px", fontWeight: 800, color: t.color, lineHeight: 1, textShadow: `0 0 24px ${t.color}40` }}>
                  {t.price}
                </span>
                <span style={{ fontFamily: C.mono, fontSize: "13px", color: C.textDim, textDecoration: "line-through" }}>{t.original}</span>
              </div>
              <p style={{ fontFamily: C.sans, fontSize: "14px", color: C.text, lineHeight: 1.6, margin: "0 0 24px", fontWeight: 300 }}>{t.desc}</p>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", paddingTop: "20px", borderTop: `1px solid ${C.border}`, marginBottom: "24px" }}>
                {t.features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: t.color, fontSize: "10px", marginTop: "4px" }}>◆</span>
                    <span style={{ fontFamily: C.sans, fontSize: "13px", color: C.cream, lineHeight: 1.45 }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href={SCORECARD_URL}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px 20px",
                  background: t.featured ? `linear-gradient(135deg, ${t.color}, ${t.color}DD)` : "transparent",
                  border: t.featured ? "none" : `1px solid ${t.color}60`,
                  borderRadius: "4px",
                  color: t.featured ? C.bg : t.color,
                  fontFamily: C.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: "pointer",
                  boxShadow: t.featured ? `0 8px 24px ${t.color}50` : "none",
                  transition: "all 0.2s",
                }}
              >
                {t.cta} <span style={{ fontSize: "12px" }}>→</span>
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Use the public MailerLite signup form share URL as a hosted fallback
    window.open(`${NEWSLETTER_FORM_URL}?email=${encodeURIComponent(email)}`, "_blank");
    setSubmitted(true);
  };
  return (
    <section style={{ position: "relative", padding: "120px 24px 100px", maxWidth: "780px", margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <Reveal>
          <Eyebrow>GET THE PLAYBOOK</Eyebrow>
        </Reveal>
        <Reveal delay={120}>
          <SerifTitle italic size={56} style={{ margin: "24px auto 16px" }}>
            One Sunday email.
            <br />
            <span style={{ color: C.gold }}>Real numbers. No fluff.</span>
          </SerifTitle>
        </Reveal>
        <Reveal delay={260}>
          <p style={{ fontFamily: C.sans, fontSize: "16px", color: C.cream, lineHeight: 1.65, maxWidth: "560px", margin: "0 auto 40px", fontWeight: 300 }}>
            Each Sunday I send one email breaking down exactly what I&apos;m doing, what worked, what didn&apos;t, and the AI tools that ran my week.
          </p>
        </Reveal>

        <Reveal delay={400}>
          {!submitted ? (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "440px", margin: "0 auto" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  padding: "16px 20px",
                  background: "rgba(7,8,11,0.7)",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  color: C.cream,
                  fontFamily: C.sans,
                  fontSize: "15px",
                  outline: "none",
                  textAlign: "center",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "16px 28px",
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  border: "none",
                  borderRadius: "4px",
                  color: C.bg,
                  fontFamily: C.mono,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: `0 8px 32px ${C.goldGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                Subscribe to the Sunday email
              </button>
              <p style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, letterSpacing: "1px", marginTop: "8px" }}>
                NO SPAM · UNSUBSCRIBE ANY TIME
              </p>
            </form>
          ) : (
            <div
              style={{
                padding: "32px",
                background: C.goldDim,
                border: `1px solid ${C.gold}40`,
                borderRadius: "8px",
                maxWidth: "440px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: C.bg,
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
              <p style={{ fontFamily: C.serif, fontStyle: "italic", fontSize: "18px", color: C.cream, margin: 0 }}>
                Check your inbox. First email Sunday.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ position: "relative", padding: "60px 24px 40px", borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "32px", marginBottom: "32px" }}>
          <div>
            <div style={{ fontFamily: C.serif, fontWeight: 800, fontSize: "20px", color: C.gold, marginBottom: "4px", textShadow: `0 0 16px ${C.goldGlow}` }}>
              APEX
            </div>
            <div style={{ fontFamily: C.mono, fontSize: "9px", letterSpacing: "2px", color: C.textDim }}>
              AUTONOMOUS PROFIT ENGINE & EXECUTION
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px" }}>
            <a href={SCORECARD_URL} style={footLink}>Scorecard</a>
            <a href="#" style={footLink}>Newsletter</a>
            <a href={CALENDLY_URL} style={footLink}>Discovery Call</a>
          </div>
        </div>
        <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${C.border}, transparent)`, margin: "0 0 24px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, letterSpacing: "2px" }}>
            © 2026 APEX · BUILT BY JJ · @apex
          </div>
          <div style={{ fontFamily: C.mono, fontSize: "9px", color: C.textDim, letterSpacing: "2px" }}>
            BUILD INCOME THAT DOESN&apos;T REQUIRE YOUR TIME.
          </div>
        </div>
      </div>
    </footer>
  );
}

const footLink = {
  fontFamily: C.mono,
  fontSize: "10px",
  color: C.cream,
  textDecoration: "none",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

// ─── App ──────────────────────────────────────────────────────────────────

export default function App() {
  const scrollP = useScrollProgress();
  const mouse = useMouse();
  const { w: vw, h: vh } = useViewport();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1200px 800px at 50% -10%, ${C.bgGlow}, ${C.bg} 60%) ${C.bg}`,
        color: C.text,
        fontFamily: C.sans,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ScrollProgress p={scrollP} />
      <Orbs />
      <CursorGlow x={mouse.x} y={mouse.y} hasMoved={mouse.hasMoved} />
      <GrainOverlay />
      <Nav scrolled={scrolled} />

      <main style={{ position: "relative", zIndex: 2 }}>
        <Hero mouseX={mouse.x} mouseY={mouse.y} vw={vw} vh={vh} />
        <Marquee />
        <Problem />
        <ScorecardSection />
        <Audience />
        <About />
        <Products />
        <Newsletter />
      </main>

      <Footer />

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: ${C.bg}; }
        ::selection { background: ${C.gold}; color: ${C.bg}; }
        a:hover { opacity: 0.85; }

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
        @keyframes pulseR {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }

        @media (max-width: 768px) {
          h1 { letter-spacing: -0.01em !important; }
        }
      `}</style>
    </div>
  );
}
