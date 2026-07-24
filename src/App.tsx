import { useState, useEffect, useRef, ChangeEvent } from "react";
import { 
  IdolPersona, 
  ChatContact, 
  ChatMessage, 
  WeversePost, 
  BubbleMessage, 
  IdolSchedule, 
  SimulatedTeammate,
  BackupData,
  getCalendarPeriod,
  getBirthdayPeriod,
  getCurrentAge
} from "./types";
import { 
  generateCoreStaff,
  DEFAULT_PERSONA,
  INITIAL_WEVERSE_POSTS,
  INITIAL_BUBBLE_MESSAGES,
  SH_LIST,
  ENHANCED_RANDOM_EVENTS
} from "./mockData";
import IdolProfileSetup from "./components/IdolProfileSetup";
import BirthdayGameModal from "./components/BirthdayGameModal";
import KakaoTalkApp from "./components/KakaoTalkApp";
import WeverseApp from "./components/WeverseApp";
import BubbleApp from "./components/BubbleApp";
import FandomAnalyticsApp from "./components/FandomAnalyticsApp";
import SchedulesApp, { getFixedSkillSchedules } from "./components/SchedulesApp";
import SuddenEventModal from "./components/SuddenEventModal";
import TikTokApp from "./components/TikTokApp";
import XiaohongshuApp from "./components/XiaohongshuApp";
import FanMailApp, { FanLetter, generateRandomFanLetter } from "./components/FanMailApp";
import { safeFetch, triggerToast, getSeoulWeather, convertToTraditional } from "./components/apiHelper";
import { motion, AnimatePresence } from "motion/react";

import { 
  Sparkles, Battery, Wifi, Signal, Grid, RefreshCw, 
  Settings as SettingsIcon, Calendar, MessageSquare, 
  User, Activity, Flame, ShieldAlert, Coins, 
  Download, Upload, Heart, Info, MonitorCheck, Award,
  Film, Image, Mail, CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";

const themeStyles: Record<string, {
  sideBg: string;
  sideCardBg_1: string;
  sideCardBg_2: string;
  activeAppContainerBg: string;
  textAccent: string;
  borderAccent: string;
  accentBtn: string;
  badgeAccent: string;
  brandColors: string;
}> = {
  neon: {
    sideBg: "bg-purple-950/85 backdrop-blur-md border-purple-500/10",
    sideCardBg_1: "bg-[#18112b]/90 border border-purple-500/25 text-purple-200",
    sideCardBg_2: "bg-[#140b24]/90 border border-purple-500/20 shadow-[0_4px_20px_rgba(147,51,234,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#11081c]/80 via-[#07040a]/90 to-slate-900/40",
    textAccent: "text-purple-300",
    borderAccent: "border-purple-500/20",
    accentBtn: "bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/25",
    badgeAccent: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    brandColors: "from-[#22103a] through-[#110822] to-slate-950"
  },
  peach: {
    sideBg: "bg-amber-950/85 backdrop-blur-md border-amber-500/10",
    sideCardBg_1: "bg-amber-950/70 border border-amber-500/20 text-amber-200",
    sideCardBg_2: "bg-[#291717]/80 border border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#1c0e10]/80 via-[#0f0709]/90 to-amber-950/30",
    textAccent: "text-amber-300",
    borderAccent: "border-amber-500/20",
    accentBtn: "bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/25",
    badgeAccent: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    brandColors: "from-[#351a1d] through-[#1a0c0e] to-stone-950"
  },
  cosmic: {
    sideBg: "bg-indigo-950/85 backdrop-blur-md border-indigo-500/10",
    sideCardBg_1: "bg-indigo-950/70 border border-indigo-500/20 text-indigo-200",
    sideCardBg_2: "bg-[#0d122b]/80 border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#090b1e]/80 via-[#04050c]/90 to-indigo-950/30",
    textAccent: "text-indigo-300",
    borderAccent: "border-indigo-500/20",
    accentBtn: "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/25",
    badgeAccent: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    brandColors: "from-[#101438] through-[#06081c] to-slate-950"
  },
  aurora: {
    sideBg: "bg-teal-950/85 backdrop-blur-md border-teal-500/10",
    sideCardBg_1: "bg-teal-950/70 border border-teal-500/20 text-teal-200",
    sideCardBg_2: "bg-[#102422]/80 border border-teal-500/20 shadow-[0_4px_20px_rgba(20,184,166,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#051715]/80 via-[#020908]/90 to-teal-950/30",
    textAccent: "text-teal-300",
    borderAccent: "border-teal-500/20",
    accentBtn: "bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/25",
    badgeAccent: "bg-teal-500/15 text-teal-400 border border-teal-500/20",
    brandColors: "from-[#0a2723] through-[#041110] to-zinc-950"
  },
  cherry: {
    sideBg: "bg-pink-950/85 backdrop-blur-md border-pink-500/10",
    sideCardBg_1: "bg-pink-950/70 border border-pink-500/21 text-[#fdc3db]",
    sideCardBg_2: "bg-[#2d111d]/80 border border-pink-500/20 shadow-[0_4px_20px_rgba(236,72,153,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#1e0713]/80 via-[#090206]/90 to-rose-950/30",
    textAccent: "text-pink-300",
    borderAccent: "border-pink-500/20",
    accentBtn: "bg-pink-600/30 hover:bg-pink-600 text-pink-200 hover:text-white border border-pink-500/25",
    badgeAccent: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
    brandColors: "from-[#350d21] through-[#15040d] to-stone-950"
  },
  starlight: {
    sideBg: "bg-amber-950/85 backdrop-blur-md border-amber-500/10",
    sideCardBg_1: "bg-amber-950/70 border border-amber-500/20 text-[#ffe5bc]",
    sideCardBg_2: "bg-[#291e10]/80 border border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
    activeAppContainerBg: "bg-gradient-to-br from-[#1a1106]/85 via-[#0c0803]/90 to-amber-950/30",
    textAccent: "text-amber-350",
    borderAccent: "border-amber-500/20",
    accentBtn: "bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/25",
    badgeAccent: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    brandColors: "from-[#2f1b0a] through-[#140b03] to-slate-950"
  }
};

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(true);
  const [showBirthdayEvent, setShowBirthdayEvent] = useState<boolean>(false);
  const [activeEnding, setActiveEnding] = useState<any | null>(null);
  const [aiEndingMessage, setAiEndingMessage] = useState<string>("");
  const [isGeneratingAiEnding, setIsGeneratingAiEnding] = useState<boolean>(false);
  const [birthdayPersonaIndices, setBirthdayPersonaIndices] = useState<number[]>([]);
  const [showCover, setShowCover] = useState<boolean>(true);
  // Parallel storage lists of multi-member data for the "组合双人/三人模式, 应用双开" mechanics
  const [personas, setPersonas] = useState<IdolPersona[]>([DEFAULT_PERSONA]);
  const [activePersonaIdx, setActivePersonaIdx] = useState<number>(0);

  const [personasTeammates, setPersonasTeammates] = useState<SimulatedTeammate[][]>([[]]);
  const [personasChatContacts, setPersonasChatContacts] = useState<ChatContact[][]>([[]]);
  const [personasChatHistories, setPersonasChatHistories] = useState<Record<string, ChatMessage[]>[]>([{}]);
  const [personasWeversePosts, setPersonasWeversePosts] = useState<WeversePost[][]>([INITIAL_WEVERSE_POSTS]);
  const [personasBubbleMessages, setPersonasBubbleMessages] = useState<BubbleMessage[][]>([INITIAL_BUBBLE_MESSAGES]);
  const [personasSchedules, setPersonasSchedules] = useState<IdolSchedule[][]>([SH_LIST]);
  const [personasFanLetters, setPersonasFanLetters] = useState<any[][]>([[]]);
  const [personasTiktokVideos, setPersonasTiktokVideos] = useState<any[][]>([[]]);
  const [personasXiaohongshuPosts, setPersonasXiaohongshuPosts] = useState<any[][]>([[]]);

  // Derived current active single states matching legacy naming conventions
  const persona = personas[activePersonaIdx] || personas[0] || DEFAULT_PERSONA;
  const teammates = personasTeammates[activePersonaIdx] || personasTeammates[0] || [];
  const chatContacts = personasChatContacts[activePersonaIdx] || personasChatContacts[0] || [];
  const chatHistories = personasChatHistories[activePersonaIdx] || personasChatHistories[0] || {};
  const weversePosts = personasWeversePosts[activePersonaIdx] || personasWeversePosts[0] || INITIAL_WEVERSE_POSTS;
  const bubbleMessages = personasBubbleMessages[activePersonaIdx] || personasBubbleMessages[0] || INITIAL_BUBBLE_MESSAGES;
  const schedules = personasSchedules[activePersonaIdx] || personasSchedules[0] || SH_LIST;
  const fanLetters = personasFanLetters[activePersonaIdx] || personasFanLetters[0] || [];
  const tiktokVideos = personasTiktokVideos[activePersonaIdx] || personasTiktokVideos[0] || [];
  const xiaohongshuPosts = personasXiaohongshuPosts[activePersonaIdx] || personasXiaohongshuPosts[0] || [];

  // State synchronization setters that transparently update the correct active index
  const setPersona = (val: IdolPersona | ((p: IdolPersona) => IdolPersona)) => {
    setPersonas(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || DEFAULT_PERSONA);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setTeammates = (val: SimulatedTeammate[] | ((p: SimulatedTeammate[]) => SimulatedTeammate[])) => {
    setPersonasTeammates(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || []);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setChatContacts = (val: ChatContact[] | ((p: ChatContact[]) => ChatContact[])) => {
    setPersonasChatContacts(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || []);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setChatHistories = (val: Record<string, ChatMessage[]> | ((p: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>)) => {
    setPersonasChatHistories(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || {});
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setWeversePosts = (val: WeversePost[] | ((p: WeversePost[]) => WeversePost[])) => {
    setPersonasWeversePosts(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || INITIAL_WEVERSE_POSTS);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setBubbleMessages = (val: BubbleMessage[] | ((p: BubbleMessage[]) => BubbleMessage[])) => {
    setPersonasBubbleMessages(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || INITIAL_BUBBLE_MESSAGES);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setSchedules = (val: IdolSchedule[] | ((p: IdolSchedule[]) => IdolSchedule[])) => {
    setPersonasSchedules(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || SH_LIST);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setFanLetters = (val: any[] | ((p: any[]) => any[])) => {
    setPersonasFanLetters(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || []);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setTiktokVideos = (val: any[] | ((p: any[]) => any[])) => {
    setPersonasTiktokVideos(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || []);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };

  const setXiaohongshuPosts = (val: any[] | ((p: any[]) => any[])) => {
    setPersonasXiaohongshuPosts(prev => {
      const arr = [...prev];
      const idx = activePersonaIdx;
      if (typeof val === "function") {
        arr[idx] = val(arr[idx] || []);
      } else {
        arr[idx] = val;
      }
      return arr;
    });
  };
  
  // Anti-Reseller Domain authorization check
  const [isDomainAuthorized, setIsDomainAuthorized] = useState<boolean>(true);
  
  // Post Setup Disclaimer & Forced 5s Timer
  const [showPostSetupDisclaimer, setShowPostSetupDisclaimer] = useState<boolean>(false);
  const [disclaimerCountdown, setDisclaimerCountdown] = useState<number>(5);

  useEffect(() => {
    let timer: any;
    if (showPostSetupDisclaimer && disclaimerCountdown > 0) {
      timer = setInterval(() => {
        setDisclaimerCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showPostSetupDisclaimer, disclaimerCountdown]);

  useEffect(() => {
    const hostname = window.location.hostname;
    // Whitelisted patterns to support localhost, development preview, GitHub Pages, and Cloudflare Pages
    const allowedPatterns = [
      "localhost",
      "127.0.0.1",
      "::1",
      "pages.dev",
      "workers.dev",
      "run.app",
      "google.com",
      "googleusercontent.com",
      "web.app",
      "firebaseapp.com",
      "github.io",
      "blumenkatze"
    ];
    
    // If hostname is empty, it might be running inside a unique environment without hostname or local bundle; allow it
    const isAllowed = !hostname || allowedPatterns.some(
      (pattern) => hostname === pattern || hostname.endsWith("." + pattern) || hostname.includes(pattern)
    );
    
    setIsDomainAuthorized(isAllowed);
  }, []);

  // Synchronize traineeDebt across all personas if playing in a multi-persona group (Close-knit friend debt pooling)
  useEffect(() => {
    if (personas.length > 1) {
      const activeP = personas[activePersonaIdx] || personas[0];
      if (activeP) {
        const targetDebt = activeP.traineeDebt;
        const needsSync = personas.some(p => p.traineeDebt !== targetDebt);
        if (needsSync) {
          setPersonas(prev => prev.map(p => ({ ...p, traineeDebt: targetDebt })));
        }
      }
    }
  }, [activePersonaIdx, personas.map(p => p.traineeDebt).join(",")]);
  
  // App navigation state
  const [activeApp, setActiveApp] = useState<string>("schedule"); // "kakaotalk" | "weverse" | "bubble" | "analytics" | "schedule" | "settings"
  const [ipadWallpaper, setIpadWallpaper] = useState<string>("cosmic"); // "neon" | "peach" | "cosmic" | "aurora"
  const [isInteractionBlocking, setIsInteractionBlocking] = useState<boolean>(false);

  const handleSwitchApp = (appId: string) => {
    if (isInteractionBlocking) {
      triggerToast(
        "⚠️ 企划决断未锁定",
        "请先处理完当前的日程复盘结算或紧急粉丝危机事件，并关闭对应的弹窗，然后再切换其他应用！",
        "warning"
      );
      return;
    }
    setActiveApp(appId);
    setIsControlCenterOpen(false);
  };
  
  // Custom Toast State
  interface ToastItem {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const prevStatsRef = useRef({ energy: DEFAULT_PERSONA.energy, stress: DEFAULT_PERSONA.stress });

  // Custom toast listener
  useEffect(() => {
    const handleToastEvent = (e: any) => {
      const { title, message, type } = e.detail;
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("app-toast" as any, handleToastEvent);
    return () => {
      window.removeEventListener("app-toast" as any, handleToastEvent);
    };
  }, []);

  // Monitor stamina (energy) drops and pressure (stress) increases
  useEffect(() => {
    if (!hasStarted) {
      prevStatsRef.current = { energy: persona.energy, stress: persona.stress };
      return;
    }
    const prev = prevStatsRef.current;
    const currentEnergy = persona.energy;
    const currentStress = persona.stress;

    if (currentEnergy < prev.energy) {
      const diff = prev.energy - currentEnergy;
      if (currentEnergy <= 25) {
        triggerToast("🔋 体力告急！", `体力下挫 ${diff}%（当前仅剩 ${currentEnergy}%），面临红线疲劳风险，请速速休息！`, "error");
      } else {
        triggerToast("⚡ 体力消耗", `执行行程，体力消耗 ${diff}%（剩余 ${currentEnergy}%）`, "warning");
      }
    }

    if (currentStress > prev.stress) {
      const diff = currentStress - prev.stress;
      if (currentStress >= 80) {
        triggerToast("⚠️ 压力过载！", `压力上升了 ${diff}%，当前高达 ${currentStress}%！容易触发非理性行为，请立刻解压！`, "error");
      } else {
        triggerToast("📈 压力飙升", `心理压力增加 ${diff}%（当前 ${currentStress}%）`, "info");
      }
    }

    prevStatsRef.current = { energy: currentEnergy, stress: currentStress };
  }, [persona.energy, persona.stress, hasStarted]);

  const activeTheme = themeStyles[ipadWallpaper] || themeStyles["cosmic"];

  
  // Dynamic system simulation logs
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "IdolPad™ OS V2.5 启动正常...",
    "练习生网络传感器自适应模块装载完毕。"
  ]);

  // Custom API configuration (Requirement 10)
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("idolpad_custom_api_key") || "";
    } catch {
      return "";
    }
  });
  const [customModel, setCustomModel] = useState<string>(() => {
    try {
      return localStorage.getItem("idolpad_custom_api_model") || "gemini-2.5-flash";
    } catch {
      return "gemini-2.5-flash";
    }
  });
  const [customApiEndpoint, setCustomApiEndpoint] = useState<string>(() => {
    try {
      return localStorage.getItem("idolpad_custom_api_endpoint") || "";
    } catch {
      return "";
    }
  });

  // Sync API configurations independently to localStorage upon any mutation
  useEffect(() => {
    try {
      localStorage.setItem("idolpad_custom_api_key", customApiKey);
    } catch (err) {
      console.warn("Failed to save customApiKey to localStorage", err);
    }
  }, [customApiKey]);

  useEffect(() => {
    try {
      localStorage.setItem("idolpad_custom_api_model", customModel);
    } catch (err) {
      console.warn("Failed to save customModel to localStorage", err);
    }
  }, [customModel]);

  useEffect(() => {
    try {
      localStorage.setItem("idolpad_custom_api_endpoint", customApiEndpoint);
    } catch (err) {
      console.warn("Failed to save customApiEndpoint to localStorage", err);
    }
  }, [customApiEndpoint]);

  // Font Size setting with global root element adaptive scaling
  const [fontSize, setFontSize] = useState<string>(() => {
    try {
      return localStorage.getItem("idolpad_font_size") || "medium";
    } catch {
      return "medium";
    }
  });

  // Traditional Chinese setting state
  const [isTraditionalChinese, setIsTraditionalChinese] = useState<boolean>(() => {
    try {
      return localStorage.getItem("idolpad_is_traditional_chinese") === "true";
    } catch {
      return false;
    }
  });

  // Sync font size to localStorage & adjust root document style dynamically with proportional offsets for all standard & arbitrary classes
  useEffect(() => {
    try {
      localStorage.setItem("idolpad_font_size", fontSize);
      let px = "16px";
      let offset = 0;
      if (fontSize === "small") {
        px = "14px";
        offset = -2;
      } else if (fontSize === "medium") {
        px = "16px";
        offset = 0;
      } else if (fontSize === "large") {
        px = "18px";
        offset = 2;
      } else if (fontSize === "xlarge") {
        px = "20px";
        offset = 4;
      }
      document.documentElement.style.fontSize = px;

      // Inject / update dynamic style tag for proportional scaling on all specific font-size classes
      const styleId = "dynamic-font-scale-override";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      if (offset === 0) {
        styleEl.innerHTML = "";
      } else {
        let cssRules = `
          /* Standard Tailwind text size classes */
          .text-xs { font-size: calc(0.75rem + ${offset}px) !important; }
          .text-sm { font-size: calc(0.875rem + ${offset}px) !important; }
          .text-base { font-size: calc(1rem + ${offset}px) !important; }
          .text-lg { font-size: calc(1.125rem + ${offset}px) !important; }
          .text-xl { font-size: calc(1.25rem + ${offset}px) !important; }
          .text-2xl { font-size: calc(1.5rem + ${offset}px) !important; }
          .text-3xl { font-size: calc(1.875rem + ${offset}px) !important; }
          .text-4xl { font-size: calc(2.25rem + ${offset}px) !important; }
          .text-5xl { font-size: calc(3rem + ${offset}px) !important; }
        `;

        // Map all standard and arbitrary pixel font sizes from 6px to 100px comprehensively
        for (let size = 6; size <= 100; size++) {
          cssRules += `
            .text-\\[${size}px\\] { font-size: calc(${size}px + ${offset}px) !important; }
          `;
        }

        styleEl.innerHTML = cssRules;
      }
    } catch (err) {
      console.warn("Failed to apply font size settings", err);
    }
  }, [fontSize]);

  // Sync Traditional Chinese to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("idolpad_is_traditional_chinese", String(isTraditionalChinese));
    } catch (err) {
      console.warn("Failed to save isTraditionalChinese settings", err);
    }
  }, [isTraditionalChinese]);

  // Live Mutation Observer translating Simplified to Traditional Chinese recursively in real time
  useEffect(() => {
    if (!isTraditionalChinese) return;

    const translateNode = (node: Node) => {
      // Dynamic translation of placeholder attributes for inputs and textareas
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") {
          const placeholder = el.getAttribute("placeholder");
          if (placeholder) {
            const translated = convertToTraditional(placeholder);
            if (translated !== placeholder) {
              el.setAttribute("placeholder", translated);
            }
          }
        }
        el.querySelectorAll("input, textarea").forEach((inputEl) => {
          const placeholder = inputEl.getAttribute("placeholder");
          if (placeholder) {
            const translated = convertToTraditional(placeholder);
            if (translated !== placeholder) {
              inputEl.setAttribute("placeholder", translated);
            }
          }
        });
      }

      const parent = node.parentElement;
      if (parent) {
        const tag = parent.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SCRIPT" || tag === "STYLE") {
          return;
        }
        if (parent.isContentEditable) {
          return;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (text) {
          const translated = convertToTraditional(text);
          if (translated !== text) {
            node.nodeValue = translated;
          }
        }
      } else {
        node.childNodes.forEach(translateNode);
      }
    };

    // Translate current body
    translateNode(document.body);

    // Track future changes recursively
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          translateNode(node);
        });
        if (mutation.type === "characterData") {
          const node = mutation.target;
          const text = node.nodeValue;
          if (text) {
            const translated = convertToTraditional(text);
            if (translated !== text) {
              node.nodeValue = translated;
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [isTraditionalChinese]);

  // Models loading and dropdown lists
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [supportedModels, setSupportedModels] = useState<{ id: string; name: string }[]>([]);
  const [isModelsFetched, setIsModelsFetched] = useState<boolean>(false);

  const handlePullModels = async () => {
    if (!customApiKey) {
      alert("请先填写 专属 API 密钥 (Model Secret Access Key)！");
      return;
    }
    setLoadingModels(true);
    try {
      const res = await safeFetch("/api/gemini/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customApiKey: customApiKey,
          customApiEndpoint: customApiEndpoint
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.models)) {
          setSupportedModels(data.models);
          setIsModelsFetched(true);
          // Auto select first match if possible
          if (data.models.length > 0) {
            // We can pre-select the first model but don't overwrite user selection if valid
            const exists = data.models.some((m: any) => m.id === customModel);
            if (!exists) {
              setCustomModel(data.models[0].id);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch available models", e);
    } finally {
      setLoadingModels(false);
    }
  };

  // Random Event trigger state
  const [activeEvent, setActiveEvent] = useState<any | null>(null);
  const [eventOutcomeText, setEventOutcomeText] = useState<string | null>(null);
  
  // Debut Evaluation status
  const [debutEvaluationStatus, setDebutEvaluationStatus] = useState<"success" | "fail" | null>(null);

  // Scandal Leak evaluation overlay state
  const [scandalModal, setScandalModal] = useState<{
    detected: boolean;
    ceoPassed: boolean;
    managerPassed: boolean;
    teammatesPassed: boolean;
    shielded: boolean;
    outcomeText: string;
    details: string;
  } | null>(null);

  // Fan Letters & Popup states
  const [arrivedMailPopup, setArrivedMailPopup] = useState<FanLetter | null>(null);

  const [seoulTime, setSeoulTime] = useState<string>("12:00PM");
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);
  const [isQuickSideMetersOpen, setIsQuickSideMetersOpen] = useState<boolean>(false);

  // New Save-Game Management Confirmation popup (Requirement 4)
  const [confirmAction, setConfirmAction] = useState<"new_game" | "delete_save" | null>(null);

  const handleConfirmNewGame = () => {
    localStorage.removeItem("idolpad_os_backup_v2.5");
    setConfirmAction(null);
    setIsControlCenterOpen(false);
    
    // Hard reset state and trigger reload to IDOL Profile Setup from scratch
    setHasStarted(false);
    setPersona(DEFAULT_PERSONA);
    setTeammates([]);
    setWeversePosts(INITIAL_WEVERSE_POSTS);
    setBubbleMessages(INITIAL_BUBBLE_MESSAGES);
    setSchedules(SH_LIST);
    setChatContacts([]);
    setChatHistories({});
    
    window.location.reload();
  };

  const handleConfirmDeleteSave = () => {
    localStorage.clear(); // Format everything
    setConfirmAction(null);
    setIsControlCenterOpen(false);
    
    // Completely hard reset state
    setHasStarted(false);
    setPersona(DEFAULT_PERSONA);
    setTeammates([]);
    setWeversePosts(INITIAL_WEVERSE_POSTS);
    setBubbleMessages(INITIAL_BUBBLE_MESSAGES);
    setSchedules(SH_LIST);
    setChatContacts([]);
    setChatHistories({});
    setCustomApiKey("");
    setCustomModel("gemini-2.5-flash");
    setCustomApiEndpoint("");
    
    window.location.reload();
  };

  // Helper for system logger
  const handleAddSystemLog = (log: string) => {
    setSystemLogs(prev => [log, ...prev.slice(0, 15)]);
  };

  // Automated setting phase auto-summarizer (Token saving)
  const [isAutoSummarizeEnabled, setIsAutoSummarizeEnabled] = useState<boolean>(true);
  const [summarizationThreshold, setSummarizationThreshold] = useState<number>(6); // Default: summarize when message count exceeds 6
  const [isSummarizingInProgress, setIsSummarizingInProgress] = useState<boolean>(false);

  const handleSummarizeContact = async (
    contactId: string, 
    force = false, 
    passedHistories?: Record<string, ChatMessage[]>, 
    passedContacts?: ChatContact[]
  ) => {
    const activeHist = passedHistories || chatHistories;
    const activeConts = passedContacts || chatContacts;

    const history = activeHist[contactId] || [];
    // Only summarize if history is longer than threshold, or forced
    if (history.length < 5 && !force) return;

    // Find the contact
    const contact = activeConts.find(c => c.id === contactId);
    if (!contact) return;

    // Filter message dialog turns to pass to model
    const dialogueTurns = history
      .filter(m => m.sender === "idol" || m.sender === "other")
      .map(m => `${m.sender === "idol" ? "玩家" : contact.name}: ${m.text}`)
      .join("\n");

    if (!dialogueTurns.trim()) return;

    try {
      const prompt = `请帮我把玩家与K-pop圈子内成员（${contact.name}，关系角色: ${contact.role}，MBTI: ${contact.mbti || "ESTJ"}）的KakaoTalk未读/已读历史聊天记录合并、高度提炼，总结成一小段简短紧凑的【阶段性核心人物交往记忆/核心承诺/好感里程碑大纲】（中文）。
这个总结将由于上下文限制而注入到系统的核心 Prompt 中作为长效记忆载入。请确保言简意赅。
要求：只返回这一小段核心总结文本本身，切忌带有 markdown 回应、解释。不要超过 120 字。

历史对话如下：
${dialogueTurns}

旧的大纲记录（若有）：
${contact.summary || "无"}`;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: "You are a relational long-term memory compiler in Chinese. Output the distilled conversation summary ONLY. Keep it extremely compact.",
          customApiKey: customApiKey,
          model: customModel,
          customApiEndpoint: customApiEndpoint
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      let res;
      try {
        res = JSON.parse(text);
      } catch {
        res = { text };
      }
      const summaryText = (res.text || text || "已提炼阶段对话记录").trim();

      // Update states
      setChatContacts(conts => conts.map(c => {
        if (c.id === contactId) {
          return { ...c, summary: summaryText };
        }
        return c;
      }));

      setChatHistories(prev => {
        const hist = prev[contactId] || [];
        const systemInit = hist.find(m => m.sender === "system") || { id: `sys_init_${contactId}`, sender: "system", text: "—— 建立了安全的私人加密会话通道 ——", time: "上午 09:00" };
        const nonSystem = hist.filter(m => m.sender !== "system");
        
        // Retain only the last 2 messages so continuity isn't broken
        const kept = nonSystem.slice(-Math.min(2, nonSystem.length));
        const updatedHist = [systemInit, ...kept];
        const nextHists = { ...prev, [contactId]: updatedHist };
        
        // Auto save triggers
        triggerAutoSave(persona, teammates, nextHists);
        return nextHists;
      });

      handleAddSystemLog(`[LLM 智能归档] 成功将与【${contact.name}】的阶段长对话归档。节省 80%+ 的上下文 tokens 并永久同步至人物长期记忆！`);
    } catch (err) {
      console.error("Auto summarization failed for contact " + contactId, err);
    }
  };

  // Perform a full scan and summarize any dialogue exceeding limits
  const handleTriggerAutoSummarizeAll = async (
    force = false, 
    passedHistories?: Record<string, ChatMessage[]>, 
    passedContacts?: ChatContact[]
  ) => {
    const activeHist = passedHistories || chatHistories;
    const activeConts = passedContacts || chatContacts;
    
    setIsSummarizingInProgress(true);
    handleAddSystemLog(`[记忆守护行程] 正在自动检索所有长耗时、高冗余对话并尝试进行智能压缩提炼...`);

    // Find any contact with history length >= thresholds
    const targets = activeConts.filter(contact => {
      const hist = activeHist[contact.id] || [];
      return hist.length >= (force ? 3 : summarizationThreshold);
    });

    if (targets.length === 0) {
      setIsSummarizingInProgress(false);
      if (force) {
        handleAddSystemLog(`[记忆守护行程] 检索完毕。没有聊天记录行数足够长到需要执行阶段提炼整理。`);
      }
      return;
    }

    // Sequence execution to prevent rate limit
    for (const target of targets) {
      await handleSummarizeContact(target.id, force, activeHist, activeConts);
    }

    setIsSummarizingInProgress(false);
    handleAddSystemLog(`[记忆提炼完毕] 已成功对 ${targets.length} 位角色的关联会话记录完成了精简化压缩总结！`);
  };

  // Setup live clock in Seoul format
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      setSeoulTime(formatter.format(now));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load state from localStorage on init
  useEffect(() => {
    const backup = localStorage.getItem("idolpad_os_backup_v2.5");
    if (backup) {
      try {
        const parsed: any = JSON.parse(backup);
        if (parsed.personas && parsed.personas.length > 0) {
          setPersonas(parsed.personas);
          setActivePersonaIdx(parsed.activePersonaIdx || 0);
          if (parsed.personasTeammates) setPersonasTeammates(parsed.personasTeammates);
          if (parsed.personasChatContacts) setPersonasChatContacts(parsed.personasChatContacts);
          if (parsed.personasChatHistories) setPersonasChatHistories(parsed.personasChatHistories);
          if (parsed.personasWeversePosts) setPersonasWeversePosts(parsed.personasWeversePosts);
          if (parsed.personasBubbleMessages) setPersonasBubbleMessages(parsed.personasBubbleMessages);
          if (parsed.personasSchedules) setPersonasSchedules(parsed.personasSchedules);
          if (parsed.personasFanLetters) setPersonasFanLetters(parsed.personasFanLetters);
          if (parsed.personasTiktokVideos) setPersonasTiktokVideos(parsed.personasTiktokVideos);
          if (parsed.personasXiaohongshuPosts) setPersonasXiaohongshuPosts(parsed.personasXiaohongshuPosts);
          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint || "");
          setHasStarted(true);
        } else if (parsed.persona && parsed.persona.name) {
          setPersonas([parsed.persona]);
          setActivePersonaIdx(0);
          setPersonasTeammates([parsed.teammates || []]);
          setPersonasChatHistories([parsed.chatHistories || {}]);
          setPersonasWeversePosts([parsed.weversePosts || INITIAL_WEVERSE_POSTS]);
          setPersonasBubbleMessages([parsed.bubbleMessages || INITIAL_BUBBLE_MESSAGES]);
          setPersonasSchedules([parsed.schedules || SH_LIST]);
          setPersonasFanLetters([parsed.fanLetters || [generateRandomFanLetter(parsed.persona, parsed.persona.dayNumber)]]);
          setPersonasTiktokVideos([parsed.tickTokVideos || []]);
          setPersonasXiaohongshuPosts([parsed.xiaohongshuPosts || []]);

          const contactList = generateSubContacts(parsed.persona, parsed.teammates || [], parsed.chatHistories || {});
          setPersonasChatContacts([contactList]);

          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint || "");
          setHasStarted(true);
        }
      } catch (err) {
        console.error("Failed to restore saved session", err);
      }
    }
  }, []);

  // Propose a customized chat list based on generated teammates (Requirement 9, 15)
  const generateSubContacts = (p: IdolPersona, tm: SimulatedTeammate[], currHist: Record<string, ChatMessage[]> = chatHistories): ChatContact[] => {
    const staff = generateCoreStaff(p.gender, p);
    
    // 1. Procedural randomized openers based on personality & favorability (Requirement 13 & 15)
    let managerMsg = "";
    const mPersonality = p.managerPersonality || "strict";
    const mName = p.managerCustomName || (p.gender === "female" ? "严相勋" : "闵相勋");
    
    if (mPersonality === "strict") {
      if (p.managerFavorability < 25) {
        managerMsg = `我是${mName}。你昨天的卡路里摄入严重超标，现在立刻来我的办公室进行面部消肿！少跟我找借口。`;
      } else {
        managerMsg = `今天的通告单发工作群了，动作别划水！下午体脂称重前严禁喝水，黑咖啡自己记得喝。`;
      }
    } else if (mPersonality === "gentle") {
      if (p.managerFavorability < 25) {
        managerMsg = `最近是不是压力太大了呀？看你昨天练舞有点心不在焉，我给你泡了润喉的热红茶，休息时来喝一口吧。`;
      } else {
        managerMsg = `昨晚练习很累吧？我在休息室放了润喉糖和消肿冰贴，不要太勉强自己，身体才是最重要的。`;
      }
    } else if (mPersonality === "money_minded") {
      if (p.managerFavorability < 25) {
        managerMsg = `公司在这个季度投在你身上的营销费用是天文数字。如果今天的称重考核和直拍测评还是及格线，代表那边我可不好交代。`;
      } else {
        managerMsg = `这次的商业代言分成已经发到你的预备账上了。你红了，我对你的资源倾斜就更顺理成章，明白我的意思吧？`;
      }
    } else if (mPersonality === "unreliable") {
      managerMsg = `哎呀不好了！下午测评的备用服装我好像忘在上一家美容室了... 那个，你能先穿着练习服顶一下吗？千万别告诉代表啊呜呜！`;
    } else {
      managerMsg = `今天也要加倍努力啊！遇到任何事情随时联系我，我会是你最坚实的后盾。`;
    }

    let ceoMsg = "如果下一张专辑首日销量没破五万，后续打歌资源将自动缩紧。";
    if (p.ceoFavorability < 15) {
      const msgs = [
        "作为公司精锐培育队伍的一员，偷懒意味着自毁前程。今天的称重月度考核，我很期待看到符合公司最高标准的体脂结果。",
        "听说你对这次的主唱配比有微词？在Aether Label，一切资源只看谁有饥饿感。你如果不想跳，有的是新人渴望替补。"
      ];
      ceoMsg = msgs[Math.floor(Math.random() * msgs.length)];
    } else {
      const msgs = [
        "我看过你之前的个人刀群舞直拍。细节把握尚可，但眼神攻势需要极具侵略性。新主打曲的Center，我期待你来争夺。",
        "这段时间辛苦了。作为队长/核心，要把身子养好，多给成员们做正面表率，明天的电视预录我会亲临现场监看。"
      ];
      ceoMsg = msgs[Math.floor(Math.random() * msgs.length)];
    }

    let rivalMsg = "听说你们的主打歌空降Melon前十？羡慕啦，恭喜你们！🎉";
    const rivalMsgs = [
      "嗨！我们在电视台大楼看到你们的概念预告了，那个慵懒猫系人设妆造简直是神仙下凡，这次绝对空降出圈！❤️",
      "宝宝！今天打歌后台便利店的草莓拿铁超好喝诶，我让随行助理给你待机室带了一杯过去，清晨预录加油喔！",
      "听说你们这次的主打歌主舞编舞强度超大，大腿淤青是不是又跑出来了？哈哈开玩笑啦，下打歌后一起排夜消！"
    ];
    rivalMsg = rivalMsgs[Math.floor(Math.random() * rivalMsgs.length)];

    const contactList: ChatContact[] = [
      {
        id: "manager",
        name: staff.manager.name,
        avatar: staff.manager.avatar,
        role: "manager",
        lastMessage: managerMsg,
        unread: true,
        time: "上午 09:21",
        mbti: staff.manager.mbti,
        favorability: p.managerFavorability
      },
      {
        id: "ceo",
        name: staff.ceo.name,
        avatar: staff.ceo.avatar,
        role: "ceo",
        lastMessage: ceoMsg,
        unread: false,
        time: "昨天",
        mbti: staff.ceo.mbti,
        favorability: p.ceoFavorability
      },
      {
        id: "rival",
        name: staff.rival.name,
        avatar: staff.rival.avatar,
        role: "celeb",
        lastMessage: rivalMsg,
        unread: false,
        time: "昨天",
        mbti: staff.rival.mbti,
        favorability: 60
      }
    ];

    // Include generated group members chatter only for group style
    if (p.style === "group") {
      tm.forEach((mate, mateIdx) => {
        const greeting = p.gender === "female" ? "欧尼" : "哥";
        const isExtrovert = mate.mbti && mate.mbti.startsWith("E");
        let mateMsg = `${greeting}！今晚称重评测放水求同盟呗！`;
        
        if (isExtrovert) {
          const msgs = [
            `${greeting}！刚才舞蹈集训完，我偷偷买了两杯清潭洞清晨限定冰美式，在新宿舍门口呢，等会儿匀你一杯！别让闵室长发现喔！☕️🤫`,
            `嘿嘿！听说昨晚代表在代表室夸起你的声乐咬字了，看来下张专辑你的 killing part 要拿满了！下午美容室等我，一起点鸡胸肉沙拉！🥑`,
            `${greeting}！刚才看到有人在Weverse给你专门写小长文安利了，超级治愈！今天也要元气满满地把练习室炸掉，Fighting！💃`,
            `哈哈，昨天录音PD甚至夸我唱歌有进步咧！今晚一起在宿舍吃无盐轻食拌沙拉吧，我学了新的拌酱！🥣`,
            `${greeting}听说明天电视台预录的时间提早了，我们千万别迟到，今晚记得调五个闹钟！⏰`,
            `${greeting}！今晚我打算去排练室拍个翻跳短视频，你愿意当我的特约摄影师嘛？拍完请你喝零糖冰美式！🍦`
          ];
          // Select message by index to prevent identical greetings for different members
          mateMsg = msgs[mateIdx % msgs.length];
        } else {
          const msgs = [
            `${greeting}... 那个，这次主打歌中段的走位，我有一小段总是慢半拍，晚上练习完可以单独加练，能不能麻烦你提点一下我... 🥺`,
            `在客厅桌上留了消肿大麦茶和维他命，出门练习前记得带上。今天称重考核，我们一定能全员通过的，加油。`,
            `刚刚听说隔壁公司的竞品要推迟回归期了，我们的打歌夺冠机会突然变大了，哈哈。希望新主打能早点空降一位...`,
            `宿舍的冰箱里我放了半个西柚，上面贴了你的名字，练习累了记得回去吃掉哦，可以迅速补充水分。🍊`,
            `${greeting}，昨天看你有些疲惫，要注意休息。桌上放了蒸汽眼罩，睡前敷一个会舒服很多。🌙`,
            `关于下次主打曲的副歌和声部分，我觉得我们的声音叠在一起效果特别温润，有空我们在琴房合一下音怎么样？🎹`
          ];
          // Select message by index to prevent identical greetings for different members
          mateMsg = msgs[mateIdx % msgs.length];
        }

        let displayRole = mate.role ? mate.role.split(" ")[0] : "";
        if (displayRole && !displayRole.startsWith("队内")) {
          displayRole = `队内${displayRole}`;
        }

        contactList.push({
          id: mate.id,
          name: `${mate.name} (${displayRole})`,
          avatar: mate.avatar,
          role: "member",
          mbti: mate.mbti,
          lastMessage: mateMsg,
          unread: true,
          time: "刚刚",
          favorability: mate.favorability
        });
      });
    }

    // Include underground/secret romance lover contact if configured (Requirement 13)
    if (p.hasLover && p.loverName) {
      const genderSign = p.loverGender === "female" ? "🚺" : "🚹";
      const isCeleb = p.loverIdentity === "celebrity";
      const ageLabel = p.loverAge === "same_age" ? "同龄" : p.loverAge === "older" ? "年上" : "年下";
      const roleLabel = p.loverRole || (isCeleb ? "演员" : "素人");
      
      let loverMsg = "宝贝，想你了... 今天集训累不累？";
      const currentMood = p.loverMood ?? 80;
      if (currentMood < 40) {
        loverMsg = "其实我总在想，我们这样瞒着所有人真的对吗？对你的粉丝好不公平，我心里很愧疚... 我们是不是该分手？😔";
      } else if (currentMood < 70) {
        loverMsg = "呼，最近打歌行程太密了，我超级担心被狗仔跟拍。为了你的声誉，我们要不试着理智地克制联系一两周？";
      }

      contactList.push({
        id: "lover",
        name: `💖 ${p.loverName} (${roleLabel})`,
        avatar: "", // Removed per user request, fallback to sweet heart character
        role: "celeb",
        mbti: p.loverMbti || "INFJ",
        lastMessage: loverMsg,
        unread: true,
        time: "刚刚",
        favorability: currentMood
      });
    }

    // Populate active sasaeng stalkers dynamically from history
    Object.keys(currHist || {}).forEach((key) => {
      if (key.startsWith("sasaeng_")) {
        const list = currHist[key] || [];
        const lastMsg = list.length > 0 ? list[list.length - 1].text : "你刚才穿的灰色卫衣很衬你哦... 😉";
        contactList.push({
          id: key,
          name: `🤐 匿名未知私域来电 [私生粉丝]`,
          mbti: "XXXX型人格",
          avatar: "",
          role: "fan",
          lastMessage: lastMsg,
          unread: true,
          time: "刚刚",
          favorability: -99
        });
      }
    });

    return contactList;
  };

  // Removed sasaeng trigger from useEffect to prevent re-rolls on page reload.
  // It is now rolled safely or calculated on next-day transit.

  // Trigger auto save to local storage
  const triggerAutoSave = (
    currPersona = persona,
    currTeammates = teammates,
    currHist = chatHistories,
    currWeverse = weversePosts,
    currBubble = bubbleMessages,
    currSch = schedules,
    currFanLetters = fanLetters,
    currTiktok = tiktokVideos,
    currXiaohongshu = xiaohongshuPosts
  ) => {
    const idx = activePersonaIdx;

    const updatedPersonas = [...personas];
    updatedPersonas[idx] = currPersona;

    const updatedTeammates = [...personasTeammates];
    updatedTeammates[idx] = currTeammates;

    const updatedContacts = [...personasChatContacts];
    updatedContacts[idx] = chatContacts;

    const updatedHistories = [...personasChatHistories];
    updatedHistories[idx] = currHist;

    const updatedWeverse = [...personasWeversePosts];
    updatedWeverse[idx] = currWeverse;

    const updatedBubble = [...personasBubbleMessages];
    updatedBubble[idx] = currBubble;

    const updatedSchedules = [...personasSchedules];
    updatedSchedules[idx] = currSch;

    const updatedFanLetters = [...personasFanLetters];
    updatedFanLetters[idx] = currFanLetters;

    const updatedTiktok = [...personasTiktokVideos];
    updatedTiktok[idx] = currTiktok;

    const updatedXiaohongshu = [...personasXiaohongshuPosts];
    updatedXiaohongshu[idx] = currXiaohongshu;

    const data: any = {
      // Legacy compatibility single values
      persona: currPersona,
      teammates: currTeammates,
      chatHistories: currHist,
      weversePosts: currWeverse,
      bubbleMessages: currBubble,
      schedules: currSch,
      tickTokVideos: currTiktok,
      xiaohongshuPosts: currXiaohongshu,
      fanLetters: currFanLetters,

      // Modern multi-open parallel arrays
      personas: updatedPersonas,
      activePersonaIdx: idx,
      personasTeammates: updatedTeammates,
      personasChatContacts: updatedContacts,
      personasChatHistories: updatedHistories,
      personasWeversePosts: updatedWeverse,
      personasBubbleMessages: updatedBubble,
      personasSchedules: updatedSchedules,
      personasFanLetters: updatedFanLetters,
      personasTiktokVideos: updatedTiktok,
      personasXiaohongshuPosts: updatedXiaohongshu,

      customApiKey,
      customModel,
      customApiEndpoint
    };
    localStorage.setItem("idolpad_os_backup_v2.5", JSON.stringify(data));
  };

  // Complete profile step & launch simulation
  const handleSetupComplete = (newPersonaInput: IdolPersona[], generatedTeammatesInput: SimulatedTeammate[]) => {
    const finalPersonas: IdolPersona[] = [];
    const finalTeammatesList: SimulatedTeammate[][] = [];
    const finalChatContactsList: ChatContact[][] = [];
    const finalChatHistoriesList: Record<string, ChatMessage[]>[] = [];
    const finalWeversePostsList: WeversePost[][] = [];
    const finalBubbleMessagesList: BubbleMessage[][] = [];
    const finalSchedulesList: IdolSchedule[][] = [];
    const finalFanLettersList: any[][] = [];
    const finalTiktokVideosList: any[][] = [];
    const finalXiaohongshuPostsList: any[][] = [];

    newPersonaInput.forEach((p, idx) => {
      // 1. Teammates setup (include other player slots as close companion sisters)
      const otherPlayers: SimulatedTeammate[] = [];
      newPersonaInput.forEach((otherP, otherIdx) => {
        if (otherIdx !== idx) {
          otherPlayers.push({
            id: `player_mate_${otherIdx}`,
            name: otherP.name,
            stageName: otherP.stageName,
            mbti: otherP.mbti,
            role: otherP.roleInGroup || "企划搭档",
            nationality: otherP.nationality,
            favorability: 98,
            trait: "自创组合组员 (Playable Twin Unit)",
            avatar: ""
          });
        }
      });
      const tms = [...otherPlayers, ...generatedTeammatesInput];

      // 2. Chat contacts
      const contactList = generateSubContacts(p, tms);

      // 3. Chat histories
      const initialHist: Record<string, ChatMessage[]> = {};
      contactList.forEach((c) => {
        initialHist[c.id] = [
          { id: `sys_init_${c.id}`, sender: "system", text: "—— 建立了安全的私人加密会话通道 ——", time: "上午 09:00" },
          { id: `init_${c.id}`, sender: "other", text: c.lastMessage, time: "上午 09:12" }
        ];
      });

      // 4. Letters
      const initLetters = [
        generateRandomFanLetter(p, 1),
        generateRandomFanLetter(p, 1)
      ];

      finalPersonas.push(p);
      finalTeammatesList.push(tms);
      finalChatContactsList.push(contactList);
      finalChatHistoriesList.push(initialHist);
      finalWeversePostsList.push([...INITIAL_WEVERSE_POSTS]);
      finalBubbleMessagesList.push([...INITIAL_BUBBLE_MESSAGES]);
      finalSchedulesList.push([...SH_LIST]);
      finalFanLettersList.push(initLetters);
      finalTiktokVideosList.push([]);
      finalXiaohongshuPostsList.push([]);
    });

    setPersonas(finalPersonas);
    setActivePersonaIdx(0);
    setPersonasTeammates(finalTeammatesList);
    setPersonasChatContacts(finalChatContactsList);
    setPersonasChatHistories(finalChatHistoriesList);
    setPersonasWeversePosts(finalWeversePostsList);
    setPersonasBubbleMessages(finalBubbleMessagesList);
    setPersonasSchedules(finalSchedulesList);
    setPersonasFanLetters(finalFanLettersList);
    setPersonasTiktokVideos(finalTiktokVideosList);
    setPersonasXiaohongshuPosts(finalXiaohongshuPostsList);

    setShowPostSetupDisclaimer(true);
    setDisclaimerCountdown(5);
    setHasStarted(true);

    const groupSymbol = finalPersonas.length > 1 ? `【${finalPersonas[0].groupName}】的 ${finalPersonas.length}人` : `单人常规`;
    handleAddSystemLog(`创世纪元！自建 ${groupSymbol} 企划档案创建就位！`);

    // Multi save structured
    const archive = {
      personas: finalPersonas,
      activePersonaIdx: 0,
      personasTeammates: finalTeammatesList,
      personasChatContacts: finalChatContactsList,
      personasChatHistories: finalChatHistoriesList,
      personasWeversePosts: finalWeversePostsList,
      personasBubbleMessages: finalBubbleMessagesList,
      personasSchedules: finalSchedulesList,
      personasFanLetters: finalFanLettersList,
      personasTiktokVideos: finalTiktokVideosList,
      personasXiaohongshuPosts: finalXiaohongshuPostsList,
      customApiKey,
      customModel,
      customApiEndpoint
    };
    localStorage.setItem("idolpad_os_backup_v2.5", JSON.stringify(archive));
  };

  // Export progress
  const handleExportData = () => {
    const data: any = {
      persona, // Fallback for single-character
      teammates,
      chatHistories,
      weversePosts,
      bubbleMessages,
      schedules,
      tickTokVideos: [],
      xiaohongshuPosts: [],
      customApiKey,
      customModel,
      customApiEndpoint,
      fanLetters,

      // Multi-Play Supports
      personas,
      activePersonaIdx,
      personasTeammates,
      personasChatContacts,
      personasChatHistories,
      personasWeversePosts,
      personasBubbleMessages,
      personasSchedules,
      personasFanLetters
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `idolpad_multi_backup_${persona.stageName || "group"}_day${persona.dayNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
    handleAddSystemLog("成功导出多开联动组合全套存档文件！");
  };

  const handleTriggerEnding = (overrideP?: IdolPersona) => {
    const p = overrideP || persona;
    
    // Determine stats
    const totalTalent = p.vocalSkill + p.danceSkill + p.rapSkill + p.varietySkill;
    const isSolo = p.style === "solo";
    const hasPaidDebt = p.traineeDebt <= 0;
    const isDating = p.relationshipStatus === "dating";
    const hasGoodSkin = p.skinCondition === "perfect";
    const highStress = p.stress >= 78;
    const highAntis = (p.fansDistribution?.antiFans ?? 10) >= 15;
    
    let endingTitle = "平凡的打工人・人生新篇章";
    let endingRating = "C";
    let endingDesc = "你完成了一场平稳、踏实且无愧于心的演艺大考。虽然没有大起大落，也未曾站在极巅，但在无数个起早贪黑的行程日历里，你与同伴留下了真切的欢笑。退役后，你回到了阔别已久的大学校园，修完了心理学或数字媒体的学位，成为了一个幸福可爱的自由职业者。那些留在阁楼里的打歌直拍录像带，成为了偶尔家庭聚会时，你指给孩子们看的‘我当年也是超级耀眼的爱豆哦’的珍贵宝藏。";
    
    if (p.popularity >= 85 && p.reputation >= 80 && p.fansCount >= 2500000 && hasPaidDebt && p.money >= 4000) {
      endingTitle = "传奇绝代巨星・宇宙级天王天后";
      endingRating = "SSS";
      endingDesc = "在漫长而璀璨的聚光灯生涯中，你成为了整个 K-POP 行业公认的最高图腾。你带领你的队伍横扫全球各大榜单，从江南奥林匹克竞技馆一路唱到了格莱美中心。不仅还清了所有初始企划债务，银行卡里更流淌着八位数令人眼红的纯利提成。你退役时，甚至连首尔塔都通宵为你亮起了应援色的霓虹。你的名字，成了不朽的代名词。";
    } else if (isDating && (p.loverMood ?? 80) >= 82 && p.money >= 1200) {
      endingTitle = "落跑星侣・隐世密恋的甜润乐章";
      endingRating = "S";
      endingDesc = "在耀眼的霓虹灯最盛大的那一刻，你向世界展露了一个恶作剧般的灿烂微笑，随后摘下沉重的无线麦克风，牵起那个一直躲在后台阴影里的 Ta 的手。你们在众目睽睽之下飞奔出待机室，登上了飞往冰岛的深夜航班。虽然离开了闪光灯，但你们用积累下来的丰厚资金在安静的海边小镇开了一间小花店。每当潮水涨落，Ta 总是会为你轻轻哼唱你当年的成名曲。这是只属于你们两人的纯白童话。";
    } else if (isSolo && p.vocalSkill >= 45 && p.popularity >= 60) {
      endingTitle = "单飞主宰・无冕之Core传奇唱作天王/歌姬";
      endingRating = "S";
      endingDesc = "你彻底摆脱了群雄割据的分摊束缚，成为绝对掌控舞台的女王/歌神。退役之后，你正式被大众奉为‘音源终结者’和‘声音的骄傲’。无论什么平淡俗套的编曲，一经你的声带润色，均能在三秒内引爆空降各大榜单第一。你退役后转为核心音乐制作人与评委，你亲手谱写的副歌配曲甚至能买下一整栋清潭洞大楼。你是无冕、且永远无需向任何人低头的绝对声浪领主。";
    } else if (hasGoodSkin && p.fansCount >= 1000000 && p.varietySkill >= 40) {
      endingTitle = "江南美容奢装大亨・时尚秀场绝对C位";
      endingRating = "A";
      endingDesc = "比起日日在阴寒排练室留下的血汗污渍，你优雅地发现了真正属于自己的战场——时尚、顶级医美、与国际奢侈大牌的秀场前排。你凭借‘毫无破绽的绝光莹润初恋皮’和满分的镜头综艺感，横扫了所有高端女性垂直代言圈。退役后，你直接拿下了江南清潭洞知名连锁皮肤管理科的合伙人资格。你现在常驻巴黎和纽约，成为了掌控全网美丽奥秘的幕后奢装大亨。";
    } else if (highStress && highAntis) {
      endingTitle = "饭圈修罗场的挣扎离场者・退热咖啡屋";
      endingRating = "B";
      endingDesc = "这台庞大且残酷的娱乐机器让你留下了难以名状的内部创伤。每天早晨醒来，都是社交网络上关于你身材、眼神抑或私下举止的恶毒解读与狙击。在经历了数次待机室内的过度换气和掩面痛哭后，你决定在合约结束的那一天头也不回地离场。你在首尔郊区开了一家极其静谧的阳光咖啡馆，养了三只流浪猫，屏蔽了所有社交媒体的推送。虽然霓虹灯暗淡了，但你终于找回了那个久违的、会因吹拂微风而真心微笑的自己。";
    } else if (p.traineeDebt >= 12000 && p.popularity < 45) {
      endingTitle = "终身负债・地下挣扎翻跳社畜组员";
      endingRating = "D";
      endingDesc = "由于初始企划的巨额公关宣发债务像雪球一样越滚越大，你和队友在出道多年后依然拿不到半块钱的结算提成。你们被迫常年奔波于各种荒僻郡县的小型乡村商演、开业剪彩台，或者在不通暖气的地下练习室里为不知名品牌录制翻跳短视频。即使精疲力竭、膝盖积水，韩主管也只会对你翻一个冷酷的白眼。你最终宣告隐退，回归为平凡的写字楼文员，每月领薪水时看着存折，依然会叹息那场仿佛耗尽了一生力气的泡沫幻梦。";
    } else if (p.reputation >= 70 && (p.vocalSkill >= 40 || p.danceSkill >= 40)) {
      endingTitle = "传奇声望・业界宗师艺术舞台总监";
      endingRating = "A";
      endingDesc = "你在大众和业界同伴中赢得了如潮的尊崇与极其完美的纯净口碑。退役后，你迅速接到了厂牌代表的诚挚返聘，聘用你为 Aether Label 的首席舞台艺术总监与终身声望总监。你亲自考核着那些如饥似渴、骨相精致的年轻练习生，你随便一句温和的指点，都是孩子们梦寐以求的圣经。即使你不再亲自登台，各大国级大赏颁奖礼永远将最尊贵的正中席位为你预留。";
    }

    setActiveEnding({
      title: endingTitle,
      rating: endingRating,
      desc: endingDesc,
      daysNumber: p.dayNumber,
      totalFans: p.fansCount,
      money: p.money,
      debt: p.traineeDebt,
      skills: totalTalent,
      highestSkill: Math.max(p.vocalSkill, p.danceSkill, p.rapSkill, p.varietySkill),
      age: getCurrentAge(p.age, p.dayNumber, 18, p.cycleDays || 36)
    });
    setAiEndingMessage(""); // Clear any previous AI generation
  };

  const handleGenerateAiEnding = async () => {
    if (!activeEnding) return;
    setIsGeneratingAiEnding(true);
    setAiEndingMessage("");
    
    const partnerStr = persona.hasLover ? `地下眷侣 ${persona.loverName} (关系: ${persona.relationshipStatus === "dating" ? "执手相伴中" : "遗憾分手"})` : "单身无偶";
    const teammatesStr = persona.style === "group" ? `与队友合力奋斗，队内人缘好感 ${persona.teammatesFavorability}` : "个人Solo独立路线（全程无队友）";
    const skillsStr = `声乐 ${persona.vocalSkill}, 舞蹈 ${persona.danceSkill}, 说唱 ${persona.rapSkill}, 综艺 ${persona.varietySkill}`;
    const debtStr = activeEnding.debt > 0 ? `仍欠债务 ₩ ${activeEnding.debt} 万` : "无任何债务，完全财务自由";

    const prompt = `你现在是 K-POP 殿堂级娱乐大厂 Aether Label 的‘首席生涯记录者与灵魂写手’。请基于以下最终退役结算数据，为艺人“${persona.name} (艺名: ${persona.stageName})”撰写一封充满温度、细节交融、略带韩系叙事色彩的 350 字‘终身殿堂荣誉生涯纪念长信’：
- 职业名称/最终成就: ${activeEnding.title} (等级评级: ${activeEnding.rating})
- 通告活跃天数: ${activeEnding.daysNumber} 天
- 最终角色年龄: ${activeEnding.age} 岁
- 最终粉丝量: ₩ ${activeEnding.totalFans.toLocaleString()} 人
- 最终所得现金及利润分红: ₩ ${activeEnding.money} 万
- 最终账务核算: ${debtStr}
- 当期伴侣状况: ${partnerStr}
- 企划路线与队友情况: ${teammatesStr}
- 最终声乐/舞蹈/说唱/综艺均值: ${skillsStr}
- 主管闵室长最终态度: 好感 ${persona.managerFavorability}

写作要求：
1. 语言极其动人温柔，既有聚光灯下汗水与舞台呼吸的真实感，又有尘埃落定后对岁月的温柔释怀。
2. 提及宿命年龄的递增（如从新秀阶段走向 ${activeEnding.age} 岁退役的实际感悟）。
3. ${persona.style === "solo" ? "艺人为【个人Solo独立歌手】，全程无任何组合队友，绝对禁止提及任何队友或团队互动，突出个人独立舞台与独闯演艺圈的坚韧与辉煌！" : "融入具体的队友、闵主管或眷侣的动态反馈。"}
4. 绝对不要出现任何 AI 模版僵硬的废话或套话。直接输出信件正文。`;

    try {
      const response = await safeFetch({
        prompt,
        systemInstruction: "你是一个最擅长撰写韩娱、追星纪实文学与感人散文的小说家和心理医生。文字必须触动心灵，极具文学张力，不要任何废话前置或引言，直入正文。",
        apiKey: customApiKey,
        model: customModel,
        endpoint: customApiEndpoint
      });
      setAiEndingMessage(response || "（AI 撰信遭遇信号波动，代表将此手扎珍藏于保险箱内）");
    } catch (err) {
      setAiEndingMessage("信件撰写失败，网络信号穿行首尔美容通告大楼时产生了回声干扰。您可以阅读上述纯真模版结局。");
    } finally {
      setIsGeneratingAiEnding(false);
    }
  };

  // Import JSON progress
  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: any = JSON.parse(event.target?.result as string);
        if (parsed.personas && parsed.personas.length > 0) {
          setPersonas(parsed.personas);
          setActivePersonaIdx(parsed.activePersonaIdx || 0);
          if (parsed.personasTeammates) setPersonasTeammates(parsed.personasTeammates);
          if (parsed.personasChatContacts) setPersonasChatContacts(parsed.personasChatContacts);
          if (parsed.personasChatHistories) setPersonasChatHistories(parsed.personasChatHistories);
          if (parsed.personasWeversePosts) setPersonasWeversePosts(parsed.personasWeversePosts);
          if (parsed.personasBubbleMessages) setPersonasBubbleMessages(parsed.personasBubbleMessages);
          if (parsed.personasSchedules) setPersonasSchedules(parsed.personasSchedules);
          if (parsed.personasFanLetters) setPersonasFanLetters(parsed.personasFanLetters);
          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint || "");
          setHasStarted(true);
          handleAddSystemLog("同步成功！已恢复本地多开角色组合备份数据。");

          // Auto save
          const firstP = parsed.personas[0];
          triggerAutoSave(
            firstP,
            parsed.personasTeammates?.[0] || [],
            parsed.personasChatHistories?.[0] || {},
            parsed.personasWeversePosts?.[0] || INITIAL_WEVERSE_POSTS,
            parsed.personasBubbleMessages?.[0] || INITIAL_BUBBLE_MESSAGES,
            parsed.personasSchedules?.[0] || SH_LIST
          );
        } else if (parsed.persona && parsed.persona.name) {
          setPersonas([parsed.persona]);
          setActivePersonaIdx(0);
          setPersonasTeammates([parsed.teammates || []]);
          setPersonasChatHistories([parsed.chatHistories || {}]);
          setPersonasWeversePosts([parsed.weversePosts || INITIAL_WEVERSE_POSTS]);
          setPersonasBubbleMessages([parsed.bubbleMessages || INITIAL_BUBBLE_MESSAGES]);
          setPersonasSchedules([parsed.schedules || SH_LIST]);
          setPersonasFanLetters([parsed.fanLetters || [generateRandomFanLetter(parsed.persona, parsed.persona.dayNumber)]]);

          const contactList = generateSubContacts(parsed.persona, parsed.teammates || [], parsed.chatHistories || {});
          setPersonasChatContacts([contactList]);

          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint || "");
          setHasStarted(true);
          handleAddSystemLog("同步成功！已恢复本地单角色备份数据。");
          
          triggerAutoSave(
            parsed.persona,
            parsed.teammates || [],
            parsed.chatHistories,
            parsed.weversePosts,
            parsed.bubbleMessages,
            parsed.schedules
          );
        } else {
          alert("无效的 IdolPad 备份文件布局。");
        }
      } catch (err) {
        alert("JSON 语法解析失败。");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSimulator = () => {
    if (confirm("这会彻底清空您目前的偶像人设与全部进度。确认吗？")) {
      localStorage.removeItem("idolpad_os_backup_v2.5");
      setHasStarted(false);
      window.location.reload();
    }
  };

  // Triggers random Korean Entertainment crisis (Requirement 3)
  const handleTriggerRandomEvent = () => {
    const validEvents = ENHANCED_RANDOM_EVENTS.filter(e => pSpecialValidate(e));
    if (validEvents.length > 0) {
      const selected = validEvents[Math.floor(Math.random() * validEvents.length)];
      
      let processedEvent = { ...selected };
      if (teammates && teammates.length > 0) {
        const replacementName = teammates[0].name;
        processedEvent.title = processedEvent.title.replace(/智雅/g, replacementName);
        processedEvent.description = processedEvent.description.replace(/智雅/g, replacementName);
        processedEvent.choices = processedEvent.choices.map(choice => ({
          ...choice,
          text: choice.text.replace(/智雅/g, replacementName),
          outcomeText: choice.outcomeText.replace(/智雅/g, replacementName)
        }));
      }

      setActiveEvent(processedEvent);
      setEventOutcomeText(null);
    }
  };

  // Checks if the event can apply to the current character style
  const pSpecialValidate = (evt: any): boolean => {
    if ((evt.id === "e_m1" || evt.id === "e_cp1" || evt.id === "e_c1" || evt.id === "e_s1") && persona.style !== "group") {
      return false; // Group center/CP/teammate events only apply for group style
    }
    if (evt.id === "e_g1" && persona.nationality === "korean") {
      return false; // Green card bias only applies for green card stans
    }
    if (evt.id && evt.id.startsWith("e_romance") && !persona.hasLover) {
      return false; // Romance crisis events only apply if they have a lover
    }
    return true;
  };

  // Choice outcome applying
  const handleApplyEventOutcome = (
    popEff: number,
    repEff: number,
    nrgEff: number,
    cashEff: number,
    stressEff: number,
    debtEff: number,
    managerEff: number,
    teammateEff: number,
    outcome: string
  ) => {
    const p = { ...persona };
    p.popularity = Math.max(0, Math.min(100, p.popularity + popEff));
    p.reputation = Math.max(0, Math.min(100, p.reputation + repEff));
    p.energy = Math.max(0, Math.min(100, p.energy + nrgEff));
    
    // Cash & Trainee Debt clearing rules (Requirement 4)
    if (p.startType === "trainee") {
      p.traineeDebt = Math.max(0, p.traineeDebt - (cashEff * 4)); // subtracts debt if they made profits
      p.money = p.money + 15; // Trainees can gain trivial money from items
    } else {
      p.money = Math.max(0, p.money + cashEff);
    }

    p.stress = Math.max(0, Math.min(100, p.stress + stressEff));
    p.traineeDebt = Math.max(0, p.traineeDebt + debtEff);
    
    p.managerFavorability = Math.max(0, Math.min(100, p.managerFavorability + managerEff));
    p.teammatesFavorability = Math.max(0, Math.min(100, p.teammatesFavorability + teammateEff));

    setPersona(p);
    
    // Update contact favorability representation dynamically (Requirement 13)
    const nextContacts = chatContacts.map((c) => {
      if (c.id === "manager") return { ...c, favorability: p.managerFavorability };
      if (c.role === "member") return { ...c, favorability: p.teammatesFavorability };
      return c;
    });
    setChatContacts(nextContacts);

    setEventOutcomeText(outcome);
    triggerAutoSave(p, teammates);
    handleAddSystemLog(`事件："${activeEvent?.title}" 已做出决策理。影响值：人气(${popEff}) / 压力(${stressEff})`);
    triggerToast("✨ 决断完成", `成功应对事件: "${activeEvent?.title ?? "突发状况"}"`, "success");
  };

  return (
    <div className={`h-[100dvh] md:min-h-screen relative p-0 md:p-6 select-none overflow-hidden transition-all duration-500 ${
      ipadWallpaper === "neon" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-indigo-950/40" :
      ipadWallpaper === "peach" ? "bg-stone-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/30 via-stone-950 to-amber-950/30" :
      ipadWallpaper === "cosmic" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 via-slate-950 to-slate-900" :
      ipadWallpaper === "aurora" ? "bg-[#040e10] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-zinc-950 to-emerald-950/30" :
      ipadWallpaper === "cherry" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/40 via-stone-950 to-purple-950/30" :
      "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-blue-950/30"
    } text-slate-100 flex items-center justify-center`}>

      {/* SECURITY LOCK: Reseller Prevention / Unauthorized Domain Lock */}
      {!isDomainAuthorized && (
        <div id="unauthorized-resell-gate" className="fixed inset-0 z-[100000] bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-text">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12),transparent_75%)] pointer-events-none" />
          <div className="bg-slate-900/90 border border-red-500/25 rounded-3xl p-6 md:p-8 max-w-md shadow-[0_20px_50px_rgba(239,68,68,0.15)] relative overflow-hidden z-10 backdrop-blur-md">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            
            <h1 className="text-xl font-bold text-red-405 tracking-tight mb-2">
              ⚠️ 检测到非授权/打包二传倒卖版本
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mb-4">
              AUTHORIZED DOMAIN VERIFICATION FAILED
            </p>
            
            <div className="bg-slate-950/80 text-left p-4.5 rounded-2xl border border-white/5 space-y-3 mb-6 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                当前网页加载运行的域名为 <code className="text-red-350 font-mono font-bold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/10">{window.location.hostname || "local-file-package"}</code>，不在官方授权域名列表中。
              </p>
              <p className="text-[13px] text-amber-400 font-extrabold border-l-2 border-amber-500 pl-2.5">
                如果你是花钱买的那你就被骗了，建议退款，本项目开源免费纯原创。
              </p>
              <p className="text-xs text-slate-400 pt-1.5 border-t border-white/5">
                原作者：Blumenkatze
              </p>
            </div>
            
            <div className="space-y-3 font-sans">
              <button 
                onClick={() => {
                  window.location.href = "mailto:blumenkatze0108@gmail.com?subject=IdolPad 非法渠道倒卖维权举报&body=当前非法倒卖运行域名: " + window.location.hostname;
                }}
                className="w-full py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-white/5 transition-all text-center cursor-pointer"
              >
                举报/反馈倒卖者并保留记录 📧
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* POST-SETUP MANDATORY DISCLAIMER MODAL WITH TIMER */}
      {showPostSetupDisclaimer && (
        <div id="post-setup-disclaimer-modal" className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.12),transparent_70%)] pointer-events-none" />
          <div className="bg-slate-900/95 border border-rose-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_25px_60px_-15px_rgba(244,63,94,0.2)] relative overflow-hidden z-[100000] backdrop-blur-md">
            <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
            
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>

            <h2 className="text-lg md:text-xl font-bold text-center text-transparent bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text tracking-tight mb-4">
              ⚔️ 免费正版验证与防骗提示
            </h2>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/5 space-y-4 text-slate-200 leading-relaxed text-sm">
              <p className="text-amber-405 font-extrabold text-base border-l-4 border-amber-500 pl-3 leading-normal py-0.5">
                如果你是花钱买的那你就被骗了，建议退款，本项目开源免费纯原创。
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400 font-mono">
                <span>PROJECT TYPE: FREE & OPEN SOURCE</span>
                <span className="text-rose-350 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  原作者：Blumenkatze
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                disabled={disclaimerCountdown > 0}
                onClick={() => setShowPostSetupDisclaimer(false)}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all tracking-wide select-none transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                  disclaimerCountdown > 0
                    ? "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                }`}
              >
                {disclaimerCountdown > 0 ? (
                  <span className="flex items-center justify-center gap-1.5 font-sans">
                    请仔细阅读并知悉 (正在阅读 {disclaimerCountdown} 秒后解锁...)
                  </span>
                ) : (
                  "我已阅读并知晓，确认进入游戏 ⚔️"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Immersive Cover Page / User Guide on Load */}
      {showCover && (
        <div id="idolpad-cover-screen" className="fixed inset-0 z-[80000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-radial-gradient from-purple-950/40 via-transparent to-transparent pointer-events-none animate-pulse" />
          
          {/* Glass Card Container */}
          <div className="w-full max-w-4xl bg-[#0d121c]/95 text-white rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-purple-500/15 flex flex-col max-h-[92vh] md:max-h-[85vh] relative animate-in fade-in scale-in duration-305">
            
            {/* Header Splash */}
            <div className="bg-gradient-to-r from-purple-900/40 via-[#111726]/90 to-indigo-900/40 p-5 md:p-8 border-b border-white/5 relative overflow-hidden shrink-0">
              <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/25 rounded-full text-[10px] text-purple-300 font-mono mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 rotate-12" />
                    IDOLPAD OS SIMULATOR V2.5
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent leading-none">
                    IdolPad™ OS 爱豆生存企划模拟器
                  </h1>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                    欢迎来到业界首个高保真深度 K-Pop 爱豆模拟系统。开启你的造星纪元
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCover(false)}
                  className="sm:self-center shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  启动模拟系统 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Core Guide Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-8 no-scrollbar bg-slate-900/10">
              
              {/* Box 1: 大概背景故事 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">01</span>
                  🌌 企划前言：深度背景故事 (Lore Profile)
                </h2>
                <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-sans">
                  <p>
                    繁华喧嚣的首尔江南，是闪光灯与璀璨舞台的汇聚之地。数以万计的少男少女在此挥洒汗水，只为争夺那唯一的万众瞩目席位。然而，舞台的背后是无尽的契约、长达数年的地下债务、以及严苛得近乎残酷的角色塑造。
                  </p>
                  <p>
                    在《IdolPad™ OS》模拟企划中，你将接管一台高精度的爱豆生存控制台。你可以选择作为<strong>三大厂高压夹缝下的练习生</strong>（背负高达 ₩2000w 倾家荡产级别的“江南美容加练债务”），或是<strong>刚发布新专辑的Solo/团体正式打歌主唱爱豆</strong>。
                  </p>
                  <p>
                    从零结算的财务账单折磨，到江南清潭洞高级皮肤科的医美急救；从突击回归带来的爆痘状态崩塌，到KakaoTalk上绿卡身份危机与闵经理人、竞争对手的周旋。你的一言一行都将被狂热的粉丝圈、苛刻的娱乐媒体与宿命机制动态评判。
                  </p>
                </div>
              </div>

              {/* Box 2: 玩法与所有功能 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative">
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text flex items-center gap-2 mb-4">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">02</span>
                  📱 拟真终端：玩法与系统功能 (Apps Depot)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-purple-500/20 transition-all">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5" /> 日常行列表 (Schedule)
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      指派全天舞蹈加练、断食抗饿、打歌排练或皮肤管理，平衡你的<strong>体力（Stamina）</strong>与<strong>压力（Stress）</strong>指标。
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-yellow-500/20 transition-all">
                    <span className="font-bold text-yellow-350 flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" /> KakaoTalk 成员群聊
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      与苛刻的「闵经理人」、威严的「崔社长」、队内队友或毒舌的「竞品同期死对头」进行高保真拟真聊天互动。
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-teal-500/20 transition-all">
                    <span className="font-bold text-teal-300 flex items-center gap-1.5 mb-1">
                      <Heart className="w-3.5 h-3.5" /> Weverse 官咖讨论
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      发布官方营业动态，收获粉丝团疯狂刷屏打气或爆破，直接体验血雨腥风的主流粉丝舆论风波。
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-pink-500/20 transition-all">
                    <span className="font-bold text-pink-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> Bubble 粉丝订阅消息
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      开启1vN私密泡泡聊天，发送极高亲密度的暖心小作文。实时接收海量付费订阅粉丝的反馈弹幕。
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5" /> 皮肤诊所与数据面板 (Derm & Data)
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      监测死忠粉、路人缘与精雕等级。花费代币自费预约江南清潭洞皮肤科（LDM导入、水光针、VIP热玛吉）抗衰救脸！
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-rose-500/20 transition-all">
                    <span className="font-bold text-rose-350 flex items-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5" /> 粉丝实体来信物 (Fan Mail)
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      解锁亲笔拆阅粉丝的信件。可以选择手写回复，暖心或毒舌的言语会改变在 Fandom 中的粉丝死忠留存度。
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <Film className="w-3.5 h-3.5" /> TikTok卡点 / 小红书穿搭
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      把握移动流媒体网络大潮！紧跟时下热门歌曲拍摄动感舞蹈，或上传在江南日常精美私服搭配引爆美妆推荐榜！
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/20 transition-all">
                    <span className="font-bold text-blue-305 flex items-center gap-1.5 mb-1">
                      🌤️ 首尔动态气候与皮肤干预级影响
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      首尔特有的5大天气循环（温和晴朗、异常干燥沙尘风、梅雨高湿、烈日暴晒、寒潮气温干裂）将深度扰动体能水合并改变次日爆痘与过敏概率。
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 3: 使用教程 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative">
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">03</span>
                  💡 新手实操：一步步使用教程 (Step Guide)
                </h2>
                <div className="text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono flex items-center justify-center shrink-0">1</div>
                    <div>
                      <strong>设定爱豆履历</strong>：在首发的【IdolPad Profile Setup】页面精雕你的名字、血型、外貌底子，选择你的练习生和所属事务所。属性与担当是由你自由判定的。
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono flex items-center justify-center shrink-0">2</div>
                    <div>
                      <strong>进行日常日程</strong>：来到【日常行列表 (Schedule)】挑选练习任务。每天的行动都将增减体力，每达成当天全部行程，点击底部<strong>“过夜结算，开启新一天”</strong>。
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono flex items-center justify-center shrink-0">3</div>
                    <div>
                      <strong>处理社交网络</strong>：遇到带红点提示的 APP 务必跟进。在 KakaoTalk 配合闵经理的吩咐，或者在 Weverse 发起新回复。你的处理选择关系到你的续约倾向性。
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono flex items-center justify-center shrink-0">4</div>
                    <div>
                      <strong>应对限时危机</strong>：当极度疲劳或压力拉爆（Stress &gt; 65）时，过夜会高几率触发黑粉舆论战或痘印彻底爆发。及时用皮肤科套餐或吃喝睡回血。
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 4: 关于备份、密钥设置教程 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative">
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-teal-500/10 rounded border border-teal-500/20">04</span>
                  🔑 外部兼容：数据备份与密钥设置 (Access & Backup)
                </h2>
                <div className="text-xs text-slate-355 space-y-3 leading-relaxed font-sans">
                  <div className="p-3 bg-[#0c101b] border border-white/5 rounded-xl">
                    <span className="font-bold text-white block mb-1">🔑 1. 如何解锁超高真度 AI 拟真回复机制?</span>
                    <p className="text-slate-400 leading-relaxed">
                      本应用搭载深度沙盒文案系统。若想激活<strong>纯智能生成、与你设定的属性和行为完全丝滑绑定的动态 KakaoTalk 群聊及手写粉丝信回复</strong>：
                      请在应用外部或 AI Studio 顶部的「Settings（设置）」菜单中提供你的专属 <strong>`GEMINI_API_KEY` （Gemini 密钥）</strong>。本系统会全程在服务器端（Server-side）安全访问，密钥绝不暴露给客户端。
                    </p>
                  </div>
                  <div className="p-3 bg-[#0c101b] border border-white/5 rounded-xl">
                    <span className="font-bold text-white block mb-1">💾 2. 存档备份与云盘导回机制</span>
                    <p className="text-slate-400 leading-relaxed">
                      点击底部最右侧的<strong>「系统设置 (Settings)」</strong>图标。你可以在此实时复制长文格式的 <strong>JSON 存档数据</strong>，并在本地打包。下次游玩时直接贴回「导入状态」并确认即刻完美接轨断点，安全免丢档。
                    </p>
                  </div>
                </div>
              </div>

              {/* Box 5: 本次版本更新内容 */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 relative">
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-pink-500/10 rounded border border-pink-500/20">05</span>
                  🚀 最新迭代：V4.5 个人 Solo 独立歌手模式 & 纯享个人饭圈重构版 (Changelog)
                </h2>
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                  <p className="font-bold text-purple-300">本系统已全量推送到主服务器。根据主理人反馈，V4.5 重磅迭代加入以下突破及修复内容：</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                    <li>
                      <strong className="text-slate-200">🎤 个人 Solo 独立歌手模式 100% 纯享重构</strong>：彻底解绑 Solo 模式与组合/队友逻辑！在选择【个人 Solo 独立歌手】时，系统全域（包含 KakaoTalk、Weverse 官咖、W-Live 直播弹幕、TikTok 变装/舞蹈挑战、小红书私服笔记、粉丝来信等）将 100% 聚焦爱豆个人的舞台与生活，绝对不会虚构或误提及任何组合队友或团内争议！
                    </li>
                    <li>
                      <strong className="text-slate-200">📊 大健康 / 粉丝大盘 (Fandom Analytics) 逻辑适配</strong>：为 Solo 独立歌手重塑大盘模型！彻底移除「OT 团粉」与「团队毒唯」维度，自动平滑归集为「核心唯粉死忠」、「事业唯/成绩粉」与「跨界/合作 CP 粉」，呈现最真实的个人爱豆饭圈格局！
                    </li>
                    <li>
                      <strong className="text-slate-200">💬 恋爱攻受定位 (Top/Bottom) & 身份称谓约束</strong>：深化了 KakaoTalk 地下恋人角色扮演中的左位（Gong/Top）与右位（Shou/Bottom）语气与娇嗔/霸气设定，并严格绑定玩家性别（欧尼/哥哥/欧巴），绝无穿帮与错位。
                    </li>
                    <li>
                      <strong className="text-slate-200">🔍 全局字号等比例自适应缩放</strong>：支持无级字号缩放偏移，全标准 Tailwind 字体大小（xs 至 5xl）及自定义字号各自等量递增/递减，舒适大字不挤压！
                    </li>
                  </ul>
                </div>
              </div>

              {/* Box 6: 独家原创保护 & 正版声明 */}
              <div id="original-protection-box" className="bg-red-950/20 border border-red-500/15 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute right-[-14px] top-[-14px] translate-x-1 translate-y-1 rotate-12 text-red-500/5 font-mono text-[80px] font-black pointer-events-none select-none">
                  ©
                </div>
                <h2 className="text-base font-bold text-transparent bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-red-500/15 text-red-300 rounded border border-red-500/20">06</span>
                  🔒 独家原创保护与免费声明 (Anti-Theft Disclaimer)
                </h2>
                <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2.5">
                  <p className="text-amber-300 font-bold text-[13px] leading-relaxed">
                    如果你是花钱买的那你就被骗了，建议退款，本项目开源免费纯原创。
                  </p>
                  <p className="text-slate-400 font-sans text-xs">
                    本应用由原作者开发，项目旨在同好交流，任何付费变相倒卖均属侵权欺诈行为。请支持退款维权！
                  </p>
                  <p className="text-[11px] text-purple-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    原作者：Blumenkatze
                  </p>
                </div>
              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="p-5 md:p-6 bg-slate-950/85 border-t border-white/5 flex items-center justify-center shrink-0">
              <button
                onClick={() => setShowCover(false)}
                className="w-full max-w-lg py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-purple-500/10 transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2"
              >
                我知道了，立即进入 IdolPad™ 生存世界 <Sparkles className="w-4 h-4 text-yellow-300 animate-bounce" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Toast System Floating Container */}
      <div id="global-toast-portal" className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 30, transition: { duration: 0.2 } }}
              className={`pointer-events-auto w-full p-4.5 rounded-2xl border backdrop-blur-md shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] flex items-start gap-3 transition-colors duration-300 ${
                toast.type === "success" ? "bg-emerald-950/85 border-emerald-500/30 text-emerald-100 shadow-emerald-950/25" :
                toast.type === "error" ? "bg-rose-950/85 border-rose-500/30 text-rose-100 shadow-rose-950/25" :
                toast.type === "warning" ? "bg-amber-950/85 border-amber-500/30 text-amber-100 shadow-amber-950/25" :
                "bg-slate-900/95 border-indigo-500/30 text-indigo-100 shadow-indigo-950/25"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />}
              {toast.type === "error" && <ShieldAlert className="w-5.5 h-5.5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />}
              {toast.type === "warning" && <AlertCircle className="w-5.5 h-5.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />}
              {toast.type === "info" && <Sparkles className="w-5.5 h-5.5 text-indigo-400 shrink-0 mt-0.5 animate-spin duration-3000" />}

              <div className="flex-1 min-w-0 text-left">
                <h4 className="font-bold text-sm leading-tight mb-1">{toast.title}</h4>
                <p className="text-xs text-slate-350 leading-normal">{toast.message}</p>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-450 hover:text-white transition-colors cursor-pointer text-xs font-bold leading-none p-1 shrink-0"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Cinematic Ambient Ambient Glow Orbs */}
      <div className={`absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full mix-blend-screen filter blur-[120px] opacity-[0.22] animate-pulse duration-[6000ms] pointer-events-none transition-all duration-1000 ${
        ipadWallpaper === "neon" ? "bg-purple-600" :
        ipadWallpaper === "peach" ? "bg-rose-500" :
        ipadWallpaper === "cosmic" ? "bg-indigo-600" :
        ipadWallpaper === "aurora" ? "bg-teal-500" :
        ipadWallpaper === "cherry" ? "bg-pink-500" : "bg-amber-500"
      }`} />
      <div className={`absolute bottom-[10%] right-[5%] w-[450px] h-[450px] rounded-full mix-blend-screen filter blur-[140px] opacity-[0.18] animate-pulse duration-[8000ms] pointer-events-none transition-all duration-1000 ${
        ipadWallpaper === "neon" ? "bg-indigo-600" :
        ipadWallpaper === "peach" ? "bg-amber-500" :
        ipadWallpaper === "cosmic" ? "bg-violet-600" :
        ipadWallpaper === "aurora" ? "bg-emerald-600" :
        ipadWallpaper === "cherry" ? "bg-rose-500" : "bg-cyan-600"
      }`} />

      {/* Gentle overlay grids */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      {/* Soft background aesthetics */}
      <div className="absolute inset-0 bg-radial-gradient from-purple-500/5 via-indigo-500/0 to-transparent pointer-events-none" />

      {!hasStarted ? (
        <IdolProfileSetup onComplete={handleSetupComplete} />
      ) : (
        <div id="ipad-shell-wrapper" className="w-full max-w-7xl h-[100dvh] md:h-[840px] md:max-h-[90vh] relative mx-auto p-0 md:p-4 rounded-none md:rounded-[40px] bg-slate-950 md:bg-[#1c1d25] border-none md:border-t md:border-white/20 shadow-none md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.06)] flex flex-col overflow-hidden">
          
          {/* Main iPad Inner Screen Aspect ratio */}
          <div className={`flex-1 w-full rounded-none md:rounded-[28px] overflow-hidden flex flex-col relative border border-slate-950 transition-all duration-500 ${
            ipadWallpaper === "neon" ? "bg-gradient-to-b from-[#110c1c] to-[#090a10]" :
            ipadWallpaper === "peach" ? "bg-gradient-to-b from-[#1e1318] to-[#120f12]" :
            ipadWallpaper === "cosmic" ? "bg-gradient-to-b from-[#0e0e1c] to-[#060810]" :
            ipadWallpaper === "aurora" ? "bg-gradient-to-b from-[#081214] to-[#04080a]" :
            ipadWallpaper === "cherry" ? "bg-gradient-to-b from-[#221018] to-[#0f0a0d]" :
            "bg-gradient-to-b from-[#111624] to-[#0b0c10]"
          }`}>
            
            {/* iPad Pro Header Status Bar */}
            <div id="ipad-header-status" className="h-9 px-2 sm:px-4 md:px-6 bg-slate-950/50 backdrop-blur-md flex items-center justify-between text-[11px] sm:text-xs text-slate-300 font-medium select-none border-b border-white/5 relative z-40">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-[11px] sm:text-xs">{seoulTime}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:inline">Seoul KST</span>
                {/* Visual Watermark / Original Author Attribution Badge */}
                <div className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/25 rounded text-[8px] font-bold text-rose-300 font-sans tracking-wide select-none" title="Original Creator: BlumenKatze & Free Playable">
                  <span>© 原创正版: BlumenKatze</span>
                </div>
                {/* Weather in Seoul Indicator */}
                <div 
                  className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/25 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer"
                  title={getSeoulWeather(persona.dayNumber).impactText}
                  onClick={() => {
                    triggerToast(
                      `首尔气象局 (Day ${persona.dayNumber})`, 
                      getSeoulWeather(persona.dayNumber).impactText,
                      "info"
                    );
                  }}
                >
                  <span className="animate-pulse">{getSeoulWeather(persona.dayNumber).icon}</span>
                  <span className="font-bold text-indigo-200 hidden sm:inline">{getSeoulWeather(persona.dayNumber).name}</span>
                </div>
                {persona.startType === "trainee" ? (
                  <span className="bg-red-500/15 text-red-400 border border-red-500/25 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                    <span className="hidden xs:inline">DEBT: </span>${persona.traineeDebt}w
                  </span>
                ) : (
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded font-mono uppercase">
                    IDOL
                  </span>
                )}
              </div>

              {/* Dynamic Camera Notch Center */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-4 bg-black rounded-full border border-white/5 items-center justify-center pointer-events-none hidden md:flex">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-purple-500/50 mr-1" />
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="text-[9px] text-slate-400 hidden lg:inline-flex items-center gap-1 font-mono">
                  <Signal className="w-3 h-3 text-indigo-400" />
                  {persona.company.split(" ")[0]}
                </span>
                <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
                <div className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded">
                  <Battery className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-mono text-[9px] sm:text-[10px]">{persona.energy}%</span>
                </div>

                {/* Mobile stats drawer trigger */}
                <button
                  type="button"
                  onClick={() => setIsQuickSideMetersOpen(!isQuickSideMetersOpen)}
                  className="flex md:hidden items-center justify-center px-1.5 py-0.5 bg-purple-500/25 border border-purple-500/40 rounded text-[9px] text-purple-200 font-bold active:scale-90 hover:bg-purple-500/35 cursor-pointer transition-all shrink-0 animate-pulse"
                >
                  📊 属性
                </button>

                {/* Quick Interactive Wallpaper Palette Dock - Hidden on Mobile */}
                <div className="hidden sm:flex items-center gap-1 bg-white/10 hover:bg-white/15 px-1.5 sm:px-2 py-0.5 rounded-lg border border-white/5 transition-all text-[10px]">
                  <button 
                    onClick={() => {
                      const walls = ["neon", "peach", "cosmic", "aurora", "cherry", "starlight"];
                      const idx = walls.indexOf(ipadWallpaper);
                      const nextWall = walls[(idx + 1) % walls.length];
                      setIpadWallpaper(nextWall);
                      handleAddSystemLog(`🔮 快捷切换壁纸：已轮换至「${
                        nextWall === "neon" ? "霓虹" : 
                        nextWall === "peach" ? "蜜桃" : 
                        nextWall === "cosmic" ? "星寰" : 
                        nextWall === "aurora" ? "极光" :
                        nextWall === "cherry" ? "樱粉" : "星汉"
                      }」`);
                    }}
                    className="hover:bg-white/10 p-0.5 rounded text-pink-400 active:scale-90 transition-all flex items-center gap-1 font-bold cursor-pointer"
                    title="点击快捷轮换专属壁纸"
                  >
                    <Image className="w-2.5 h-2.5 text-pink-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-350 hidden md:inline">壁纸</span>
                  </button>
                  <div className="flex gap-1">
                    {[
                      { id: "neon", color: "bg-purple-500", name: "霓虹" },
                      { id: "peach", color: "bg-orange-400", name: "蜜桃" },
                      { id: "cosmic", color: "bg-indigo-650", name: "星寰" },
                      { id: "aurora", color: "bg-teal-500", name: "极光" },
                      { id: "cherry", color: "bg-pink-400", name: "樱粉" },
                      { id: "starlight", color: "bg-amber-300", name: "星汉" }
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setIpadWallpaper(w.id);
                          handleAddSystemLog(`🔮 壁纸选择：已切换至「${w.name}」专属桌面`);
                        }}
                        className={`w-2 h-2 rounded-full transition-all hover:scale-130 cursor-pointer ${w.color} ${ipadWallpaper === w.id ? "ring-1.5 ring-white scale-125 shadow-md" : "opacity-60"}`}
                        title={`切换为: ${w.name}`}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setIsControlCenterOpen(!isControlCenterOpen)}
                  className="p-1 hover:bg-white/10 rounded transition-all cursor-pointer text-slate-300 active:scale-95"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 👥 企划多开与双人/三人组合多开控制台 */}
            {personas.length > 1 && (
              <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs relative z-40 select-none">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400 font-mono tracking-wider">
                    🌌 Combo Group Dual Space (自创组合多开独立运行空间)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
                  {personas.map((p, idx) => {
                    const isCurrent = activePersonaIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isInteractionBlocking) {
                            triggerToast(
                              `⚠️ 企划决断未锁定`,
                              `请先处理完当前成员 [${p.name}] 的次日晚间复盘报告或粉丝狂热危机事件，才能切换专线！`,
                              "warning"
                            );
                            return;
                          }
                          setActivePersonaIdx(idx);
                          triggerToast(
                            `🎮 组合双开环境切线`, 
                            `已完美切换至组合成员 [${p.name}] 专属加密系统环境和所有单独的Kakao/Weverse通讯链路！`, 
                            "success"
                          );
                        }}
                        className={`px-3.5 py-1 text-xs rounded-full font-semibold flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                          isCurrent
                            ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-pink-500/20 scale-103 ring-1.5 ring-white/20"
                            : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                        }`}
                      >
                        <span className="text-[9px] bg-white/10 px-1 py-0.2 rounded uppercase font-mono">成员{idx+1}</span>
                        <span>{p.name}</span>
                        <span className="text-[9px] text-slate-350/80 font-mono">({p.stageName})</span>
                        {isCurrent && <span className="text-[9px] px-1 py-0.1 bg-white/25 rounded animate-pulse">LIVE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUICK SETTINGS CONTROL BOARD */}
            {isControlCenterOpen && (
              <div id="quick-controls" className="absolute top-9 right-4 w-72 bg-slate-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3 text-xs text-slate-400">
                  <span className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" /> Control Depot</span>
                  <button onClick={() => setIsControlCenterOpen(false)} className="hover:text-white">Close</button>
                </div>

                <div className="space-y-3.5 text-xs text-slate-350">
                  <div>
                    <span className="text-slate-400 block mb-1">更换iPad专属壁纸:</span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[
                        { id: "neon", name: "霓虹" },
                        { id: "peach", name: "蜜桃" },
                        { id: "cosmic", name: "星寰" },
                        { id: "aurora", name: "极光" },
                        { id: "cherry", name: "樱粉" },
                        { id: "starlight", name: "星汉" }
                      ].map((wall) => (
                        <button
                          key={wall.id}
                          onClick={() => { setIpadWallpaper(wall.id); setIsControlCenterOpen(false); }}
                          className={`py-1 rounded text-[8px] text-center capitalize border ${ipadWallpaper === wall.id ? "border-purple-500 bg-purple-500/20 text-purple-300 font-bold" : "border-white/5 bg-slate-900/60"}`}
                        >
                          {wall.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border border-white/5 transition-all duration-500 ${activeTheme.sideCardBg_1}`}>
                    <span className={`block font-bold text-[11px] mb-1 transition-all ${activeTheme.textAccent}`}>Idol Overview</span>
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      舞台名: <strong className="text-white">{persona.stageName}</strong><br />
                      公司: {persona.company.split(" ")[0]} ({persona.companySplit})<br />
                      国籍定位: <span className="text-yellow-400 uppercase">{persona.nationality.replace("_", " ")}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <button
                      onClick={() => { setShowUpdateModal(true); setIsControlCenterOpen(false); }}
                      className="w-full py-1.5 px-2 bg-gradient-to-r from-purple-700/80 to-indigo-700/80 hover:from-purple-600 hover:to-indigo-600 text-purple-100 hover:text-white border border-purple-500/30 rounded-xl text-center transition-all cursor-pointer font-extrabold flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> 🍲 查看企划社全量更新日志
                    </button>
                    <button
                      onClick={() => { setConfirmAction("new_game"); setIsControlCenterOpen(false); }}
                      className={`w-full py-1.5 px-2 ${activeTheme.accentBtn} rounded text-center transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> 🔁 开启新神颜档 (New Game)
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { handleSwitchApp("settings"); }}
                        className="flex-1 py-1 px-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-center text-[10px] transition-all cursor-pointer"
                      >
                        📊 数据备份 (Cloud)
                      </button>
                      <button
                        onClick={() => { setConfirmAction("delete_save"); setIsControlCenterOpen(false); }}
                        className="py-1 px-2.5 bg-red-950/45 hover:bg-red-800 text-red-200 border border-red-500/15 rounded text-[10px] cursor-pointer flex items-center gap-1 font-bold"
                        title="删除当前存档"
                      >
                        🗑️ 删档 (Purge)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DUAL MAIN INTERACTIVE AREAS */}
            <div id="ipad-main-screen" className="flex-1 flex flex-col landscape:flex-row md:flex-row overflow-hidden relative min-h-0">
              
              {/* STATUS BAR DRAWER METERS (Requirement 11, 12, 13) */}
              <div 
                id="quick-side-meters" 
                className={`w-full landscape:w-[200px] md:w-[220px] ${activeTheme.sideBg} border-b landscape:border-b-0 md:border-b-0 landscape:border-r md:border-r border-white/5 p-4 flex-col justify-between shrink-0 select-none overflow-y-auto transition-all duration-500 ${
                  isQuickSideMetersOpen 
                    ? "absolute landscape:relative md:relative inset-x-0 top-0 h-[450px] landscape:h-auto md:h-auto z-40 bg-slate-950/98 landscape:bg-transparent shadow-2xl landscape:shadow-none flex" 
                    : "hidden landscape:flex md:flex"
                }`}
              >
                {/* Mobile Close Button for Quick Side Meters */}
                <div className="md:hidden flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-350">📊 属性与状态参数</span>
                  <button 
                    onClick={() => setIsQuickSideMetersOpen(false)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg text-[10px] text-slate-300 font-bold active:scale-95 cursor-pointer"
                  >
                    收起 ✕
                  </button>
                </div>
                <div className="space-y-4">
                  
                  {/* Persona Bio Badge */}
                  <div className={`p-3 ${activeTheme.sideCardBg_2} rounded-2xl relative shadow-md transition-all duration-500`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0 border border-purple-500/35 shadow animate-pulse">
                        {persona.stageName.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 truncate block">{persona.stageName}</span>
                        <span className={`text-[8px] font-mono text-slate-450 block uppercase ${activeTheme.textAccent}`}>★ {persona.mbti}</span>
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-400 italic mt-2 border-t border-white/5 pt-1.5 leading-relaxed">
                      {persona.vibeText}
                    </p>
                  </div>

                  {/* Detailed Profile Specifications */}
                  <div className={`p-2.5 ${activeTheme.sideCardBg_2} rounded-xl space-y-1 text-[10px] text-slate-350 transition-all duration-500`}>
                    <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
                      <span className="text-[8px] text-slate-400 uppercase font-mono font-bold">🔍 详实身份档案</span>
                      <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold block ${activeTheme.badgeAccent}`}>{persona.bloodType || "O型"}</span>
                    </div>
                    <div className="space-y-1 leading-tight">
                      <div>
                        <span className="text-[8px] text-slate-500">生辰星盘: </span>
                        <span className="text-slate-200 font-mono text-[9px]">
                          {persona.birthday || "2006-01-08"} ({persona.zodiac || "魔羯座"}) | {getCurrentAge(persona.age, persona.dayNumber, 18, persona.cycleDays || 36)}岁
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500">具体国籍: </span>
                        <span className="text-slate-200 block truncate text-[9px]" title={persona.specificNationality || "韩国首尔"}>{persona.specificNationality || "韩国首尔"}</span>
                      </div>
                    </div>
                    {persona.isMixed && (
                      <div className={`pt-1 border-t border-white/5 flex justify-between text-[8px] ${activeTheme.textAccent}`}>
                        <span>🧬 混血世家:</span>
                        <strong>{persona.mixedCountries || "中韩混血"}</strong>
                      </div>
                    )}
                    <div className="pt-1 border-t border-white/5 grid grid-cols-3 gap-1 text-[8px] text-slate-400 leading-tight">
                      <div className="text-center bg-slate-900/50 p-1 rounded">
                        <span className="text-[7px] text-slate-500 block">眼型</span>
                        <span className="text-white font-semibold block truncate text-[8px]">{persona.eyeShape ? persona.eyeShape.split(" ")[0] : "瑞凤眼"}</span>
                      </div>
                      <div className="text-center bg-slate-900/50 p-1 rounded">
                        <span className="text-[7px] text-slate-500 block">瞳色</span>
                        <span className="text-white font-semibold block truncate text-[8px]">{persona.eyeColor ? persona.eyeColor.split(" ")[0] : "茶黑"}</span>
                      </div>
                      <div className="text-center bg-slate-900/50 p-1 rounded">
                        <span className="text-[7px] text-slate-500 block">鼻部</span>
                        <span className="text-white font-semibold block truncate text-[8px]">{persona.noseShape ? persona.noseShape.split(" ")[0] : "小翘鼻"}</span>
                      </div>
                    </div>
                  </div>

                  {/* High Quality interactive stat progression bars */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-bold">
                      RPG 属性及健康系数
                    </span>

                    {/* Popularity */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400 flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" /> 实时人气 (Pop)</span>
                        <span className="font-mono font-bold text-orange-300">{persona.popularity}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${persona.popularity}%` }} />
                      </div>
                    </div>

                    {/* Reputation */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400 flex items-center gap-0.5"><Award className="w-3 h-3 text-teal-400" /> 业界美誉 (Rep)</span>
                        <span className="font-mono font-bold text-teal-300">{persona.reputation}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full" style={{ width: `${persona.reputation}%` }} />
                      </div>
                    </div>

                    {/* Physical Weight */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-slate-400">上镜体重 (Weight)</span>
                        <span className="font-mono font-bold text-rose-300">{persona.weight.toFixed(1)} kg</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, Math.max(20, (persona.weight / 65) * 100))}%` }} />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="space-y-3.5 border-t border-white/5 pt-3 mt-1 shrink-0">
                  {/* Wallet */}
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-mono block">旗下艺人现金与提成余额</span>
                    <span className="text-base font-bold text-yellow-300 font-mono mt-0.5 block flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500 animate-spin" /> ₩ {persona.money.toLocaleString()} 万
                    </span>
                  </div>

                  {/* Teammates or Sibling Relationship Favorability status (Requirement 13) */}
                  <div className={`p-2.5 ${activeTheme.sideCardBg_1} rounded-xl transition-all duration-500`}>
                    <span className="text-[9px] block text-slate-400 uppercase font-mono mb-1">团队主管与成员关系度</span>
                    <div className="space-y-1 text-[10px] text-slate-300">
                      <div className="flex justify-between">
                        <span>👔 {persona.gender === "female" ? "严" : "闵"}室长:</span>
                        <span className="font-bold font-mono text-purple-400">{persona.managerFavorability}/100</span>
                      </div>
                      {persona.style === "group" && (
                        <div className="flex justify-between">
                          <span>👯‍♂️ 组合队员:</span>
                          <span className="font-bold font-mono text-pink-400">{persona.teammatesFavorability}/100</span>
                        </div>
                      )}
                    </div>
                    {persona.managerFavorability < 35 && (
                      <p className="text-[8px] text-red-400 mt-1.5 leading-relaxed">
                        ⚠️ <strong>高危警报:</strong> 您和主管关系恶劣，年末舞台等资源面临克扣待机室冷脸！
                      </p>
                    )}
                  </div>

                  {/* Retire & View Ending Action */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <button
                      type="button"
                      id="apply-retirement-btn"
                      onClick={() => {
                        if (confirm("👑 您确定要在这一刻交付所有的功勋徽章并正式申请退役结算以开启生涯大结局吗？")) {
                          handleTriggerEnding();
                        }
                      }}
                      className="w-full py-2 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 hover:from-teal-600 hover:to-emerald-600 text-teal-300 hover:text-white border border-teal-500/30 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-900/10"
                    >
                      🏆 申请退役与生涯结局 (Ending)
                    </button>
                    <p className="text-[7.5px] text-center text-slate-400 leading-normal font-sans">
                      完成 3 年合约后（即第 {(persona.cycleDays || 36) * 3 + 1} 天）将自动收官，也可点击上方提前开启多达 8 种宿命结局！
                    </p>
                  </div>
                </div>
              </div>

              {/* DYNAMIC APP GRID ROUTING AREA */}
              <div className={`flex-1 flex flex-col justify-between min-w-0 ${activeTheme.activeAppContainerBg} relative transition-all duration-500`}>
                
                {/* Dynamic App content display canvases */}
                <div className="flex-1 p-2 xs:p-3 md:p-6 flex flex-col min-h-0 h-[calc(100vh-140px)] md:h-auto overflow-y-auto flex-shrink-0">
                  
                  {activeApp === "schedule" && (
                    <SchedulesApp
                      persona={persona}
                      personas={personas}
                      schedules={schedules}
                      weversePosts={weversePosts}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      onUpdatePersona={(p) => {
                        setPersona(p);
                        triggerAutoSave(p, teammates, chatHistories, weversePosts, bubbleMessages, schedules);
                      }}
                      onUpdateSchedules={(schs) => {
                        setSchedules(schs);
                        triggerAutoSave(persona, teammates, chatHistories, weversePosts, bubbleMessages, schs);
                      }}
                      onUpdateWeversePosts={(posts) => {
                        setWeversePosts(posts);
                        triggerAutoSave(persona, teammates, chatHistories, posts, bubbleMessages, schedules);
                      }}
                      onNextDayTransition={(newPersona, newSchedules, newWeversePosts, newManagerMsg, proactiveMessage) => {
                        // Check for global contract expiration automatic career ending (dynamic based on cycleDays)
                        const maxEndingDay = (newPersona.cycleDays || 36) * 3 + 1;
                        if (newPersona.dayNumber >= maxEndingDay) {
                          handleTriggerEnding(newPersona);
                          return;
                        }

                        // 3. Random slowly shifting fan base distribution based on active day actions
                        let updatedFansDist = { ...(newPersona.fansDistribution || { otFans: 50, soloFans: 25, cpFans: 15, antiFans: 10 }) };
                        if (newPersona.style === "solo") {
                          updatedFansDist.otFans = 0;
                        }
                        // Randomly shift 1-2 points from antiFans to otFans/soloFans if reputation is high, otherwise increase anti-fans!
                        if (newPersona.reputation >= 65) {
                          if (updatedFansDist.antiFans > 5) {
                            updatedFansDist.antiFans -= 1;
                            if (newPersona.style === "solo") {
                              updatedFansDist.soloFans += 1;
                            } else {
                              updatedFansDist.otFans += 1;
                            }
                          }
                        } else {
                          updatedFansDist.antiFans += 1;
                          if (newPersona.style === "solo") {
                            if (updatedFansDist.soloFans > 20) {
                              updatedFansDist.soloFans -= 1;
                            }
                          } else {
                            if (updatedFansDist.otFans > 20) {
                              updatedFansDist.otFans -= 1;
                            }
                          }
                        }
                        
                        // If style is solo, shift towards soloFans. If style is group, shift towards otFans
                        if (newPersona.style === "solo") {
                          if (updatedFansDist.otFans > 0) {
                            updatedFansDist.soloFans += updatedFansDist.otFans;
                            updatedFansDist.otFans = 0;
                          }
                        } else {
                          if (updatedFansDist.soloFans > 10) {
                            updatedFansDist.soloFans -= 1;
                            updatedFansDist.otFans += 1;
                          }
                        }
                        
                        newPersona.fansDistribution = updatedFansDist;

                        let evaluationTriggered = false;
                        
                        // A. Check for trainee debut evaluation on Day 36+ (dynamic based on cycleDays)
                        const evaluationTargetDay = (persona.cycleDays || 36) + 1;
                        if (persona.startType === "trainee" && newPersona.dayNumber >= evaluationTargetDay) {
                          evaluationTriggered = true;
                          const totalTalent = newPersona.vocalSkill + newPersona.danceSkill + newPersona.rapSkill + newPersona.varietySkill;
                          const repValue = newPersona.reputation;
                          const stressValue = newPersona.stress;
                          
                          if (totalTalent >= 150 && repValue >= 65 && stressValue < 80) {
                            setDebutEvaluationStatus("success");
                          } else {
                            setDebutEvaluationStatus("fail");
                          }
                        }

                        // B. Check for birthday mini game trigger (Group / Coordinated Anniversary checking)
                        const currentPeriod = getCalendarPeriod(newPersona.dayNumber, newPersona.cycleDays || 36);
                        const bdayPeriodIndices: number[] = [];
                        personas.forEach((p, idx) => {
                          const bdayVal = idx === activePersonaIdx ? newPersona.birthday : p.birthday;
                          const bPeriod = getBirthdayPeriod(bdayVal);
                          if (bPeriod && bPeriod.month === currentPeriod.month && bPeriod.period === currentPeriod.period) {
                            bdayPeriodIndices.push(idx);
                          }
                        });

                        if (bdayPeriodIndices.length > 0) {
                          setBirthdayPersonaIndices(bdayPeriodIndices);
                          setShowBirthdayEvent(true);
                          const celebratingNames = bdayPeriodIndices.map(idx => (idx === activePersonaIdx ? newPersona.stageName : personas[idx].stageName)).join(" & ");
                          handleAddSystemLog(`🎂 【生日大吉】当前历法轮转到了 [${celebratingNames}] 的专属生日旬！全厂牌及应援唯粉精心筹备了联合生日专属迎新庆典与感恩游戏！`);
                        }
                        
                        // B. Check for secret dating leak scandal risk or breakup crisis (ONLY if they didn't trigger trainee debut evaluation, or they are already an idol)
                        if (!evaluationTriggered && newPersona.hasLover) {
                          const currentMood = newPersona.loverMood ?? 80;
                          
                          // B1. Breakup threat check due to low lover mood/guilt (Requirement 13)
                          if (currentMood < 45 && newPersona.relationshipStatus === "dating") {
                            const breakupCrisisRolled = Math.random() < 0.35; // 35% chance on day transition
                            if (breakupCrisisRolled) {
                              newPersona.relationshipStatus = "broken_up";
                              newPersona.stress = Math.min(100, newPersona.stress + 20);
                              
                              setScandalModal({
                                detected: true,
                                ceoPassed: false,
                                managerPassed: false,
                                teammatesPassed: false,
                                shielded: false,
                                outcomeText: `【💔 情感极地：地下伙伴 (${newPersona.loverName}) 单方面宣告暂时离场！】`,
                                details: `与你携手在温润暗夜里的 ${newPersona.loverName} (当前安民心情 ${currentMood}) 心头压覆的愧疚罪意已彻底决口。Ta认为不能再贪恋这种带着密集窃贼般罪感的相伴：‘每次听到你唯粉砸巨资买周边只为看你全神宣称为她们守身、高呼你是世界上唯一无暇的纯爱时，我的胸口都在滴血。对不起... 我们先退出来吧。放过你，也放过对粉丝的良心欺骗，请让我静静。’\n\n【惩罚】地下恋情状态变为【已分手】！压力值大幅激增 20 点！赶紧通过 KakaoTalk 与Ta谈心或者写三页自省长信挽回吧。当心情重新重筑升至 50 ％ 左右，即可主页或聊天里捧着黄玫瑰登门复合！`
                              });
                              handleAddSystemLog(`📫 【💔 情感破防】秘密地下恋人 ${newPersona.loverName} 无法忍受愧对粉丝的道德谴责，单方面与您宣告【已分手】！请火速在 Kakao 软件内予以安抚开导！`);
                            }
                          }
                          
                          // B2. Scandal risk depending on loverMood (Requirement 13)
                          if (newPersona.relationshipStatus === "dating") {
                            // High mood is careful (8%), low mood is disorganized (32%), normal is 16%.
                            const scandalChance = currentMood >= 85 ? 0.08 : currentMood < 55 ? 0.32 : 0.16;
                            const scandalRolled = Math.random() < scandalChance;
                            
                            if (scandalRolled) {
                              const ceoPassed = newPersona.ceoFavorability >= 45;
                              const managerPassed = newPersona.managerFavorability >= 45;
                              const teammatesPassed = newPersona.style === "group" && newPersona.teammatesFavorability >= 45;
                              const shielded = ceoPassed || managerPassed || teammatesPassed;
                              
                              let outcomeText = "";
                              let details = "";
                              
                              if (ceoPassed) {
                                newPersona.traineeDebt += 1500; // Build up debt
                                outcomeText = `【🚨 绯闻漏风：李秉旭社长秘密下场掩盖成功！】`;
                                details = `你平素勤恳的表现与高达 ${newPersona.ceoFavorability} 的高管认可度发挥了关键作用！社长得到D社长焦照密函后大发雷霆，但也明白你现阶段是Aether Label的绝对摇钱树。代表直接动用 ₩1,500w 黄金公关基金，赶在新闻排版前私了并买断了全部母带！虽然逃过一劫，但代表冷笑着给你记了账：新增 ₩1,500w 危机公关公摊债务！下次注意点！`;
                                updatedFansDist.antiFans = Math.min(100, updatedFansDist.antiFans + 3);
                              } else if (managerPassed) {
                                outcomeText = `【🚨 绯闻漏风：闵室长启动‘肉身公关’完美化解！】`;
                                details = `你的闵经纪人（好感度 ${newPersona.managerFavorability}）在业界人脉极广，在深夜截获了风声。她直接将该合照解释为‘深夜造型测试及公司工作便当品鉴会’。她带队连夜狂刷超话，把热度转移为其他八卦。虽然你被记过了一次并没收手机两天，但名誉保住了！没有增加半毛钱负债，爱死她了！`;
                                updatedFansDist.antiFans = Math.min(100, updatedFansDist.antiFans + 1);
                              } else if (teammatesPassed) {
                                outcomeText = `【🚨 绯闻漏风：团魂爆发！队友们发布‘全员宿舍炸鸡围坐图’挡枪！】`;
                                details = `患难见真情！你的队友们（集体好感度 ${newPersona.teammatesFavorability}）没有选择对你冷嘲热讽落井下石，而是立刻在官网上发布了整整一组嘻嘻哈哈 of 的晚间炸鸡自拍合照，配文‘当晚和亲爱的大家、编舞欧巴以及好朋友一起在排练喔！’ 成功让舆论相信这只是寻常的工作小聚！粉丝们松了一大口气，甚至磕起了你们的‘友情大团圆’！`;
                                updatedFansDist.otFans = Math.min(100, updatedFansDist.otFans + 5);
                                updatedFansDist.cpFans = Math.min(100, updatedFansDist.cpFans + 3);
                              } else {
                                // FAILED!! PUBLIC FALLOUT DISASTER!
                                newPersona.relationshipStatus = "revealed"; // SET STATUS!
                                newPersona.reputation = Math.max(10, newPersona.reputation - 30);
                                newPersona.popularity = Math.min(100, newPersona.popularity + 15); // Black publicity makes you famous
                                newPersona.stress = Math.min(100, newPersona.stress + 45); // VERY STRESSFUL
                                
                                updatedFansDist.antiFans = Math.min(100, updatedFansDist.antiFans + 25);
                                updatedFansDist.soloFans = Math.max(0, updatedFansDist.soloFans - 12);
                                updatedFansDist.otFans = Math.max(0, updatedFansDist.otFans - 13);
                                
                                outcomeText = `【🚨 致命泄露：D社重磅绯闻全国曝光！舆论全面失控！】`;
                                details = newPersona.style === "solo"
                                  ? `灾难发生了！你在公司内部孤立无援，关键时刻不仅没有得到李代表公关经费支持，闵室长表示无能为力。你和秘密交往的 ${newPersona.loverName.split(" - ").pop() || newPersona.loverName} 的高清深夜牵手拥抱长焦大图，口子一旦漏底，直接登上娱乐新闻爆词首位！\n\n粉丝圈发生大地震，大量死忠脱粉回踩、大开黑号！全网怒控‘拿青春应援结果养你在温香软玉里泡茶！’ 好感代表性雪崩，你的名誉度暴跌 30 点，精神压力几近红区极限！`
                                  : `灾难发生了！你在公司上上下下塑料情谊，关键时刻不仅没有得到李代表公关经费支持，闵室长表示无能为力，队友更是对此视若无睹冷眼旁观。你和秘密交往的 ${newPersona.loverName.split(" - ").pop() || newPersona.loverName} 的高清深夜牵手拥抱长焦大图，口子一旦漏底，直接登上娱乐新闻爆词首位！\n\n粉丝圈发生大地震，大量死忠脱粉回踩、大开黑号！全网怒控‘拿青春应援结果养你在温香软玉里泡茶！’ 好感代表性雪崩，你的名誉度暴跌 30 点，精神压力几近红区极限！`;
                              }
                              
                              newPersona.fansDistribution = updatedFansDist;
                              
                              setScandalModal({
                                detected: true,
                                ceoPassed,
                                managerPassed,
                                teammatesPassed,
                                shielded,
                                outcomeText,
                                details
                              });
                            }
                          }
                        }

                        // D. Random check for Fan Mail arrival on morning setup (e.g. 40% daily chance)
                        if (Math.random() < 0.40) {
                          const freshMail = generateRandomFanLetter(newPersona, newPersona.dayNumber);
                          setArrivedMailPopup(freshMail);
                          setFanLetters(prev => {
                            const nextLetters = [freshMail, ...prev];
                            triggerAutoSave(newPersona, teammates, chatHistories, newWeversePosts, bubbleMessages, newSchedules, nextLetters);
                            return nextLetters;
                          });
                          handleAddSystemLog(`📫 【信物送件】有热心粉丝的手写实体信已寄达厂牌前台小货架！快去小卡盒里查看！`);
                        }

                        if (personas.length > 1) {
                          setPersonas(prev => prev.map((p, idx) => {
                            if (idx === activePersonaIdx) {
                              return newPersona;
                            } else {
                              const sibling = { ...p };
                              sibling.dayNumber = newPersona.dayNumber; // Keep dayNumber in lock-step!
                              sibling.energy = Math.min(100, sibling.energy + 50); // Overnight rest
                              sibling.stress = Math.max(0, sibling.stress - 15);
                              
                              // Check standard skin decay chance for the teammate
                              let skinDecayChance = sibling.stress > 65 ? 0.75 : 0.08;
                              const nextWeather = getSeoulWeather(sibling.dayNumber);
                              if (nextWeather.type === "dry") skinDecayChance += 0.25;
                              else if (nextWeather.type === "rainy") skinDecayChance += 0.20;
                              else if (nextWeather.type === "hot") skinDecayChance += 0.15;
                              else if (nextWeather.type === "cold") skinDecayChance += 0.20;

                              if (Math.random() < skinDecayChance) {
                                if (sibling.skinCondition === "perfect") sibling.skinCondition = "glowing";
                                else if (sibling.skinCondition === "glowing") sibling.skinCondition = "troubled";
                                else if (sibling.skinCondition === "troubled") sibling.skinCondition = Math.random() > 0.5 ? "breakout" : "exhausted";
                                else if (sibling.skinCondition === "breakout") sibling.skinCondition = "exhausted";
                              }

                              // Auto-execute teammate's queued completed tasks to gain passive attributes!
                              const siblingSchedules = personasSchedules[idx] || [];
                              siblingSchedules.forEach(sch => {
                                if (sch.completed) {
                                  sibling.fansCount += sch.rewardPopularity * 40;
                                  sibling.reputation = Math.min(100, sibling.reputation + sch.rewardReputation);
                                }
                              });

                              // traineeDebt is synchronized group-wide
                              sibling.traineeDebt = newPersona.traineeDebt;

                              return sibling;
                            }
                          }));

                          setPersonasSchedules(prev => prev.map((schs, idx) => {
                            if (idx === activePersonaIdx) {
                              return newSchedules;
                            } else {
                              return getFixedSkillSchedules(newPersona.dayNumber);
                            }
                          }));

                          setPersonasWeversePosts(prev => prev.map((posts, idx) => {
                            if (idx === activePersonaIdx) {
                              return newWeversePosts;
                            } else {
                              return posts;
                            }
                          }));

                          setPersona(newPersona);
                          setSchedules(newSchedules);
                          setWeversePosts(newWeversePosts);
                        } else {
                          setPersona(newPersona);
                          setSchedules(newSchedules);
                          setWeversePosts(newWeversePosts);
                        }
                        
                        let stalkerAdded = false;
                        const stalkerId = `sasaeng_${newPersona.dayNumber}`;
                        let stalkerCreepyText = "";
                        let stalkerContact: ChatContact | null = null;
                        
                        // 55% chance of stalker harassment exactly once on day transition
                        if (newPersona.dayNumber > 1 && Math.random() < 0.55) {
                          const creepyMsgs = [
                            "姐姐，你刚才在练习室里跳舞穿的灰色卫衣很配你哦... 嘻嘻。你猜我是趴在天花板的空调管道，还是在对面公寓的顶楼举着望远镜看你呢？",
                            "宝贝，我搞到了你明天要去的那家江南美容室做私域面部护理的水乳配方哦... 喜欢我寄到你宿舍大门的爱心包裹吗？",
                            "千万不要拉黑我的Kakaotalk，不然我明天就把你那张没修过的浮肿丑图连夜大喇叭到各个吃瓜论坛上去！",
                            "姐姐，你新宿舍的安全门锁密码是 2038# 对不对？我昨晚深夜试了一下，锁开了报备耶... 放心，我只在你床底下留了一支微型录音笔噢~"
                          ];
                          stalkerCreepyText = creepyMsgs[Math.floor(Math.random() * creepyMsgs.length)];
                          stalkerContact = {
                            id: stalkerId,
                            name: `🤐 匿名未知私域来电 [私生粉丝]`,
                            mbti: "XXXX型人格",
                            avatar: "",
                            role: "fan",
                            lastMessage: stalkerCreepyText,
                            unread: true,
                            time: "刚刚",
                            favorability: -99
                          };
                          stalkerAdded = true;
                        }

                        if (stalkerAdded) {
                          handleAddSystemLog(`【🔴 KAKAOTALK 安全警报】极其有害！发现有私生粉高价买通不法渠道获取了您的私密 Kakaotalk 账号并向您投送私域骚扰监视言论，请在通讯软件中极其理智地小心回复处置！`);
                        }

                        setChatHistories(prev => {
                          let nextHists = { ...prev };
                          
                          // 1. Add manager message if present
                          if (newManagerMsg) {
                            const mgrHist = nextHists["manager"] || [];
                            const isDuplicate = mgrHist.some(msg => msg.text === newManagerMsg);
                            if (!isDuplicate) {
                              nextHists["manager"] = [
                                ...mgrHist,
                                {
                                  id: `mgr_trans_${Date.now()}`,
                                  sender: "other",
                                  text: newManagerMsg,
                                  time: "上午 08:30"
                                }
                              ];
                            }
                          }

                          // 2. Add proactive message if present
                          let triggeredSenderId: string | undefined = undefined;
                          if (proactiveMessage && proactiveMessage.text) {
                            const matchId = proactiveMessage.senderId;
                            // Search teammates to see if name matches
                            const matchedTeammate = teammates.find(t => 
                              t.id === matchId || 
                              t.name.toLowerCase().includes(String(matchId).toLowerCase()) || 
                              t.stageName.toLowerCase().includes(String(matchId).toLowerCase())
                            );
                            
                            const parsedId = matchedTeammate ? matchedTeammate.id : (matchId === "ceo" || matchId === "rival") ? matchId : undefined;
                            const finalSenderId = parsedId || (teammates.length > 0 ? teammates[Math.floor(Math.random() * teammates.length)].id : "ceo");
                            
                            triggeredSenderId = finalSenderId;
                            const hist = nextHists[finalSenderId] || [];
                            const isDuplicate = hist.some(msg => msg.text === proactiveMessage.text);
                            if (!isDuplicate) {
                              nextHists[finalSenderId] = [
                                ...hist,
                                {
                                  id: `proactive_trans_${Date.now()}`,
                                  sender: "other",
                                  text: proactiveMessage.text,
                                  time: proactiveMessage.time || "上午 09:15"
                                }
                              ];
                            }
                          }

                          // 3. Add stalker message in transition if generated
                          if (stalkerAdded && stalkerContact) {
                            if (!nextHists[stalkerId]) {
                              nextHists[stalkerId] = [
                                {
                                  id: `creepy_init_${Date.now()}`,
                                  sender: "other",
                                  text: stalkerCreepyText,
                                  time: "刚刚"
                                }
                              ];
                            }
                          }

                          // 4. Update contact list state (including stalker injection)
                          setChatContacts(conts => {
                            let updatedConts = conts.map(c => {
                              if (c.id === "manager" && newManagerMsg) {
                                return {
                                  ...c,
                                  lastMessage: newManagerMsg.substring(0, 30) + (newManagerMsg.length > 30 ? "..." : ""),
                                  unread: true,
                                  time: "上午 08:30"
                                };
                              }
                              if (triggeredSenderId && c.id === triggeredSenderId && proactiveMessage) {
                                return {
                                  ...c,
                                  lastMessage: proactiveMessage.text.substring(0, 30) + (proactiveMessage.text.length > 30 ? "..." : ""),
                                  unread: true,
                                  time: proactiveMessage.time || "上午 09:15"
                                };
                              }
                              return c;
                            });

                            if (stalkerAdded && stalkerContact) {
                              const stalkerExists = updatedConts.some(c => c.id === stalkerId);
                              if (!stalkerExists) {
                                updatedConts = [stalkerContact, ...updatedConts];
                              }
                            }
                            return updatedConts;
                          });
                          
                           // Check if new day date is the user's Birthday! (Group/Coordinated exact birthday checking)
                          const isBday = (bdayStr: string, dayN: number): boolean => {
                            if (!bdayStr) return false;
                            const parts = bdayStr.split("-");
                            if (parts.length !== 3) return false;
                            const birthMonth = parseInt(parts[1], 10);
                            const birthDay = parseInt(parts[2], 10);
                            
                            const simDate = new Date(2026, 4, 29); // May 29, 2026 starting point
                            simDate.setDate(simDate.getDate() + (dayN - 1));
                            const simMonth = simDate.getMonth() + 1;
                            const simDateDay = simDate.getDate();
                            
                            return birthMonth === simMonth && birthDay === simDateDay;
                          };

                          const celebratingBdayDateIndices: number[] = [];
                          personas.forEach((p, idx) => {
                            const bdayVal = idx === activePersonaIdx ? newPersona.birthday : p.birthday;
                            if (isBday(bdayVal, newPersona.dayNumber)) {
                              celebratingBdayDateIndices.push(idx);
                            }
                          });

                          if (celebratingBdayDateIndices.length > 0) {
                            setBirthdayPersonaIndices(celebratingBdayDateIndices);
                            setShowBirthdayEvent(true);
                            const celebratingNames = celebratingBdayDateIndices.map(idx => (idx === activePersonaIdx ? newPersona.stageName : personas[idx].stageName)).join(" & ");
                            handleAddSystemLog(`🎂 【联合生日限定特别剧情】天呐！今天正好逢着组合本命成员 [${celebratingNames}] 在档案中设定的专属生日公历日期！全社队友、闵室长已在保姆车中为您筹划联合重磅惊喜现场，生日限定大礼包已上线！`);
                            triggerToast("🎂 Happy Birthday!", `今天到达了 [${celebratingNames}] 的专属生日，联合生日限定庆典游戏已被唤醒！`, "success");
                          }

                          triggerAutoSave(newPersona, teammates, nextHists, newWeversePosts, bubbleMessages, newSchedules);
                          
                          if (isAutoSummarizeEnabled) {
                            setTimeout(() => {
                              handleTriggerAutoSummarizeAll(false, nextHists);
                            }, 400);
                          }
                          return nextHists;
                        });
                      }}
                      onTriggerRandomEvent={handleTriggerRandomEvent}
                      onAddLog={handleAddSystemLog}
                      onBlockingChange={setIsInteractionBlocking}
                    />
                  )}

                  {activeApp === "fanmail" && (
                    <FanMailApp
                      persona={persona}
                      teammates={teammates}
                      fanLetters={fanLetters}
                      onUpdateLetters={(letters) => {
                        setFanLetters(letters);
                        triggerAutoSave(persona, teammates, chatHistories, weversePosts, bubbleMessages, schedules, letters);
                      }}
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                    />
                  )}

                  {activeApp === "kakaotalk" && (
                    <KakaoTalkApp
                      persona={persona}
                      teammates={teammates}
                      chatContacts={chatContacts}
                      chatHistories={chatHistories}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      onUpdateHistories={(hist, conts) => {
                        setChatHistories(hist);
                        setChatContacts(conts);
                        triggerAutoSave(persona, teammates, hist);
                      }}
                      onAddLog={handleAddSystemLog}
                      onUpdatePersona={(updatedPersona) => {
                        setPersona(updatedPersona);
                        const updatedContacts = chatContacts.map(c => {
                          if (c.id === "lover") {
                            return {
                              ...c,
                              favorability: updatedPersona.loverMood ?? 80
                            };
                          }
                          return c;
                        });
                        setChatContacts(updatedContacts);
                        triggerAutoSave(updatedPersona, teammates, chatHistories, weversePosts, bubbleMessages, schedules, fanLetters);
                      }}
                      personas={personas}
                    />
                  )}

                  {activeApp === "weverse" && (
                    <WeverseApp
                      persona={persona}
                      weversePosts={weversePosts}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      onUpdatePosts={(posts) => {
                        setWeversePosts(posts);
                        triggerAutoSave(persona, teammates, chatHistories, posts);
                      }}
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                      personas={personas}
                    />
                  )}

                  {activeApp === "bubble" && (
                    <BubbleApp
                      persona={persona}
                      teammates={teammates}
                      bubbleMessages={bubbleMessages}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      onUpdateBubble={(msgs) => {
                        setBubbleMessages(msgs);
                        triggerAutoSave(persona, teammates, chatHistories, weversePosts, msgs);
                      }}
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                      personas={personas}
                    />
                  )}

                  {activeApp === "analytics" && (
                    <FandomAnalyticsApp
                      persona={persona}
                      teammates={teammates}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      onUpdatePersona={(p) => {
                        setPersona(p);
                        triggerAutoSave(p);
                      }}
                      onAddLog={handleAddSystemLog}
                    />
                  )}

                  {activeApp === "tiktok" && (
                    <TikTokApp
                      persona={persona}
                      teammates={teammates}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      tiktokVideos={tiktokVideos}
                      onUpdateTiktokVideos={(videos) => {
                        setTiktokVideos(videos);
                        triggerAutoSave(persona, teammates, chatHistories, weversePosts, bubbleMessages, schedules, fanLetters, videos, xiaohongshuPosts);
                      }}
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                    />
                  )}

                  {activeApp === "xiaohongshu" && (
                    <XiaohongshuApp
                      persona={persona}
                      customApiKey={customApiKey}
                      customModel={customModel}
                      customApiEndpoint={customApiEndpoint}
                      posts={xiaohongshuPosts}
                      onUpdatePosts={(posts) => {
                        setXiaohongshuPosts(posts);
                        triggerAutoSave(persona, teammates, chatHistories, weversePosts, bubbleMessages, schedules, fanLetters, tiktokVideos, posts);
                      }}
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                    />
                  )}

                  {activeApp === "settings" && (
                    <div id="settings-view" className="primary-app-container scrollable-desktop bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
                      
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-1 text-slate-100">
                          <SettingsIcon className="w-4 h-4 text-slate-400" />
                          系统高保真设置与 AI 接口接入 Panel (Requirement 10)
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">您可以配置自定义的 LLM 代理，输入对应的 Api Key 和端口网关来实现高恢复回复。</p>
                      </div>

                      {/* Romance Position settings panel (Requirement: switch left/right in settings, changes prompts) */}
                      {persona.hasLover && (
                        <div className="bg-slate-950 p-4 rounded-xl border border-pink-500/15 space-y-3">
                          <span className="text-[10px] block font-mono text-pink-450 uppercase font-bold tracking-wide flex items-center gap-1.5 text-pink-400">
                            💖 地下恋爱状态与剧情攻受定位切换 (Romance Alignment Adjustment)
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            您当前正与 <strong>{persona.loverName}</strong> 进行地下秘密交往。在此随时调整你在关系中的<strong>剧情心理定位（左位 / 右位）</strong>，从而微调对方在 KakaoTalk 聊天和剧情事件中的性格切线和甜蜜对话基调：
                          </p>

                          <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...persona, romancePosition: "left" as const };
                                setPersona(updated);
                                triggerAutoSave(updated);
                                handleAddSystemLog(`[定位更新] 成功将与 ${persona.loverName} 的交往定位切换至【左位 (左/攻/Top)】！`);
                                triggerToast("💘 定位切换成功", "心意切线调整：恋人将转变偏受(温柔依恋依顺)风格！", "success");
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                (persona.romancePosition || "right") === "left"
                                  ? "bg-purple-950/40 border-purple-500 text-purple-300 shadow-md font-extrabold"
                                  : "bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              左位 (左 / 攻 / Top / 保护方)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...persona, romancePosition: "right" as const };
                                setPersona(updated);
                                triggerAutoSave(updated);
                                handleAddSystemLog(`[定位更新] 成功将与 ${persona.loverName} 的交往定位切换至【右位 (右/受/Bottom)】！`);
                                triggerToast("💘 定位切换成功", "心意切线调整：恋人将转变偏攻 (宠溺霸气强欲) 风格！", "success");
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                                (persona.romancePosition || "right") === "right"
                                  ? "bg-pink-950/40 border-pink-500 text-pink-300 shadow-md font-extrabold"
                                  : "bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              右位 (右 / 受 / Bottom / 被宠爱)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* API Input Block */}
                      <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] block font-mono text-indigo-400 uppercase font-bold tracking-wide">
                          🛠️ 自定义 OpenAI 或 Gemini 规制端网口
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">自定义 API 网关或中转域名 (Base URL/Endpoint)</label>
                            <input
                              type="text"
                              value={customApiEndpoint}
                              onChange={(e) => setCustomApiEndpoint(e.target.value)}
                              placeholder="e.g., https://generativelanguage.googleapis.com"
                              className="w-full bg-slate-900/80 border border-white/10 rounded-lg p-2 text-xs text-white uppercase focus:outline-none focus:border-purple-500 font-sans"
                            />
                            <p className="text-[8px] text-slate-500 mt-1 leading-tight">留空表示直接访问标准 Google Gemini API 官方直连端通道。</p>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">专属 API 密钥 (Model Secret Access Key)</label>
                            <input
                              type="password"
                              value={customApiKey}
                              onChange={(e) => setCustomApiKey(e.target.value)}
                              placeholder={customApiKey ? "••••••••••••••••••••••••" : "输入您的个人 AI 秘钥以极速开启仿真..."}
                              className="w-full bg-slate-900/80 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                            />
                            <p className="text-[8px] text-slate-500 mt-1 leading-tight">有些公开/中转中继端需要输入秘钥才能访问拉取列表。</p>
                          </div>
                        </div>

                        {/* Interactive model listing & connection */}
                        <div className="bg-[#121622]/50 p-3 rounded-lg border border-white/5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                              🤖 接口模型配置 (Models Discovery & Connect)
                            </span>
                            <button
                              type="button"
                              onClick={handlePullModels}
                              disabled={loadingModels}
                              className={`px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${loadingModels ? "opacity-50 pointer-events-none" : ""}`}
                            >
                              {loadingModels ? "🔍 正在连接拉取..." : "📥 拉取可用模型列表"}
                            </button>
                          </div>

                          {isModelsFetched ? (
                            <div className="animate-in fade-in duration-300">
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1">已检测到的模型 — 请选择一个模型连接：</label>
                              <select
                                value={customModel}
                                onChange={(e) => {
                                  setCustomModel(e.target.value);
                                  const updated = { ...persona };
                                  triggerAutoSave(updated);
                                }}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-bold text-yellow-300 focus:outline-none focus:border-purple-500 font-mono"
                              >
                                {supportedModels.map((m) => (
                                  <option key={m.id} value={m.id} className="bg-slate-950 text-white font-mono">
                                    {m.name || m.id} ({m.id})
                                  </option>
                                ))}
                              </select>
                              <p className="text-[8px] text-emerald-400 mt-1 font-mono">✓ 成功连接了模型: {customModel}</p>
                            </div>
                          ) : (
                            <div className="py-2.5 px-3 bg-black/40 border border-white/5 rounded text-[11px] text-slate-500 flex items-center justify-between">
                              <span>当前模型连接：<strong className="text-purple-400 font-mono">{customModel}</strong></span>
                              <span className="text-[9px] uppercase font-mono text-slate-600">未拉取网关源</span>
                            </div>
                          )}

                          <div className="border-t border-white/5 pt-2">
                            <label className="block text-[9px] text-slate-500 mb-1">如列表中无合适模型，可在下方手动输入指定：</label>
                            <input
                              type="text"
                              value={customModel}
                              onChange={(e) => setCustomModel(e.target.value)}
                              placeholder="亦可手动输入指定模型，例如 gemini-2.5-flash"
                              className="w-full bg-slate-900/60 border border-white/5 rounded px-2.5 py-1 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Token-Saving Dialogue Auto-Summarization Dashboard */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] block font-mono text-emerald-400 uppercase font-bold">
                            🧠 智能对话阶段归档与 Token 清洗引擎 (Dialogue Summarize Engine)
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[8px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            ACTIVE & PROTECTED
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          开启后，当单对单 KakaoTalk 对话记录偏长（超过指定条数上限）时，系统会自动将久远的历史对话提炼为一段角色的<strong>“长期回忆 milestones”</strong>并写入背景 system prompt 中，并将对话消息截断只保留最后 2 条，从而<strong>极速缩减 Gemini 关联上下文</strong>，节省高达 90% 的 Token 消耗，彻底告别上下文堆积造成的长时卡顿！
                        </p>

                        <div className="p-3 bg-[#111827]/80 rounded-lg border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-300 font-semibold">自动阶段总结并精简上下文</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAutoSummarizeEnabled(!isAutoSummarizeEnabled);
                                handleAddSystemLog(`[记忆守护] 已${!isAutoSummarizeEnabled ? "开启" : "关闭"}日过渡对话自动总结功能。`);
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAutoSummarizeEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoSummarizeEnabled ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>触发自动归档并整理总结的阈值:</span>
                              <span className="text-yellow-400 font-bold font-mono">{summarizationThreshold} 句对话</span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={15}
                              step={1}
                              value={summarizationThreshold}
                              onChange={(e) => setSummarizationThreshold(Number(e.target.value))}
                              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="block text-[8px] text-slate-500 font-sans leading-tight">当人物消息总数超过此设置时，将在「开启明天」的过程中在后台自动启动深度提炼与截断。</span>
                          </div>

                          <div className="border-t border-white/5 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">
                              觉得对话卡顿？你可以随时手动一键对所有长记录执行深度压缩整理：
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTriggerAutoSummarizeAll(true)}
                              disabled={isSummarizingInProgress}
                              className={`px-3 py-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-[10px] font-bold text-white rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer w-fit shrink-0 ${isSummarizingInProgress ? "opacity-50 pointer-events-none animate-pulse" : ""}`}
                            >
                              {isSummarizingInProgress ? "⏳ 正在提炼压缩..." : "🌟 一键执行历史对话总结归档"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Backup and state storage tools */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                        <span className="text-[10px] block font-mono text-purple-400 uppercase font-bold">
                          🗄️ 存档历史进度与备份/同步工具 (Backup & Restoration)
                        </span>

                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          您可以将目前打歌的进度、积累的粉丝大盘分布、与成员的主管关系、以及好感值保存并备份导出到本地电脑，防止因为清理缓存断开。
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            onClick={handleExportData}
                            className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" /> 导出备份 JSON 存档
                          </button>

                          <div className="relative">
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportData}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full"
                              id="import-backup-file-picker"
                            />
                            <button
                              type="button"
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <Upload className="w-3.5 h-3.5" /> 导入本地备份文件
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Font Size & Traditional Chinese localization setting box */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                        <span className="text-[10px] block font-mono text-cyan-400 uppercase font-bold tracking-wide">
                          🌐 系统个性化与全球化语言设置 (Display & Localization Settings)
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Font Size Adjustment Section */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-300">
                              🔤 字符大小调节 (Font Size scaling)
                            </label>
                            <p className="text-[9px] text-slate-500 leading-tight">
                              全局自适应缩放所有应用字体与 UI 元素，适配各种屏幕和阅读需求。
                            </p>
                            
                            <div className="grid grid-cols-4 gap-1.5 pt-1">
                              {[
                                { id: "small", label: "小号" },
                                { id: "medium", label: "标准" },
                                { id: "large", label: "大号" },
                                { id: "xlarge", label: "特大" }
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setFontSize(item.id);
                                    handleAddSystemLog(`[界面配置] 成功将全局字符大小调整为【${item.label}】！`);
                                    triggerToast("🔤 字体大小调整", `全局字符已缩放至【${item.label}】模式`, "success");
                                  }}
                                  className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                                    fontSize === item.id
                                      ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 font-extrabold shadow-sm"
                                      : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Traditional Chinese Localization Toggle Section */}
                          <div className="space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-300">
                              🇹🇼 繁體中文切換 (Traditional Chinese Toggle)
                            </label>
                            <p className="text-[9px] text-slate-500 leading-tight">
                              開啟後，全系統 UI 與後續 AI 模型輸出、模擬對話均會自動實時轉換為繁體中文。
                            </p>
                            
                            <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-white/5 mt-1">
                              <span className="text-[10px] text-slate-300 font-medium">切換為繁體中文 (Traditional Chinese)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = !isTraditionalChinese;
                                  setIsTraditionalChinese(nextVal);
                                  handleAddSystemLog(`[语言切换] 成功${nextVal ? "开启" : "关闭"}繁体中文模式！`);
                                  triggerToast("🌐 语言切换成功", nextVal ? "已切换为繁体中文。后续 AI 仿真回复与全系统 UI 均转为繁体。" : "已恢复为简体中文模式", "success");
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isTraditionalChinese ? "bg-cyan-500" : "bg-slate-700"}`}
                              >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTraditionalChinese ? "translate-x-4" : "translate-x-0"}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dev diagnostics information */}
                      <div className="p-3 bg-purple-950/20 border border-purple-500/15 rounded-xl flex gap-2">
                        <Info className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <div className="text-[10px] text-purple-200 leading-relaxed">
                          本模拟器专为韩娱艺术团队而筑，具有 <strong>高沉浸感</strong>、<strong>无Sentiment作假</strong> 等极致设定。您做的所有通告和决断都会对身材管理、粉丝成分造成剧烈的连锁化反应。
                        </div>
                      </div>



                    </div>
                  )}

                </div>

                {/* LOGS DISPLAY CONSOLE BOTTOM LINE (Requirement Architectural Cleanliness, Human labels) */}
                <div id="ipad-announcements" className="h-8 px-4 bg-slate-950/95 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 select-none shrink-0 font-mono relative overflow-hidden">
                  <div className="flex items-center gap-1.5 text-slate-300 overflow-hidden h-full flex-1 mr-4">
                    <MonitorCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0 bg-slate-950 z-10 pr-1" />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0 bg-slate-950 z-10 pr-2">系统消息:</span>
                    <div className="flex-1 overflow-hidden relative h-full flex items-center">
                      <span className="animate-marquee whitespace-nowrap absolute left-0 font-medium text-slate-250">
                        {systemLogs.filter(Boolean).map(log => log.replace(/[\n\r]+/g, " ")).join("     ★     ") || "IdolPad OS 运行中..."}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] text-[#868da1] z-10 bg-slate-950 pl-2">
                    SEOUL UTC+09
                  </span>
                </div>

              </div>

            </div>

            {/* DOCK BAR FOR IPAD APP SHORTCUTS (Aesthetic shortcuts to different Apps) */}
            <div id="ipad-bottom-dock" className="h-[46px] xs:h-[50px] sm:h-14 md:h-16 px-1 xs:px-2 md:px-12 bg-slate-950/50 border-t border-white/5 backdrop-blur-md flex items-center justify-center shrink-0 relative select-none z-30 w-full overflow-x-auto no-scrollbar">
              
              <div className="px-1 xs:px-2 sm:px-4 py-0.5 xs:py-1 sm:py-1.5 bg-white/5 rounded-xl sm:rounded-2xl flex items-center gap-1 xs:gap-1.5 sm:gap-3 md:gap-5 shadow-lg border border-white/5 shrink-0 max-w-none">
                {/* 1. Schedule Calendar */}
                <button
                  id="schedule-shortcut-btn"
                  onClick={() => { handleSwitchApp("schedule"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 md:p-3.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "schedule" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-105" : "text-slate-400 hover:text-white"}`}
                  title="日常行列表"
                >
                  <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-[#f44e73] animate-ping" />
                </button>

                {/* 2. KakaoTalk */}
                <button
                  id="kakaotalk-shortcut-btn"
                  onClick={() => { handleSwitchApp("kakaotalk"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 md:p-3.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "kakaotalk" ? "bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/10 scale-105" : "text-slate-400 hover:text-white"}`}
                  title="KakaoTalk 成员群聊"
                >
                  <MessageSquare className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 3. Weverse */}
                <button
                  id="weverse-shortcut-btn"
                  onClick={() => { handleSwitchApp("weverse"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 md:p-3.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "weverse" ? "bg-teal-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="Weverse 官咖讨论"
                >
                  <Heart className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 4. Bubble */}
                <button
                  onClick={() => { handleSwitchApp("bubble"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "bubble" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="Bubble 粉丝订阅"
                >
                  <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 5. Health & Fandom metrics */}
                <button
                  onClick={() => { handleSwitchApp("analytics"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "analytics" ? "bg-indigo-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="数据与大健康分析"
                >
                  <Activity className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 5b. TikTok Short video Challenge */}
                <button
                  onClick={() => { handleSwitchApp("tiktok"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "tiktok" ? "bg-red-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="TikTok卡点短视频"
                >
                  <Film className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 5c. XiaoHongShu Outfit */}
                <button
                  onClick={() => { handleSwitchApp("xiaohongshu"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "xiaohongshu" ? "bg-rose-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="小红书好物穿搭"
                >
                  <Image className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 5d. Fan Mail (手写来信) */}
                <button
                  onClick={() => { handleSwitchApp("fanmail"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all relative cursor-pointer outline-none shrink-0 ${activeApp === "fanmail" ? "bg-pink-600 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="粉丝实体来信物"
                >
                  <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  {fanLetters.some((l) => !l.isRead) && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#f44e73] animate-pulse border border-[#0e111a]" />
                  )}
                </button>

                {/* Divider */}
                <div className="w-[1px] h-5 sm:h-6 bg-white/10 shrink-0 self-center" />

                {/* 6. Settings Key configuration */}
                <button
                  onClick={() => { handleSwitchApp("settings"); }}
                  className={`p-1 xs:p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all cursor-pointer outline-none shrink-0 ${activeApp === "settings" ? "bg-slate-700 text-white shadow-lg scale-105" : "text-slate-400 hover:text-white"}`}
                  title="系统API/备份管理"
                >
                  <SettingsIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SYSTEM EVENT OVERLAYS Crisis/Challenge popup modals (Requirement 3) */}
      {activeEvent && (
        <SuddenEventModal
          event={activeEvent}
          persona={persona}
          onChoiceSelected={(popEff, repEff, nrgEff, cashEff, stressEff, debtEff, managerEff, teammateEff, outcome) => {
            handleApplyEventOutcome(
              popEff,
              repEff,
              nrgEff,
              cashEff,
              stressEff,
              debtEff,
              managerEff,
              teammateEff,
              outcome
            );
          }}
        />
      )}

      {/* Out-Of-Event Option Feedback outcome displaying */}
      {eventOutcomeText && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 text-center text-white relative shadow-xl">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest font-mono">
              📣 决断处理反馈结果 (Decision Outcome)
            </h3>
            <p className="text-xs text-slate-200 mt-4 leading-relaxed font-sans bg-slate-950/40 p-4 border border-white/5 rounded-xl whitespace-pre-line text-left">
              {eventOutcomeText}
            </p>
            <button
              onClick={() => {
                setEventOutcomeText(null);
                setActiveEvent(null);
              }}
              className="mt-5 w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
            >
              确认，继续我的演艺生涯！
            </button>
          </div>
        </div>
      )}

      {/* 1. Trainee Debut Success Overlay */}
      {debutEvaluationStatus === "success" && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-yellow-500 rounded-3xl p-8 text-center text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
            <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full tracking-widest font-mono shadow-md uppercase">
              🎉 考核达成：荣耀出道合格评定 🎉
            </span>
            <div className="py-2">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-tight">
                恭喜！最终考核全员通过，您已被准予出道！
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Aether Label 运营企划部发布了您的首张回归出道专辑企划案！
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-5 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-left">
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block font-mono">声舞说艺总评 (Skills Check):</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {persona.vocalSkill + persona.danceSkill + persona.rapSkill + persona.varietySkill} / 150
                </span>
                <span className="text-[9px] text-emerald-400/70 block mt-0.5">合格 (Pass)</span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block font-mono">业内名誉度 (Reputation):</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{persona.reputation} / 65</span>
                <span className="text-[9px] text-emerald-400/70 block mt-0.5">及格 (Pass)</span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block font-mono">抗压负荷率 (Stress):</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{persona.stress}% / &lt;80%</span>
                <span className="text-[9px] text-emerald-400/70 block mt-0.5">低危险 (Unstressed)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-left max-h-36 overflow-y-auto bg-slate-950/30 p-4 border border-white/5 rounded-xl">
              李秉旭代表与运营团队对你在练习生期间的高强度表现非常满意！因为你的超水准技能储备，公司决定豁免高额练习生前期债务 <strong>₩8,000万 韩元</strong>！
              你的正式出道主打歌已经空降Melon热搜榜，瞬间积累 <strong>120,000</strong> 名初始万能死忠粉丝，个人知名度及本行业信誉也随之突破！
              <br /><br />
              一扇崭新的大门已然开启：在正式爱豆模式下，你将自动解锁“高端皮肤科、极度塑形私教、更自由的队内Center争抢、甚至是随心进行地下秘密交往检测”等专属明星特权！
            </p>

            <button
              onClick={() => {
                const p = { ...persona };
                p.startType = "idol";
                p.traineeDebt = Math.max(0, p.traineeDebt - 8000); // Reduce debt!
                p.fansCount = p.fansCount + 120000; // Big fan jump!
                p.reputation = Math.min(100, Math.max(70, p.reputation + 15));
                p.popularity = Math.min(100, Math.max(45, p.popularity + 30));
                p.fansDistribution = {
                  otFans: 50,
                  soloFans: 25,
                  cpFans: 15,
                  antiFans: 10
                };
                
                // Boost relationships with core entities
                p.managerFavorability = Math.min(100, p.managerFavorability + 25);
                p.teammatesFavorability = Math.min(100, p.teammatesFavorability + 20);
                p.ceoFavorability = Math.min(100, p.ceoFavorability + 30);
                p.pdFavorability = Math.min(100, p.pdFavorability + 25);
                
                // Update individual teammate favorabilities to match
                const updatedTeam = teammates.map(t => ({
                  ...t,
                  favorability: Math.min(100, t.favorability + 20)
                }));
                
                setPersona(p);
                setTeammates(updatedTeam);
                setDebutEvaluationStatus(null);
                handleAddSystemLog("【练习生成功宣告出道】正式进化为全职爱豆！");
                triggerAutoSave(p, updatedTeam);
              }}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
            >
              👑 蜕变升格！晋升为 K-POP 闪亮爱豆明星！
            </button>
          </div>
        </div>
      )}

      {/* 2. Trainee Debut Fail Overlay */}
      {debutEvaluationStatus === "fail" && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-red-500 rounded-3xl p-8 text-center text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
            <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white font-bold text-xs px-4 py-1.5 rounded-full tracking-widest font-mono shadow-md uppercase">
              🚨 考核不合格：未准予正式出道 🚨
            </span>
            <div className="py-2">
              <h2 className="text-xl font-black text-red-500 tracking-tight">
                遗憾！最终评审由于多项指标未达底线，被判定无限期搁置出道！
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Aether Label 运营企划部认为您目前的业务能力与名誉抗磨尚未准备好接受镜头挑剔。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-5 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-left font-mono">
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block animate-pulse">技能基础分 (Skills VS 150):</span>
                <span className={`text-sm font-bold ${(persona.vocalSkill + persona.danceSkill + persona.rapSkill + persona.varietySkill) >= 150 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.vocalSkill + persona.danceSkill + persona.rapSkill + persona.varietySkill} / 150
                </span>
                <span className={`text-[9px] block mt-0.5 ${(persona.vocalSkill + persona.danceSkill + persona.rapSkill + persona.varietySkill) >= 150 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {(persona.vocalSkill + persona.danceSkill + persona.rapSkill + persona.varietySkill) >= 150 ? '合格' : '不合格'}
                </span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block">业内名誉 (Reputation VS 65):</span>
                <span className={`text-sm font-bold ${persona.reputation >= 65 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.reputation} / 65
                </span>
                <span className={`text-[9px] block mt-0.5 ${persona.reputation >= 65 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {persona.reputation >= 65 ? '合格' : '不合格'}
                </span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30">
                <span className="text-[10px] text-slate-400 block">身心压力 (Stress &lt; 80%):</span>
                <span className={`text-sm font-bold ${persona.stress < 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.stress}% / 80%
                </span>
                <span className={`text-[9px] block mt-0.5 ${persona.stress < 80 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {persona.stress < 80 ? '及格' : '红线崩溃'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950/30 p-4 border border-white/5 rounded-xl">
              李社长冷着脸指出：“你的综合技能实力目前出去只会在开麦舞台上给厂牌抹黑。要么你加紧练习，在第二天跨进新日程时重新进行评测；要么只能由您承担额外 <strong>₩3,000万 韩元</strong> 运作公关手续费，强行打通关系包办贷款出道！”
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => {
                  setDebutEvaluationStatus(null);
                  handleAddSystemLog("【练习生选择继续潜心加练】期待新一天的蜕变。");
                }}
                className="py-3 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
              >
                💪 宽限延期：继续特训深造
              </button>
              <button
                onClick={() => {
                  const p = { ...persona };
                  p.startType = "idol";
                  p.traineeDebt = p.traineeDebt + 3000; // Debt increases by 30 million KRW!
                  p.fansCount = p.fansCount + 100000;
                  p.reputation = Math.min(100, Math.max(55, p.reputation + 5));
                  p.popularity = Math.min(100, Math.max(35, p.popularity + 15));
                  p.fansDistribution = {
                    otFans: 40,
                    soloFans: 30,
                    cpFans: 15,
                    antiFans: 15
                  };
                  
                  setPersona(p);
                  setDebutEvaluationStatus(null);
                  handleAddSystemLog("【债务公关强行出道】顶负债与争议强行空降出道！");
                  triggerAutoSave(p, teammates);
                }}
                className="py-3 bg-gradient-to-r from-red-650 to-pink-600 hover:from-red-600 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-red-500/20"
              >
                💸 承受负债加重 +₩3,000w 强拍出道！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update and Debug notification modal */}
      {showUpdateModal && (
        <div id="update-notification-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-[#0b0e17] border-2 border-purple-500/30 rounded-2xl p-5.5 max-w-lg w-full shadow-[0_0_50px_rgba(147,51,234,0.25)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl font-sans"></div>
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4.5">
              <div className="bg-purple-500/20 text-purple-400 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 font-sans">
                  👑 企划社最新巨献公告 (粉丝倾向梦系、经纪人专属定制、深夜恋爱互动)
                </h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                  SYSTEM VERSION 4.0 | FANDOM DEMOGRAPHICS & MANAGER PERSONALITY CUSTOMIZATION
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-slate-200 font-sans text-xs">

              {/* Feature 20: Fandom & Manager Customization (BRAND NEW V4.0) */}
              <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-indigo-950/20 border border-pink-500/35 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[12.5px]">
                  <span>✨ 20. [全能定制] 粉丝属性梦男/梦女偏向设定、经纪人专属MBTI人设与深夜秘密电话</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为提供更完美的沉浸式爱豆追梦之旅，我们在创角 setup 阶段重磅呈献粉丝与经纪人全方位定制底座：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-pink-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🔮 <strong className="text-pink-200">梦男梦女比例自由定制</strong>：在建档时可自由设定你狂热梦系受众倾向（混合、梦女女粉为主、梦男男粉为主）。这将直接重构 W-Live 直播弹幕、Weverse 评论和手写信，定制专属浪漫及称呼！</p>
                  <p>🤝 <strong className="text-amber-200">专属经纪人人设 (ESTJ/ISFJ/ENTJ/ENFP)</strong>：可自由定制随行经纪人的姓名、职称与 MBTI 性格侧写，不仅会在每日日程结算清晨点评中展示，还会重塑 KakaoTalk 的发信语气与态度！</p>
                  <p>📞 <strong className="text-cyan-200">深夜煲电话粥与专属 Lovestagram</strong>：在 KakaoTalk 恋人互动中新增「深夜煲电话粥」与「私密 Bubble 空间」，不惊动狗仔的前提下，大幅拉近彼此的秘密地下恋心境！</p>
                  <p>🚨 <strong className="text-red-300">突发骚扰降噪冷却</strong>：大大降低了私生粉和毒站姐的突发频率（降至15%），并增加 <strong>5天严格冷却期</strong>，防堵骚扰过频，保卫主理人健康！</p>
                </div>
              </div>

              {/* Feature 18: Global Font Size Adjustment & Traditional Chinese All-Field Toggle (BRAND NEW V3.8) */}
              <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-yellow-600/10 border border-amber-500/35 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>🌐 18. [重磅升级] 全局字号等比例自适应缩放 & 繁体中文全域高保真转译</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应大中华区及海外主理人对于无障碍辅助与多语言阅读的极致呼声，我们在【设置】面板中隆重呈献全新无级自适应算法：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-amber-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🔍 <strong className="text-amber-200">全局字号等比例独立放大</strong>：摆脱单一根节点缩放，新增智能字号偏移算法！系统内所有 Tailwind 标准字号（<code className="text-amber-300 bg-amber-950/65 px-1 rounded">text-xs</code> ~ <code className="text-amber-300 bg-amber-950/65 px-1 rounded">text-5xl</code>）与各模块细微自定字号（从 <code className="text-amber-300 bg-amber-950/65 px-1 rounded">7px</code> 到 <code className="text-amber-300 bg-amber-950/65 px-1 rounded">80px</code>）均会根据所选档位（小、中、大、特大）在原有大底字号上<strong>分别等量递增/递减</strong>。排版完美无缝，绝无错位或遮挡！</p>
                  <p>🇹🇼 <strong className="text-orange-200">3880+ 词条 OpenCC 繁体字典完美转译</strong>：全面集成官方高保真繁体中文对照表，不单能够一键动态切换全部静态 UI，更配合端侧实时 <code className="text-orange-300 bg-orange-950/65 px-1 rounded">MutationObserver</code> 嗅探器，对所有 AI 输出及实时聊天互动进行即时深层繁体转译，实现 100% 繁体化视觉沉浸！</p>
                </div>
              </div>

              {/* Feature 15: Mobile Viewport Adaptive Scroll Optimization (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-[12.5px]">
                  <span>📱 15. [重要优化] 移动端竖屏自适应与防截断全局滚动适配</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了让各位主理人在手机、iPad等小屏竖屏设备上获得顺滑不截断的完美演艺体验，我们重构了核心容器：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-blue-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>📱 <strong className="text-blue-200">手机竖屏安全区域自适应</strong>：新增了统一 of 自适应视口高度计算类 <code className="text-blue-300 bg-blue-950/65 px-1 rounded">primary-app-container</code>，彻底解决了移动端原生导航栏/底部栏遮挡或组件溢出被截断导致无法触达底部操作的顽疾。</p>
                  <p>📜 <strong className="text-indigo-200">主应用多终端独立弹性逻辑</strong>：在手机竖屏上自动切换为柔和的局部自适应滑动视口，确保按钮与数据仪表盘触手可得；在平板/电脑宽屏下保持无缝的高阶分栏非切割布局，享受大开大合的完美主理操盘体验！</p>
                </div>
              </div>

              {/* Feature 16: Custom Underground Lover Backstory (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-pink-900/40 to-rose-900/40 border border-pink-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[12.5px]">
                  <span>💖 16. [重磅新特] 地下秘密情人身份背景多字段深度自定义</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应纯爱与剧情脑补玩家的极致热烈呼声，我们在创角 setup 环节上线了全套的<strong>“地下秘密恋人身份卡”自定义生成器</strong>：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-pink-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🎭 <strong className="text-pink-200">九大内置行业身份与纯自定义职业</strong>：不仅可以选择大势爱豆、顶级模特、同公司练习生队友、公司 CEO 社长、编舞总监等九大内置光鲜亮丽的职业圈层，更能选择“自定义输入”，随心所欲定制对方的社会行当！</p>
                  <p>🚻 <strong className="text-rose-200">全链字段参数自由构建</strong>：完美定制恋人的 <strong>姓名/艺名、性别、MBTI、真实年龄</strong>。随同携带恋人开局，将解锁专属的「秘密恋人KakaoTalk私密聊天通道」，随时应对由于粉圈亏欠感、D社暗雷而引发的破防冷静分手危机！</p>
                </div>
              </div>

              {/* Feature 17: Romance Position Alignment & Personality Tone Dynamic Shifting (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-pink-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>💘 17. [首创] 地下恋人情感攻受定位切换与动态私聊语调自适应</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  不再是死板的固定回复，恋爱对话的攻受属性与主导地位现在掌握在您的手中：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>↕️ <strong className="text-purple-200">攻受定位设定随心调整</strong>：在【设置】面板中，当您拥有地下恋人时，可随时在 <strong>左位 (左 / 攻 / Top / 保护方)</strong> 或是 <strong>右位 (右 / 受 / Bottom / 被宠爱)</strong> 之间相互切线转换！</p>
                  <p>🗣️ <strong className="text-pink-250">恋人心境私聊完美回馈</strong>：
                    <br />• <strong>切换为左位 (您是主攻/保护者) 时</strong>：对方的 KakaoTalk 回复与对话文本将转变倾向为<strong>偏受(温柔依恋依顺、体贴退让、甜腻缠人)</strong> 的受方风格；
                    <br />• <strong>切换为右位 (您是主受/被宠爱者) 时</strong>：恋人的私密安抚和过夜大纲等动作将倾斜至<strong>偏攻(霸道宠溺、强有力护短、富有强欲与占有欲)</strong> 的攻方调性，极尽温柔，极致纯爱！
                  </p>
                </div>
              </div>

              {/* Feature 14: 18-Point Interaction System and Stamina/Stress Protection Lock (BRAND NEW V3.5) */}
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-[12.5px]">
                  <span>🕒 14. [重磅] 18点每日互动点数制 与 极限制裁/身体保护机制</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了给大家提供极高主理人自由度和真实的养组合体感，我们对日常演艺体系进行了重构升级：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>⚜️ <strong className="text-emerald-200">全新的 18 点每日互动点数系统 (Interaction Points)</strong>：摒弃了之前繁琐的时间流逝体制！现在，每一项大型业务日程或主动生活互动（如去清潭洞皮肤管理、普拉提私教、深夜大餐密谋、甚至呼叫 Dr. Kim 医生心理咨询）都改为精准扣减 <strong>1~2 个互动点</strong>。每天的规划量和自主支配频次瞬间翻倍，不再因为单一活动草草换天！</p>
                  <p>🚨 <strong className="text-rose-300">首创 极低体力与爆表压力强制休整挂锁</strong>：有血有肉有神经的爱豆绝非无情的打卡机器！当爱豆体力濒临彻底枯竭（<strong>低于或等于 10⚡</strong>）或心理压力近乎爆表崩溃（<strong>大于或等于 95%</strong>）时，除了进行大口大嚼干饭、去宿舍/保姆车休息大睡、自选修护绿汁SPA等<strong>恢复体力/释放压力</strong>的操作外，其余所有高体力消耗训练、侵入式治疗美化（水光针、热玛吉）、地狱极速断食、各种大型业务日程<strong>均会被强行锁定挂红中止</strong>，督促您优先科学调理，打通爱豆大健康双轨制！</p>
                </div>
              </div>

              {/* Feature 13: 24-Day Cycle Setup (BRAND NEW V3.3) */}
              <div className="bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-indigo-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-[12.5px]">
                  <span>⚡ 13. [新增] 24天特快合约年与12个月上下半分期方案</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应部分希望快节奏推演和急于晋升殿堂级大前辈玩家的反馈：我们在创角界面新增了<strong>【合约年度日历周期】</strong>选择！你可以随时开启 24 天制特快神颜档（12个月，每月分上半月、下半月各一天完成流转），资历计算与全局合同周期均会精准自动计算，尽情享受特快飞跃的爽快感！
                </p>
              </div>

              {/* Feature 10: Visual Stress Indicator (BRAND NEW) */}
              <div className="bg-gradient-to-r from-rose-950/40 to-amber-950/40 border border-rose-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-[12.5px]">
                  <span>🤯 10. [首创] 行程面板“今日精神压力值”直接精细可视</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应各位爱豆运营官热烈要求，在【日常日程表】顶部紧邻体力条的绝佳位置，我们增设了实时动态同步的<strong>“🤯 压力: XX/100”指示牌成分</strong>。不用切换面板即可一气宏图统筹规划调理了！
                </p>
              </div>

              {/* Feature 11: Persistent API settings (BRAND NEW) */}
              <div className="bg-gradient-to-r from-teal-950/40 to-blue-950/40 border border-teal-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-[12.5px]">
                  <span>💾 11. [省心] API 配置游离态 LocalStorage 终身固化</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  现在，<strong>您的个人 API Key、自定义微调模型名、自定义端点</strong>全部被直接剥离缓存于独立且稳健的浏览器本地 LocalStorage 中。不管进退存，一次填完终身顺畅！
                </p>
              </div>

              {/* Feature 12: Career Solo and Scandal Decoupling (BRAND NEW) */}
              <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-[12.5px]">
                  <span>🔒 12. [独美] 纯正事业型单身流与恋爱绯闻危机绝绝对分立</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  对于在创角 setup 时选择<strong>不谈地下恋、保持零绯闻母胎单身</strong>路线的搞事业纯血爱豆，系统判定逻辑现已彻底物理遮罩并静默切除“D社深夜江边曝光密会约会”等高危风暴，让您搞起事业来畅通无阻，绝对专注！
                </p>
              </div>

              {/* Feature 9: K-Pop Ageing Factor (BRAND NEW) */}
              <div className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-purple-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>👑 9. [首发巨献] K-Pop 演艺资历 (Ageing Factor) 与 AI 动态语气自适应语调</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  打破成见！合约周期性演进深刻改变你与配角（经纪人、对头、队友、社长）的长期交际态势与叙事：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>📅 <strong className="text-purple-200">行当资历分层</strong>：以 36 天为一个合约周期，资历属性由 <strong>Ageing Factor</strong> 实时折算（0 新人，1 一周年熟手，2+ 资深大前辈，顶峰大势）。</p>
                  <p>🗣️ <strong className="text-pink-350">AI 智能语气千人千面蜕变</strong>：
                    <br />• <strong>Ageing Factor = 0 时</strong>：配角对你严格敲打，闵纪人更是高频吩咐点拨、言谈稍带挑剔刻薄；
                    <br />• <strong>Ageing Factor = 1 时</strong>：经过积累蜕变，闵经理人、社长对你的专业成熟表现出真正的职业赏识，关照并认可你为成熟中坚；
                    <br />• <strong>Ageing Factor &ge; 2 时</strong>：话语完全过渡到与同行大前辈/合伙人平视的体面、老到、沉稳和高端商务嘱托，告别毛躁。
                  </p>
                  <p>📱 <strong className="text-cyan-300">深度交融私聊与次日结算</strong>：本规则已全面写合 KakaoTalk 私聊引擎、次日过夜深度 AI 行程决策（且无 Key 地下高保真本地 fallback 中也获得一致支持）！</p>
                </div>
              </div>

              {/* Feature 8: Snacking Simulator (BRAND NEW) */}
              <div className="bg-gradient-to-r from-amber-950/40 to-indigo-950/40 border border-amber-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>🍲 8. [全新巨献] “深夜偷吃食堂” 偷吃特工作战趣味模拟</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  不再是单纯的数值点击！在【属性】数据版块下正式新增了极具代入感的互动加餐游戏系统：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-amber-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🍱 <strong className="text-amber-200">六大特色深夜膳食</strong>：包括 🍗 宿舍深夜炸鸡、🥩 顶级炭火韩牛、🥤 高卡碳水燕麦奶昔、🍧 辛辣年糕雪冰、🥗 水煮鸡胸肉挣扎餐、🍜 便利店芝士拉面。各具特殊奇妙效果！</p>
                  <p>👄 <strong className="text-amber-200">大口咀嚼物理反馈</strong>：伴随细腻生吞、大口大嚼叙事动画以及倒计时物理咀嚼条。可长嚼，亦可一键“快速三口闷完”！</p>
                  <p>👀 <strong className="text-pink-300">突发事件一 [舍友撞破分食]</strong>：18% 的几率遭遇室友深夜贴脸抢食！被迫分一口，能量热量减半，但大幅增加与队友的集体好感度 (+7)！</p>
                  <p>🚨 <strong className="text-red-400">突发事件二 [闵室长查寝]</strong>：10% 几率听到门外高跟鞋咚咚逼近！塞进床底下仓促过关，饱食度暴损，心理压力巨额飙升 (+15)！</p>
                  <p>🎒 <strong className="text-emerald-300">特殊健康补偿反馈</strong>：吃干瘪鸡胸肉甚至能由于身体轻灵无水肿负担，直接爆出永久 <strong className="text-emerald-300">声乐/舞蹈技能 +2 点 </strong> 的练习回报！而高端韩牛更能极速滋养被压力受损干枯暴痘的疲惫肌，恢复红润面色！但在深夜暴食大辛大辣拉面年糕则有高达 30% 晨起满面油脂、脸部极度浮肿的毁容风险哦！</p>
                </div>
              </div>

              {/* Feature 1: Name Duplicate filtering */}
              <div className="bg-purple-950/20 border border-purple-500/20 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>🛡️ 1. 爱豆重名/冲突规避校验系统</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了从底层彻底切断重名引起的通信乱流：自建多槽位间限制重合本名或艺名，更自动屏蔽了经纪人、董事会NPC及宿命队友（智雅、香橙、樱子等）等同名撞车。
                </p>
              </div>

              {/* Feature 2: BMI and health */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-[12.5px]">
                  <span>📏 2. 体重/身高联动 BMI 与黄金调理机制</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  重构了身体质量指数（BMI）物理学公式，由设定的身高与体重科学共算。彻底推倒了“任何时刻都无理贬斥极其消瘦”的单调舆论——当您打理营养使BMI恢复健康区间时，饭圈论坛将会爆发全网最高赞的吹捧，让爱豆越养越美！
                </p>
              </div>

              {/* Feature 3: Stamina restore */}
              <div className="bg-blue-950/20 border border-blue-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-[12.5px]">
                  <span>🔋 3. 清晨复盘结算体力延迟读取修正</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  纠正了AI次日结算流程中，对能量体力更新滞后一天的时序Bug。清晨复盘评价中会实时采用最健康的早间饱满回复精力数据，让AI再也不会毫无缘由地唠叨你极其劳累。
                </p>
              </div>

              {/* Feature 4: bubble names alignment */}
              <div className="bg-sky-950/20 border border-sky-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-[12.5px]">
                  <span>💬 4. 泡泡 (Bubble) 评论真实队友精准连线</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  优化泡泡营业生成，杜绝了系统偶尔无脑编造英文与虚构队友回复。前排营业最后一贴凡是出现队友打趣时，均100%连线至真实的组合名册（包含您的多槽卡和队内既定担当）。
                </p>
              </div>

              {/* Feature 5: Trainee Romance */}
              <div className="bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-[12.5px]">
                  <span>💖 5. 练习生暗线恋爱启动与姓名补全</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  练习生时期全面接入情感选项，空白时会周全自动配置极赞的伴侣名字（如 韩熙珍/宋承泽）并解锁温存的短信交流，练习生再不是毫无爱情互动的枯槁旅途！
                </p>
              </div>

              {/* Feature 6: Responsive scroll container */}
              <div className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>📺 6. PC浏览器自适应 iPad 窗体与纵向滚动</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  修缮了平板外壳外框高度，设定 dynamic 限高，强制溢出时内部容器自适应，允许全域独立双向滚动！杜绝了PC电脑浏览器下底部控制栏、侧边栏溢出导致无法点击的问题。
                </p>
              </div>

              {/* Feature 7: Lockdown */}
              <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-red-300 font-bold text-[12.5px]">
                  <span>🔒 7. 重大危机/复盘选项强制切线锁定</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  重修了切线逃脱决策惩罚的空子：在早结算复牌、私生饭骚扰大考等事件处于活动态时，左上角成员切线通道、底部快捷 Dock 都会被牢牢物理遮罩锁定，直至您智勇了结！
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2.5 text-xs mt-6 pt-3.5 border-t border-white/10">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-md transition cursor-pointer text-center select-none active:scale-[0.98]"
              >
                开始健康调理，进入爱豆计划
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Underground Scandal Risk Modal */}
      {scandalModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-slate-900 border-2 border-pink-500 rounded-3xl p-8 text-center text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
            <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-mono text-[10px] px-4 py-1.5 rounded-full tracking-widest shadow-md uppercase font-bold">
              🖤 绯闻公关审判 (Dating Scandal Crisis Evaluation) 🖤
            </span>
            <div className="py-2 text-left">
              <h2 className="text-lg font-black text-pink-400 tracking-tight text-center">
                {scandalModal.outcomeText}
              </h2>
              <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-950/50 p-4 border border-pink-500/15 rounded-xl whitespace-pre-line text-left">
                {scandalModal.details}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-left text-[11px]">
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 block">李社长好感 (CEO):</span>
                <span className={`font-bold font-mono mt-0.5 ${persona.ceoFavorability >= 45 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.ceoFavorability} / 45
                </span>
                <span className={`text-[8px] font-bold ${persona.ceoFavorability >= 45 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {persona.ceoFavorability >= 45 ? '社长公关成功' : '不予理睬'}
                </span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 block">闵室长好感 (Manager):</span>
                <span className={`font-bold font-mono mt-0.5 ${persona.managerFavorability >= 45 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.managerFavorability} / 45
                </span>
                <span className={`text-[8px] font-bold ${persona.managerFavorability >= 45 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {persona.managerFavorability >= 45 ? '室长代为掩护' : '闭门谢客'}
                </span>
              </div>
              <div className="p-2 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 block">队友好感度 (Teammates):</span>
                {persona.style === "solo" ? (
                  <>
                    <span className="font-bold text-indigo-400 font-mono mt-0.5">— Solo无队友 —</span>
                    <span className="text-[8px] text-indigo-400/70 font-bold">无拖累</span>
                  </>
                ) : (
                  <>
                    <span className={`font-bold font-mono mt-0.5 ${persona.teammatesFavorability >= 45 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {persona.teammatesFavorability} / 45
                    </span>
                    <span className={`text-[8px] font-bold ${persona.teammatesFavorability >= 45 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                      {persona.teammatesFavorability >= 45 ? '发放团魂背书' : '冷眼旁观'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setScandalModal(null);
                handleAddSystemLog("【绯闻爆料审判收官】坚毅面对星途。");
              }}
              className="mt-4 w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
            >
              🤝 确认，坚毅前进！
            </button>
          </div>
        </div>
      )}

      {/* 4. Arrived New Fan Mail Envelope Pop-Up */}
      {arrivedMailPopup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 animate-in fade-in">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-950 border border-pink-500/35 rounded-3xl p-6 text-center text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Stamp Detail */}
            <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/25 mb-4 animate-bounce">
              <Mail className="w-6 h-6 text-pink-400" />
            </div>

            <span className="bg-pink-950/40 border border-pink-500/30 text-pink-300 font-bold text-[9px] px-3 py-1 rounded-full tracking-wider font-mono">
              📬 宿外小货架：有新的粉丝实体来信！
            </span>
            
            <div className="py-4 space-y-2">
              <h2 className="text-base font-black text-rose-300 tracking-tight">
                【{arrivedMailPopup.sender}】寄送的手手信已寄达！
              </h2>
              <div className="p-3 bg-slate-950/50 border border-white/5 rounded-2xl text-[10px] text-slate-400 font-mono text-left space-y-1">
                <div className="flex justify-between">
                  <span>寄信粉丝:</span>
                  <span className="text-white font-bold">{arrivedMailPopup.fanTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>标题预览:</span>
                  <span className="text-white truncate max-w-[200px]" title={arrivedMailPopup.title}>{arrivedMailPopup.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>寄送天数:</span>
                  <span className="text-rose-400 font-bold">今天 (Day {arrivedMailPopup.receivedDay})</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal px-2">
                现在拆信阅读可直接获得<strong>精神治愈体力加注</strong>！或者您也可以选择先整理收纳进书桌盒子中，晚些时候随时翻开！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-2">
              <button
                onClick={() => {
                  setArrivedMailPopup(null);
                  setActiveApp("fanmail");
                  handleAddSystemLog(`📬 决定立即拆封阅读粉丝【${arrivedMailPopup.sender}】的手手信。`);
                }}
                className="py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer active:scale-95"
              >
                💌 立即拆封阅读
              </button>
              <button
                onClick={() => {
                  setArrivedMailPopup(null);
                  handleAddSystemLog(`📁 粉丝手写信已稳妥整理归档至【小卡盒】待读列表，您可以稍后查看。`);
                }}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 border border-white/5"
              >
                📥 收纳进小卡盒
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Brand New Game and Purge save confirmation modal (Requirement 4) */}
      {confirmAction && (
        <div id="confirm-action-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-150 relative">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2 font-sans">
              {confirmAction === "new_game" ? "🔁 确定启动新的爱豆企划？" : "🗑️ 确定永久粉碎删除当前本地存档？"}
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
              {confirmAction === "new_game" 
                ? "开启新档将重置您当前正在进行的偶像演艺日记、行程安排与粉丝热度趋势。您将被送回本姓名帖填写页重新雕刻容貌骨相、调整身高体重并重新挑选职业起点。确认执行吗？"
                : "删除全站存档将永久重置本设备缓存的所有数据（包含所有已保存的艺名信息、已归档的消息历史与您设置的自定义 Gemini API 关联），并全面格式化机壳电脑。该操作是完全毁灭性不可复原的！确认吗？"}
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button 
                id="cancel-confirm-btn"
                onClick={() => setConfirmAction(null)} 
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-705 transition cursor-pointer font-bold"
              >
                取消 (Cancel)
              </button>
              <button 
                id="execute-confirm-btn"
                onClick={confirmAction === "new_game" ? handleConfirmNewGame : handleConfirmDeleteSave} 
                className={`px-3.5 py-1.5 text-white rounded transition cursor-pointer font-bold ${confirmAction === "new_game" ? "bg-purple-600 hover:bg-purple-500" : "bg-red-600 hover:bg-red-500"}`}
              >
                {confirmAction === "new_game" ? "确认开新档" : "确认永久删除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update and Debug notification modal */}
      {showUpdateModal && (
        <div id="update-notification-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[250] p-4">
          <div className="bg-[#0b0e17] border-2 border-purple-500/30 rounded-2xl p-5.5 max-w-lg w-full shadow-[0_0_50px_rgba(147,51,234,0.25)] animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4.5">
              <div className="bg-purple-500/20 text-purple-400 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 font-sans">
                  👑 企划社最新巨献公告 (V4.5 个人 Solo 独立歌手纯享重构 & 个人饭圈适配)
                </h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">
                  SYSTEM VERSION 4.5 | SOLO IDOL MODE REFACTOR & EXCLUSIVE SOLO FANDOM ECOLOGY
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-slate-200 font-sans text-xs">

              {/* Feature 21: Solo Mode & Solo Fandom Ecology Refactor (BRAND NEW V4.5) */}
              <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-pink-950/30 border border-purple-500/40 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>🎤 21. [重磅升级] V4.5 个人 Solo 独立歌手模式 & 纯享个人饭圈重构</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应广大主理人对于 Solo 独立歌手真实感与纯享体验的期待，我们完成了底层 AI 提示词与大健康 / 粉丝大盘系统的彻底重塑：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/40 text-[10.5px] text-slate-400 leading-snug">
                  <p>🎤 <strong className="text-purple-200">Solo 独立歌手全域无队友纯享</strong>：当选择【个人 Solo 独立歌手】时，系统全域（包含 KakaoTalk、Weverse 官咖、W-Live 直播弹幕、TikTok 变装/舞蹈挑战、小红书私服笔记、粉丝来信等）将 100% 聚焦个人舞台与独处日常，绝对不再虚构或误提及任何组合队友！</p>
                  <p>📊 <strong className="text-indigo-200">大健康 / 粉丝分析 (Fandom Analytics) 彻底适配</strong>：Solo 模式下彻底剔除「OT 团粉」与「团队毒唯」，自动平滑归集重构为「核心唯粉死忠」、「事业唯/成绩粉」与「跨界/合作 CP 粉」，带来最地道的个人 Solo 爱豆饭圈操盘体感！</p>
                  <p>💬 <strong className="text-pink-200">恋人攻受定位 & 性别称谓全场景强校验</strong>：强化 KakaoTalk 地下恋人角色扮演中的左位（Gong/Top）与右位（Shou/Bottom）语气词，并严格根据玩家性别（女/男爱豆）防穿帮调用（欧尼/姐姐/哥哥/欧巴）。</p>
                </div>
              </div>

              {/* Feature 20: Fandom & Manager Customization (BRAND NEW V4.0) */}
              <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-indigo-950/20 border border-pink-500/35 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[12.5px]">
                  <span>✨ 20. [全能定制] 粉丝属性梦男/梦女偏向设定、经纪人专属MBTI人设与深夜秘密电话</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为提供更完美的沉浸式爱豆追梦之旅，我们在创角 setup 阶段重磅呈献粉丝与经纪人全方位定制底座：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-pink-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🔮 <strong className="text-pink-200">梦男梦女比例自由定制</strong>：在建档时可自由设定你狂热梦系受众倾向（混合、梦女女粉为主、梦男男粉为主）。这将直接重构 W-Live 直播弹幕、Weverse 评论和手写信，定制专属浪漫及称呼！</p>
                  <p>🤝 <strong className="text-amber-200">专属经纪人人设 (ESTJ/ISFJ/ENTJ/ENFP)</strong>：可自由定制随行经纪人的姓名、职称与 MBTI 性格侧写，不仅会在每日日程结算清晨点评中展示，还会重塑 KakaoTalk 的发信语气与态度！</p>
                  <p>📞 <strong className="text-cyan-200">深夜煲电话粥与专属 Lovestagram</strong>：在 KakaoTalk 恋人互动中新增「深夜煲电话粥」与「私密 Bubble 空间」，不惊动狗仔的前提下，大幅拉近彼此的秘密地下恋心境！</p>
                  <p>🚨 <strong className="text-red-300">突发骚扰降噪冷却</strong>：大大降低了私生粉和毒站姐的突发频率（降至15%），并增加 <strong>5天严格冷却期</strong>，防堵骚扰过频，保卫主理人健康！</p>
                </div>
              </div>

              {/* Feature 19: Recent Hotfixes (BRAND NEW V3.9) */}
              <div className="bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-950/20 border border-purple-500/35 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>🛠️ 19. [热点修复] V3.9 热点问题修复与全设备体感增筑</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应主理人们反馈，我们连夜攻坚完成了以下数个核心系统体验修复与底层优化：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>📜 <strong className="text-purple-200">PC端设置面板纵向滚动</strong>：修复了在电脑宽屏下，设置面板被外层容器限制而无法滚动的Bug，现在隐藏功能和长文导入一拉到底！</p>
                  <p>💬 <strong className="text-indigo-200">泡泡发信气泡高对比度</strong>：玩家发信消息气泡完美重塑！调整前景和背景色彩对比，绝无白字隐形，确保泡泡对话清晰易读。</p>
                  <p>📱 <strong className="text-pink-300">社媒作品切换持久化</strong>：重构了小红书和TikTok作品管理器。离开当前App再切回时，已发布作品将100%永久保留，永不消失！</p>
                  <p>🤝 <strong className="text-cyan-300">经纪人身份命名智能纠偏</strong>：完善了性别称谓逻辑。当玩家性别为女（经纪人为「严室长」）时，彻底消除偶尔将消息标签误判为「闵经纪人」的幽灵时序Bug。</p>
                </div>
              </div>

              {/* Feature 18: Global Font Size Adjustment & Traditional Chinese All-Field Toggle (BRAND NEW V3.8) */}
              <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-yellow-600/10 border border-amber-500/35 p-3.5 rounded-xl space-y-2 font-sans">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>🌐 18. [重磅升级] 全局字号等比例自适应缩放 & 繁体中文全域高保真转译</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应大中华区及海外主理人对于无障碍辅助与多语言阅读的极致呼声，我们在【设置】面板中隆重呈献全新无级自适应算法：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-amber-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🔍 <strong className="text-amber-200">全局字号等比例独立放大</strong>：摆脱单一根节点缩放，新增智能字号偏移算法！系统内所有 Tailwind 标准字号（<code className="text-amber-300 bg-amber-950/65 px-1 rounded">text-xs</code> ~ <code className="text-amber-300 bg-amber-950/65 px-1 rounded">text-5xl</code>）与各模块细微自定字号（从 <code className="text-amber-300 bg-amber-950/65 px-1 rounded">7px</code> 到 <code className="text-amber-300 bg-amber-950/65 px-1 rounded">80px</code>）均会根据所选档位（小、中、大、特大）在原有大底字号上<strong>分别等量递增/递减</strong>。排版完美无缝，绝无错位或遮挡！</p>
                  <p>🇹🇼 <strong className="text-orange-200">3880+ 词条 OpenCC 繁体字典完美转译</strong>：全面集成官方高保真繁体中文对照表，不单能够一键动态切换全部静态 UI，更配合端侧实时 <code className="text-orange-300 bg-orange-950/65 px-1 rounded">MutationObserver</code> 嗅探器，对所有 AI 输出及实时聊天互动进行即时深层繁体转译，实现 100% 繁体化视觉沉浸！</p>
                </div>
              </div>

              {/* Feature 15: Mobile Viewport Adaptive Scroll Optimization (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-[12.5px]">
                  <span>📱 15. [重要优化] 移动端竖屏自适应与防截断全局滚动适配</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了让各位主理人在手机、iPad等小屏竖屏设备上获得顺滑不截断的完美演艺体验，我们重构了核心容器：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-blue-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>📱 <strong className="text-blue-200">手机竖屏安全区域自适应</strong>：新增了统一 of 自适应视口高度计算类 <code className="text-blue-300 bg-blue-950/65 px-1 rounded">primary-app-container</code>，彻底解决了移动端原生导航栏/底部栏遮挡 or 组件溢出被截断导致无法触达底部操作的顽疾。</p>
                  <p>📜 <strong className="text-indigo-200">主应用多终端独立弹性逻辑</strong>：在手机竖屏上自动切换为柔和的局部自适应滑动视口，确保按钮与数据仪表盘触手可得；在平板/电脑宽屏下保持无缝的高阶分栏非切割布局，享受大开大合的完美主理操盘体验！</p>
                </div>
              </div>

              {/* Feature 16: Custom Underground Lover Backstory (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-pink-900/40 to-rose-900/40 border border-pink-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-pink-300 font-bold text-[12.5px]">
                  <span>💖 16. [重磅新特] 地下秘密情人身份背景多字段深度自定义</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应纯爱与剧情脑补玩家的极致热烈呼声，我们在创角 setup 环节上线了全套的<strong>“地下秘密恋人身份卡”自定义生成器</strong>：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-pink-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🎭 <strong className="text-pink-200">九大内置行业身份与纯自定义职业</strong>：不仅可以选择大势爱豆、顶级模特、同公司练习生队友、公司 CEO 社长、编舞总监等九大内置光鲜亮丽的职业圈层，更能选择“自定义输入”，随心所欲定制对方的社会行当！</p>
                  <p>🚻 <strong className="text-rose-200">全链字段参数自由构建</strong>：完美定制恋人的 <strong>姓名/艺名、性别、MBTI、真实年龄</strong>。随同携带恋人开局，将解锁专属的「秘密恋人KakaoTalk私密聊天通道」，随时应对由于粉圈亏欠感、D社暗雷而引发的破防冷静分手危机！</p>
                </div>
              </div>

              {/* Feature 17: Romance Position Alignment & Personality Tone Dynamic Shifting (BRAND NEW V3.6) */}
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-pink-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>💘 17. [首创] 地下恋人情感攻受定位切换与动态私聊语调自适应</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  不再是死板的固定回复，恋爱对话的攻受属性与主导地位现在掌握在您的手中：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>↕️ <strong className="text-purple-200">攻受定位设定随心调整</strong>：在【设置】面板中，当您拥有地下恋人时，可随时在 <strong>左位 (左 / 攻 / Top / 保护方)</strong> 或是 <strong>右位 (右 / 受 / Bottom / 被宠爱)</strong> 之间相互切线转换！</p>
                  <p>🗣️ <strong className="text-pink-250">恋人心境私聊完美回馈</strong>：
                    <br />• <strong>切换为左位 (您是主攻/保护者) 时</strong>：对方的 KakaoTalk 回复与对话文本将转变倾向为<strong>偏受(温柔依恋依顺、体贴退让、甜腻缠人)</strong> 的受方风格；
                    <br />• <strong>切换为右位 (您是主受/被宠爱者) 时</strong>：恋人的私密安抚和过夜大纲等动作将倾斜至<strong>偏攻(霸道宠溺、强有力护短、富有强欲与占有欲)</strong> 的攻方调性，极尽温柔，极致纯爱！
                  </p>
                </div>
              </div>

              {/* Feature 14: 18-Point Interaction System and Stamina/Stress Protection Lock (BRAND NEW V3.5) */}
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-[12.5px]">
                  <span>🕒 14. [重磅] 18点每日互动点数制 与 极限制裁/身体保护机制</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了给大家提供极高主理人自由度和真实的养组合体感，我们对日常演艺体系进行了重构升级：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>⚜️ <strong className="text-emerald-200">全新的 18 点每日互动点数系统 (Interaction Points)</strong>：摒弃了之前繁琐的时间流逝体制！现在，每一项大型业务日程或主动生活互动（如去清潭洞皮肤管理、普拉提私教、深夜大餐密谋、甚至呼叫 Dr. Kim 医生心理咨询）都改为精准扣减 <strong>1~2 个互动点</strong>。每天的规划量和自主支配频次瞬间翻倍，不再因为单一活动草草换天！</p>
                  <p>🚨 <strong className="text-rose-300">首创 极低体力与爆表压力强制休整挂锁</strong>：有血有肉有神经的爱豆绝非无情的打卡机器！当爱豆体力濒临彻底枯竭（<strong>低于或等于 10⚡</strong>）或心理压力近乎爆表崩溃（<strong>大于或等于 95%</strong>）时，除了进行大口大嚼干饭、去宿舍/保姆车休息大睡、自选修护绿汁SPA等<strong>恢复体力/释放压力</strong>的操作外，其余所有高体力消耗训练、侵入式治疗美化（水光针、热玛吉）、地狱极速断食、各种大型业务日程<strong>均会被强行锁定挂红中止</strong>，督促您优先科学调理，打通爱豆大健康双轨制！</p>
                </div>
              </div>

              {/* Feature 13: 24-Day Cycle Setup (BRAND NEW V3.3) */}
              <div className="bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-indigo-500/35 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-[12.5px]">
                  <span>⚡ 13. [新增] 24天特快合约年与12个月上下半分期方案</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应部分希望快节奏推演和急于晋升殿堂级大前辈玩家的反馈：我们在创角界面新增了<strong>【合约年度日历周期】</strong>选择！你可以随时开启 24 天制特快神颜档（12个月，每月分上半月、下半月各一天完成流转），资历计算与全局合同周期均会精准自动计算，尽情享受特快飞跃的爽快感！
                </p>
              </div>

              {/* Feature 10: Visual Stress Indicator (BRAND NEW) */}
              <div className="bg-gradient-to-r from-rose-950/40 to-amber-950/40 border border-rose-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-[12.5px]">
                  <span>🤯 10. [首创] 行程面板“今日精神压力值”直接精细可视</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  应各位爱豆运营官热烈要求，在【日常日程表】顶部紧邻体力条的绝佳位置，我们增设了实时动态同步的<strong>“🤯 压力: XX/100”指示牌成分</strong>。不用切换面板即可一气宏图统筹规划调理了！
                </p>
              </div>

              {/* Feature 11: Persistent API settings (BRAND NEW) */}
              <div className="bg-gradient-to-r from-teal-950/40 to-blue-950/40 border border-teal-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-[12.5px]">
                  <span>💾 11. [省心] API 配置游离态 LocalStorage 终身固化</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  现在，<strong>您的个人 API Key、自定义微调模型名、自定义端点</strong>全部被直接剥离缓存于独立且稳健的浏览器本地 LocalStorage 中。不管进退存，一次填完终身顺畅！
                </p>
              </div>

              {/* Feature 12: Career Solo and Scandal Decoupling (BRAND NEW) */}
              <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-[12.5px]">
                  <span>🔒 12. [独美] 纯正事业型单身流与恋爱绯闻危机绝绝对分立</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  对于在创角 setup 时选择<strong>不谈地下恋、保持零绯闻母胎单身</strong>路线的搞事业纯血爱豆，系统判定逻辑现已彻底物理遮罩并静默切除“D社深夜江边曝光密会约会”等高危风暴，让您搞起事业来畅通无阻，绝对专注！
                </p>
              </div>

              {/* Feature 9: K-Pop Ageing Factor (BRAND NEW) */}
              <div className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border border-purple-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>👑 9. [首发巨献] K-Pop 演艺资历 (Ageing Factor) 与 AI 动态语气自适应语调</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  打破成见！合约周期性演进深刻改变你与配角（经纪人、对头、队友、社长）的长期交际态势与叙事：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-purple-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>📅 <strong className="text-purple-200">行当资历分层</strong>：以 36 天为一个合约周期，资历属性由 <strong>Ageing Factor</strong> 实时折算（0 新人，1 一周年熟手，2+ 资深大前辈，顶峰大势）。</p>
                  <p>🗣️ <strong className="text-pink-350">AI 智能语气千人千面蜕变</strong>：
                    <br />• <strong>Ageing Factor = 0 时</strong>：配角对你严格敲打，闵纪人更是高频吩咐点拨、言谈稍带挑剔刻薄；
                    <br />• <strong>Ageing Factor = 1 时</strong>：经过积累蜕变，闵经理人、社长对你的专业成熟表现出真正的职业赏识，关照并认可你为成熟中坚；
                    <br />• <strong>Ageing Factor &ge; 2 时</strong>：话语完全过渡到与同行大前辈/合伙人平视的体面、老到、沉稳和高端商务嘱托，告别毛躁。
                  </p>
                  <p>📱 <strong className="text-cyan-300">深度交融私聊与次日结算</strong>：本规则已全面写合 KakaoTalk 私聊引擎、次日过夜深度 AI 行程决策（且无 Key 地下高保真本地 fallback 中也获得一致支持）！</p>
                </div>
              </div>

              {/* Feature 8: Snacking Simulator (BRAND NEW) */}
              <div className="bg-gradient-to-r from-amber-950/40 to-indigo-950/40 border border-amber-500/25 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>🍲 8. [全新巨献] “深夜偷吃食堂” 偷吃特工作战趣味模拟</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  不再是单纯的数值点击！在【属性】数据版块下正式新增了极具代入感的互动加餐游戏系统：
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-amber-500/30 text-[10.5px] text-slate-400 leading-snug">
                  <p>🍱 <strong className="text-amber-200">六大特色深夜膳食</strong>：包括 🍗 宿舍深夜炸鸡、🥩 顶级炭火韩牛、🥤 高卡碳水燕麦奶昔、🍧 辛辣年糕雪冰、🥗 水煮鸡胸肉挣扎餐、🍜 便利店芝士拉面。各具特殊奇妙效果！</p>
                  <p>👄 <strong className="text-amber-200">大口咀嚼物理反馈</strong>：伴随细腻生吞、大口大嚼叙事动画以及倒计时物理咀嚼条。可长嚼，亦可一键“快速三口闷完”！</p>
                  <p>👀 <strong className="text-pink-300">突发事件一 [舍友撞破分食]</strong>：18% 的几率遭遇室友深夜贴脸抢食！被迫分一口，能量热量减半，但大幅增加与队友的集体好感度 (+7)！</p>
                  <p>🚨 <strong className="text-red-400">突发事件二 [闵室长查寝]</strong>：10% 几率听到门外高跟鞋咚咚逼近！塞进床底下仓促过关，饱食度暴损，心理压力巨额飙升 (+15)！</p>
                  <p>🎒 <strong className="text-emerald-300">特殊健康补偿反馈</strong>：吃干瘪鸡胸肉甚至能由于身体轻灵无水肿负担，直接爆出永久 <strong className="text-emerald-300">声乐/舞蹈技能 +2 点 </strong> 的练习回报！而高端韩牛更能极速滋养被压力受损干枯暴痘的疲惫肌，恢复红润面色！但在深夜暴食大辛大辣拉面年糕则有高达 30% 晨起满面油脂、脸部极度浮肿的毁容风险哦！</p>
                </div>
              </div>

              {/* Feature 1: Name Duplicate filtering */}
              <div className="bg-purple-950/20 border border-purple-500/20 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-[12.5px]">
                  <span>🛡️ 1. 爱豆重名/冲突规避校验系统</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  为了从底层彻底切断重名引起的通信乱流：自建多槽位间限制重合本名或艺名，更自动屏蔽了经纪人、董事会NPC及宿命队友（智雅、香橙、樱子等）等同名撞车。
                </p>
              </div>

              {/* Feature 2: BMI and health */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-[12.5px]">
                  <span>📏 2. 体重/身高联动 BMI 与黄金调理机制</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  重构了身体质量指数（BMI）物理学公式，由设定的身高与体重科学共算。彻底推倒了“任何时刻都无理贬斥极其消瘦”的单调舆论——当您打理营养使BMI恢复健康区间时，饭圈论坛将会爆发全网最高赞的吹捧，让爱豆越养越美！
                </p>
              </div>

              {/* Feature 3: Stamina restore */}
              <div className="bg-blue-950/20 border border-blue-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-[12.5px]">
                  <span>🔋 3. 清晨复盘结算体力延迟读取修正</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  纠正了AI次日结算流程中，对能量体力更新滞后一天的时序Bug。清晨复盘评价中会实时采用最健康的早间饱满回复精力数据，让AI再也不会毫无缘由地唠叨你极其劳累。
                </p>
              </div>

              {/* Feature 4: bubble names alignment */}
              <div className="bg-sky-950/20 border border-sky-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-[12.5px]">
                  <span>💬 4. 泡泡 (Bubble) 评论真实队友精准连线</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  优化泡泡营业生成，杜绝了系统偶尔无脑编造英文与虚构队友回复。前排营业最后一贴凡是出现队友打趣时，均100%连线至真实的组合名册（包含您的多槽卡和队内既定担当）。
                </p>
              </div>

              {/* Feature 5: Trainee Romance */}
              <div className="bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-[12.5px]">
                  <span>💖 5. 练习生暗线恋爱启动与姓名补全</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  练习生时期全面接入情感选项，空白时会周全自动配置极赞的伴侣名字（如 韩熙珍/宋承泽）并解锁温存的短信交流，练习生再不是毫无爱情互动的枯槁旅途！
                </p>
              </div>

              {/* Feature 6: Responsive scroll container */}
              <div className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-[12.5px]">
                  <span>📺 6. PC浏览器自适应 iPad 窗体与纵向滚动</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  修缮了平板外壳外框高度，设定 dynamic 限高，强制溢出时内部容器自适应，允许全域独立双向滚动！杜绝了PC电脑浏览器下底部控制栏、侧边栏溢出导致无法点击的问题。
                </p>
              </div>

              {/* Feature 7: Lockdown */}
              <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-red-300 font-bold text-[12.5px]">
                  <span>🔒 7. 重大危机/复盘选项强制切线锁定</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  重修了切线逃脱决策惩罚的空子：在早结算复牌、私生饭骚扰大考等事件处于活动态时，左上角成员切线通道、底部快捷 Dock 都会被牢牢物理遮罩锁定，直至您智勇了结！
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2.5 text-xs mt-6 pt-3.5 border-t border-white/10">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-md transition cursor-pointer text-center select-none active:scale-[0.98]"
              >
                开始健康调理，进入爱豆计划
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8-Ending Narrative System Overlay Modal */}
      {activeEnding && (
        <div className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans select-none">
          <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-teal-500/20 rounded-3xl p-5 md:p-8 shadow-2xl shadow-teal-950/10 flex flex-col relative max-h-[92vh] overflow-y-auto">
            
            {/* Elegant sparkling header background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
            
            {/* Top Close indicator or badge */}
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest font-black text-teal-400">
                  Aether Label 首席终身荣誉评级档案
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">YEAR 3 RETIREMENT SYSTEM</span>
            </div>

            {/* Main Trophy & Title Segment */}
            <div className="text-center relative py-4 mb-5 bg-white/3 rounded-2xl border border-white/5 shadow-inner">
              <div className="text-3xl md:text-4xl mb-2 animate-bounce">🏆</div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest ${
                activeEnding.rating === 'SSS' ? 'bg-amber-500/25 text-yellow-350 border border-amber-500/40' :
                activeEnding.rating === 'S' ? 'bg-purple-500/25 text-purple-305 border border-purple-500/40' :
                activeEnding.rating === 'A' ? 'bg-cyan-500/25 text-cyan-305 border border-cyan-500/40' :
                'bg-slate-800/60 text-slate-400 border border-white/5'
              }`}>
                🌟 生涯荣誉评级: {activeEnding.rating}
              </span>
              <h2 className="text-xl md:text-2xl font-black mt-2 bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent tracking-wide">
                {activeEnding.title}
              </h2>
              <p className="text-[10px] text-slate-450 mt-1">
                于 Aether 历练厂牌累计执剑奋斗 {activeEnding.daysNumber} 天・终算年龄 {activeEnding.age} 岁
              </p>
            </div>

            {/* Narrative Tale block */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-2">
                  <span>📖</span> 宿命叙事终章・尘埃落定
                </h3>
                <p className="text-[11.5px] leading-relaxed text-slate-300 font-sans tracking-wide indent-6 whitespace-pre-line">
                  {activeEnding.desc}
                </p>
              </div>

              {/* Gemini Custom Career Chronicler letter block */}
              <div className="bg-slate-950/90 rounded-2xl p-4 border border-teal-500/10 shadow-lg relative min-h-[140px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-350 to-emerald-400 flex items-center gap-1">
                      <span>🦉</span> AI 心理师兼生涯官・定制荣誉自述
                    </h3>
                    <button
                      type="button"
                      onClick={handleGenerateAiEnding}
                      disabled={isGeneratingAiEnding}
                      className="px-3 py-1 bg-gradient-to-r from-teal-600/30 to-emerald-600/30 hover:from-teal-600 hover:to-emerald-600 text-teal-300 hover:text-white border border-teal-500/25 rounded-lg text-[9px] font-black tracking-wider transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isGeneratingAiEnding ? "✍️ 正在竭诚手写纪实信件..." : "✨ 启动 AI 生成定制一封信"}
                    </button>
                  </div>

                  {aiEndingMessage ? (
                    <div className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-white/5 italic font-sans max-h-56 overflow-y-auto whitespace-pre-line">
                      {aiEndingMessage}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-normal font-sans italic">
                      （检测到您当前已绑定 Gemini 密钥，可以直接点击右侧按钮，调用大模型对您这一轮的所有心血大考、主管好感、地下恋人互动等参数做出深度情感自述与 300 字爱心总结信。如未绑定，可随时阅读上述纯真宿命大纲结局。）
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Grid of Dynamic Stat Summary Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-[10px]">
              <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-center">
                <span className="text-slate-500 block text-[9px]">终役资产余额</span>
                <span className="font-bold font-mono text-yellow-300 text-xs">₩ {activeEnding.money.toLocaleString()} 万</span>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-center">
                <span className="text-slate-500 block text-[9px]">余留初始债务</span>
                <span className={`font-bold font-mono text-xs ${activeEnding.debt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {activeEnding.debt > 0 ? `₩ ${activeEnding.debt.toLocaleString()} 万` : '财务彻底两清!'}
                </span>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-center">
                <span className="text-slate-500 block text-[9px]">宿命均值技能值</span>
                <span className="font-bold font-mono text-cyan-300 text-xs">{activeEnding.skills} Pts</span>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-center">
                <span className="text-slate-500 block text-[9px]">最终积累信众</span>
                <span className="font-bold font-mono text-pink-300 text-xs text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">
                  {((activeEnding.totalFans || 0) / 10000).toFixed(1)} 万人
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3.5 mt-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveEnding(null);
                  setConfirmAction("new_game");
                }}
                className="py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black rounded-xl text-xs shadow-md shadow-purple-950/20 text-center cursor-pointer active:scale-98 transition"
              >
                🎮 载入新档再次重鸣 (New Game)
              </button>
              <button
                type="button"
                onClick={() => setActiveEnding(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs text-center cursor-pointer active:scale-98 transition"
              >
                👀 折叠返回，余温驻足 (Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Specialty Birthday mini game modal */}
      {showBirthdayEvent && (
        <BirthdayGameModal
          personas={personas}
          celebratingIndices={birthdayPersonaIndices.length > 0 ? birthdayPersonaIndices : [activePersonaIdx]}
          teammates={teammates}
          onAddLog={handleAddSystemLog}
          onComplete={(updatedPList) => {
            setPersonas(updatedPList);
            const currentP = updatedPList[activePersonaIdx] || updatedPList[0] || persona;
            setPersona(currentP);
            setShowBirthdayEvent(false);
            triggerAutoSave(currentP, teammates, chatHistories, weversePosts, bubbleMessages, schedules);
            handleAddSystemLog(`🎂 【生日大吉】生日庆典在漫天彩弹与唯粉尖叫声中圆满落下帷幕！所有特权奖励已被稳妥写入寿星成员的名誉簿里！`);
            triggerToast("🎁 惊喜加注成功", "生日专属礼遇已被完全激活并持久保存入档！", "success");
          }}
        />
      )}

    </div>
  );
}
