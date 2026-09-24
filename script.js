"use strict";

/* =========================================================
   CONFIG — edit these values
   ========================================================= */
const CONFIG = {
  name: "Md. Ibnul Bin Kader Arnub",
  host: "sec-lab",
  email: "ibnul.ec@gmail.com",
  linkedin: "https://linkedin.com/in/rnb2kool",
  github: "https://github.com/rnb2kool",   // <-- change
  cvFile: "cv.pdf",                             // upload your CV to the repo with this name
  // Contact form delivery. Create a free form at https://formspree.io and paste its endpoint,
  // e.g. "https://formspree.io/f/abcdwxyz". Leave empty to fall back to the visitor's email app.
  formspreeEndpoint: "",
  // Optional: URL of your own serverless AI proxy (see worker.js). Leave empty to use the
  // built-in offline assistant, which answers from the knowledge base below.
  aiEndpoint: ""
};

/* =========================================================
   DOM + helpers
   ========================================================= */
const $out = document.getElementById("output");
const $in = document.getElementById("cmd");
const $prompt = document.getElementById("prompt");
const $term = document.getElementById("terminal");

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const scrollDown = () => { $term.scrollTop = $term.scrollHeight; };

function print(html = "", cls = "") {
  const div = document.createElement("div");
  div.className = ("line " + cls).trim();
  div.innerHTML = html;
  $out.appendChild(div);
  scrollDown();
  return div;
}

let mode = "shell";        // shell | ai | contact
let busy = false;
let skipBoot = false;
const history = [];
let hIndex = 0;
const contact = { step: 0, data: {} };
const aiHistory = [];

async function typeOut(text, cls = "ai") {
  const div = print("", cls);
  busy = true;
  for (let i = 0; i < text.length; i++) {
    div.textContent += text[i];
    if (i % 3 === 0) { scrollDown(); await sleep(6); }
  }
  scrollDown();
  busy = false;
  return div;
}

function setPrompt() {
  const contactLabels = ["name", "email", "message", "send? (y/n)"];
  $prompt.innerHTML = {
    shell: `<span class="p-user">guest</span>@<span class="p-host">${CONFIG.host}</span>:<span class="p-path">~</span>$`,
    ai: `<span class="p-ai">ai@arnub</span> &gt;`,
    contact: `<span class="p-warn">${contactLabels[contact.step]}</span> &gt;`
  }[mode];
}

function echoLine(raw) {
  print(`${$prompt.innerHTML} ${esc(raw)}`);
}

const link = (url, label) =>
  `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label || url)}</a>`;
const cmdLink = (name) => `<a class="cmd-name" data-cmd="${name}">${name}</a>`;

/* =========================================================
   Content
   ========================================================= */
const BANNER = String.raw`
    _    ____  _   _ _   _ ____
   / \  |  _ \| \ | | | | | __ )
  / _ \ | |_) |  \| | | | |  _ \
 / ___ \|  _ <| |\  | |_| | |_) |
/_/   \_\_| \_\_| \_|\___/|____/
`;

function showBanner() {
  print(esc(BANNER), "banner");
  print("[ ARNUB :: SEC-LAB ]", "banner-sm");
  print(`<span class="h">${CONFIG.name}</span>
<span class="dim">PhD Researcher in Cybersecurity</span>

Welcome, guest. Type ${cmdLink("help")} to see available commands, or ${cmdLink("ask")} to talk to my AI assistant.
`);
}

const FILES = {
  "about.txt": "whoami",
  "experience.log": "experience",
  "education.md": "education",
  "skills.json": "skills",
  "certs.txt": "certs",
  "research.md": "research",
  "achievements.txt": "achievements",
  "contact.sh": "contact",
  "cv.pdf": "cv"
};

/* =========================================================
   Commands
   ========================================================= */
const COMMANDS = {
  help: {
    desc: "List available commands",
    run() {
      const rows = Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([n, c]) => `  <a class="cmd-name" data-cmd="${n}">${n.padEnd(13)}</a><span class="dim">${c.desc}</span>`)
        .join("\n");
      print(`<span class="h">Available commands</span>
${rows}

<span class="dim">Tips: ↑/↓ history · Tab autocomplete · Ctrl+L clear · Ctrl+C cancel · click any command</span>`);
    }
  },

  whoami: {
    desc: "Who is behind this terminal",
    run() {
      print(`<span class="dim">guest — but this machine belongs to:</span>

<span class="h">${CONFIG.name}</span>
  role      PhD Researcher, Computer Science @ Victoria University of Wellington
  focus     Adversarial ML · CAN bus intrusion detection · Detection engineering
  previous  7+ years in banking cybersecurity (SOC, CTI, IT risk & compliance)
  location  Wellington, New Zealand
  status    <span class="ok">● open to cybersecurity roles in NZ</span> (SOC, threat detection, risk & compliance)`);
    }
  },

  experience: {
    desc: "Professional experience",
    run() {
      print(`<span class="h">── Experience ──────────────────────────────</span>

<span class="accent">BRAC Bank PLC</span>  <span class="dim">Feb 2025 – Aug 2025</span>
Associate Manager — Cyber Threat Intelligence & SOC
  › 24x7 Level 2 SOC monitoring, incident investigation and root cause analysis
    across SIEM, SOAR, XDR and honeypot platforms
  › Built new detection use cases; improved correlation logic and alert quality,
    reducing analyst workload
  › Threat hunting, proactive vulnerability analysis, ISO/IEC 27001 audit evidence

<span class="accent">Islami Bank Bangladesh PLC</span>  <span class="dim">Dec 2019 – Feb 2025</span>
Officer — Information & Risk Management Division
  › Enterprise IT risk assessments across 141+ applications, systems and servers
  › Supported ISO/IEC 27001, PCI DSS, third-party, PwC and Bangladesh Bank audits
  › VAPT of web apps, mobile apps and network infrastructure
  › Implemented IBM QRadar SIEM; led ISO 27001 policy alignment & PCI DSS initiatives
  › Dark Web exposure and threat intelligence monitoring

<span class="accent">Suprov Spinning Limited</span>  <span class="dim">Jun 2017 – Mar 2019</span>
Assistant Engineer & IT Officer
  › IT support across hardware, software and networks; inventory & usage reporting`);
    }
  },

  education: {
    desc: "Academic background",
    run() {
      print(`<span class="h">── Education ───────────────────────────────</span>
  PhD, Computer Science          Victoria University of Wellington   2025 – present
  MBA, Finance                   Bangladesh University of Professionals   CGPA 3.84
  M.Sc. Engg., EEE               American International University-Bangladesh   CGPA 3.81
  B.Sc., EEE                     American International University-Bangladesh   CGPA 3.65`);
    }
  },

  skills: {
    desc: "Technical skills & tooling",
    run() {
      print(`<span class="h">── Skills ──────────────────────────────────</span>
<span class="accent">SIEM / SOAR</span>     IBM QRadar · Splunk · LogRhythm · Wazuh/ELK · Swimlane SOAR
<span class="accent">EDR / XDR</span>       CrowdStrike · Trellix
<span class="accent">Network</span>         Palo Alto NGFW · Fortinet · Zscaler · Forcepoint DLP
<span class="accent">VAPT</span>            Burp Suite · OWASP ZAP · Nessus · Qualys · OpenVAS · Acunetix · HCL AppScan · MobSF
<span class="accent">Threat Intel</span>    Mandiant · Cyble · honeypots · Dark Web monitoring
<span class="accent">Cloud</span>           AWS · Azure
<span class="accent">GRC</span>             ISO/IEC 27001 · PCI DSS · IT risk assessment · audit support
<span class="accent">Code / Research</span> Python · C/C++ · machine learning · CARLA simulator · VMware ESXi`);
    }
  },

  certs: {
    desc: "Certifications",
    run() {
      const list = [
        "AWS Certified Solutions Architect – Associate",
        "ISO/IEC 27001 Lead Auditor – PECB",
        "ISO/IEC 27001:2022 Lead Implementer",
        "CEH (Master) – EC-Council",
        "Certified SOC Analyst – EC-Council",
        "C)PTE – Mile2",
        "RHCSA – Red Hat",
        "CRPO – EU Cyber Academy",
        "CNSP – The SecOps Group",
        "APIsec Certified Practitioner",
        "Oracle Cloud Infrastructure Foundations",
        "ISO/IEC 20000 ITSM Associate"
      ];
      print(`<span class="h">── Certifications ──────────────────────────</span>\n` +
        list.map((c) => `  <span class="ok">[✔]</span> ${c}`).join("\n"));
    }
  },

  research: {
    desc: "Current PhD research",
    run() {
      print(`<span class="h">── Research ────────────────────────────────</span>
<span class="accent">Adversarial robustness of intrusion detection for autonomous vehicles</span>

Modern vehicles talk over the CAN bus — a protocol with no built-in authentication.
ML-based intrusion detection systems (IDS) can spot malicious CAN traffic, but they
can themselves be fooled by carefully crafted adversarial inputs.

My PhD at Victoria University of Wellington studies:
  › adversarial machine learning attacks against CAN bus IDS
  › how to make in-vehicle detection robust to those attacks
  › intrusion detection & prevention for autonomous vehicles using the
    CARLA simulator, machine learning and sensor fusion

Want to collaborate? Run ${cmdLink("contact")}.`);
    }
  },

  achievements: {
    desc: "Awards & scholarships",
    run() {
      print(`<span class="h">── Achievements ────────────────────────────</span>
  🏆 Wellington Doctoral Scholarship
  🏆 ISACA Digital Trust Scholarship
  🏆 Cum Laude Award
  🏆 Dean's Award
  🏆 4th Place — Smart EV Project (out of 165 groups)

<span class="h">── Affiliations ────────────────────────────</span>
  IEEE NZ Central Section · IEEE VTS & ITSS Member · IEEE Young Professionals`);
    }
  },

  ask: {
    desc: "Chat with ARNUB-AI (e.g. ask what is your research?)",
    async run(args) {
      if (args.length) await answer(args.join(" "));
      else startAI();
    }
  },

  contact: {
    desc: "Send me a message (interactive)",
    run() { startContact(); }
  },

  socials: {
    desc: "Email, LinkedIn, GitHub",
    run() {
      print(`  email     ${link("mailto:" + CONFIG.email, CONFIG.email)}
  linkedin  ${link(CONFIG.linkedin)}
  github    ${link(CONFIG.github)}`);
    }
  },

  cv: {
    desc: "Open my CV (PDF)",
    run() {
      print(`Opening ${link(CONFIG.cvFile, CONFIG.cvFile)} ...`, "dim");
      window.open(CONFIG.cvFile, "_blank", "noopener");
    }
  },

  ls: {
    desc: "List files",
    run() {
      print(Object.keys(FILES).map((f) => `<span class="accent">${f}</span>`).join("   "));
    }
  },

  cat: {
    desc: "Read a file (e.g. cat about.txt)",
    run(args) {
      const f = args[0];
      if (!f) return print("usage: cat &lt;file&gt;  — try " + cmdLink("ls"), "warn");
      const target = FILES[f];
      if (!target) return print(`cat: ${esc(f)}: No such file or directory`, "err");
      COMMANDS[target].run([]);
    }
  },

  theme: {
    desc: "Switch colour: green | amber | cyan | red",
    run(args) {
      const t = (args[0] || "").toLowerCase();
      const themes = ["green", "amber", "cyan", "red"];
      if (!themes.includes(t)) return print(`usage: theme &lt;${themes.join(" | ")}&gt;`, "warn");
      if (t === "green") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = t;
      refreshMatrixColor();
      print(`Theme set to ${t}.`, "ok");
    }
  },

  history: {
    desc: "Show command history",
    run() {
      print(history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${esc(h)}`).join("\n") || "(empty)", "dim");
    }
  },

  banner: { desc: "Show the banner", run: showBanner },

  date: { desc: "Current date & time", run() { print(new Date().toString()); } },

  echo: { desc: "Print text", run(args) { print(esc(args.join(" "))); } },

  clear: { desc: "Clear the screen", run() { $out.innerHTML = ""; } },

  /* ---- hidden easter eggs ---- */
  sudo: {
    hidden: true,
    run(args) {
      if (args.join(" ").toLowerCase() === "hire-me" || args.join(" ").toLowerCase() === "hire arnub") {
        print(`<span class="ok">[sudo] access granted.</span>
Excellent decision. Initiating ${cmdLink("contact")} sequence...`);
        setTimeout(startContact, 600);
      } else {
        print("guest is not in the sudoers file. This incident will be reported. 👀", "err");
      }
    }
  },
  rm: { hidden: true, run() { print("Nice try. Integrity monitoring blocked that. 🛡️", "err"); } },
  exit: { hidden: true, run() { print("There is no escape. Try " + cmdLink("contact") + " instead 😉", "dim"); } },
  pwd: { hidden: true, run() { print("/home/guest"); } },
  hack: {
    hidden: true,
    async run() {
      busy = true;
      for (const s of ["Scanning ports...", "Bypassing firewall...", "Escalating privileges...", "Access denied. Just kidding — ethical hackers only here. 🙂"]) {
        print(s, s.startsWith("Access") ? "warn" : "dim");
        await sleep(450);
      }
      busy = false;
    }
  }
};

function notFound(name) {
  const guess = Object.keys(COMMANDS).find((c) => !COMMANDS[c].hidden && (c.startsWith(name) || name.startsWith(c)));
  print(`command not found: ${esc(name)}` + (guess ? ` — did you mean ${cmdLink(guess)}?` : `. Type ${cmdLink("help")}.`), "err");
}

/* =========================================================
   AI assistant
   ========================================================= */
const KB = [
  {
    keys: ["hello", "hi", "hey", "kia ora", "greetings", "yo"],
    answer: "Kia ora! I'm ARNUB-AI. Ask me about Arnub's research, experience, skills, certifications or availability."
  },
  {
    keys: ["who", "about", "yourself", "introduce", "summary", "arnub"],
    answer: "Arnub (Md. Ibnul Bin Kader Arnub) is a PhD researcher in Computer Science at Victoria University of Wellington, working on the security of intrusion detection for autonomous vehicles. Before that he spent 7+ years in banking cybersecurity — SOC operations, cyber threat intelligence, IT risk and compliance."
  },
  {
    keys: ["research", "phd", "thesis", "can bus", "bus", "ids", "adversarial", "vehicle", "automotive", "autonomous", "car", "carla", "machine", "ml"],
    answer: "His PhD studies adversarial machine learning attacks against CAN bus intrusion detection systems. The CAN bus has no built-in authentication, so ML-based IDS are used to spot malicious traffic — but they can be fooled by crafted inputs. He investigates those attacks and how to make in-vehicle detection robust, using the CARLA simulator, machine learning and sensor fusion."
  },
  {
    keys: ["experience", "work", "worked", "bank", "brac", "islami", "soc", "career", "previous", "background"],
    answer: "Most recently he was Associate Manager, Cyber Threat Intelligence & SOC at BRAC Bank (2025): Level 2 SOC monitoring, incident investigation, detection use-case development and threat hunting. Before that, 5+ years at Islami Bank Bangladesh in Information & Risk Management: IT risk assessments across 141+ systems, ISO 27001 and PCI DSS audits, VAPT, and implementing IBM QRadar SIEM."
  },
  {
    keys: ["skill", "tool", "siem", "splunk", "qradar", "stack", "technology", "tech", "python", "cloud", "aws", "azure"],
    answer: "Key tools: IBM QRadar, Splunk, LogRhythm, Wazuh/ELK, Swimlane SOAR, CrowdStrike, Trellix, Palo Alto, Fortinet, Zscaler, Burp Suite, Nessus, Qualys, Mandiant and Cyble, plus AWS and Azure. For research he uses Python, C/C++ and the CARLA simulator. Run 'skills' for the full list."
  },
  {
    keys: ["cert", "certification", "certified", "ceh", "iso", "27001", "rhcsa", "qualification"],
    answer: "He holds 12 certifications including AWS Solutions Architect – Associate, ISO/IEC 27001 Lead Auditor and Lead Implementer, CEH (Master), Certified SOC Analyst, RHCSA and C)PTE. Run 'certs' to see them all."
  },
  {
    keys: ["education", "degree", "study", "studied", "university", "mba", "msc", "bsc", "gpa"],
    answer: "PhD in Computer Science at Victoria University of Wellington (2025 – present), an MBA in Finance (CGPA 3.84), and an M.Sc. and B.Sc. in Electrical & Electronic Engineering."
  },
  {
    keys: ["hire", "hiring", "available", "availability", "role", "roles", "job", "looking", "open", "opportunity", "opportunities", "position", "intern", "internship", "graduate"],
    answer: "Yes — Arnub is looking for cybersecurity roles in New Zealand's technology and financial sectors: security operations, threat detection, and risk & compliance. Type 'contact' to send him a message directly."
  },
  {
    keys: ["contact", "email", "reach", "linkedin", "message", "connect", "talk"],
    answer: "The fastest route is the 'contact' command, which sends him a message from this terminal. You can also email ibnul.ec@gmail.com or connect on LinkedIn (linkedin.com/in/rnb2kool)."
  },
  {
    keys: ["where", "location", "based", "wellington", "zealand", "nz", "live"],
    answer: "He's based in Wellington, New Zealand."
  },
  {
    keys: ["award", "awards", "scholarship", "achievement", "achievements", "prize"],
    answer: "Awards include the Wellington Doctoral Scholarship, ISACA Digital Trust Scholarship, a Cum Laude Award, a Dean's Award, and 4th place out of 165 groups in the Smart EV Project."
  },
  {
    keys: ["language", "languages", "speak", "english", "bangla"],
    answer: "English (professional) and Bangla (native)."
  },
  {
    keys: ["cv", "resume"],
    answer: "Type 'cv' to open his CV as a PDF."
  }
];

function localAnswer(q) {
  const lower = q.toLowerCase();
  const tokens = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  let best = null, bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const k of entry.keys) {
      if (k.includes(" ")) { if (lower.includes(k)) score += 2; }
      else if (tokens.some((t) => t === k || (k.length > 3 && t.startsWith(k)))) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return best
    ? best.answer
    : "I'm not sure about that one. I can tell you about Arnub's research, experience, skills, certifications, education or availability — or type 'contact' to ask him directly.";
}

function startAI() {
  mode = "ai";
  print(`<span class="h">ARNUB-AI v1.0</span> <span class="dim">— neural link established</span>
Ask me anything about Arnub: research, experience, skills, certifications, availability.
Type <span class="accent">exit</span> to return to the shell, or <span class="accent">contact</span> to message him.`);
  setPrompt();
}

async function aiStep(line) {
  if (!line) return;
  const l = line.toLowerCase();
  if (["exit", "quit", "bye", "q"].includes(l)) {
    mode = "shell"; print("AI session closed.", "dim"); return setPrompt();
  }
  if (l === "clear") return COMMANDS.clear.run();
  if (l === "contact") { mode = "shell"; return startContact(); }
  await answer(line);
}

async function answer(q) {
  busy = true;
  const thinking = print("analysing query", "dim thinking");
  let reply = null;
  if (CONFIG.aiEndpoint) {
    try {
      const res = await fetch(CONFIG.aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: aiHistory.slice(-6) })
      });
      if (res.ok) reply = (await res.json()).reply || null;
    } catch (_) { /* fall through to offline assistant */ }
  }
  if (!reply) { await sleep(400); reply = localAnswer(q); }
  thinking.remove();
  aiHistory.push({ role: "user", content: q }, { role: "assistant", content: reply });
  await typeOut(reply);
}

/* =========================================================
   Interactive contact form
   ========================================================= */
function startContact() {
  mode = "contact";
  contact.step = 0;
  contact.data = {};
  print(`<span class="h">Secure contact channel opened</span> <span class="dim">[encrypted]</span>
Answer the prompts below. Type <span class="accent">cancel</span> at any time to abort.`);
  setPrompt();
}

function endContact(msg, cls = "dim") {
  mode = "shell";
  print(msg, cls);
  setPrompt();
}

async function contactStep(line) {
  if (line.toLowerCase() === "cancel") return endContact("Transmission aborted.");
  switch (contact.step) {
    case 0:
      if (!line) return print("Name can't be empty.", "err");
      contact.data.name = line.slice(0, 100);
      contact.step = 1;
      break;
    case 1:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)) return print("That doesn't look like a valid email address.", "err");
      contact.data.email = line.slice(0, 200);
      contact.step = 2;
      break;
    case 2:
      if (line.length < 5) return print("Message is a bit short — tell me a little more.", "err");
      contact.data.message = line.slice(0, 5000);
      contact.step = 3;
      print(`<span class="dim">── preview ──</span>
  from     ${esc(contact.data.name)} &lt;${esc(contact.data.email)}&gt;
  message  ${esc(contact.data.message)}`);
      break;
    case 3:
      if (/^y(es)?$/i.test(line)) return sendMessage();
      return endContact("Message discarded.");
  }
  setPrompt();
}

async function sendMessage() {
  const { name, email, message } = contact.data;
  if (CONFIG.formspreeEndpoint) {
    busy = true;
    print("Encrypting payload... transmitting", "dim thinking");
    try {
      const res = await fetch(CONFIG.formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message, _subject: `Portfolio contact from ${name}` })
      });
      busy = false;
      if (res.ok) return endContact("✔ Message delivered. Arnub will get back to you soon.", "ok");
      throw new Error(String(res.status));
    } catch (_) {
      busy = false;
      print("Relay failed — falling back to your email client.", "warn");
    }
  }
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  endContact("Opening your email client with the message pre-filled...", "ok");
}

/* =========================================================
   Input handling
   ========================================================= */
async function runLine(raw) {
  const line = raw.trim();
  echoLine(mode === "contact" && contact.step === 1 ? line : raw);
  if (mode === "contact") return contactStep(line);
  if (mode === "ai") return aiStep(line);
  if (!line) return;
  history.push(line);
  hIndex = history.length;
  const [name, ...args] = line.split(/\s+/);
  const cmd = COMMANDS[name.toLowerCase()];
  if (cmd) await cmd.run(args, line);
  else notFound(name);
}

function autocomplete() {
  if (mode !== "shell") return;
  const v = $in.value.trim();
  if (!v) return;
  const parts = v.split(/\s+/);
  if (parts.length === 2 && parts[0] === "cat") {
    const m = Object.keys(FILES).filter((f) => f.startsWith(parts[1]));
    if (m.length === 1) $in.value = `cat ${m[0]}`;
    else if (m.length > 1) { echoLine(v); print(m.join("   "), "dim"); }
    return;
  }
  const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(v.toLowerCase()));
  if (matches.length === 1) $in.value = matches[0] + " ";
  else if (matches.length > 1) { echoLine(v); print(matches.join("   "), "dim"); }
}

$in.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (busy) return;
    const v = $in.value;
    $in.value = "";
    await runLine(v);
  } else if (e.key === "ArrowUp") {
    if (mode !== "shell" || !history.length) return;
    e.preventDefault();
    hIndex = Math.max(0, hIndex - 1);
    $in.value = history[hIndex];
  } else if (e.key === "ArrowDown") {
    if (mode !== "shell" || !history.length) return;
    e.preventDefault();
    hIndex = Math.min(history.length, hIndex + 1);
    $in.value = history[hIndex] || "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    autocomplete();
  } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
    e.preventDefault();
    $out.innerHTML = "";
  } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection().toString()) {
    e.preventDefault();
    echoLine($in.value + "^C");
    $in.value = "";
    if (mode !== "shell") { mode = "shell"; print("Cancelled.", "dim"); setPrompt(); }
  }
});

// Click a command link (in output or quick bar) to run it
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-cmd]");
  if (el) {
    e.preventDefault();
    skipBoot = true;
    if (busy) return;
    if (mode !== "shell") { mode = "shell"; setPrompt(); }
    await runLine(el.dataset.cmd);
    $in.focus();
    return;
  }
  // Focus the input when clicking the terminal (unless selecting text or clicking a link)
  if (e.target.closest("#terminal") && !e.target.closest("a") && !window.getSelection().toString()) {
    $in.focus();
  }
});
document.addEventListener("keydown", () => { skipBoot = true; }, { once: true });

/* =========================================================
   Matrix rain background
   ========================================================= */
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
const glyphs = "01アイウエオカキクケコサシスセソ<>/{}[]#$%&*+=".split("");
let drops = [];
let matrixColor = "#00ff9c";
const fontSize = 16;

function refreshMatrixColor() {
  matrixColor = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#00ff9c";
}
function resizeMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drops = Array(Math.ceil(canvas.width / fontSize)).fill(0).map(() => Math.random() * -50);
}
function drawMatrix() {
  ctx.fillStyle = "rgba(5, 8, 13, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = matrixColor;
  ctx.font = `${fontSize}px monospace`;
  drops.forEach((y, i) => {
    ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, y * fontSize);
    drops[i] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
  });
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  resizeMatrix();
  refreshMatrixColor();
  window.addEventListener("resize", resizeMatrix);
  setInterval(drawMatrix, 55);
}

/* =========================================================
   Boot sequence
   ========================================================= */
async function boot() {
  busy = true;
  setPrompt();
  const lines = [
    "Initialising secure kernel",
    "Loading threat intelligence feeds",
    "Mounting /home/arnub/research",
    "Starting CAN bus intrusion detection service",
    "Applying firewall rules (deny all, allow curiosity)",
    "Session established — TLS 1.3"
  ];
  for (const l of lines) {
    print(`<span class="ok">[  OK  ]</span> ${l}`, "dim");
    if (!skipBoot) await sleep(170);
  }
  print("");
  showBanner();
  busy = false;
  $in.focus();
}

boot();
