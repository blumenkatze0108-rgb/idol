import { useState, useEffect } from "react";
import { IdolSchedule, IdolPersona, WeversePost, SimulatedTeammate, getCalendarPeriod } from "../types";
import { generateFallbackWeeklyDiaryEntry } from "./PersonalDiaryApp";
import { SH_LIST } from "../mockData";
import { Calendar, CheckCircle2, ChevronRight, RefreshCw, Coins, FileX, Sparkles, MessageSquare, Flame, AlertCircle, Moon, Coffee, Lock, Unlock, Heart, Users } from "lucide-react";
import { safeFetch, getSeoulWeather } from "./apiHelper";

const MBTI_DORM_TALKS: Record<string, { monologue: string; insight: string }> = {
  INFJ: {
    monologue: "「今晚宿舍的灯都关了，练习室的脚伤还在隐隐作痛吧？我泡了热蜂蜜柚子茶……其实我之前一直很担心自己作为主唱会拖累大家，但听你对我说的那番话，我终于安心了。以后无论遇到什么黑粉攻击，我都会默默站在你身后。」",
    insight: "INFJ · 隐形守护者：表面清冷安静，实则极其敏感深情。深夜谈心彻底破开了对方的心防，将你视为最值得依赖的灵魂依靠。"
  },
  ENFP: {
    monologue: "「哈哈，终于大家都睡着了！其实我平时在镜头前拼命搞怪开玩笑，只是不想让大家看到我因为音准被训而偷偷掉眼泪的样子……谢谢你今晚盘腿陪我坐在客厅看首尔夜景，我感觉自己的电池瞬间又被充满啦！」",
    insight: "ENFP · 追光气氛担当：看似无忧无虑乐天派，实则极度需要认可与偏爱。谈心后对方将你视为最温暖的避风港。"
  },
  INTJ: {
    monologue: "「我平时说话太理性直白，可能让经纪人和成员们觉得我有些冰冷刺骨吧……但今晚关于以后主打歌编舞和分词的想法，我只想第一个听听你的看法。在这个组合里，只有你能真正听懂我未尽的言外之意。」",
    insight: "INTJ · 幕后冰山智囊：严苛冷静、追求绝对掌控力，但在深夜卸下防备后对你展现出了难得的绝对信任与偏袒。"
  },
  ISFP: {
    monologue: "「戴着耳机坐在客厅地板上，看着窗外首尔清晨前的夜色……我常常怀疑自己到底适不适合聚光灯。但刚才听你分享的练习生回忆，我突然觉得，只要有你在身旁，我就有勇气继续跳下去。」",
    insight: "ISFP · 自由艺术灵魂：内心世界极其丰富细腻，对舞台艺术有极致追求。谈心后对方对你的好感与依恋度大幅飙升！"
  },
  ENTP: {
    monologue: "「所有人都以为我只是个在广播和综艺上爱接话的显眼包……只有你会认真听我那些奇奇怪怪的音乐想法。今晚这罐冷饮没白喝，以后我们一起把组合的舞台玩出新花样！」",
    insight: "ENTP · 敏锐奇想家：思维天马行空，外表玩世不恭内里非常重情义。谈心后彻底将你奉为最懂自己的知己！"
  },
  ENFJ: {
    monologue: "「作为队内照顾大家的大哥/大姐姐，我每天都要绷紧神经配合公司的行程。只有在深夜跟你单独聊天的时候，我才能把身上的重担卸下来一会儿……谢谢你一直以来这么理解我的不容易。」",
    insight: "ENFJ · 领袖暖阳：习惯照顾全队却常常忽略自己。深夜谈心让你成为了对方唯一能够展露脆弱的精神支柱。"
  },
  ISTJ: {
    monologue: "「我整理了队内过去半年的考勤和舞台消音对比数据……虽然看起来很无趣，但我是真的希望我们组合能长长久久地走下去。今晚能和你谈心，让我更加确信我们走在正确的道路上。」",
    insight: "ISTJ · 忠诚基石：踏实严谨、不善言辞表达，但默默将你的每句需求记在心头并落实为行动。"
  },
  INFP: {
    monologue: "「大家都在宿舍睡了，我偷偷把这首深夜写的歌 Demo 放给你听……其实歌词里的每一个句子，都是写关于我们一路走来的酸甜苦辣。只要你觉得好听，我就有信心拿到公司的企划会上去。」",
    insight: "INFP · 浪漫吟游诗人：感情细腻浪漫，习惯用创作寄托情绪。谈心后对方将你写入了心底最柔软的隐秘角落。"
  }
};

export function getEffectiveTeammates(persona: IdolPersona, teammates?: SimulatedTeammate[]): SimulatedTeammate[] {
  if (teammates && teammates.length > 0) return teammates;
  if (persona.style === "solo") return [];
  return [
    {
      id: "tm_fallback_1",
      name: persona.gender === "male" ? "朴敏旭" : "金智雅",
      stageName: persona.gender === "male" ? "Minuk" : "Jia",
      mbti: "INFJ",
      role: "主唱 / 队内老大哥",
      nationality: "韩国",
      favorability: persona.teammatesFavorability || 50,
      trait: "表面高冷严苛，深夜会偷偷在宿舍客厅给成员泡热蜂蜜柚子茶的隐形守护者",
      avatar: persona.gender === "male" 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: "tm_fallback_2",
      name: persona.gender === "male" ? "崔韩率" : "李彩恩",
      stageName: persona.gender === "male" ? "Hansol" : "Chaeeun",
      mbti: "ENFP",
      role: "主舞 / 气氛担当",
      nationality: "韩国",
      favorability: persona.teammatesFavorability || 50,
      trait: "镜头前精力爆棚的极强情绪感染力团宠，深夜也有需要倾诉的脆弱时刻",
      avatar: persona.gender === "male"
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: "tm_fallback_3",
      name: persona.gender === "male" ? "姜泰贤" : "申柳真",
      stageName: persona.gender === "male" ? "Taehyun" : "Ryujin",
      mbti: "INTJ",
      role: "Rapper / 幕后智囊",
      nationality: "韩国",
      favorability: persona.teammatesFavorability || 50,
      trait: "思维极度理性冰冷，但在关键时刻对队友拥有毫不动摇的偏袒与忠诚",
      avatar: persona.gender === "male"
        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    }
  ];
}

const SOLO_STAGE_MONOLOGUES = [
  {
    title: "🎤 【Solo 舞台爆发 · 聚光灯主宰】",
    quote: "「这个舞台不需要多余的队形掩护，也不需要他人分担高音！当所有聚光灯和镜头死死锁定在我一个人的脸庞上时，全场两万名观众的尖叫只为我一个人而沸腾——这就是 Solo 歌手的绝对统治力，我一个人，就是整座舞台的最高主宰！」",
    insight: "全场镜头无死角跟拍，极度震撼的单人 Stage 气场彻底引爆网络论坛与高清直拍榜！"
  },
  {
    title: "⚡ 【Solo 舞台爆发 · 极致气场引爆】",
    quote: "「没有队友在身侧缓冲气口，全场3分30秒的爆裂高音与极致开麦编舞全由我一人独立扛下！眼神扫过前排看台的瞬间，整座体育馆的气压被我的气场彻底引爆。这一刻，我不是团体里的一部分，我就是这个舞台唯一的神！」",
    insight: "你神级的高音拉长与极具冲击力的舞台眼神杀死全场，各大打歌PD纷纷将你的直拍推至官网封面！"
  },
  {
    title: "🔥 【Solo 舞台爆发 · 撕裂全场开麦】",
    quote: "「全场大合唱在耳返里炸开，全无队友顶替的窒息编舞下，我的稳定垫音与高音拉长直接撕裂了直播画面的弹幕幕布！直拍破百万的瞬间，圈内圈外都在惊叹：‘不需要任何队形排阵，Ta 单枪匹马就能主宰顶流爱豆的世纪舞台！’」",
    insight: "全网唯粉与路人粉彻底陷入狂欢，纷纷转发：『无需团魂衬托，Ta 站出来就是顶级偶像的标准样板！』"
  },
  {
    title: "👑 【Solo 舞台爆发 · 独霸C位高潮】",
    quote: "「最后的 C 位高潮部分，烟花在我脚下爆开。我向着镜头露出极度自信的眼神撕裂笑容——独自一人扛起全场C位，把个人极致的星光与致命吸引力绽放到最极致！Solo 的世界里，我无需妥妥协，只管闪耀！」",
    insight: "聚光灯落幕，全场只回荡着你一个人的艺名与尖叫，你的个人魅力与舞台气场已达到近期巅峰！"
  }
];

export function getFixedSkillSchedules(dayN: number, cycleDays: number = 36, isSolo: boolean = false): IdolSchedule[] {
  const period = getCalendarPeriod(dayN, cycleDays);
  return [
    {
      id: `fixed_vocal_${dayN}`,
      time: "上午 09:00 - 11:30",
      title: `【${period.text}·固定声乐课】金牌声轨导师一对一生唱咬字打磨 🎙️`,
      category: "vocal_lesson",
      rewardPopularity: 1,
      rewardReputation: 1,
      energyCost: 15,
      completed: false
    },
    {
      id: `fixed_dance_${dayN}`,
      time: "下午 13:00 - 15:30",
      title: isSolo ? `【${period.text}·固定舞蹈课】高强度Solo舞台高难编舞肢体节拍矫正 💃` : `【${period.text}·固定舞蹈课】高强度超整齐刀群舞角度肢体节拍矫正 💃`,
      category: "practice",
      rewardPopularity: 1,
      rewardReputation: 1,
      energyCost: 20,
      completed: false
    },
    {
      id: `fixed_rap_${dayN}`,
      time: "下午 16:00 - 18:00",
      title: `【${period.text}·固定说唱课】暗黑词流律动与吐字爆破气相度特训 🎤`,
      category: "practice",
      rewardPopularity: 1,
      rewardReputation: 1,
      energyCost: 15,
      completed: false
    },
    {
      id: `fixed_variety_${dayN}`,
      time: "晚上 19:35 - 21:30",
      title: `【${period.text}·固定艺能课】广播级口才辩才与综艺机智模拟对抗 📺`,
      category: "variety_show",
      rewardPopularity: 1,
      rewardReputation: 1,
      energyCost: 12,
      completed: false
    }
  ];
}

interface SchedulesProps {
  persona: IdolPersona;
  personas?: IdolPersona[];
  teammates?: SimulatedTeammate[];
  schedules: IdolSchedule[];
  weversePosts: WeversePost[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdatePersona: (p: IdolPersona) => void;
  onUpdateTeammates?: (tms: SimulatedTeammate[]) => void;
  onUpdateSchedules: (schs: IdolSchedule[]) => void;
  onUpdateWeversePosts: (posts: WeversePost[]) => void;
  onNextDayTransition: (
    newPersona: IdolPersona,
    newSchedules: IdolSchedule[],
    newWeversePosts: WeversePost[],
    newManagerMsg?: string,
    proactiveMessage?: { senderId: string; senderName: string; text: string; time?: string } | null
  ) => void;
  onTriggerRandomEvent: () => void;
  onAddLog: (log: string) => void;
  onBlockingChange?: (blocking: boolean) => void;
}

export default function SchedulesApp({
  persona,
  personas = [],
  teammates = [],
  schedules,
  weversePosts,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdatePersona,
  onUpdateTeammates,
  onUpdateSchedules,
  onUpdateWeversePosts,
  onNextDayTransition,
  onTriggerRandomEvent,
  onAddLog,
  onBlockingChange
}: SchedulesProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [transitionResult, setTransitionResult] = useState<{
    narrative: string;
    managerMessage: string;
    weversePostContent: string;
    newSchedules: IdolSchedule[];
    pUpdate: IdolPersona;
    proactiveMessage?: { senderId: string; senderName: string; text: string; time?: string } | null;
  } | null>(null);

  const [emergencyHarassment, setEmergencyHarassment] = useState<{
    type: "big_fan" | "sasaeng";
    sender: string;
    message: string;
    options: {
      text: string;
      moneyCost?: number;
      debtIncrease?: number;
      stressChange: number;
      fansChange: number;
      story: string;
    }[];
  } | null>(null);

  const [soloStageBurstModal, setSoloStageBurstModal] = useState<{
    title: string;
    monologue: string;
    insight: string;
    extraFans: number;
    popBonus: number;
    repBonus: number;
    stageName: string;
  } | null>(null);

  const [isDormTalkSelectionOpen, setIsDormTalkSelectionOpen] = useState(false);
  const [dormTalkResult, setDormTalkResult] = useState<{
    teammate: SimulatedTeammate;
    monologue: string;
    mbtiInsight: string;
    favorabilityBoost: number;
    teamFavorabilityBoost: number;
  } | null>(null);

  useEffect(() => {
    if (onBlockingChange) {
      onBlockingChange(isProcessing || transitionResult !== null || emergencyHarassment !== null || soloStageBurstModal !== null || isDormTalkSelectionOpen || dormTalkResult !== null);
    }
  }, [isProcessing, transitionResult, emergencyHarassment, soloStageBurstModal, isDormTalkSelectionOpen, dormTalkResult, onBlockingChange]);

  const handleExecuteDormTalk = (tm: SimulatedTeammate) => {
    if (persona.interactionPoints < 1) {
      onAddLog("今日互动点不足！与队友进行宿舍深夜谈心需要消耗 1 个互动点。");
      return;
    }

    const p = { ...persona };
    p.interactionPoints -= 1;

    const currentTms = getEffectiveTeammates(p, teammates);
    const favBoost = Math.floor(Math.random() * 8) + 8; // +8 to +15 favorability
    const teamFavBoost = Math.floor(Math.random() * 4) + 3; // +3 to +6 team favorability

    const mbtiKey = (tm.mbti || "INFJ").toUpperCase();
    const talkData = MBTI_DORM_TALKS[mbtiKey] || MBTI_DORM_TALKS["INFJ"];

    const newFav = Math.min(100, (tm.favorability || 50) + favBoost);
    const newTeamFav = Math.min(100, (p.teammatesFavorability || 50) + teamFavBoost);
    p.teammatesFavorability = newTeamFav;

    const updatedTeammates = currentTms.map(t => {
      if (t.id === tm.id || t.name === tm.name) {
        return {
          ...t,
          favorability: newFav,
          mbtiUnlocked: true,
          mbtiInsight: talkData.insight
        };
      }
      return t;
    });

    onUpdatePersona(p);
    if (onUpdateTeammates) {
      onUpdateTeammates(updatedTeammates);
    }

    setDormTalkResult({
      teammate: {
        ...tm,
        favorability: newFav,
        mbtiUnlocked: true,
        mbtiInsight: talkData.insight
      },
      monologue: talkData.monologue,
      mbtiInsight: talkData.insight,
      favorabilityBoost: favBoost,
      teamFavorabilityBoost: teamFavBoost
    });

    setIsDormTalkSelectionOpen(false);
    onAddLog(`🌙 【宿舍深夜谈心】你与队友「${tm.name}」在深夜客厅盘腿长谈！${tm.name} 个人好感度 +${favBoost}（达到 ${newFav}/100），团队好感度 +${teamFavBoost}！解锁隐藏 MBTI 侧写：${tm.mbti || 'INFJ'}`);
  };

  // Perform a specific schedule item (Requirement 12)
  const handlePerformSchedule = (schId: string) => {
    const sch = schedules.find((s) => s.id === schId);
    if (!sch || sch.completed) return;

    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    const pointsCost = sch.category === "vocal_lesson" || sch.category === "practice" ? 1 :
                     sch.category === "music_show" || sch.category === "variety_show" || sch.category === "cf_shoot" || sch.category === "concert" || sch.category === "fansign" ? 2 :
                     sch.category === "clinical_dermatology" ? 1 :
                     sch.category === "restrictive_diet" ? 1 :
                     sch.category === "rest_sleep" ? 1 : 1;

    if (currentPoints < pointsCost) {
      onAddLog(`今日互动点不足！此业务需要消耗 ${pointsCost} 互动点，但今天仅剩 ${currentPoints} 点。请在下方进行自选体力恢复、去宿舍睡觉、或点击【次日清点计算】。`);
      return;
    }

    const isRestingAction = sch.category === "rest_sleep" || sch.id.includes("sleep") || sch.title.includes("睡") || sch.title.includes("休息");

    if (persona.energy < sch.energyCost) {
      onAddLog(`【体力匮乏】进行此项活动需要 ${sch.energyCost} 体力，目前仅剩 ${persona.energy}。请选择下方【每日自选修护计划】进行体力充值，或者去宿舍泡冷水冰疗睡觉。`);
      return;
    }

    // Strict stamina restriction
    if (persona.energy <= 10 && !isRestingAction) {
      onAddLog(`【体力枯竭保护】当前体力仅剩 ${persona.energy}⚡（已低于10警戒线）！除选择【每日自选修护计划】或执行【宿舍/保姆车大睡】等恢复行动外，您无法强行执行任何对外大型业务或日常训练。请优先保护爱豆身体！`);
      return;
    }

    // Strict stress restriction
    if (persona.stress >= 95 && !isRestingAction) {
      onAddLog(`【精神高度崩溃】当前心理压力已接近临界极限 ${persona.stress}/100 🤯！除进行【心理诊疗】呼叫 Dr. Kim 进行深度话疗、大健康大餐放松或自选高端SPA护理外，爱豆目前因心理原因无法配合完成训练或日常业务。请优先安抚情绪！`);
      return;
    }

    // Process effects
    const p = { ...persona };
    p.interactionPoints = currentPoints - pointsCost;
    p.energy = Math.max(0, p.energy - sch.energyCost);
    p.popularity = Math.min(100, p.popularity + sch.rewardPopularity);
    p.reputation = Math.min(100, p.reputation + sch.rewardReputation);
    
    // Day progress stats impact
    let weightDrain = 0.05;
    let stressGrowth = 5;

    // Specific category impacts (Requirement 11, 12)
    if (sch.id.startsWith("fixed_vocal") || sch.category === "vocal_lesson") {
      p.vocalSkill = Math.min(100, p.vocalSkill + 3);
      weightDrain = 0.05;
      stressGrowth = 6;
    } else if (sch.id.startsWith("fixed_dance") || (sch.category === "practice" && (sch.title.includes("舞蹈") || sch.title.includes("舞") || sch.title.includes("编舞")))) {
      p.danceSkill = Math.min(100, p.danceSkill + 3);
      weightDrain = 0.2; // heavy dancing drops weight
      stressGrowth = 8;
    } else if (sch.id.startsWith("fixed_rap") || (sch.category === "practice" && (sch.title.includes("说唱") || sch.title.includes("rap") || sch.title.includes("Rap")))) {
      p.rapSkill = Math.min(100, p.rapSkill + 3);
      weightDrain = 0.1;
      stressGrowth = 7;
    } else if (sch.id.startsWith("fixed_variety") || sch.category === "variety_show" || sch.title.includes("艺能") || sch.title.includes("综艺") || sch.title.includes("口才")) {
      p.varietySkill = Math.min(100, p.varietySkill + 3);
      weightDrain = 0.05;
      stressGrowth = 5;
    } else if (sch.category === "restrictive_diet") {
      p.weight = Math.max(38, p.weight - 0.5);
      stressGrowth = 12;
    } else if (sch.category === "clinical_dermatology") {
      p.skinCondition = "perfect";
      stressGrowth = -5;
    } else if (sch.category === "rest_sleep") {
      p.energy = Math.min(100, p.energy + 45);
      p.stress = Math.max(0, p.stress - 20);
      weightDrain = -0.1; // sleeping overnight slightly regains water weight
      stressGrowth = -15;
    } else if (sch.category === "fansign" || sch.category === "music_show") {
      // Fan gains or financial updates (Requirement 4)
      const baseFanGain = Math.floor(Math.random() * 800) + 400;
      const multiplier = p.style === "solo" ? 1.0 : 3.8;
      const fanGain = Math.floor(baseFanGain * multiplier * (p.popularity / 30));
      p.fansCount = p.fansCount + fanGain;
      
      // physical album sales trigger
      if (p.startType === "idol") {
        const addedSales = Math.floor(fanGain * 0.15);
        p.albumSales = p.albumSales + addedSales;
        
        // Income split payout: standard rookie album payout is incredibly minimal (Requirement 4)
        const payoutKRW = Math.floor(addedSales * 0.15); // e.g. 15,000 W per album profit
        p.money = p.money + payoutKRW;
        onAddLog(`打歌/签售营业完毕！吸引了 ${fanGain} 个死忠粉，物理唱片售出 ${addedSales} 张。个人分成取得利息 ₩${payoutKRW}万韩元！`);
      } else {
        // Trainee has ZERO actual payout, directly pays off trainee debts! (Requirement 4)
        const addedDebtCleared = Math.floor(fanGain * 0.3); // clears debt
        p.traineeDebt = Math.max(0, p.traineeDebt - addedDebtCleared);
        onAddLog(`打歌舞台出众！粉丝圈增加 ${fanGain}。根据契约分成，取得的所有利润 ₩${addedDebtCleared}万已自动填补了未结清练习生债负！`);
      }

      // Solo Stage Explosion Mechanism (舞台爆发独白)
      const isStageSchedule = sch.category === "music_show" || sch.category === "fansign" || sch.title.includes("打歌") || sch.title.includes("舞台") || sch.title.includes("LIVE");
      if (p.style === "solo" && isStageSchedule && p.popularity >= 45) {
        const popBonus = Math.floor(Math.random() * 3) + 3;
        const repBonus = Math.floor(Math.random() * 2) + 3;
        const extraFans = Math.floor(Math.random() * 1000) + 1500;
        p.popularity = Math.min(100, p.popularity + popBonus);
        p.reputation = Math.min(100, p.reputation + repBonus);
        p.fansCount += extraFans;

        const monoObj = SOLO_STAGE_MONOLOGUES[Math.floor(Math.random() * SOLO_STAGE_MONOLOGUES.length)];
        setSoloStageBurstModal({
          title: monoObj.title,
          monologue: monoObj.quote,
          insight: monoObj.insight,
          extraFans,
          popBonus,
          repBonus,
          stageName: p.stageName || p.name
        });
        onAddLog(`🔥 【Solo 舞台爆发】个人绝对魅力主宰全场！揭幕独白：${monoObj.title}。人气 +${popBonus}，声望 +${repBonus}，新增死忠粉 +${extraFans}！`);
      }
    }

    p.weight = Math.max(38, p.weight - weightDrain);
    p.stress = Math.min(100, Math.max(0, p.stress + stressGrowth));

    onUpdatePersona(p);
    onAddLog(`【时间管理】「${sch.title}」运行完毕，消耗 ${pointsCost} 互动点。今天剩余可用互动点：${p.interactionPoints} 点。`);

    // Save schedule completion status
    const updatedSchedules = schedules.map((s) => {
      if (s.id === schId) {
        return { ...s, completed: true };
      }
      return s;
    });
    onUpdateSchedules(updatedSchedules);

    // Trigger sudden event with a 45% probability (Requirement 3)
    if (Math.random() < 0.45) {
      setTimeout(() => {
        onTriggerRandomEvent();
      }, 800);
    }
  };

  const handleDailyRecover = (planType: "juice" | "nap" | "spa") => {
    if (persona.hasRecoveredToday) {
      onAddLog("【体能修护】今日已执行过自选恢复！每日仅能修护一次，请等次日起床后再行选择。");
      return;
    }

    const p = { ...persona };
    const currentPoints = typeof p.interactionPoints === 'number' ? p.interactionPoints : 18;

    let cost = 0;
    let energyVal = 0;
    let stressVal = 0;
    let pointsCost = 0;
    let planName = "";

    if (planType === "juice") {
      cost = 1;
      energyVal = 25;
      stressVal = 5;
      pointsCost = 1;
      planName = "江南排毒草本果汁 🍹";
    } else if (planType === "nap") {
      cost = 0;
      energyVal = 40;
      stressVal = 10;
      pointsCost = 1;
      planName = "练习室沙发小憩 💤";
    } else if (planType === "spa") {
      cost = 12;
      energyVal = 70;
      stressVal = 25;
      pointsCost = 2; // Spa used to cost 3 hours, now only 2 interaction points
      planName = "高端香薰理疗SPA 💆";
    }

    if (currentPoints < pointsCost) {
      onAddLog(`【体能修护】互动点不足！执行「${planName}」需要 ${pointsCost} 互动点，但今天仅剩 ${currentPoints} 点。`);
      return;
    }

    if (p.money < cost && p.startType === "idol") {
      onAddLog(`【体能修护】韩元代付不足！购买「${planName}」需要 ₩${cost}万。`);
      return;
    }

    // Apply stats
    p.hasRecoveredToday = true;
    p.interactionPoints = currentPoints - pointsCost;
    if (p.startType === "idol") {
      p.money = Math.max(0, p.money - cost);
    }
    p.energy = Math.min(100, p.energy + energyVal);
    p.stress = Math.max(0, p.stress - stressVal);

    onUpdatePersona(p);
    onAddLog(`【体力瞬时恢复】您安排并享受了「${planName}」！体力值提升 +${energyVal}⚡️，压力减小 -${stressVal}🤯，消耗 ${pointsCost} 个互动点。今日剩余可用互动点：${p.interactionPoints} 点。`);
  };

  // Fully dynamic AI-driven next day transition (Requirement: "所有内容都是根据用户前一天的行为动态生成，会消耗api次数。")
  const handleNextDay = async () => {
    setIsProcessing(true);
    onAddLog(`【API 智能清算】正在合并分析您今日的所有行程决策，向大模型请求次日宏观变迁与行程包...`);

    const completedSchedules = schedules.filter(s => s.completed).map(s => s.title);
    const completedText = completedSchedules.length > 0 ? completedSchedules.join("、") : "一整天偷懒划水，没完成任何既定业务。";

    // 1. Prepare secondary stats calculated client-side as base update
    const pUpdateObj = { ...persona };
    pUpdateObj.dayNumber = pUpdateObj.dayNumber + 1;
    pUpdateObj.interactionPoints = 18;
    pUpdateObj.hasRecoveredToday = false;
    const ageing_factor = Math.floor((pUpdateObj.dayNumber - 1) / (pUpdateObj.cycleDays || 36));
    pUpdateObj.ageing_factor = ageing_factor;
    pUpdateObj.energy = Math.min(100, pUpdateObj.energy + 50); // rest Overnight
    pUpdateObj.stress = Math.max(0, pUpdateObj.stress - 15);
    
    // Automatically generate weekly personal diary summary at the end of every week (every 7 in-game days)
    const weekCompleted = Math.floor((pUpdateObj.dayNumber - 1) / 7);
    if (weekCompleted >= 1) {
      const existingEntries = pUpdateObj.diaryEntries || [];
      if (!existingEntries.some((e) => e.weekNumber === weekCompleted)) {
        const weeklyEntry = generateFallbackWeeklyDiaryEntry(pUpdateObj, weekCompleted);
        pUpdateObj.diaryEntries = [weeklyEntry, ...existingEntries].sort((a, b) => b.weekNumber - a.weekNumber);
        onAddLog(`📖 【星途手记自动存归】第 ${weekCompleted} 周已顺利总结归档！可前往【星途手记】或【系统设置】随时查阅。`);
      }
    }
    
    // Check next day's weather and its impact on skin condition probabilities
    const nextWeather = getSeoulWeather(pUpdateObj.dayNumber);
    let skinDecayChance = pUpdateObj.stress > 65 ? 0.75 : 0.08; // Base chance based on stress
    
    // Adjust decay probability based on weather
    if (nextWeather.type === "dry") {
      skinDecayChance += 0.25; // Drier and dustier environment (+25%)
    } else if (nextWeather.type === "rainy") {
      skinDecayChance += 0.20; // High humidity leading to sebum and clogged pores (+20%)
    } else if (nextWeather.type === "hot") {
      skinDecayChance += 0.15; // Strong UV ray oxidation stress (+15%)
    } else if (nextWeather.type === "cold") {
      skinDecayChance += 0.20; // Cold dry wind harming skin barrier (+20%)
    }

    if (Math.random() < skinDecayChance) {
      if (pUpdateObj.skinCondition === "perfect") {
        pUpdateObj.skinCondition = "glowing";
      } else if (pUpdateObj.skinCondition === "glowing") {
        pUpdateObj.skinCondition = "troubled";
      } else if (pUpdateObj.skinCondition === "troubled") {
        pUpdateObj.skinCondition = Math.random() > 0.5 ? "breakout" : "exhausted";
      } else if (pUpdateObj.skinCondition === "breakout") {
        pUpdateObj.skinCondition = "exhausted";
      }
    } else if (nextWeather.type === "sunny" && pUpdateObj.stress < 40) {
      // Sunny mild climate paired with low stress has a 20% chance to regenerate skin status
      if (Math.random() < 0.20) {
        if (pUpdateObj.skinCondition === "exhausted") {
          pUpdateObj.skinCondition = "breakout";
        } else if (pUpdateObj.skinCondition === "breakout") {
          pUpdateObj.skinCondition = "troubled";
        } else if (pUpdateObj.skinCondition === "troubled") {
          pUpdateObj.skinCondition = "glowing";
        } else if (pUpdateObj.skinCondition === "glowing") {
          pUpdateObj.skinCondition = "perfect";
        }
      }
    }

    // 2. Draft the API request with scientific BMI calculation from tomorrow's metrics
    const heightM = (pUpdateObj.height / 100);
    const calcBmi = (pUpdateObj.weight / (heightM * heightM)).toFixed(1);
    let bmiEvaluation = "";
    const bmiVal = parseFloat(calcBmi);
    const isMale = persona.gender === "male";

    if (isMale) {
      if (bmiVal < 18.5) {
        bmiEvaluation = "极度修长纸片人 (男爱豆181cm/60kg级别，非常纤细清冷、九头身骨相，粉丝疯狂心疼求多吃加餐，绝不可能有任何小腹或赘肉)";
      } else if (bmiVal < 21.5) {
        bmiEvaluation = "黄金男神比例型 (身材绝佳、九头身双腿修长、利落九头身模特体态，完美扛住高清打歌直拍镜头)";
      } else if (bmiVal < 23.5) {
        bmiEvaluation = "健美清爽型 (肌肉紧致、健康阳光，极少数苛刻黑粉可能会刻薄挑剔『脸稍圆了一圈』，但真爱粉集体反击)";
      } else {
        bmiEvaluation = "壮实偏重型 (偏向普通人较厚身材，在严酷镜头下被黑粉挑剔控体)";
      }
    } else {
      if (bmiVal < 17.5) {
        bmiEvaluation = "极度修长纸片人 (女爱豆标准冷脸纸片人，身材极度纤细，粉丝心疼劝多吃，绝不可能有任何小腹或赘肉)";
      } else if (bmiVal < 19.5) {
        bmiEvaluation = "上镜完美女神型 (比例绝佳、神颜冷猫系纸片人，完美呈现打歌舞台造型)";
      } else if (bmiVal < 21.5) {
        bmiEvaluation = "健康匀称型 (状态自然元气，少数挑剔黑粉无理挑刺上镜微圆)";
      } else {
        bmiEvaluation = "丰满偏重型 (超出南韩爱豆冷酷卡尺红线，被黑粉挑剔)";
      }
    }

    const mLabel = persona.gender === "female" ? "严" : "闵";

    const prompt = `玩家昨日完成了以下团队与个人行程：[${completedText}]。
主角设定：
- 专属名字/艺名：${persona.name} / ${persona.stageName}
- 主角性别：${isMale ? "【男爱豆 / 男性歌手】（极其重要：所有叙事与称谓必须100%基于男爱豆视角！如哥哥/欧巴/帅气/男神/西装/名模体态/九头身。绝不可使用裙子/女团/姐妹/欧尼/女装/美妆遮肉等女性词汇！绝对禁止胡乱造谣181cm瘦长身材有『大肚腩/肚子胖/小腹脂肪』等错乱描写！）" : "【女爱豆 / 女性歌手】"}
- 初始成长模式：${persona.startType === "trainee" ? "处于三大厂高压下的练习期债务生" : "刚发布专辑的正式打歌主唱爱豆"}
- 企划模式：${persona.style === "solo" ? "【个人Solo独立歌手】（极其重要：全过程无任何队友，绝不得产生队友相关叙事、队友私聊、宿舍同居或团队争执！）" : `${persona.groupName} (${persona.style})`}
- 当前体能指标（已安享一夜睡眠恢复后的明日真实体力）：体力值: ${pUpdateObj.energy}/100（提示：主角已经通过第二天的恢复机制得到了充足的精力充盈，不要再一味责备TA感到过度劳累 and 很虚弱了！）, 精神压力值: ${pUpdateObj.stress}/100, 身高: ${pUpdateObj.height}cm, 体重: ${pUpdateObj.weight.toFixed(1)}kg, 人体身体BMI值: ${calcBmi}, 胖瘦评估状态: ${bmiEvaluation}, 皮肤状况: ${pUpdateObj.skinCondition}.
- 粉丝圈人气：${pUpdateObj.fansCount} 位死忠, 美誉等级: ${pUpdateObj.reputation}/100.
- 职业资历与衰老成熟指数：ageing_factor: ${pUpdateObj.ageing_factor || 0}（说明：每 ${pUpdateObj.cycleDays || 36} 天为一个合约年。0 = 青涩活泼的新手练习生期；1 = 沉淀磨砺出的成熟过渡阶段；2 = 资深、练达、自持的K-Pop大前辈阶段；3+ = 殿堂级成熟前辈顶峰阶段，能自如控制情绪并宠辱不惊）。

请根据上述的 ageing_factor 资历指标，精准微调 AI 生成的角色对话语气（包括${mLabel}经理人发来的 managerMessage 消息以及主动找主角的 proactiveMessage.text 未读信息）：
- 如果 ageing_factor 为 0：角色言谈表现得非常直率、对新人严格，指导或嘱咐多带有教训和指点口吻。
- 如果 ageing_factor 为 1：由于艺人积累了一年多的行当沉淀，配角说话能微露出对你业务和心理成熟度的认可与尊重，不再一味怒骂。
- 如果 ageing_factor >= 2：语气转向极其稳重、妥帖、饱经世故的资深对话口吻，少了一些毛躁的呵斥敲打，多了一些对待行业资深老手、成熟老艺人的成熟理解，甚至会有更多的商务关切、顶层演艺方向寄语与稳重自持的信任嘱托。

请采用极度逼真的K-Pop黑水粉圈叙事风格，动态生成由于昨日高压或偷懒产生的一系列“宿醉/消肿失败/打歌爆点/黑粉嘲讽/同僚鼓励”的【过夜深度结算叙事】（请围绕上述具体BMI身材类型，让粉丝或黑粉在评论中激烈辩驳起来，使黑粉、唯粉和各路路人粉的激辩极其饱满、尖锐、贴合Kpop现实！）。并全新计算【明日全新的三个量身定制行程】。
还要为当前好感度为 ${pUpdateObj.managerFavorability}/100 的${mLabel}经理人撰写一条新的KakaoTalk未读消息。

此外，请生成一条清晨时分除${mLabel}经理人之外的其他角色（社长 'ceo'（好感值: ${pUpdateObj.ceoFavorability}/100）、竞品大势艺人/对头 'rival'${persona.style === "solo" ? "" : "、或任一练习生队内队友例如组合主舞/主唱等"}）主动找主角发来的私聊消息（几率：75%）。

请严格仅返回以下标准合法的纯 JSON 格式数据（注意：不要将其包裹在 markdown 代码块中，仅返回纯JSON）：
{
  "narrative": "中文。昨晚到今天清晨的粉丝评论/爆料，以及主角的各项健康指数、皮肤细节变迁反馈，限120~180字。${persona.style === "solo" ? "【严格限制：Solo独立歌手，绝不可出现队友/宿舍同居/刀群舞！】" : ""}${isMale ? "【严格限制：男爱豆视角，绝不可使用女性词汇/女装/姐妹！】" : ""}",
  "managerMessage": "根据经纪人当前好感度 (${pUpdateObj.managerFavorability}/100) 撰写：${pUpdateObj.managerFavorability > 80 ? '【好感爆表>80】语气极度温柔宠溺、无微不至关怀、极致偏袒护短，甚至带有一丝私下追捧与恋慕关切' : pUpdateObj.managerFavorability > 60 ? '【好感良好>60】语气温和赞赏，主动关照并积极协调优质资源' : pUpdateObj.managerFavorability >= 35 ? '【好感公事35~60】语气专业严谨、公事公办' : '【好感低迷<35】语气严肃严厉、高压挑剔与批评催促'}。",
  "schedules": [
    {
      "id": "new_sch_a",
      "time": "上午 08:00 - 11:30",
      "title": "全新的自定义标题",
      "category": "practice",
      "rewardPopularity": 2,
      "rewardReputation": 2,
      "energyCost": 15
    },
    {
      "id": "new_sch_b",
      "time": "下午 13:00 - 16:30",
      "title": "符合前文叙事的定制任务标题",
      "category": "vocal_lesson",
      "rewardPopularity": 4,
      "rewardReputation": 1,
      "energyCost": 25
    },
    {
      "id": "new_sch_c",
      "time": "晚上 18:00 - 21:00",
      "title": "符合前文叙事的收尾打歌任务标题",
      "category": "fansign",
      "rewardPopularity": 3,
      "rewardReputation": 3,
      "energyCost": 20
    }
  ],
  "weversePostContent": "一条今天最新的Weverse内热门贴，内容是围绕主角昨天曝光的热搜表现或皮肤、实力展开的粉丝圈激辩。${persona.style === "solo" ? "【严格限制：Solo歌手，只讨论个人】" : ""}",
  "proactiveMessage": {
    "senderId": "选填，可以是 'ceo', 'rival'${persona.style === "solo" ? "（注意：Solo歌手，严禁选队友）" : "，或者组合队内队友的名字"}，若概率不触发则设为 null。${persona.style === "solo" ? "绝不可设为队友ID" : "若是队内队友，设为组合内任一个人的ID或英文拼写"}",
    "senderName": "具体显示的名字（例如 '社长李代表', '大势爱豆敏太' 等）",
    "text": "根据 ageing_factor 调优口吻。主动给主角发来的私聊未读消息（限80字以内，符合人设性格MBTI，如果是ceo好感低则敲打，${persona.style === "solo" ? "rival则假意祝福或者竞争约话" : "队友则关心或者吐槽，rival则假意祝福或者竞争约话"}）"
  }
}`;

    let parsedResult = null;

    try {
      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: "You are a specialized K-Pop entertainment simulator logic engine. Return ONLY the strict JSON block requested.",
          customApiKey: customApiKey,
          model: customModel,
          customApiEndpoint: customApiEndpoint
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error("Unable to parse server API response as JSON.");
      }
      let rawText = data.text || "";

      // Clean Markdown tags
      if (rawText.includes("```json")) {
        rawText = rawText.split("```json")[1].split("```")[0];
      } else if (rawText.includes("```")) {
        rawText = rawText.split("```")[1].split("```")[0];
      }
      
      parsedResult = JSON.parse(rawText.trim());
    } catch (err) {
      console.warn("AI Generation for next day failed, fallback to interactive offline generator", err);
    }

    // High fidelity fallback if API fails or is not set up
    if (!parsedResult) {
      const isFatigued = pUpdateObj.energy < 40;
      const isStressed = pUpdateObj.stress > 65;
      
      let narrative = isMale
        ? `昨夜完成了当天的业务。清晨自律的高强度训练维持着极佳的模特九头身体态，死忠粉在论坛高赞护航『这才是舞台上独一无二的舞台男神』。新的一天伴随着练习室音乐轰鸣拉开了序幕……`
        : `昨夜结束了今天的业务。由于清晨体重微微有起伏，黑粉立刻在论坛带节奏『看来爱豆根本没有容貌和自尊觉醒，上镜水肿成发面馒头了』。死忠唯粉在论坛高能对线，你夜里顶着失眠的风险进行了消肿护理，肌肉有些僵硬。新的一天伴随着练习室空调的轰鸣拉开了血色帷幕……`;
      if (isFatigued) {
        narrative = persona.style === "solo" 
          ? `体力过度透支导致你在保姆车上彻底昏睡沉沦。现场工作人员对你近来的虚弱有些许担忧：『今天的Solo连轴转通告要怎么撑？！』。好在海外死忠粉疯狂灌爆打卡榜，你虚无的名气稍微得到了一些维系。今天${mLabel}经纪人已经在走廊尽头默默为你准备了补品。`
          : `体力过度透支导致你在保姆车上彻底昏睡沉沦。成员们对你近来的虚弱有些许怨言：『队长今天体力又断崖了，编舞连轴转要怎么排？！』。好在海外死忠粉疯狂灌爆打卡榜，你虚无的名气稍微得到了一些维系。今天${mLabel}经纪人已经冷脸站在了走廊尽头。`;
      } else if (isStressed) {
        narrative = `由于昨夜你极度透支的精神压力，回到休息室后，你的下巴附近爆发了几颗红肿的痘痘，韩网站姐的新直拍连夜流传开，粉卷里都在关心你的皮肤红肿状况。代表更是在清晨晨会上敲了敲桌子叹了口气。今天不得不重新规划皮肤科与特训。`;
      }

      let managerMessage = persona.managerFavorability > 80 
        ? `【KakaoTalk - ${mLabel}室长】\n宝贝！昨晚练习辛苦啦。我特意让人给你熬了温补红参汤寄到了后台前台。今天行程虽然多，但不要太勉强自己，有任何压力或委屈随时跟我说，有我在没人能欺负你！`
        : persona.managerFavorability < 35 
        ? `【KakaoTalk - ${mLabel}室长】\n呀！昨晚的演出你那个转身动作是不是慢了半拍？高价买来的编舞概念全被你给糟蹋了！今天的极饿体脂对抗你最好动作快一点，再让我看到上镜有赘肉，年末C位直接让给别人！` 
        : `【KakaoTalk - ${mLabel}室长】\n表现得还算凑合，继续保持。今天的行程依旧满档，我帮你准备的高能消肿水已经寄到清潭洞皮肤科前台里了，做完护理立马回公司声乐室加练！`;

      const factor = pUpdateObj.ageing_factor || 0;
      if (factor === 1) {
        managerMessage = `【KakaoTalk - ${mLabel}室长】\n你已经度过了第一年的新手期，如今举手投足成熟沉稳了许多。今天的业务行程我发你了，放手去做，团队需要你拿出资深爱豆的担当和沉淀气质来，继续保持高标准运营！`;
      } else if (factor >= 2) {
        managerMessage = `【KakaoTalk - ${mLabel}室长】\n作为厂牌的资深元老和大前辈，咱们之间就不用那些客套教训了。刚才和PD、李社长开会重点提了你接下来的长期演艺身价定位，希望今天你也能展现最巅峰和完美练达的舞台风范。`;
      }

      let proactiveMsgObj = null;
      if (factor > 0) {
        const senderText = factor === 1 
          ? "【KakaoTalk - 社长李代表】\n不错，经过这一年的磨练你的行事说话是稳重成熟了不少。未来厂牌 and 新人的风向标还得看你的表现，加油吧。"
          : `【KakaoTalk - 社长李代表】\n刚才听${mLabel}经纪人说你在决策和应答方面大显沉稳练达的大前辈风采。我很欣慰能在这个顶峰期见证你心智的蜕变成熟，厂牌很看好你的高阶表现。`;
        proactiveMsgObj = {
          senderId: "ceo",
          senderName: "厂牌代表李秉旭",
          text: senderText
        };
      }

      parsedResult = {
        narrative: narrative,
        managerMessage: managerMessage,
        proactiveMessage: proactiveMsgObj,
        schedules: [
          {
            id: `sch_g_${Date.now()}_1`,
            time: "清晨 06:15 - 08:30",
            title: "【AI生成】顶级LDM皮秒童颜超声波紧致 🏥",
            category: "clinical_dermatology",
            rewardPopularity: 0,
            rewardReputation: 1,
            energyCost: 10,
            completed: false
          },
          {
            id: `sch_g_${Date.now()}_2`,
            time: "中午 11:30 - 下午 15:00",
            title: "【AI生成】1.5倍速汗水单车体脂称重考核 🚲",
            category: "restrictive_diet",
            rewardPopularity: 1,
            rewardReputation: 1,
            energyCost: 25,
            completed: false
          },
          {
            id: `sch_g_${Date.now()}_3`,
            time: "晚上 18:00 - 21:30",
            title: "【AI生成】主打歌深夜爆款韩江台上班路打歌 💃",
            category: "practice",
            rewardPopularity: 4,
            rewardReputation: 2,
            energyCost: 30,
            completed: false
          }
        ],
        weversePostContent: "［热议帖］大家有没有觉得，宝宝今天的皮肤状态和之前的饭撒对视好像变好了很多？虽然昨晚有些疲惫，但那个拼命营业的劲儿真的太让人怜爱了..."
      };
    }

    // Dynamic replacement of manager name references based on player gender (female -> 严, male -> 闵)
    if (mLabel === "严") {
      if (parsedResult.narrative) {
        parsedResult.narrative = parsedResult.narrative
          .replace(/闵室长/g, "严室长")
          .replace(/闵经理人/g, "严经理人")
          .replace(/闵经理/g, "严经理")
          .replace(/闵经纪人/g, "严经纪人")
          .replace(/闵相勋/g, "严相勋")
          .replace(/闵纪人/g, "严纪人")
          .replace(/闵室/g, "严室");
      }
      if (parsedResult.managerMessage) {
        parsedResult.managerMessage = parsedResult.managerMessage
          .replace(/闵室长/g, "严室长")
          .replace(/闵经理人/g, "严经理人")
          .replace(/闵经理/g, "严经理")
          .replace(/闵经纪人/g, "严经纪人")
          .replace(/闵相勋/g, "严相勋")
          .replace(/闵纪人/g, "严纪人")
          .replace(/闵室/g, "严室");
      }
      if (parsedResult.weversePostContent) {
        parsedResult.weversePostContent = parsedResult.weversePostContent
          .replace(/闵室长/g, "严室长")
          .replace(/闵经理人/g, "严经理人")
          .replace(/闵经理/g, "严经理")
          .replace(/闵经纪人/g, "严经纪人")
          .replace(/闵相勋/g, "严相勋")
          .replace(/闵纪人/g, "严纪人")
          .replace(/闵室/g, "严室");
      }
      if (parsedResult.proactiveMessage && parsedResult.proactiveMessage.text) {
        parsedResult.proactiveMessage.text = parsedResult.proactiveMessage.text
          .replace(/闵室长/g, "严室长")
          .replace(/闵经理人/g, "严经理人")
          .replace(/闵经理/g, "严经理")
          .replace(/闵经纪人/g, "严经纪人")
          .replace(/闵相勋/g, "严相勋")
          .replace(/闵纪人/g, "严纪人")
          .replace(/闵室/g, "严室");
      }
    } else if (mLabel === "闵") {
      if (parsedResult.narrative) {
        parsedResult.narrative = parsedResult.narrative
          .replace(/严室长/g, "闵室长")
          .replace(/严经理人/g, "闵经理人")
          .replace(/严经理/g, "闵经理")
          .replace(/严经纪人/g, "闵经纪人")
          .replace(/严相勋/g, "闵相勋")
          .replace(/严纪人/g, "闵纪人")
          .replace(/严室/g, "闵室");
      }
      if (parsedResult.managerMessage) {
        parsedResult.managerMessage = parsedResult.managerMessage
          .replace(/严室长/g, "闵室长")
          .replace(/严经理人/g, "闵经理人")
          .replace(/严经理/g, "闵经理")
          .replace(/严经纪人/g, "闵经纪人")
          .replace(/严相勋/g, "闵相勋")
          .replace(/严纪人/g, "闵纪人")
          .replace(/严室/g, "闵室");
      }
      if (parsedResult.weversePostContent) {
        parsedResult.weversePostContent = parsedResult.weversePostContent
          .replace(/严室长/g, "闵室长")
          .replace(/严经理人/g, "闵经理人")
          .replace(/严经理/g, "闵经理")
          .replace(/严经纪人/g, "闵经纪人")
          .replace(/严相勋/g, "闵相勋")
          .replace(/严纪人/g, "闵纪人")
          .replace(/严室/g, "闵室");
      }
      if (parsedResult.proactiveMessage && parsedResult.proactiveMessage.text) {
        parsedResult.proactiveMessage.text = parsedResult.proactiveMessage.text
          .replace(/严室长/g, "闵室长")
          .replace(/严经理人/g, "闵经理人")
          .replace(/严经理/g, "闵经理")
          .replace(/严经纪人/g, "闵经纪人")
          .replace(/严相勋/g, "闵相勋")
          .replace(/严纪人/g, "闵纪人")
          .replace(/严室/g, "闵室");
      }
    }

    // Map scheduled results cleanly to app schedules formats
    const generatedSchedules: IdolSchedule[] = parsedResult.schedules.map((s: any, idx: number) => ({
      id: s.id || `gen_sch_idx_${idx}_${Date.now()}`,
      time: s.time || "中午 12:00",
      title: s.title || "全新定制爱豆商务",
      category: s.category || "practice",
      rewardPopularity: Number(s.rewardPopularity) || 2,
      rewardReputation: Number(s.rewardReputation) || 1,
      energyCost: Number(s.energyCost) || 20,
      completed: false
    }));

    // Prepend tomorrow's 4 fixed skill courses
    const fixedSchedules = getFixedSkillSchedules(pUpdateObj.dayNumber, pUpdateObj.cycleDays || 36, pUpdateObj.style === "solo");
    const nextSchedulesList = [...fixedSchedules, ...generatedSchedules];

    setTransitionResult({
      narrative: parsedResult.narrative,
      managerMessage: parsedResult.managerMessage,
      weversePostContent: parsedResult.weversePostContent,
      newSchedules: nextSchedulesList,
      pUpdate: pUpdateObj,
      proactiveMessage: parsedResult.proactiveMessage
    });
  };

  // Confirm tomorrow's transition result & update context (Requirement 13 & 15)
  const handleConfirmNextDay = () => {
    if (!transitionResult) return;

    const { pUpdate, newSchedules, weversePostContent, managerMessage, proactiveMessage } = transitionResult;

    // Create a new simulated Weverse post to append
    let updatedWeverse = [...weversePosts];
    if (weversePostContent) {
      const newPost: WeversePost = {
        id: `wev_post_gen_${Date.now()}`,
        content: `【粉丝全网热烈声讨讨论组】\n${weversePostContent}`,
        image: "",
        likes: Math.floor(Math.random() * 2000) + 1000,
        commentsCount: 2,
        time: "刚刚",
        comments: [
          {
            id: `wev_com_1_${Date.now()}`,
            author: "NetizenKpop_88",
            authorAvatar: "",
            content: "对对对，昨天的舞台简直是不容错过的经典！爱豆本命觉醒！",
            likes: 620,
            time: "刚刚",
            fanType: "OT_fan"
          },
          {
            id: `wev_com_2_${Date.now()}`,
            author: "HaterBlockerX",
            authorAvatar: "",
            content: "行了吧，天天炒作，还是赶快去练习室，音高准度能行吗？",
            likes: 41,
            time: "刚刚",
            fanType: "anti"
          }
        ]
      };
      // Insert at front
      updatedWeverse = [newPost, ...updatedWeverse];
    }

    // Intercept with sasaeng stalker or big fan harassment pop-up if fanbase is large (Requirement 6)
    // Reduce trigger rate from 0.6 to 0.15, and enforce a minimum cooldown of 5 days (User-requested anti-spam fix)
    const daysSinceLastEmergency = pUpdate.dayNumber - (pUpdate.lastEmergencyDay || 0);
    if (pUpdate.fansCount > 15000 && daysSinceLastEmergency >= 5 && Math.random() < 0.15 && !emergencyHarassment) {
      // Record trigger day in persona state to track cooldown
      pUpdate.lastEmergencyDay = pUpdate.dayNumber;
      const scens = [
        {
          type: "sasaeng" as const,
          sender: "🤐 匿名跟踪特务 '1314'",
          message: `“姐姐，你刚才在练习室跳舞穿的灰色卫衣很配你哦...你新宿舍的安全门锁密码是 2038# 对不对？我昨晚深夜悄悄试了一下，门铃响了滴滴一声竟然开了耶... 放心，我只在床底板后面贴了一支小小的微型无线录音笔，绝对没有乱动你的别的贴身衣物噢~”`,
          options: [
            {
              text: "👿【自费 ₩500w 连夜换锁扫频及强化安保】",
              moneyCost: 500,
              stressChange: -15,
              fansChange: 0,
              story: "你连夜花费账下五百万高薪雇人扫频，清扫出两枚微型窃听器并且更换了高难密码锁，重获安全感。"
            },
            {
              text: "📜【通过官咖发布法务警告阻隔声明】",
              stressChange: 15,
              fansChange: -2000,
              story: "你发布措施严厉的警告公告。私生饭气急败坏之下公开了你上周熬夜吃快餐的外卖私单，黑粉疯狂嘲讽你身材管理差，有些散粉脱粉。"
            },
            {
              text: "🤐【强忍发抖拉黑账号，不作任何理会】",
              stressChange: 35,
              fansChange: -4500,
              story: "你强装镇定置之不理。但一连数天你晚上睡觉都能隐约听到窗外闪光灯的咔嚓快门声，心力彻底严重透支崩盘。"
            }
          ]
        },
        {
          type: "big_fan" as const,
          sender: "🍒 联合集资核心站姐 'Min-姜恩熙'",
          message: `“SUA，我们全网首战联合组这轮给你集资了500w韩元买了大屏神级宣传，可昨晚你的 W-Live 生日联合直播中，在念礼物名单时居然漏过了我们站子的自作曲的名字，还对旁边别家练习生眨眼！我们给一个不敬畏毒唯神坛的人砸大钱做数据是傻子吗？请在两个小时内上Weverse服软解释，否则今晚首站永久关站黑屏，并公开未经任何修图的面部浮肿原图！”`,
          options: [
            {
              text: "🥺【立刻向该大粉道歉服软，并发去精挑细选的感谢自拍】",
              stressChange: 12,
              fansChange: 2000,
              story: "你无奈之下私下回复诚恳安抚。大粉十分受用，表示‘美颜看哭了，站子继续集资控评为你撑腰！’"
            },
            {
              text: "💼【转交经纪事务室作专业冷处理、拉黑法务威慑】",
              debtIncrease: 300,
              stressChange: -5,
              fansChange: -1500,
              story: "公司下场将该站姐拉黑退款，大粉愤怒关站退圈。但也导致了一批唯粉指控公司冷血，你账下记入公摊应付公关债 300w。"
            },
            {
              text: "😡【毫不容忍，连夜发表长文Weverse痛斥过界行为】",
              stressChange: -20,
              fansChange: -8500,
              story: "你写下‘粉丝和爱豆要保持理智界限’。大粉出离愤怒，公开发布了积攒了半年的下车崩眼丑照，韩网彻底吵上天，粉丝流失惨烈。"
            }
          ]
        },
        {
          type: "sasaeng" as const,
          sender: "📸 高倍长焦跟踪狂 'K-金勋'",
          message: `“宝贝，刚刚看着保姆车载着你进地下室，你下车上扶梯时左脚踩高跟滑了一下，我看得心疼死了。今晚你要在十二点睡觉吧？靠南的窗子记得合实别拉帘，我租了对面酒店的高位天文望远长焦镜正对着你的枕头呢，我想知道你平时抱着什么入睡... 或者你等下在社交平台上发个向右上角看的心形小气泡对个暗号好吗？”`,
          options: [
            {
              text: "📦【代表介入公关：由公司秘密全额 ₩1200w 买断其底片胶卷】",
              debtIncrease: 1200,
              stressChange: -20,
              fansChange: 1500,
              story: "李社长雇中介将对方强力约谈，并付钱买断了所有数位底图。你躲过一劫，但这 ₩1200w 被记在你的未结欠账里。"
            },
            {
              text: "🚨【联手公司安保下套捕捉，连夜报警纠治送办】",
              debtIncrease: 400,
              stressChange: 10,
              fansChange: -3000,
              story: "经过缜密报案警方拘留了该名狂热骚扰偷窥犯。私域清白和安全感挽回。但由于惊动警署上了推特热门，组合风评承压有些老粉叹息退游。"
            },
            {
              text: "🏡【心乱如麻，自费换租高门禁公馆宿舍】",
              moneyCost: 450,
              stressChange: 22,
              fansChange: 0,
              story: "你自掏腰包四百五十万转到严密宿舍，身心高度透支！每当拉窗子时还是禁不住心理毛骨悚然，心悸连连。"
            }
          ]
        }
      ];
      const selectedScen = scens[Math.floor(Math.random() * scens.length)];
      setEmergencyHarassment({
        type: selectedScen.type,
        sender: selectedScen.sender,
        message: selectedScen.message,
        options: selectedScen.options
      });
      return;
    }

    onNextDayTransition(pUpdate, newSchedules, updatedWeverse, managerMessage, proactiveMessage);
    
    setTransitionResult(null);
    setIsProcessing(false);
    onAddLog(`【次日清点结算绿灯】开启您全新生涯的第 ${pUpdate.dayNumber} 天。一早醒发，您昨天一整天的辛酸经营重新赢得了粉丝和制作团队的新点评！`);
  };

  const handleResolveHarassment = (option: {
    text: string;
    moneyCost?: number;
    debtIncrease?: number;
    stressChange: number;
    fansChange: number;
    story: string;
  }) => {
    if (!transitionResult) return;
    const { pUpdate, newSchedules, weversePostContent, managerMessage, proactiveMessage } = transitionResult;

    const finalUpdate = { ...pUpdate };
    if (option.moneyCost) {
      finalUpdate.money = Math.max(0, finalUpdate.money - option.moneyCost);
    }
    if (option.debtIncrease) {
      finalUpdate.traineeDebt = (finalUpdate.traineeDebt || 0) + option.debtIncrease;
    }
    if (option.stressChange) {
      finalUpdate.stress = Math.max(0, Math.min(100, finalUpdate.stress + option.stressChange));
    }
    if (option.fansChange) {
      finalUpdate.fansCount = Math.max(0, finalUpdate.fansCount + option.fansChange);
    }

    let updatedWeverse = [...weversePosts];
    if (weversePostContent) {
      const newPost: WeversePost = {
        id: `wev_post_gen_${Date.now()}`,
        content: `【粉丝全网热烈声讨讨论组】\n${weversePostContent}`,
        image: "",
        likes: Math.floor(Math.random() * 2000) + 1000,
        commentsCount: 2,
        time: "刚刚",
        comments: [
          {
            id: `wev_com_1_${Date.now()}`,
            author: "NetizenKpop_88",
            authorAvatar: "",
            content: "对对对，昨天的舞台简直是不容错过的经典！爱豆本命觉醒！",
            likes: 620,
            time: "刚刚",
            fanType: "OT_fan"
          },
          {
            id: `wev_com_2_${Date.now()}`,
            author: "HaterBlockerX",
            authorAvatar: "",
            content: "行了吧，天天炒作，还是赶快去练习室，音高准度能行吗？",
            likes: 41,
            time: "刚刚",
            fanType: "anti"
          }
        ]
      };
      updatedWeverse = [newPost, ...updatedWeverse];
    }

    onNextDayTransition(finalUpdate, newSchedules, updatedWeverse, managerMessage, proactiveMessage);
    setEmergencyHarassment(null);
    setTransitionResult(null);
    setIsProcessing(false);
    onAddLog(`【危机公关抉择】${option.story}`);
    onAddLog(`【次日清点结算绿灯】开启您全新生涯的第 ${finalUpdate.dayNumber} 天。`);
  };

  return (
    <div id="schedules-app" className="primary-app-container rounded-2xl bg-[#11131c] border border-slate-800 text-white p-4 flex flex-col justify-between relative">
      
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin pr-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">EPISODE CALENDAR</span>
              <h4 className="text-xs font-bold text-slate-100">今日个人及团队业务行程</h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0 sm:justify-end">
            {/* Stamina Badge */}
            <div className="bg-amber-950/45 border border-amber-500/25 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] text-amber-300 font-mono flex items-center gap-1 shadow-sm animate-fade-in">
              <span className="animate-pulse">⚡️</span>
              <span>体力: <strong>{persona.energy}</strong>/100</span>
            </div>

            {/* Stress Badge */}
            <div className="bg-rose-950/45 border border-rose-500/25 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] text-rose-300 font-mono flex items-center gap-1 shadow-sm animate-fade-in">
              <span>🤯</span>
              <span>压力: <strong>{persona.stress}</strong>/100</span>
            </div>

            {/* Active Points Badge */}
            <div className={`border rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-mono flex items-center gap-1 shadow-sm transition-all ${
              (persona.interactionPoints ?? 18) <= 4 
                ? 'bg-red-950/50 border-red-500/45 text-red-300 animate-pulse' 
                : 'bg-emerald-950/45 border-emerald-500/25 text-emerald-300'
            }`}>
              <span>🕒</span>
              <span>今天剩余: <strong>{typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18}</strong>/18 互动点</span>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] text-purple-300 font-mono flex items-center gap-1.5 shadow-sm">
              <span className="font-sans font-bold text-indigo-300 mr-1 hidden xs:inline">📅 {getCalendarPeriod(persona.dayNumber, persona.cycleDays || 36).text}</span>
              <span><strong>{persona.dayNumber}</strong>/{persona.cycleDays || 36}天</span>
            </div>
          </div>
        </div>

        {/* Trainee Debt Widget (Requirement 4) */}
        {persona.startType === "trainee" && (
          <div className="bg-red-950/15 border border-red-500/20 rounded-xl p-3 mb-3.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-red-400 uppercase font-mono block">未结算债务余额 (Leftover Trainee Debt)</span>
              <span className="text-sm font-bold text-red-300 font-mono mt-0.5 block flex items-center gap-1">
                <FileX className="w-4 h-4" /> ₩ {persona.traineeDebt.toLocaleString()} 万韩币
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-slate-400 block">收益抵扣分成</span>
              <span className="text-[10px] bg-red-900/30 text-rose-300 px-2 py-0.5 rounded font-mono font-bold block mt-0.5">100% 自动还贷扣除中</span>
            </div>
          </div>
        )}

        {/* Daily selectable energy recovery program (NEW V3.3) */}
        <div className="bg-slate-950/60 border border-purple-500/15 rounded-xl p-3 mb-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-transparent bg-gradient-to-r from-purple-400 to-[#e9b872] bg-clip-text flex items-center gap-1.5">
              <span>🌸 每日自选修护计划 (Action Refills)</span>
              {persona.hasRecoveredToday && (
                <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 px-1 rounded font-mono font-medium animate-pulse">
                  今日已修护
                </span>
              )}
            </h4>
            <span className="text-[9px] text-slate-450">每日限选 1 种进行时能恢复</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Plan A (Green juice) */}
            <button
              onClick={() => handleDailyRecover("juice")}
              disabled={persona.hasRecoveredToday}
              className={`p-2 rounded-lg border outline-none text-left transition-all ${
                persona.hasRecoveredToday 
                  ? 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed' 
                  : 'bg-[#152e25]/35 border-teal-500/20 hover:border-teal-500/55 active:scale-95 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-teal-300">
                <span>排毒果汁 🍹</span>
                <span className="text-[9px] text-slate-500 font-mono">1小时</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">体力 +25，压力 -5</p>
              <span className="text-[9px] text-teal-400 font-mono font-black mt-1 block">
                {persona.startType === "trainee" ? "免费 (厂牌专属)" : "₩ 1万"}
              </span>
            </button>

            {/* Plan B (Power Nap) */}
            <button
              onClick={() => handleDailyRecover("nap")}
              disabled={persona.hasRecoveredToday}
              className={`p-2 rounded-lg border outline-none text-left transition-all ${
                persona.hasRecoveredToday 
                  ? 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed' 
                  : 'bg-[#1a2d3d]/35 border-sky-500/20 hover:border-sky-500/55 active:scale-95 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-sky-300">
                <span>沙发小憩 💤</span>
                <span className="text-[9px] text-slate-500 font-mono">2小时</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">体力 +40，压力 -10</p>
              <span className="text-[9px] text-sky-400 font-mono font-black mt-1 block">
                免费 ₩0
              </span>
            </button>

            {/* Plan C (Aroma Spa) */}
            <button
              onClick={() => handleDailyRecover("spa")}
              disabled={persona.hasRecoveredToday}
              className={`p-2 rounded-lg border outline-none text-left transition-all ${
                persona.hasRecoveredToday 
                  ? 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed' 
                  : 'bg-[#2b1732]/35 border-purple-500/20 hover:border-purple-500/55 active:scale-95 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                <span>高端SPA 💆</span>
                <span className="text-[9px] text-slate-500 font-mono">3小时</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">体力 +70，压力 -25</p>
              <span className="text-[9px] text-purple-400 font-mono font-black mt-1 block">
                {persona.startType === "trainee" ? "免费 (宿舍报账)" : "₩ 12万"}
              </span>
            </button>
          </div>
        </div>

        {/* Dorm Late-Night Heart-to-Heart Section (Team Mode Only) */}
        {persona.style !== "solo" && (
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/60 border border-purple-500/25 rounded-xl p-3 mb-3.5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Moon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🌙 宿舍深夜谈心 (Dorm Heart-to-Heart)</span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-mono font-medium border border-purple-400/30">
                      团队模式专属
                    </span>
                  </h4>
                  <p className="text-[10px] text-purple-200/70 mt-0.5">
                    消耗 1 互动点，与指定队友盘腿长谈，提升好感度与团魂，解锁隐藏 MBTI 人格侧写
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-purple-300/80 font-mono block">
                  剩余互动点: <strong className="text-amber-300 text-xs">{persona.interactionPoints ?? 18}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDormTalkSelectionOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30"
            >
              <Coffee className="w-4 h-4 text-amber-300" />
              <span>选择队友展开深夜谈心 💬</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        )}

        {/* Schedules list */}
        <div className="space-y-1.5 pr-1 mt-3.5">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${sch.completed ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-slate-950/80 border-white/5 hover:border-purple-500/20'}`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${sch.completed ? 'bg-slate-800 text-slate-500' : 'bg-purple-900/30 text-purple-300 border border-purple-500/10'}`}>
                    {sch.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{sch.time}</span>
                </div>
                <p className={`text-xs font-semibold mt-1 truncate ${sch.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                  {sch.title}
                </p>
                <div className="flex gap-2 items-center text-[9px] text-slate-450 mt-1 font-mono flex-wrap">
                  <span className="text-teal-400">魅力: +{sch.rewardPopularity}</span>
                  <span className="text-indigo-400">名气: +{sch.rewardReputation}</span>
                  <span className="text-amber-500">消耗: {sch.energyCost}⚡️</span>
                  <span className="text-emerald-400 font-bold bg-emerald-900/20 border border-emerald-500/10 px-1 rounded">🎯 {sch.category === "vocal_lesson" || sch.category === "practice" || sch.category === "clinical_dermatology" || sch.category === "restrictive_diet" || sch.category === "rest_sleep" ? 1 : 2} 互动点</span>
                </div>
              </div>

              <button
                onClick={() => handlePerformSchedule(sch.id)}
                disabled={sch.completed}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5 shrink-0 ${sch.completed ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95 shadow-sm'}`}
              >
                {sch.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <>
                    <span>进行行程</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer next day progress button */}
      <div className="border-t border-white/5 pt-3 mt-4">
        <button
          onClick={handleNextDay}
          disabled={isProcessing}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? "正在调用 AI 进行次日演艺业务与关系清点..." : "结束今日，睡醒进入明天行程结算"}
        </button>
      </div>

      {/* Transition Summary Overlay Modal (Premium Visual Craft) */}
      {transitionResult && (
        <div id="transition-result-modal" className="absolute inset-0 bg-[#07090f]/95 backdrop-blur-md z-50 p-4 md:p-6 overflow-y-auto flex flex-col justify-between border border-purple-500/20 rounded-2xl animate-fade-in text-slate-100">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                AI 次日清晨复盘结算 - 太阳已经升起
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                DAY {persona.dayNumber} → DAY {transitionResult.pUpdate.dayNumber}
              </span>
            </div>

            {/* Physiological & Fan feedback narrative */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs leading-relaxed animate-in fade-in duration-350">
              <h5 className="font-bold text-purple-300 mb-1.5 flex items-center gap-1">📊 夜间健康与韩网社交热议汇报</h5>
              <p className="text-slate-200">{transitionResult.narrative}</p>
            </div>

            {/* Multi-member Team Business Sheet (Requirement: display stats for all members in we-opened mode) */}
            {personas && personas.length > 1 && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-xs space-y-3 animate-in slide-in-from-bottom duration-300">
                <h5 className="font-bold text-indigo-300 flex items-center gap-1.5 leading-none">
                  👥 【{personas[0].groupName || "ECLIPSE"}】 联袂多开组合 - 全员次日清晨复盘综合账单
                </h5>
                
                {/* Total Team Overview */}
                <div className="grid grid-cols-3 gap-2 bg-indigo-950/15 p-2 rounded-lg border border-indigo-500/10 text-center">
                  <div>
                    <span className="text-[8px] text-slate-500 block mb-0.5">组合总死忠粉丝量</span>
                    <span className="text-xs font-black text-indigo-200">
                      {(personas.reduce((sum, p) => sum + (p.fansCount || 0), 0) + (persona === personas[0] ? 0 : 0)).toLocaleString()} 币
                    </span>
                  </div>
                  <div className="border-x border-white/5">
                    <span className="text-[8px] text-slate-500 block mb-0.5">团队公摊总负债余额</span>
                    <span className="text-xs font-black text-rose-400">
                      ₩{personas.reduce((sum, p) => sum + (p.traineeDebt || 0), 0).toLocaleString()}万
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 block mb-0.5">组合公摊盈余款</span>
                    <span className="text-xs font-black text-yellow-400">
                      ₩{personas.reduce((sum, p) => sum + (p.money || 0), 0).toLocaleString()}万
                    </span>
                  </div>
                </div>

                {/* Individual list cards */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {personas.map((p, idx) => {
                    const isCurrent = p.stageName === persona.stageName;
                    // Overnight values corresponding to what happens during Day recovery transition
                    return (
                      <div key={idx} className={`p-2 rounded-lg border text-[11px] ${isCurrent ? 'bg-indigo-950/20 border-indigo-500/35' : 'bg-slate-900 border-white/5'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-200">
                            👤 {p.name} ({p.stageName})
                            {isCurrent && (
                              <span className="ml-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[7px] px-1 rounded font-black font-sans">操控主角</span>
                            )}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-indigo-400">{p.roleInGroup || "元气团员"}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9px] leading-tight pt-1 border-t border-white/5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">能量恢复:</span>
                            <span className="text-emerald-400 font-bold font-mono">+{isCurrent ? 50 : 50}⚡️</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">精神压力:</span>
                            <span className="text-emerald-400 font-bold font-mono">-15📉</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">信件存箱:</span>
                            <span className="text-blue-400 font-bold">1/旬</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">未结债务:</span>
                            <span className="text-rose-400 font-black font-mono">₩{p.traineeDebt ?? 0}万</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* KakaoTalk received alert */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-[#edd8c4]/10 text-xs">
              <h5 className="font-bold text-[#fef01b] mb-1.5 flex items-center gap-1.5 font-mono">
                <MessageSquare className="w-3.5 h-3.5" /> KAKAOTALK 未读呼叫提醒
              </h5>
              <div className="bg-white/5 p-2 rounded text-slate-300 italic">
                {transitionResult.managerMessage}
              </div>
            </div>

            {/* Simulated schedule pack teaser */}
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">🌟 重新计算生成的明日三大演艺行程</h5>
              {transitionResult.newSchedules.map((ns, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded-lg text-[10px]">
                  <div>
                    <span className="text-purple-300 font-semibold">[{ns.category.toUpperCase()}]</span>
                    <span className="ml-2 text-slate-200">{ns.title}</span>
                  </div>
                  <span className="text-emerald-400 font-mono">消耗: -{ns.energyCost}⚡️</span>
                </div>
              ))}
            </div>

          </div>

          <div className="border-t border-white/5 pt-3 mt-4">
            <button
              onClick={handleConfirmNextDay}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-750 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              开启第 {transitionResult.pUpdate.dayNumber} 天全新征程并确认
            </button>
          </div>

        </div>
      )}

      {/* Emergency Fan Harassment / Stalker Alarm Modal (Requirement 6) */}
      {emergencyHarassment && (
        <div id="emergency-harassment-modal" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[310] p-4 select-none">
          <div className="bg-[#100c14] border-2 border-red-500/50 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_60px_rgba(239,68,68,0.4)] relative overflow-y-auto max-h-[88vh] animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-red-500/25 pb-4 mb-5">
              <div className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl animate-pulse">
                <AlertCircle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase font-mono tracking-widest text-red-500">
                  ⚠️ WARNING: EMERGENCY SOCIAL DANGER
                </span>
                <h3 className="text-sm font-black text-slate-100">
                  {emergencyHarassment.type === "sasaeng" ? "🚨 极度隐私侵犯：私生偏轨偷窥突袭" : "💬 唯粉圈崩紧：氪金大粉头公开决裂警告"}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-red-500/20 rounded-2xl p-4 mb-5">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                <span className="text-[10px] bg-red-950/50 border border-red-500/25 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                  {emergencyHarassment.type === "sasaeng" ? "【违规私生跟踪犯】" : "【百万元氪金毒粉站姐】"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">发信通道: {emergencyHarassment.sender}</span>
              </div>
              <p className="text-xs text-red-200 leading-relaxed font-sans italic p-3 bg-black/50 rounded-xl border border-white/5">
                {emergencyHarassment.message}
              </p>
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                💡 请主宰今晨的公关对策选择：
              </span>
              
              {emergencyHarassment.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleResolveHarassment(opt)}
                  className="w-full p-3.5 rounded-2xl border border-white/5 bg-slate-950/60 text-left text-xs text-slate-200 hover:bg-red-950/20 hover:border-red-500/35 transition-all cursor-pointer active:scale-98"
                >
                  <p className="font-bold text-slate-100 mb-1">{opt.text}</p>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {opt.moneyCost && `📉 扣减个人现金 ₩${opt.moneyCost}万。`}
                    {opt.debtIncrease && `📈 连带追加公摊债务 ₩${opt.debtIncrease}万。`}
                    {opt.stressChange !== 0 && `⚡ 压力变动 ${opt.stressChange > 0 ? '+' : ''}${opt.stressChange}%。`}
                    {opt.fansChange !== 0 && `👥 核心死忠唯粉 ${opt.fansChange > 0 ? '+' : ''}${opt.fansChange}人。`}
                  </p>
                </button>
              ))}
            </div>
            
          </div>
        </div>
      )}

      {/* Solo Stage Burst Monologue Modal */}
      {soloStageBurstModal && (
        <div id="solo-stage-burst-modal" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[320] p-4 select-none animate-fade-in">
          <div className="bg-[#0f0b18] border-2 border-purple-500/50 rounded-3xl max-w-lg w-full p-6 shadow-[0_0_80px_rgba(168,85,247,0.35)] relative overflow-hidden text-slate-100">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-purple-500/30 pb-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500/30 to-amber-500/30 text-amber-300 p-3 rounded-2xl border border-amber-400/30 shadow-lg animate-pulse">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase font-mono tracking-widest text-amber-400 flex items-center gap-1">
                  🎤 SOLO STAGE EXPLOSION · 个人舞台爆发
                </span>
                <h3 className="text-base font-black text-white tracking-wide">
                  {soloStageBurstModal.title}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4.5 mb-5 relative">
              <div className="text-3xl text-purple-400/40 font-serif leading-none absolute top-2 left-3 select-none">“</div>
              <p className="text-xs text-purple-100 leading-relaxed font-sans font-medium italic pl-5 pr-2 pt-1 mb-3">
                {soloStageBurstModal.monologue}
              </p>
              <div className="text-right text-[10px] font-bold text-amber-300/90 font-mono pr-2">
                —— 独唱歌手舞台内侧独白 · {soloStageBurstModal.stageName}
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-slate-300 leading-normal flex items-start gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{soloStageBurstModal.insight}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-purple-950/60 border border-purple-500/30 rounded-xl p-2 text-center">
                <span className="text-[9px] text-purple-300/80 block font-bold">人气飙升</span>
                <span className="text-sm font-black text-purple-300 font-mono">+{soloStageBurstModal.popBonus}</span>
              </div>
              <div className="bg-amber-950/60 border border-amber-500/30 rounded-xl p-2 text-center">
                <span className="text-[9px] text-amber-300/80 block font-bold">声望突破</span>
                <span className="text-sm font-black text-amber-300 font-mono">+{soloStageBurstModal.repBonus}</span>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2 text-center">
                <span className="text-[9px] text-indigo-300/80 block font-bold">新增死忠粉</span>
                <span className="text-sm font-black text-indigo-300 font-mono">+{soloStageBurstModal.extraFans}</span>
              </div>
            </div>

            <button
              onClick={() => setSoloStageBurstModal(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              收下狂热掌声，继续独霸舞台
            </button>
          </div>
        </div>
      )}

      {/* Dorm Talk Teammate Selection Modal */}
      {isDormTalkSelectionOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[310] p-4 animate-fade-in select-none">
          <div className="bg-[#0f0b1e] border-2 border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-[0_0_60px_rgba(168,85,247,0.25)] relative overflow-hidden text-slate-100">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
                  <Moon className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>🌙 宿舍深夜谈心 · 选择队友</span>
                  </h3>
                  <p className="text-[10px] text-purple-300/70 mt-0.5">
                    消耗 1 互动点 | 剩余: <strong className="text-amber-300">{persona.interactionPoints ?? 18}</strong> 点
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDormTalkSelectionOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800/60"
              >
                ✕ 关闭
              </button>
            </div>

            <p className="text-xs text-purple-200/90 mb-4 leading-relaxed bg-purple-950/40 border border-purple-500/20 p-3 rounded-xl">
              🌙 夜深人静的宿舍客厅，暖黄的落地灯微微摇曳。选择一位队友倾听彼此内心深处的脆弱与执念，不仅能提升羁绊好感，还能解锁隐藏的 MBTI 性格侧写。
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-5">
              {getEffectiveTeammates(persona, teammates).map((tm) => (
                <div
                  key={tm.id || tm.name}
                  onClick={() => handleExecuteDormTalk(tm)}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-400/60 hover:bg-purple-950/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tm.avatar}
                      alt={tm.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-purple-500/30 group-hover:border-amber-400 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {tm.name} ({tm.stageName})
                        </span>
                        <span className="text-[9px] bg-purple-900/40 text-purple-300 px-1.5 py-0.2 rounded font-mono border border-purple-500/30">
                          {tm.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">
                          好感度: <strong className="text-pink-300">{tm.favorability || 50}/100</strong>
                        </span>
                        {tm.mbtiUnlocked ? (
                          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-mono">
                            <Unlock className="w-2.5 h-2.5" /> {tm.mbti} 已解锁
                          </span>
                        ) : (
                          <span className="text-[9px] text-purple-400/70 flex items-center gap-0.5 font-mono">
                            <Lock className="w-2.5 h-2.5" /> 隐藏 MBTI 未解锁
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow transition-all shrink-0">
                    深夜谈心 💬
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-[10px] text-slate-400 font-mono">
              💡 谈心后将自动更新团魂好感与队友个人关系链
            </div>
          </div>
        </div>
      )}

      {/* Dorm Talk Result Modal */}
      {dormTalkResult && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[320] p-4 select-none animate-fade-in">
          <div className="bg-[#0b0818] border-2 border-purple-500/50 rounded-3xl max-w-md w-full p-6 shadow-[0_0_80px_rgba(168,85,247,0.35)] relative overflow-hidden text-slate-100">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-purple-500/30 pb-4 mb-4">
              <img
                src={dormTalkResult.teammate.avatar}
                alt={dormTalkResult.teammate.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/80 shadow-lg"
              />
              <div>
                <span className="text-[10px] font-black uppercase font-mono tracking-widest text-amber-400 flex items-center gap-1">
                  🌙 DORM HEART-TO-HEART · 深夜长谈
                </span>
                <h3 className="text-sm font-black text-white tracking-wide">
                  与 {dormTalkResult.teammate.name} 的深夜敞开心扉
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 mb-4 relative shadow-inner">
              <div className="text-3xl text-purple-400/30 font-serif leading-none absolute top-2 left-3 select-none">“</div>
              <p className="text-xs text-purple-100 leading-relaxed font-sans italic pl-5 pr-2 pt-1 mb-2">
                {dormTalkResult.monologue}
              </p>
              <div className="text-right text-[10px] font-bold text-amber-300/90 font-mono pr-1">
                —— 宿舍客厅夜谈 · {dormTalkResult.teammate.name} ({dormTalkResult.teammate.role})
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-400/40 rounded-2xl p-3.5 mb-5 shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>【隐藏 MBTI 性格侧写已解锁】: <strong className="text-white font-mono text-sm">{dormTalkResult.teammate.mbti}</strong></span>
              </div>
              <p className="text-[11px] text-purple-100/90 leading-normal pl-1 font-sans">
                {dormTalkResult.mbtiInsight}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="bg-purple-950/60 border border-purple-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[9px] text-purple-300/80 block font-bold">个人好感提升</span>
                <span className="text-sm font-black text-pink-300 font-mono">
                  +{dormTalkResult.favorabilityBoost} <span className="text-[10px] text-slate-400">({dormTalkResult.teammate.favorability}/100)</span>
                </span>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2.5 text-center">
                <span className="text-[9px] text-indigo-300/80 block font-bold">团队凝聚力提升</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  +{dormTalkResult.teamFavorabilityBoost} <span className="text-[10px] text-slate-400">({persona.teammatesFavorability}/100)</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setDormTalkResult(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Moon className="w-4 h-4 text-amber-300" />
              记在心里，互道晚安 🌙
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
