"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

const COLORS = {
  yellow: "#FFD600",
  orange: "#FF6B00",
  red: "#FF1744",
  purple: "#7B2FFF",
  blue: "#0057FF",
  indigo: "#3D00C8",
  pink: "#FF3CAC",
} as const;

const G = {
  solar: "linear-gradient(135deg,#FFD600 0%,#FF6B00 40%,#FF1744 100%)",
  cosmic: "linear-gradient(135deg,#7B2FFF 0%,#FF3CAC 50%,#FF6B00 100%)",
  aurora: "linear-gradient(135deg,#0057FF 0%,#7B2FFF 50%,#FF3CAC 100%)",
  divine: "linear-gradient(135deg,#FFD600 0%,#7B2FFF 50%,#0057FF 100%)",
  flame: "linear-gradient(135deg,#FF1744 0%,#FF6B00 50%,#FFD600 100%)",
  jade: "linear-gradient(135deg,#00C87A 0%,#0057FF 100%)",
} as const;

type PostType = "move" | "spirit" | "community" | "wellness";
type AgeTier = "young_adult" | "minor";
type TabId = "feed" | "voice" | "move" | "world" | "you";

interface Persona {
  name: string;
  age: number;
  ageTier: AgeTier;
  location: string;
  avatar: string;
  gradient: string;
}

interface FeedPost {
  id: number;
  user: string;
  location: string;
  avatar: string;
  color: string;
  time: string;
  ageTier: AgeTier;
  type: PostType;
  content: string;
  likes: number;
  replies: number;
  badge: string;
  comments: string[];
}

interface VoiceRoom {
  id: number;
  title: string;
  topic: string;
  speakers: number;
  listeners: number;
  live: boolean;
  gradient: string;
  speakerAvatars: string[];
  roomType: "all_ages_moderated" | "adults_only";
  hasAiHost: boolean;
}

interface WorldLabsExperience {
  id: "prayer-room" | "identity-journey" | "campfire";
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  audience: string;
  ageNote: string | null;
  description: string;
}

const SCRIPTURES = [
  { verse: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { verse: "For I know the plans I have for you, declares the Lord — plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { verse: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9" },
  { verse: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5-6" },
  { verse: "The Lord is my light and my salvation — whom shall I fear?", ref: "Psalm 27:1" },
  { verse: "Those who hope in the Lord will renew their strength.", ref: "Isaiah 40:31" },
  { verse: "Be transformed by the renewing of your mind.", ref: "Romans 12:2" },
];

const PERSONAS: Record<AgeTier, Persona> = {
  young_adult: { name: "Jordan M.", age: 21, ageTier: "young_adult", location: "Brooklyn", avatar: "J", gradient: G.solar },
  minor: { name: "Priya S.", age: 17, ageTier: "minor", location: "Queens", avatar: "P", gradient: G.cosmic },
};

const ALL_POSTS: FeedPost[] = [
  { id: 1, user: "Jordan M.", location: "Brooklyn, NY", avatar: "J", color: G.solar, time: "2h ago", ageTier: "young_adult", type: "move", content: "Morning run complete 🏃‍♂️", likes: 84, replies: 12, badge: "🔥 Streak 30", comments: ["That’s commitment 🔥", "Same energy every morning!"] },
  { id: 2, user: "Aaliyah R.", location: "Harlem, NY", avatar: "A", color: G.aurora, time: "4h ago", ageTier: "young_adult", type: "spirit", content: "Philippians 4:13 has been grounding me.", likes: 143, replies: 31, badge: "✨ Spirit Guide", comments: ["Yes! God’s been moving.", "He never leaves us ❤️"] },
  { id: 3, user: "Marcus T.", location: "Bronx, NY", avatar: "M", color: G.flame, time: "6h ago", ageTier: "young_adult", type: "community", content: "First Sanctuary room session today.", likes: 201, replies: 48, badge: "🎙️ Voice Leader", comments: ["Purpose over pressure 🙏"] },
  { id: 4, user: "Priya S.", location: "Queens, NY", avatar: "P", color: G.cosmic, time: "8h ago", ageTier: "minor", type: "wellness", content: "Yoga + evening devotional = everything.", likes: 67, replies: 19, badge: "🌱 Rising Star", comments: ["Day 8 gang! 🌱"] },
];

const VOICE_ROOMS: VoiceRoom[] = [
  { id: 1, title: "Morning Glory", topic: "Faith & Identity", speakers: 3, listeners: 47, live: true, gradient: G.solar, speakerAvatars: ["J", "A", "D"], roomType: "all_ages_moderated", hasAiHost: true },
  { id: 2, title: "The Refinery", topic: "Purpose in Your 20s", speakers: 5, listeners: 112, live: true, gradient: G.aurora, speakerAvatars: ["M", "K", "T", "R", "L"], roomType: "adults_only", hasAiHost: true },
  { id: 3, title: "Youth Sanctuary", topic: "Teen Identity & Pressure", speakers: 2, listeners: 28, live: true, gradient: G.cosmic, speakerAvatars: ["P", "Z"], roomType: "all_ages_moderated", hasAiHost: false },
];

const WORLD_LABS_EXPERIENCES: WorldLabsExperience[] = [
  { id: "prayer-room", title: "The Prayer Room", subtitle: "Guided Meditation Space", icon: "🕊️", gradient: G.aurora, audience: "All ages", ageNote: null, description: "A serene 3D spatial environment for focused prayer." },
  { id: "identity-journey", title: "Identity Journey", subtitle: "Self-Discovery (16–19)", icon: "🧭", gradient: G.divine, audience: "Ages 16–19", ageNote: "Designed for adolescent identity formation.", description: "A guided narrative experience across five chapters." },
  { id: "campfire", title: "Community Campfire", subtitle: "Spatial Social Gathering", icon: "🔥", gradient: G.flame, audience: "18+ at launch", ageNote: "Adults only at launch.", description: "A social voice space with abstract avatar lights." },
];

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes float { from { transform:translateY(0) scale(1); } to { transform:translateY(-28px) scale(1.15); } }
    @keyframes shimmer { 0%,100%{ opacity:.5; } 50%{ opacity:1; } }
  `}</style>
);

function UnicornLogo({ size = 34 }: { size?: number }) {
  return <div style={{ fontSize: size * 0.85 }}>🦄</div>;
}

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        size: Math.random() * 7 + 3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 7 + 5,
        delay: Math.random() * 4,
        color: Object.values(COLORS)[i % Object.values(COLORS).length],
      })),
    [],
  );

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.map((p) => (
        <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0.12, animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate` }} />
      ))}
    </div>
  );
}

function Pill({ text, color, bg }: { text: string; color?: string; bg?: string }) {
  return <div style={{ fontSize: 9, padding: "3px 8px", borderRadius: 20, background: bg ?? "rgba(255,255,255,.06)", color: color ?? "rgba(255,255,255,.5)", fontFamily: "'Space Mono',monospace", letterSpacing: 0.8 }}>{text}</div>;
}

function Header({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ padding: "18px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <UnicornLogo size={30} />
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 21, background: G.divine, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{title}</div>
          {sub ? <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontFamily: "'Space Mono',monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>{sub}</div> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

function ScriptureBanner() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SCRIPTURES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, []);
  const s = SCRIPTURES[idx];

  return (
    <div style={{ margin: "0 14px 14px", borderRadius: 16, background: "linear-gradient(135deg,rgba(123,47,255,.18),rgba(255,60,172,.1))", border: "1px solid rgba(123,47,255,.35)", padding: "14px 16px" }}>
      <div style={{ fontSize: 9, color: COLORS.yellow, fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 8 }}>✦ DAILY WORD</div>
      <div style={{ transition: "opacity .4s", opacity: visible ? 1 : 0 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13.5, color: "#fff", lineHeight: 1.65, fontStyle: "italic" }}>“{s.verse}”</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 6 }}>— {s.ref}</div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [showComments, setComments] = useState(false);
  const typeGradient: Record<PostType, string> = { move: G.flame, spirit: G.aurora, community: G.divine, wellness: G.cosmic };
  const typeLabel: Record<PostType, string> = { move: "💪 Move", spirit: "✝️ Spirit", community: "🌍 Community", wellness: "🌿 Wellness" };

  return (
    <div style={{ margin: "0 14px 12px", borderRadius: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
      <div style={{ height: 3, background: typeGradient[post.type] }} />
      <div style={{ padding: "14px 14px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: post.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{post.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 600, color: "#fff", fontSize: 13.5 }}>{post.user}</span>
              {post.ageTier === "minor" ? <Pill text="🛡️ 16-17" color={COLORS.purple} bg="rgba(123,47,255,.15)" /> : null}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{post.location} · {post.time}</div>
          </div>
          <Pill text={typeLabel[post.type]} />
        </div>

        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.85)", lineHeight: 1.72, marginBottom: 12 }}>{post.content}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setLiked((l) => !l)} style={{ background: "none", border: "none", cursor: "pointer", color: liked ? COLORS.red : "rgba(255,255,255,.4)" }}>❤️ {post.likes + (liked ? 1 : 0)}</button>
          <button onClick={() => setComments((c) => !c)} style={{ background: "none", border: "none", cursor: "pointer", color: showComments ? COLORS.blue : "rgba(255,255,255,.4)" }}>💬 {post.replies}</button>
          <div style={{ flex: 1 }} />
          <Pill text={post.badge} color={COLORS.yellow} bg="rgba(255,214,0,.08)" />
        </div>
        {showComments ? <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 12 }}>{post.comments.map((c) => <div key={c} style={{ fontSize: 12, color: "rgba(255,255,255,.6)", padding: "6px 0" }}>💬 {c}</div>)}</div> : null}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (p: Persona) => void }) {
  const [step, setStep] = useState<"welcome" | "auth" | "dob" | "minor-gate">("welcome");
  const [dob, setDob] = useState("");
  const [dobError, setDobError] = useState("");

  function handleDob() {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age -= 1;

    if (!dob || Number.isNaN(birthDate.getTime())) {
      setDobError("Please enter a valid date.");
      return;
    }
    if (age < 16) {
      setDobError("Diiff is for ages 16–25. You must be at least 16 to join.");
      return;
    }
    if (age > 25) {
      setDobError("Diiff is designed for ages 16–25.");
      return;
    }

    if (age <= 17) setStep("minor-gate");
    else onLogin(PERSONAS.young_adult);
  }

  if (step === "welcome") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}><div><UnicornLogo size={56} /><button onClick={() => setStep("auth")} style={{ width: "100%", padding: "16px", borderRadius: 20, border: "none", cursor: "pointer", background: G.cosmic, color: "#fff", marginTop: 16 }}>Get Started</button></div></div>;
  if (step === "auth") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}><button onClick={() => setStep("dob")} style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff" }}>Continue with Google</button></div>;
  if (step === "dob") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}><div><input type="date" value={dob} onChange={(e) => { setDob(e.target.value); setDobError(""); }} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "#fff", colorScheme: "dark" }} />{dobError ? <div style={{ color: COLORS.red, fontSize: 12 }}>{dobError}</div> : null}<button onClick={handleDob} style={{ width: "100%", marginTop: 10, padding: "14px", borderRadius: 16, border: "none", background: G.cosmic, color: "#fff" }}>Continue</button></div></div>;
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}><button onClick={() => onLogin(PERSONAS.minor)} style={{ padding: "14px 20px", borderRadius: 16, border: "none", background: G.divine, color: "#fff" }}>Send Consent Request</button></div>;
}

function FeedTab({ viewerPersona }: { viewerPersona: Persona }) {
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const visiblePosts = ALL_POSTS.filter((p) => (filter === "all" ? true : p.type === filter));
  return (
    <div>
      <Header title="Diiff" sub="Your Daily Refinement" />
      <ScriptureBanner />
      <div style={{ display: "flex", gap: 7, padding: "0 14px 12px", overflowX: "auto" }}>
        {["all", "spirit", "move", "community", "wellness"].map((f) => <button key={f} onClick={() => setFilter(f as "all" | PostType)} style={{ padding: "6px 13px", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: filter === f ? G.cosmic : "rgba(255,255,255,.04)", color: "#fff" }}>{f}</button>)}
      </div>
      {visiblePosts.map((p) => <PostCard key={p.id} post={p} />)}
      {viewerPersona.ageTier === "minor" ? <div style={{ margin: "0 14px", color: COLORS.purple, fontSize: 11 }}>🛡️ Minor mode active.</div> : null}
    </div>
  );
}

function VoiceTab({ viewerPersona }: { viewerPersona: Persona }) {
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const viewerIsMinor = viewerPersona.ageTier === "minor";
  const activeRoom = VOICE_ROOMS.find((r) => r.id === activeRoomId) ?? null;

  const canJoin = (room: VoiceRoom) => room.live && !(viewerIsMinor && room.roomType === "adults_only");

  if (activeRoom) {
    return <div><Header title="Sanctuary" sub="Live Now" /><div style={{ margin: "0 14px", color: "#fff" }}>{activeRoom.title}<button onClick={() => setActiveRoomId(null)} style={{ marginLeft: 8 }}>Leave</button></div></div>;
  }

  return <div><Header title="Sanctuary" sub="Voice Rooms" />{VOICE_ROOMS.filter((r) => (viewerIsMinor ? r.roomType !== "adults_only" : true)).map((room) => <div key={room.id} onClick={() => { if (canJoin(room)) setActiveRoomId(room.id); }} style={{ margin: "0 14px 10px", opacity: canJoin(room) ? 1 : 0.5, color: "#fff" }}>{room.title} · 🎤 {room.speakers} · 👂 {room.listeners}</div>)}</div>;
}

function MoveTab() {
  const [done, setDone] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: false, 3: false });
  const workouts = ["Morning Devotional Run", "Strength & Scripture", "Mindful Yoga Flow", "Evening Walk & Worship"];
  return <div><Header title="Move" sub="Body & Spirit Training" /><div style={{ margin: "0 14px 14px", borderRadius: 18, background: G.solar, padding: "18px 20px" }}><div style={{ fontSize: 10 }}>CURRENT STREAK</div><div style={{ fontSize: 52 }}>30</div></div>{workouts.map((w, i) => <div key={w} style={{ margin: "0 14px 8px", color: "#fff", opacity: done[i] ? 0.6 : 1 }}><button onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}>{done[i] ? "✓" : "▷"}</button> {w}</div>)}</div>;
}

function WorldTab({ viewerPersona }: { viewerPersona: Persona }) {
  const [activeExp, setActiveExp] = useState<WorldLabsExperience["id"] | null>(null);
  const [praying, setPraying] = useState(false);
  const [prayerTime, setPrayerTime] = useState(0);
  const [journeyStep, setJourneyStep] = useState(0);

  useEffect(() => {
    if (!praying) return;
    const t = setInterval(() => setPrayerTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [praying]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (activeExp === "prayer-room") return <div style={{ padding: 24, color: "#fff" }}>Prayer timer: {formatTime(prayerTime)} <button onClick={() => setPraying((p) => !p)}>{praying ? "Pause" : "Begin"}</button> <button onClick={() => { setActiveExp(null); setPraying(false); setPrayerTime(0); }}>Exit</button></div>;
  if (activeExp === "identity-journey") return <div style={{ padding: 24, color: "#fff" }}>Identity chapter {journeyStep + 1} <button onClick={() => setJourneyStep((s) => Math.min(s + 1, 4))}>Next</button> <button onClick={() => setActiveExp(null)}>Back</button></div>;
  if (activeExp === "campfire" && viewerPersona.ageTier === "minor") return <div style={{ padding: 24, color: "#fff" }}>Adults only. <button onClick={() => setActiveExp(null)}>Back</button></div>;
  if (activeExp === "campfire") return <div style={{ padding: 24, color: "#fff" }}>Campfire preview <button onClick={() => setActiveExp(null)}>Leave</button></div>;

  return <div><Header title="World" sub="Spatial Experiences · Phase 3" />{WORLD_LABS_EXPERIENCES.map((exp) => <div key={exp.id} style={{ margin: "0 14px 12px", color: "#fff" }}><div>{exp.icon} {exp.title}</div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{exp.description}</div><button onClick={() => setActiveExp(exp.id)}>Open Preview</button></div>)}</div>;
}

function YouTab({ viewerPersona }: { viewerPersona: Persona }) {
  const [notifs, setNotifs] = useState({ morning: true, evening: true, workout: false, scripture: true });
  return <div><Header title="Your Story" sub="Profile · Identity Card" /><div style={{ margin: "0 14px", color: "#fff" }}>{viewerPersona.name} · Age {viewerPersona.age} · Streak 30 🔥</div>{Object.entries(notifs).map(([k, v]) => <button key={k} onClick={() => setNotifs((n) => ({ ...n, [k]: !v }))} style={{ margin: "8px 14px" }}>{k}: {v ? "on" : "off"}</button>)}</div>;
}

function Nav({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  const tabs: Array<{ id: TabId; icon: string; label: string }> = [
    { id: "feed", icon: "✦", label: "Feed" },
    { id: "voice", icon: "🎙️", label: "Rooms" },
    { id: "move", icon: "⚡", label: "Move" },
    { id: "world", icon: "🌍", label: "World" },
    { id: "you", icon: "◈", label: "You" },
  ];

  return <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,0,20,.95)", borderTop: "1px solid rgba(123,47,255,.25)", display: "flex", justifyContent: "space-around", padding: "10px 0 20px" }}>{tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: tab === t.id ? COLORS.yellow : "rgba(255,255,255,.35)" }}>{t.icon}<div style={{ fontSize: 9 }}>{t.label}</div></button>)}</nav>;
}

export default function DemoPage() {
  const [tab, setTab] = useState<TabId>("feed");
  const [loggedIn, setLoggedIn] = useState(false);
  const [viewerPersona, setViewerPersona] = useState<Persona | null>(null);

  function handleLogin(persona: Persona) {
    setViewerPersona(persona);
    setLoggedIn(true);
    setTab("feed");
  }

  if (!loggedIn || !viewerPersona) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", fontFamily: "'DM Sans',sans-serif", background: "#0a0012" }}>
        <GlobalStyles />
        <Particles />
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const tabs: Record<TabId, ReactNode> = {
    feed: <FeedTab viewerPersona={viewerPersona} />,
    voice: <VoiceTab viewerPersona={viewerPersona} />,
    move: <MoveTab />,
    world: <WorldTab viewerPersona={viewerPersona} />,
    you: <YouTab viewerPersona={viewerPersona} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0012", maxWidth: 420, margin: "0 auto", position: "relative", overflowX: "hidden", fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />
      <Particles />
      {viewerPersona.ageTier === "minor" ? <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(123,47,255,.12)", borderBottom: "1px solid rgba(123,47,255,.2)", padding: "5px 14px", fontSize: 9, color: COLORS.purple }}>🛡️ MINOR MODE — Age 16-17 restrictions active</div> : null}
      <div style={{ position: "relative", zIndex: 1, paddingBottom: 80, paddingTop: viewerPersona.ageTier === "minor" ? 28 : 0 }}>{tabs[tab]}</div>
      <Nav tab={tab} setTab={setTab} />
    </div>
  );
}
