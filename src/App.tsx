import { useState, useEffect, useRef, ChangeEvent } from "react";
import { 
  IdolPersona, 
  ChatContact, 
  ChatMessage, 
  WeversePost, 
  BubbleMessage, 
  IdolSchedule, 
  SimulatedTeammate,
  BackupData 
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
import KakaoTalkApp from "./components/KakaoTalkApp";
import WeverseApp from "./components/WeverseApp";
import BubbleApp from "./components/BubbleApp";
import FandomAnalyticsApp from "./components/FandomAnalyticsApp";
import SchedulesApp from "./components/SchedulesApp";
import SuddenEventModal from "./components/SuddenEventModal";
import TikTokApp from "./components/TikTokApp";
import XiaohongshuApp from "./components/XiaohongshuApp";
import FanMailApp, { FanLetter, generateRandomFanLetter } from "./components/FanMailApp";
import { safeFetch } from "./components/apiHelper";
import { 
  Sparkles, Battery, Wifi, Signal, Grid, RefreshCw, 
  Settings as SettingsIcon, Calendar, MessageSquare, 
  User, Activity, Flame, ShieldAlert, Coins, 
  Download, Upload, Heart, Info, MonitorCheck, Award,
  Film, Image, Mail
} from "lucide-react";

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [persona, setPersona] = useState<IdolPersona>(DEFAULT_PERSONA);
  const [teammates, setTeammates] = useState<SimulatedTeammate[]>([]);
  
  // App navigation state
  const [activeApp, setActiveApp] = useState<string>("schedule"); // "kakaotalk" | "weverse" | "bubble" | "analytics" | "schedule" | "settings"
  const [ipadWallpaper, setIpadWallpaper] = useState<string>("cosmic"); // "neon" | "peach" | "cosmic" | "aurora"
  
  // Dynamic system simulation logs
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "IdolPad™ OS V2.5 启动正常...",
    "练习生网络传感器自适应模块装载完毕。"
  ]);

  // Custom API configuration (Requirement 10)
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("gemini-2.5-flash");
  const [customApiEndpoint, setCustomApiEndpoint] = useState<string>("");

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

  // KakaoTalk state
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});

  // Social feeds
  const [weversePosts, setWeversePosts] = useState<WeversePost[]>(INITIAL_WEVERSE_POSTS);
  const [bubbleMessages, setBubbleMessages] = useState<BubbleMessage[]>(INITIAL_BUBBLE_MESSAGES);
  const [schedules, setSchedules] = useState<IdolSchedule[]>(SH_LIST);

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
  const [fanLetters, setFanLetters] = useState<FanLetter[]>([]);
  const [arrivedMailPopup, setArrivedMailPopup] = useState<FanLetter | null>(null);

  const [seoulTime, setSeoulTime] = useState<string>("12:00PM");
  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);

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
        const parsed: BackupData = JSON.parse(backup);
        if (parsed.persona && parsed.persona.name) {
          setPersona(parsed.persona);
          setTeammates(parsed.teammates || []);
          if (parsed.chatHistories) setChatHistories(parsed.chatHistories);
          const remappedContacts = generateSubContacts(parsed.persona, parsed.teammates || [], parsed.chatHistories || {});
          setChatContacts(remappedContacts);

          if (parsed.weversePosts) setWeversePosts(parsed.weversePosts);
          if (parsed.bubbleMessages) setBubbleMessages(parsed.bubbleMessages);
          if (parsed.schedules) setSchedules(parsed.schedules);
          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint);
          if (parsed.fanLetters) {
            setFanLetters(parsed.fanLetters);
          } else {
            setFanLetters([generateRandomFanLetter(parsed.persona, parsed.persona.dayNumber)]);
          }
          setHasStarted(true);
        }
      } catch (err) {
        console.error("Failed to restore saved session", err);
      }
    }
  }, []);

  // Propose a customized chat list based on generated teammates (Requirement 9, 15)
  const generateSubContacts = (p: IdolPersona, tm: SimulatedTeammate[], currHist: Record<string, ChatMessage[]> = chatHistories): ChatContact[] => {
    const staff = generateCoreStaff(p.gender);
    
    // 1. Procedural randomized openers based on personality & favorability (Requirement 13 & 15)
    let managerMsg = p.gender === "female" ? "下午的称重评测很严酷，动作别划水！" : "今晚称重考核加练到半夜，小子，皮绷紧点！";
    if (p.managerFavorability < 20) {
      const msgs = [
        "今天的卡路里超标贴图我已经截图了。现在立刻来办公室做面部消肿！",
        "在这个圈子里，比你好看且肯吃苦的练习生有一卡车。别让我看到你昨天的划水动作再次上演！",
        "公司花重金给你在江南清潭洞皮肤科拿了号，做完LDM童颜维稳后十分钟，立刻回公司声乐室特训！"
      ];
      managerMsg = msgs[Math.floor(Math.random() * msgs.length)];
    } else if (p.managerFavorability >= 20 && p.managerFavorability < 50) {
      const msgs = [
        "今天的通告单已经发在工作群了。下午体脂称重前严禁喝水，脸部消肿黑咖啡自己记得喝。",
        "昨天录音表现勉强及格，但接下来千万不能懈怠。今天的编舞考核社长代表和PD们也会空降，打起十二分精神！"
      ];
      managerMsg = msgs[Math.floor(Math.random() * msgs.length)];
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

    // Include generated group members chatter
    tm.forEach((mate) => {
      const greeting = p.gender === "female" ? "欧尼" : "哥";
      const isExtrovert = mate.mbti && mate.mbti.startsWith("E");
      let mateMsg = `${greeting}！今晚称重评测放水求同盟呗！`;
      
      if (isExtrovert) {
        const msgs = [
          `${greeting}！刚才舞蹈集训完，我偷偷买了两杯清潭洞清晨限定冰美式，在新宿舍门口呢，等会儿匀你一杯！别让闵室长发现喔！☕️🤫`,
          `嘿嘿！听说昨晚代表在代表室夸起你的声乐咬字了，看来下张专辑你的 killing part 要拿满了！下午美容室等我，一起点鸡胸肉沙拉！🥑`,
          `${greeting}！刚才看到有人在Weverse给你专门写小长文安利了，超级治愈！今天也要元气满满地把练习室炸掉，Fighting！💃`
        ];
        mateMsg = msgs[Math.floor(Math.random() * msgs.length)];
      } else {
        const msgs = [
          `${greeting}... 那个，这次主打歌中段的走位，我有一小段总是慢半拍，晚上练习完可以单独加练，能不能麻烦你提点一下我... 🥺`,
          `在客厅桌上留了消肿大麦茶和维他命，出门练习前记得带上。今天称重考核，我们一定能全员通过的，加油。`,
          `刚刚听说隔壁公司的竞品要推迟回归期了，我们的打歌夺冠机会突然变大了，哈哈。希望新主打能早点空降一位...`
        ];
        mateMsg = msgs[Math.floor(Math.random() * msgs.length)];
      }

      contactList.push({
        id: mate.id,
        name: `${mate.name} (队内${mate.role.split(" ")[0]})`,
        avatar: mate.avatar,
        role: "member",
        mbti: mate.mbti,
        lastMessage: mateMsg,
        unread: true,
        time: "刚刚",
        favorability: mate.favorability
      });
    });

    // Include underground/secret romance lover contact if configured (Requirement 13)
    if (p.hasLover && p.loverName) {
      const genderSign = p.loverGender === "female" ? "🚺" : "🚹";
      const isCeleb = p.loverIdentity === "celebrity";
      const ageLabel = p.loverAge === "same_age" ? "同龄" : p.loverAge === "older" ? "年上" : "年下";
      const identityLabel = isCeleb ? "星侣" : "素人";
      
      let loverMsg = "宝贝，想你了... 今天集训累不累？";
      const currentMood = p.loverMood ?? 80;
      if (currentMood < 40) {
        loverMsg = "其实我总在想，我们这样瞒着所有人真的对吗？对你的粉丝好不公平，我心里很愧疚... 我们是不是该分手？😔";
      } else if (currentMood < 70) {
        loverMsg = "呼，最近打歌行程太密了，我超级担心被狗仔跟拍。为了你的声誉，我们要不试着理智地克制联系一两周？";
      }

      contactList.push({
        id: "lover",
        name: `💖 ${p.loverName} (${identityLabel}恋人)`,
        avatar: "", // Removed per user request, fallback to sweet heart character
        role: "celeb",
        mbti: isCeleb ? "ENFJ/大势" : "ISFJ/温柔",
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

  // Dynamic Sasaeng Stalker KakaoTalk trigger on day transition
  useEffect(() => {
    if (!hasStarted) return;
    if (persona.dayNumber > 1) {
      const stalkerId = `sasaeng_${persona.dayNumber}`;
      const containsTodayStalker = chatContacts.some(c => c.id === stalkerId);
      
      // 55% chance of stalker harassment on day transition
      if (!containsTodayStalker && Math.random() < 0.55) {
        const creepyMsgs = [
          "姐姐，你刚才在练习室里跳舞穿的灰色卫衣很配你哦... 嘻嘻。你猜我是趴在天花板的空调管道，还是在对面公寓的顶楼举着望远镜看你呢？",
          "宝贝，我搞到了你明天要去的那家江南美容室做私域面部护理的水乳配方哦... 喜欢我寄到你宿舍大门的爱心包裹吗？",
          "千万不要拉黑我的Kakaotalk，不然我明天就把你那张没修过的浮肿丑图连夜大喇叭到各个吃瓜论坛上去！",
          "姐姐，你新宿舍的安全门锁密码是 2038# 对不对？我昨晚深夜试了一下，锁开了报备耶... 放心，我只在你床底下留了一支微型录音笔噢~"
        ];
        const chosenCreepy = creepyMsgs[Math.floor(Math.random() * creepyMsgs.length)];
        const stalkerContact: ChatContact = {
          id: stalkerId,
          name: `🤐 匿名未知私域来电 [私生粉丝]`,
          mbti: "XXXX型人格",
          avatar: "",
          role: "fan",
          lastMessage: chosenCreepy,
          unread: true,
          time: "刚刚",
          favorability: -99
        };

        setChatContacts(prev => [stalkerContact, ...prev]);
        setChatHistories(prev => {
          const updatedHist = {
            ...prev,
            [stalkerId]: [
              {
                id: `creepy_init_${Date.now()}`,
                sender: "fan",
                text: chosenCreepy,
                time: "刚刚"
              }
            ]
          };
          triggerAutoSave(persona, teammates, updatedHist);
          return updatedHist;
        });

        handleAddSystemLog(`【🔴 KAKAOTALK 安全警报】极其有害！发现有私生粉高价买通不法渠道获取了您的私密 Kakaotalk 账号并向您投送私域骚扰监视言论，请在通讯软件中极其理智地小心回复处置！`);
      }
    }
  }, [persona.dayNumber]);

  // Trigger auto save to local storage
  const triggerAutoSave = (
    currPersona = persona,
    currTeammates = teammates,
    currHist = chatHistories,
    currWeverse = weversePosts,
    currBubble = bubbleMessages,
    currSch = schedules,
    currFanLetters = fanLetters
  ) => {
    const data: BackupData = {
      persona: currPersona,
      teammates: currTeammates,
      chatHistories: currHist,
      weversePosts: currWeverse,
      bubbleMessages: currBubble,
      schedules: currSch,
      tickTokVideos: [],
      xiaohongshuPosts: [],
      customApiKey,
      customModel,
      customApiEndpoint,
      fanLetters: currFanLetters
    };
    localStorage.setItem("idolpad_os_backup_v2.5", JSON.stringify(data));
  };

  // Complete profile step & launch simulation
  const handleSetupComplete = (newPersona: IdolPersona, generatedTeammates: SimulatedTeammate[]) => {
    setPersona(newPersona);
    setTeammates(generatedTeammates);
    
    // Pre-populate unread letters
    const initialLetters = [
      generateRandomFanLetter(newPersona, 1),
      generateRandomFanLetter(newPersona, 1)
    ];
    setFanLetters(initialLetters);
    
    // Auto populate custom chat histories
    const contactList = generateSubContacts(newPersona, generatedTeammates);
    setChatContacts(contactList);

    const initialHist: Record<string, ChatMessage[]> = {};
    contactList.forEach((c) => {
      initialHist[c.id] = [
        { id: `sys_init_${c.id}`, sender: "system", text: "—— 建立了安全的私人加密会话通道 ——", time: "上午 09:00" },
        { id: `init_${c.id}`, sender: "other", text: c.lastMessage, time: "上午 09:12" }
      ];
    });

    setChatHistories(initialHist);
    setHasStarted(true);
    handleAddSystemLog(`创建了档案 "${newPersona.name}" (${newPersona.stageName})`);
    
    // Direct save
    const archive: BackupData = {
      persona: newPersona,
      teammates: generatedTeammates,
      chatHistories: initialHist,
      weversePosts: INITIAL_WEVERSE_POSTS,
      bubbleMessages: INITIAL_BUBBLE_MESSAGES,
      schedules: SH_LIST,
      tickTokVideos: [],
      xiaohongshuPosts: [],
      customApiKey,
      customModel,
      customApiEndpoint,
      fanLetters: initialLetters
    };
    localStorage.setItem("idolpad_os_backup_v2.5", JSON.stringify(archive));
  };

  // Export progress
  const handleExportData = () => {
    const data: BackupData = {
      persona,
      teammates,
      chatHistories,
      weversePosts,
      bubbleMessages,
      schedules,
      tickTokVideos: [],
      xiaohongshuPosts: [],
      customApiKey,
      customModel,
      customApiEndpoint
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `idolpad_backup_${persona.stageName}_day${persona.dayNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
    handleAddSystemLog("成功导出存档文件！");
  };

  // Import JSON progress
  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: BackupData = JSON.parse(event.target?.result as string);
        if (parsed.persona && parsed.persona.name) {
          setPersona(parsed.persona);
          setTeammates(parsed.teammates || []);
          if (parsed.chatHistories) setChatHistories(parsed.chatHistories);
          const mapped = generateSubContacts(parsed.persona, parsed.teammates || []);
          setChatContacts(mapped);

          if (parsed.weversePosts) setWeversePosts(parsed.weversePosts);
          if (parsed.bubbleMessages) setBubbleMessages(parsed.bubbleMessages);
          if (parsed.schedules) setSchedules(parsed.schedules);
          if (parsed.customApiKey) setCustomApiKey(parsed.customApiKey);
          if (parsed.customModel) setCustomModel(parsed.customModel);
          if (parsed.customApiEndpoint) setCustomApiEndpoint(parsed.customApiEndpoint || "");
          setHasStarted(true);
          handleAddSystemLog("同步成功！已恢复本地备份数据。");
          
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
    if (evt.id === "e_m1" && persona.style !== "group") {
      return false; // MAMA double center only applies for group stans
    }
    if (evt.id === "e_g1" && persona.nationality === "korean") {
      return false; // Green card bias only applies for green card stans
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
  };

  return (
    <div className={`min-h-screen relative p-1 md:p-6 select-none overflow-x-hidden transition-all duration-500 ${
      ipadWallpaper === "neon" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-indigo-950/40" :
      ipadWallpaper === "peach" ? "bg-stone-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/30 via-stone-950 to-amber-950/30" :
      ipadWallpaper === "cosmic" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 via-slate-950 to-slate-900" :
      ipadWallpaper === "aurora" ? "bg-[#040e10] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-zinc-950 to-emerald-950/30" :
      ipadWallpaper === "cherry" ? "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/40 via-stone-950 to-purple-950/30" :
      "bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-blue-950/30"
    } text-slate-100 flex items-center justify-center`}>
      
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
        <div id="ipad-shell-wrapper" className="w-full max-w-7xl relative mx-auto p-2 md:p-4 rounded-[40px] bg-[#1c1d25] border-t border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.06)] flex flex-col overflow-hidden">
          
          {/* Main iPad Inner Screen Aspect ratio */}
          <div className={`flex-1 w-full rounded-[28px] overflow-hidden flex flex-col relative border border-slate-950 transition-all duration-500 ${
            ipadWallpaper === "neon" ? "bg-gradient-to-b from-[#110c1c] to-[#090a10]" :
            ipadWallpaper === "peach" ? "bg-gradient-to-b from-[#1e1318] to-[#120f12]" :
            ipadWallpaper === "cosmic" ? "bg-gradient-to-b from-[#0e0e1c] to-[#060810]" :
            ipadWallpaper === "aurora" ? "bg-gradient-to-b from-[#081214] to-[#04080a]" :
            ipadWallpaper === "cherry" ? "bg-gradient-to-b from-[#221018] to-[#0f0a0d]" :
            "bg-gradient-to-b from-[#111624] to-[#0b0c10]"
          }`}>
            
            {/* iPad Pro Header Status Bar */}
            <div id="ipad-header-status" className="h-9 px-4 md:px-6 bg-slate-950/50 backdrop-blur-md flex items-center justify-between text-xs text-slate-300 font-medium select-none border-b border-white/5 relative z-40">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{seoulTime}</span>
                <span className="text-[10px] text-slate-400 font-mono">Seoul KST</span>
                {persona.startType === "trainee" ? (
                  <span className="bg-red-500/15 text-red-400 border border-red-500/25 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                    TRAIN DEBT: ${persona.traineeDebt}w
                  </span>
                ) : (
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                    ACTIVE IDOL
                  </span>
                )}
              </div>

              {/* Dynamic Camera Notch Center */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-4 bg-black rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-purple-500/50 mr-1" />
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-mono">
                  <Signal className="w-3 h-3 text-indigo-400" />
                  {persona.company.split(" ")[0]}
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                  <Battery className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-mono text-[10px]">{persona.energy}%</span>
                </div>

                {/* Quick Interactive Wallpaper Palette Dock */}
                <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-lg border border-white/5 transition-all text-[10px]">
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

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                    <span className="text-purple-300 block font-bold text-[11px] mb-1">Idol Overview</span>
                    <p className="text-[10px] leading-relaxed text-slate-400">
                      舞台名: <strong className="text-white">{persona.stageName}</strong><br />
                      公司: {persona.company.split(" ")[0]} ({persona.companySplit})<br />
                      国籍定位: <span className="text-yellow-400 uppercase">{persona.nationality.replace("_", " ")}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <button
                      onClick={() => { setConfirmAction("new_game"); setIsControlCenterOpen(false); }}
                      className="w-full py-1.5 px-2 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded text-center transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> 🔁 开启新神颜档 (New Game)
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setActiveApp("settings"); setIsControlCenterOpen(false); }}
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
            <div id="ipad-main-screen" className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* STATUS BAR DRAWER METERS (Requirement 11, 12, 13) */}
              <div id="quick-side-meters" className="w-full md:w-[220px] bg-slate-950/85 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
                <div className="space-y-4 flex-1">
                  
                  {/* Persona Bio Badge */}
                  <div className="p-3 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-black border border-white/5 rounded-2xl relative shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0 border border-purple-500/35 shadow animate-pulse">
                        {persona.stageName.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 truncate block">{persona.stageName}</span>
                        <span className="text-[8px] font-mono text-slate-450 block uppercase text-purple-300">★ {persona.mbti}</span>
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-400 italic mt-2 border-t border-white/5 pt-1.5 leading-relaxed">
                      {persona.vibeText}
                    </p>
                  </div>

                  {/* Detailed Profile Specifications */}
                  <div className="p-2.5 bg-slate-950/70 border border-white/5 rounded-xl space-y-1 text-[10px] text-slate-350">
                    <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
                      <span className="text-[8px] text-slate-400 uppercase font-mono font-bold">🔍 详实身份档案</span>
                      <span className="text-[8px] bg-indigo-950/50 px-1 py-0.2 rounded text-indigo-300 font-mono font-bold block">{persona.bloodType || "O型"}</span>
                    </div>
                    <div className="space-y-1 leading-tight">
                      <div>
                        <span className="text-[8px] text-slate-500">生辰星盘: </span>
                        <span className="text-slate-200 font-mono text-[9px]">{persona.birthday || "2006-01-08"} ({persona.zodiac || "魔羯座"})</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500">具体国籍: </span>
                        <span className="text-slate-200 block truncate text-[9px]" title={persona.specificNationality || "韩国首尔"}>{persona.specificNationality || "韩国首尔"}</span>
                      </div>
                    </div>
                    {persona.isMixed && (
                      <div className="pt-1 border-t border-white/5 flex justify-between text-[8px] text-purple-300">
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

                <div className="space-y-3.5 border-l md:border-l-0 md:border-t border-white/5 pl-4 md:pl-0 pt-0 md:pt-3 flex-1 md:flex-initial">
                  {/* Wallet */}
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-mono block">到手提成费余额</span>
                    <span className="text-base font-bold text-yellow-300 font-mono mt-0.5 block flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500 animate-spin" /> ₩ {persona.money.toLocaleString()} 万
                    </span>
                  </div>

                  {/* Teammates or Sibling Relationship Favorability status (Requirement 13) */}
                  <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl">
                    <span className="text-[9px] block text-slate-400 uppercase font-mono mb-1">团队主管与成员关系度</span>
                    <div className="space-y-1 text-[10px] text-slate-300">
                      <div className="flex justify-between">
                        <span>👔 闵室长:</span>
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
                </div>
              </div>

              {/* DYNAMIC APP GRID ROUTING AREA */}
              <div className="flex-1 flex flex-col justify-between min-w-0 bg-[#0e111a]/45 relative">
                
                {/* Dynamic App content display canvases */}
                <div className="flex-1 p-4 md:p-6 overflow-hidden">
                  
                  {activeApp === "schedule" && (
                    <SchedulesApp
                      persona={persona}
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
                        // 3. Random slowly shifting fan base distribution based on active day actions
                        let updatedFansDist = { ...(newPersona.fansDistribution || { otFans: 50, soloFans: 25, cpFans: 15, antiFans: 10 }) };
                        // Randomly shift 1-2 points from antiFans to otFans/soloFans if reputation is high, otherwise increase anti-fans!
                        if (newPersona.reputation >= 65) {
                          if (updatedFansDist.antiFans > 5) {
                            updatedFansDist.antiFans -= 1;
                            updatedFansDist.otFans += 1;
                          }
                        } else {
                          updatedFansDist.antiFans += 1;
                          if (updatedFansDist.otFans > 20) {
                            updatedFansDist.otFans -= 1;
                          }
                        }
                        
                        // If style is solo, shift towards soloFans. If style is group, shift towards otFans
                        if (newPersona.style === "solo") {
                          if (updatedFansDist.otFans > 10) {
                            updatedFansDist.otFans -= 1;
                            updatedFansDist.soloFans += 1;
                          }
                        } else {
                          if (updatedFansDist.soloFans > 10) {
                            updatedFansDist.soloFans -= 1;
                            updatedFansDist.otFans += 1;
                          }
                        }
                        
                        newPersona.fansDistribution = updatedFansDist;

                        let evaluationTriggered = false;
                        
                        // A. Check for trainee debut evaluation on Day 5+
                        if (persona.startType === "trainee" && newPersona.dayNumber >= 5) {
                          evaluationTriggered = true;
                          const totalTalent = newPersona.vocalSkill + newPersona.danceSkill + newPersona.rapSkill;
                          const repValue = newPersona.reputation;
                          const stressValue = newPersona.stress;
                          
                          if (totalTalent >= 130 && repValue >= 65 && stressValue < 80) {
                            setDebutEvaluationStatus("success");
                          } else {
                            setDebutEvaluationStatus("fail");
                          }
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
                              const teammatesPassed = newPersona.style === "solo" ? true : newPersona.teammatesFavorability >= 45;
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
                              } else if (teammatesPassed && newPersona.style === "group") {
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
                                details = `灾难发生了！你在公司上上下下塑料情谊，关键时刻不仅没有得到李代表公关经费支持，闵室长表示无能为力，队友更是对此视若无睹冷眼旁观。你和秘密交往的 ${newPersona.loverName.split(" - ").pop() || newPersona.loverName} 的高清深夜牵手拥抱长焦大图，口子一旦漏底，直接登上娱乐新闻爆词首位！\n\n粉丝圈发生大地震，大量死忠脱粉回踩、大开黑号！全网怒控‘拿青春应援结果养你在温香软玉里泡茶！’ 好感代表性雪崩，你的名誉度暴跌 30 点，精神压力几近红区极限！`;
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

                        setPersona(newPersona);
                        setSchedules(newSchedules);
                        setWeversePosts(newWeversePosts);
                        
                        setChatHistories(prev => {
                          let nextHists = { ...prev };
                          
                          // 1. Add manager message if present
                          if (newManagerMsg) {
                            const mgrHist = nextHists["manager"] || [];
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

                          // 3. Update contact list state
                          setChatContacts(conts => conts.map(c => {
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
                          }));
                          
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
                      onUpdateStats={(pop, rep, nrg, stress) => {
                        const up = { ...persona, popularity: pop, reputation: rep, energy: nrg, stress };
                        setPersona(up);
                        triggerAutoSave(up);
                      }}
                      onAddLog={handleAddSystemLog}
                    />
                  )}

                  {activeApp === "settings" && (
                    <div id="settings-view" className="bg-slate-900 border border-white/5 rounded-2xl p-5 h-full overflow-y-auto space-y-4">
                      
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-1 text-slate-100">
                          <SettingsIcon className="w-4 h-4 text-slate-400" />
                          系统高保真设置与 AI 接口接入 Panel (Requirement 10)
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">您可以配置自定义的 LLM 代理，输入对应的 Api Key 和端口网关来实现高恢复回复。</p>
                      </div>

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
                                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-bold text-yellow-300 focus:outline-none focus:border-purple-500 font-mono text-white"
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
                <div id="ipad-announcements" className="h-8 px-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 select-none pointer-events-none shrink-0 font-mono">
                  <span className="truncate max-w-[80%] flex items-center gap-1 text-slate-300">
                    <MonitorCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    系统消息: {systemLogs[0] || "IdolPad OS 运行中..."}
                  </span>
                  <span className="shrink-0 text-[9px] text-[#868da1]">
                    SEOUL UTC+09
                  </span>
                </div>

              </div>

            </div>

            {/* DOCK BAR FOR IPAD APP SHORTCUTS (Aesthetic shortcuts to different Apps) */}
            <div id="ipad-bottom-dock" className="h-16 px-4 md:px-12 bg-slate-950/50 border-t border-white/5 backdrop-blur-md flex items-center justify-center gap-3 md:gap-6 shrink-0 relative select-none z-30">
              
              <div className="px-4 py-1.5 bg-white/5 rounded-2xl flex items-center gap-3 md:gap-5 shadow-lg border border-white/5">
                {/* 1. Schedule Calendar */}
                <button
                  onClick={() => { setActiveApp("schedule"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "schedule" ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-110" : "text-slate-400 hover:text-white"}`}
                  title="日常行列表"
                >
                  <Calendar className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#f44e73] animate-ping" />
                </button>

                {/* 2. KakaoTalk */}
                <button
                  onClick={() => { setActiveApp("kakaotalk"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "kakaotalk" ? "bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/10 scale-110" : "text-slate-400 hover:text-white"}`}
                  title="KakaoTalk 成员群聊"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* 3. Weverse */}
                <button
                  onClick={() => { setActiveApp("weverse"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "weverse" ? "bg-teal-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="Weverse 官咖讨论"
                >
                  <Heart className="w-5 h-5" />
                </button>

                {/* 4. Bubble */}
                <button
                  onClick={() => { setActiveApp("bubble"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "bubble" ? "bg-blue-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="Bubble 粉丝订阅"
                >
                  <Sparkles className="w-5 h-5" />
                </button>

                {/* 5. Health & Fandom metrics */}
                <button
                  onClick={() => { setActiveApp("analytics"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "analytics" ? "bg-indigo-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="数据与大健康分析"
                >
                  <Activity className="w-5 h-5" />
                </button>

                {/* 5b. TikTok Short video Challenge */}
                <button
                  onClick={() => { setActiveApp("tiktok"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "tiktok" ? "bg-red-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="TikTok卡点短视频"
                >
                  <Film className="w-5 h-5" />
                </button>

                {/* 5c. XiaoHongShu Outfit */}
                <button
                  onClick={() => { setActiveApp("xiaohongshu"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "xiaohongshu" ? "bg-rose-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="小红书好物穿搭"
                >
                  <Image className="w-5 h-5" />
                </button>

                {/* 5d. Fan Mail (手写来信) */}
                <button
                  onClick={() => { setActiveApp("fanmail"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer outline-none ${activeApp === "fanmail" ? "bg-pink-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="粉丝实体来信物"
                >
                  <Mail className="w-5 h-5" />
                  {fanLetters.some((l) => !l.isRead) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#f44e73] animate-pulse border border-[#0e111a]" />
                  )}
                </button>

                {/* Divider */}
                <div className="w-[1px] h-6 bg-white/10 shrink-0 self-center" />

                {/* 6. Settings Key configuration */}
                <button
                  onClick={() => { setActiveApp("settings"); setIsControlCenterOpen(false); }}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer outline-none ${activeApp === "settings" ? "bg-slate-700 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white"}`}
                  title="系统API/备份管理"
                >
                  <SettingsIcon className="w-5 h-5" />
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
              确人，继续我的演艺生涯！
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
                <span className="text-[10px] text-slate-400 block font-mono">声舞说总评 (Skills Check):</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {persona.vocalSkill + persona.danceSkill + persona.rapSkill} / 130
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
                <span className="text-[10px] text-slate-400 block animate-pulse">训练生值 (Skills VS 130):</span>
                <span className={`text-sm font-bold ${(persona.vocalSkill + persona.danceSkill + persona.rapSkill) >= 130 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {persona.vocalSkill + persona.danceSkill + persona.rapSkill} / 130
                </span>
                <span className={`text-[9px] block mt-0.5 ${(persona.vocalSkill + persona.danceSkill + persona.rapSkill) >= 130 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                  {(persona.vocalSkill + persona.danceSkill + persona.rapSkill) >= 130 ? '合格' : '不合格'}
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
              李社长冷着脸指出：“你的实力目前出去只会在开麦舞台上给厂牌抹黑。要么你加练习，在第二天跨进新日程时重新进行评测；要么只能由你承担额外 <strong>₩2,000万 韩元</strong> 运作公关手续费，强行打通关系包办出道！”
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
                  p.traineeDebt = p.traineeDebt + 2000; // Debt increases by 20 million KRW!
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
                💸 承受负债加重 +₩2,000万 强拍出道！
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

    </div>
  );
}
