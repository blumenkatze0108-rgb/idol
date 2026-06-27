import { useState } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { TrendingUp, User, ShieldAlert, Heart, Calendar, Activity, Zap, Coins, Sliders, Play, Brain, Sparkles, Smile, MessageSquare } from "lucide-react";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from "recharts";
import { safeFetch } from "./apiHelper";

interface FandomAnalyticsProps {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdatePersona: (p: IdolPersona) => void;
  onAddLog: (log: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#111827] border border-slate-700 p-2.5 rounded-xl shadow-lg text-xs text-white">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fill }} />
          {data.name}
        </p>
        <p className="text-slate-400 mt-1 font-mono">占比: <span className="text-emerald-400 font-bold">{data.value}%</span></p>
      </div>
    );
  }
  return null;
};

const FOOD_ITEMS = [
  {
    id: "chicken",
    name: "宿舍深夜炸鸡宵夜",
    emoji: "🍗",
    cost: 3,
    weightGain: 0.5,
    energyRecover: 30,
    stressRelief: 15,
    desc: "深夜偷偷点的一份韩式香脆炸鸡外卖。酥脆爆汁，香气溢出整个被窝！",
    chews: 4,
    spicy: false,
    funNotes: [
      "打开饭盒，金黄酥脆的炸鸡香气直冲脑门！",
      "咔嚓！偷偷咬了一口，外皮丝丝酥脆，肉汁在舌尖爆开！",
      "咕嘟咕嘟灌了一口冰汽水，整个人爽飞到外太空！",
      "吸吮指尖最后一点香甜酱汁，这一刻罪恶与极致的幸福共存！"
    ]
  },
  {
    id: "hanwoo",
    name: "炭火顶级韩牛大餐",
    emoji: "🥩",
    cost: 15,
    weightGain: 0.3,
    energyRecover: 55,
    stressRelief: 25,
    desc: "特级炭火烤韩牛，优质纯蛋白能修补疲惫毛孔，大幅提亮肤质！",
    chews: 5,
    spicy: false,
    skinImprove: true,
    funNotes: [
      "大理石纹雪花牛肉在炽热的炭火上滋滋冒油，香味铺鼻！",
      "入口即化！浓浓的油脂香和质感简直在给灵魂做按摩！",
      "裹上一层咸香芝麻盐，这一口的鲜甜让舌头激动得要起舞！",
      "充沛氨基酸注入体内，感觉熬夜带来的泛黄干瘪正在消退！",
      "喝上一大口暖胃牛肉清汤，温厚而又结实的元气瞬间满血复活！"
    ]
  },
  {
    id: "gainer",
    name: "高卡碳水燕麦奶昔",
    emoji: "🥤",
    cost: 6,
    weightGain: 0.8,
    energyRecover: 22,
    stressRelief: 5,
    desc: "纯粹、科学的无盐卡路里干涉代餐。健康高效率增重，完全不带来皮肤或水肿负担。",
    chews: 3,
    spicy: false,
    funNotes: [
      "吨吨吨！一大口稠密、微温的浓密纯麦流食缓缓灌下去...",
      "没啥花哨的味道，但热量和温饱安全感在实打实注入胃袋！",
      "咽下最后一口。绝对健康的卡路里，给虚胖绝缘，安全稳定长肉。"
    ]
  },
  {
    id: "tteokbokki",
    name: "辛辣年糕雪冰大满足",
    emoji: "🍧",
    cost: 4.5,
    weightGain: 0.6,
    energyRecover: 40,
    stressRelief: 22,
    desc: "重辣芝士年糕拼香甜双倍芒果雪冰！极致冰火淬炼，狂飙多巴胺！",
    chews: 4,
    spicy: true,
    funNotes: [
      "天哪，红油酱汁也太辣了！嚼着黏糯滚烫的年糕爽得头发发麻！",
      "火急火燎之下舀一大勺雪冰吞下！冷热碰撞在嘴里激起璀璨烟花！",
      "冰与火疯狂揉搓！极致辣度把近期积攒的所有压抑焦虑彻底燃烧一空！",
      "呼哧呼哧舔完勺底。虽然嘴巴像着了火，但是畅快得无与伦比！"
    ]
  },
  {
    id: "breast",
    name: "水煮鸡胸肉挣扎代餐",
    emoji: "🥗",
    cost: 1,
    weightGain: -0.2,
    energyRecover: 12,
    stressRelief: -5,
    desc: "水煮冷冻鸡胸肉配冰地瓜。高饱腹、零油脂防肿，甚至微弱提高声、舞基本功！",
    chews: 3,
    spicy: false,
    isDiet: true,
    funNotes: [
      "干瘪无味的肉丝仿佛在锯你的喉咙... 留下小爱豆挣扎屈辱的眼泪！",
      "默默嚼着高饱腹的微甜冰红薯。虽然寡淡，但腹部线条似乎更有安全感了！",
      "干完最后一块木屑般的肉。身材无负荷，体内元气格外清朗通透！"
    ]
  },
  {
    id: "ramen2",
    name: "便利店芝士拉面双人拌",
    emoji: "🍜",
    cost: 1.5,
    weightGain: 0.4,
    energyRecover: 22,
    stressRelief: 12,
    desc: "热辣拉面里融化一整张黄芝士！巨香浓，但20%宿醉或明晨起床水肿的危险。",
    chews: 3,
    spicy: true,
    funNotes: [
      "大口吸溜挂满咸香爆浆芝士的热辣拉面，顺滑浓郁得简直是犯罪！",
      "吸溜吸溜~ 这是什么旷世奇面！吃一口，连面带芝士让人飘飘欲仙！",
      "连面带汤干干净净！满足得想打滚，只是心底已经拉响了明日肿脸警报..."
    ]
  }
];

export default function FandomAnalyticsApp({
  persona,
  teammates,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdatePersona,
  onAddLog
}: FandomAnalyticsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fandom" | "body" | "dermatology" | "therapy">("fandom");

  // --- AI Psychologist states ---
  const [therapyInput, setTherapyInput] = useState("");
  const [therapyResult, setTherapyResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stressDelta, setStressDelta] = useState<number | null>(null);

  // --- New Food Simulator states ---
  const [activeEatingFood, setActiveEatingFood] = useState<any | null>(null);
  const [chewsRemaining, setChewsRemaining] = useState<number>(0);
  const [eatingLogs, setEatingLogs] = useState<string[]>([]);
  const [hasSharedWithTeammate, setHasSharedWithTeammate] = useState<string | null>(null);
  const [isBustedByManager, setIsBustedByManager] = useState<boolean>(false);

  // Calculate BMI
  const mSquare = (persona.height / 100) * (persona.height / 100);
  const bmi = (persona.weight / mSquare).toFixed(2);

  // Fandom makeup percentages bound dynamicaly to persona state
  const isTrainee = persona.startType === "trainee";
  const otFandom = persona.fansDistribution?.otFans ?? (isTrainee ? 70 : 45);
  const soloStan = persona.fansDistribution?.soloFans ?? (isTrainee ? 15 : 30);
  const cpShipper = persona.fansDistribution?.cpFans ?? (isTrainee ? 5 : 15);
  const antiFans = persona.fansDistribution?.antiFans ?? (isTrainee ? 10 : 10);
  const delusional = 5;
  const sasaengStalker = 3;
  const evilStan = 8;

  // Chart Data for Recharts Radial Bar Chart
  const chartData = [
    { name: "OT Fans (双向团粉)", value: otFandom, fill: "#a855f7" },
    { name: "Solo Fans (唯粉/毒唯)", value: soloStan + evilStan, fill: "#3b82f6" },
    { name: "CP Shippers (CP粉)", value: cpShipper, fill: "#ec4899" },
    { name: "Anti Fans (黑粉/私生)", value: antiFans + sasaengStalker, fill: "#ef4444" }
  ];

  // Dermatology purchases (Requirement 11, 12)
  const buyTherapy = (type: "ldm" | "injection" | "thermage" | "depuff") => {
    let cost = 0;
    let pointsCost = 1;
    if (type === "thermage") pointsCost = 2;
    if (type === "depuff") pointsCost = 1;

    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < pointsCost) {
      onAddLog(`【皮肤科】今日互动点数不足！本护理需要消耗 ${pointsCost} 互动点，但您仅剩 ${currentPoints} 点。`);
      return;
    }

    if (type === "injection" || type === "thermage") {
      if (persona.energy <= 15) {
        onAddLog(`【体力枯竭】进行水光针/热玛吉提拉施术极度消耗抵抗力。您目前体力仅剩 ${persona.energy}⚡，强行治疗易引发晕眩或面部红肿！请优先进行体力修护。`);
        return;
      }
      if (persona.stress >= 95) {
        onAddLog(`【精神极度敏感】爱豆目前的脑部压力高达 ${persona.stress}/100 🤯，对微小创伤/痛感处于极度恐慌警戒状态，医生建议立即暂停侵入式医美！请优先安抚情绪。`);
        return;
      }
    }

    const p = { ...persona };
    p.interactionPoints = currentPoints - pointsCost;

    if (type === "ldm") {
      cost = 35;
      if (p.money < cost && p.startType === "idol") {
        onAddLog("资金不足！LDM童颜超声波保养需要 ₩35万。");
        return;
      }
      p.money = Math.max(0, p.money - cost);
      p.skinCondition = "glowing";
      p.stress = Math.max(0, p.stress - 15);
      p.energy = Math.max(0, p.energy - 5);
      onAddLog(`【江南清潭洞皮肤科】您完成了LDM童颜超声波维稳，消耗 ${pointsCost} 互动点。面部重新焕发出健康蜜桃光泽，疲劳有所缓解！今天剩余: ${p.interactionPoints} 互动点。`);
    } else if (type === "injection") {
      cost = 65;
      if (p.money < cost && p.startType === "idol") {
        onAddLog("资金不足！江南深层水光针护肤需要 ₩65万。");
        return;
      }
      p.money = Math.max(0, p.money - cost);
      p.skinCondition = "perfect";
      p.stress = Math.min(100, p.stress + 5); // hurts!
      p.energy = Math.max(0, p.energy - 10);
      onAddLog(`【江南清潭洞皮肤科】打完高级胶原蛋白水光针，消耗 ${pointsCost} 互动点！素颜状态达到了巅峰！今天剩余: ${p.interactionPoints} 互动点。`);
    } else if (type === "thermage") {
      cost = 220;
      if (p.money < cost && p.startType === "idol") {
        onAddLog("资金不足！VIP全脸热玛吉激光紧致需要 ₩220万。");
        return;
      }
      p.money = Math.max(0, p.money - cost);
      p.skinCondition = "perfect";
      p.popularity = p.popularity + 8;
      p.stress = Math.min(100, p.stress + 15); // hurts like laser!
      p.energy = Math.max(0, p.energy - 15);
      onAddLog(`【江南清潭洞皮肤科】完成高端热玛吉面部提拉，消耗 ${pointsCost} 互动点。下颌线清晰，路人缘大幅提升！今天剩余: ${p.interactionPoints} 互动点。`);
    } else {
      // Espresso depuff
      cost = 5;
      if (p.money < cost && p.startType === "idol") {
        onAddLog("您的零用钱不够买黑咖啡消肿套组 (₩5万)。");
        return;
      }
      p.money = Math.max(0, p.money - cost);
      p.weight = Math.max(38, p.weight - 0.3);
      p.stress = Math.max(0, p.stress - 5);
      onAddLog(`【急速排水】您灌下了两杯超浓缩冰美式与刮痧，消耗 ${pointsCost} 互动点，体重下降 0.3kg！今天剩余: ${p.interactionPoints} 互动点。`);
    }

    onUpdatePersona(p);
  };

  // Slimming purchases (Requirement 11, 12)
  const handleFasting = () => {
    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < 1) {
      onAddLog("【急速断食】时间不足！执行极端断食消肿需要消耗 1 互动点，但今天仅剩 " + currentPoints + " 点。");
      return;
    }

    // Health protections for Fasting
    if (persona.energy <= 15) {
      onAddLog(`【断食终止】您目前的体力极差（仅剩 ${persona.energy}⚡）！极端断食消耗极大，强行断食容易引发脱水虚脱或在练习室当场晕倒！请优先吃大餐或睡觉。`);
      return;
    }
    if (persona.stress >= 90) {
      onAddLog(`【断食限制】当前心理压力已爆表 (${persona.stress}/100) 🤯！极度生理饥饿极易诱发突发性暴食抑郁，甚至精神恍惚，无法断食。请优先安抚情绪或呼叫 Dr. Kim 进行话疗。`);
      return;
    }

    const p = { ...persona };
    p.interactionPoints = currentPoints - 1;
    p.weight = Math.max(38, p.weight - 0.7);
    p.energy = Math.max(5, p.energy - 25); // very exhausting!
    p.stress = Math.min(100, p.stress + 18);
    // Bad for skin
    p.skinCondition = "troubled";
    onAddLog("【极端消肿】连续24小时无盐断食。消耗 1 互动点，体重狂掉 0.7kg，但你已经眼冒金星，面色缺乏血气，皮肤开始粗糙。今日剩余可用互动点：" + p.interactionPoints + " 点。");
    onUpdatePersona(p);
  };

  const handlePilates = () => {
    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < 1) {
      onAddLog("【普拉提】互动点不足！进行 1对1 普拉提拉伸需要消耗 1 互动点，但今天仅剩 " + currentPoints + " 点。");
      return;
    }

    // Health protections for Pilates
    if (persona.energy <= 10) {
      onAddLog(`【体力枯竭】进行1对1普拉提强力拉伸需耗体力。您目前精力仅剩 ${persona.energy}⚡，强行训练极易拉伤肌肉和韧带。请优先补充精力。`);
      return;
    }

    const cost = 45;
    const p = { ...persona };
    if (p.money < cost && p.startType === "idol") {
      onAddLog("资金不足！普拉提1对1私教课程需要 ₩45万。");
      return;
    }
    p.interactionPoints = currentPoints - 1;
    p.money = Math.max(0, p.money - cost);
    p.weight = Math.max(38, p.weight - 0.2);
    p.danceSkill = Math.min(100, p.danceSkill + 4);
    p.energy = Math.max(0, p.energy - 12);
    p.stress = Math.max(0, p.stress - 8); // destress!
    onAddLog("【普拉提塑形】拉伸了韧带及马甲线，消耗 1 互动点。核心控制力与核心舞感舞蹈技巧 (+4) 明显提高！今日剩余可用互动点：" + p.interactionPoints + " 点。");
    onUpdatePersona(p);
  };

  const handleFreeGym = () => {
    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < 1) {
      onAddLog("【健身特训】互动点不足！去健身房进行高强度深蹲与肺活量特训需要消耗 1 互动点，但今天仅剩 " + currentPoints + " 点。");
      return;
    }

    // Health protections for Gym
    if (persona.energy <= 15) {
      onAddLog(`【体力枯竭】高强度阻力深蹲与慢跑排毒极耗气血！您目前体力仅剩 ${persona.energy}⚡，强行举铁极易受伤。请优先补充精力或睡觉。`);
      return;
    }
    if (persona.stress >= 95) {
      onAddLog(`【精神崩溃边缘】当前心理压力已爆表高达 ${persona.stress}/100 🤯！高压下强迫爱豆进行枯燥训练容易诱发抑郁反弹，请安排心理诊疗缓解。`);
      return;
    }

    const p = { ...persona };
    p.interactionPoints = currentPoints - 1;
    p.energy = Math.max(0, p.energy - 20);
    p.weight = Math.max(38, p.weight - 0.1);
    p.vocalSkill = Math.min(100, p.vocalSkill + 1);
    p.stress = Math.min(100, p.stress + 6);
    onAddLog("【公司免费健身房】完成阻力运动与慢跑排毒，消耗 1 互动点。稍微有助于面部消肿，今日剩余可用互动点：" + p.interactionPoints + " 点。");
    onUpdatePersona(p);
  };

  const startEating = (food: any) => {
    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < 1) {
      onAddLog(`【深夜加餐】互动点不足！深夜开吃密谋需要 1 互动点，但今天仅剩 ${currentPoints} 点。`);
      return;
    }

    const p = { ...persona };
    p.interactionPoints = currentPoints - 1;
    if (p.money < food.cost && p.startType === "idol") {
      onAddLog(`资金不足！【${food.name}】需要 ₩${food.cost}万。`);
      return;
    }
    
    // Deduct cost immediately
    p.money = Math.max(0, p.money - food.cost);
    onUpdatePersona(p);

    setActiveEatingFood(food);
    setChewsRemaining(food.chews);
    setHasSharedWithTeammate(null);
    setIsBustedByManager(false);
    setEatingLogs([`🎒 [开始深夜密谋作战] ${persona.name} 悄悄把一盒【${food.name}】塞进衣兜钻进床褥...`]);
  };

  const chewFood = () => {
    if (!activeEatingFood || chewsRemaining <= 0) return;
    
    const newChews = chewsRemaining - 1;
    setChewsRemaining(newChews);
    
    const currentChewIndex = activeEatingFood.chews - chewsRemaining;
    const note = activeEatingFood.funNotes[currentChewIndex] || "大口吞下美食...";
    let logs = [...eatingLogs, `😋 [嚼] ${note}`];

    // Trigger surprise events midway (after 1st chew, if there are chews left)
    let triggeredMate = hasSharedWithTeammate;
    let triggeredManager = isBustedByManager;

    if (newChews > 0 && !hasSharedWithTeammate && !isBustedByManager) {
      const roll = Math.random();
      if (roll < 0.18 && teammates && teammates.length > 0) {
        const randMate = teammates[Math.floor(Math.random() * teammates.length)];
        triggeredMate = randMate.name;
        setHasSharedWithTeammate(randMate.name);
        logs.push(`👀 [舍友分食] 门缝开了，队友 ${randMate.name} 贼眉鼠眼地钻进来，捂着嘴惊叫：“大发！是【${activeEatingFood.name}】！分我一口！！我会保密的！” 看来这顿美味要被迫分享了。`);
      } else if (roll >= 0.18 && roll < 0.28 && persona.startType === "idol") {
        triggeredManager = true;
        setIsBustedByManager(true);
        logs.push(`🚨 [危机降临] 完蛋！地板传来闵经纪人标志性冰冷的高跟鞋叩地声正迅速逼近！你冷汗直冒，必须手忙脚乱地把餐盒捂进被罩里...`);
      }
    }

    // Swallowed!
    if (newChews === 0) {
      const p = { ...persona };
      const food = activeEatingFood;
      
      let finalW = food.weightGain;
      let finalE = food.energyRecover;
      let finalS = food.stressRelief;
      let resultMsg = "";

      if (triggeredManager) {
        finalW = 0;
        finalE = Math.round(food.energyRecover * 0.25);
        p.stress = Math.min(100, p.stress + 15);
        p.energy = Math.min(100, p.energy + finalE);
        
        resultMsg = `😭 [落荒而逃] 门开启瞬间你快速将餐盒踢进床底！没饱成还被一通劈头训斥，压力狂飙 (+15)，体力恢复微弱 (+${finalE})。`;
      } else if (triggeredMate) {
        finalW = parseFloat((food.weightGain / 2).toFixed(2));
        finalE = Math.round(food.energyRecover * 0.55);
        finalS = Math.round(food.stressRelief * 1.25);
        
        // update global teammate favorability in persona state
        p.teammatesFavorability = Math.min(100, (p.teammatesFavorability ?? 50) + 7);
        p.weight = parseFloat(Math.min(80, Math.max(38, p.weight + finalW)).toFixed(2));
        p.energy = Math.min(100, p.energy + finalE);
        p.stress = Math.max(0, p.stress - finalS);
        
        resultMsg = `💖 [战友情深] 你和 【${triggeredMate}】 挤在衣帽间干光了！TA投来无比感动的眼神！热量自动减半 (+${finalW}kg)，饱足感恢复 (+${finalE})，你和队友的集体好感大幅上升 (+7)！`;
      } else {
        // Perfect single eat
        p.weight = parseFloat(Math.min(80, Math.max(38, p.weight + finalW)).toFixed(2));
        p.energy = Math.min(100, p.energy + finalE);
        p.stress = Math.max(0, p.stress - finalS);

        if (food.spicy && Math.random() < 0.3) {
          if (p.skinCondition === "perfect") p.skinCondition = "glowing";
          else if (p.skinCondition === "glowing") p.skinCondition = "troubled";
          else p.skinCondition = "breakout";
          resultMsg = `🌶️ [热辣反弹] 完美独享！但重辣刺激让你满面大汗，体力恢复 (+${finalE})，压力得解，只是明日极易引发水肿与额头闷痘！`;
        } else if (food.skinImprove) {
          if (p.skinCondition === "exhausted" || p.skinCondition === "breakout") p.skinCondition = "troubled";
          else if (p.skinCondition === "troubled") p.skinCondition = "glowing";
          else p.skinCondition = "perfect";
          resultMsg = `✨ [美颜护体] 特级韩牛的丰富高分子蛋白极速修补了你泛黄粗糙的肌肤，体力大幅度回血 (+${finalE})，连皮肤都被治愈提亮了！`;
        } else if (food.isDiet) {
          const isVocal = Math.random() < 0.5;
          if (isVocal) {
            p.vocalSkill = Math.min(100, p.vocalSkill + 2);
            resultMsg = `🥗 [丹田提气] 默默咽下了寡淡的水煮鸡胸。虽然吃得痛苦，但轻盈的身体让你的声部核心发音格外顺畅 (声乐水平 +2)！`;
          } else {
            p.danceSkill = Math.min(100, p.danceSkill + 2);
            resultMsg = `🥗 [轻盈舞姿] 吃完了水煮减脂餐。身体完全没有任何多余的水肿负荷，下午排齐舞动作时感觉轻若飞燕 (舞蹈技巧 +2)！`;
          }
        } else {
          resultMsg = `🏆 [完美偷吃] 宵夜特工作战圆满成功！无惊无险吃个精光，香气吞进肚，体力恢复 (+${finalE})，元气暴涨精神大放松！`;
        }
      }

      onAddLog(`【干饭日志】 ${persona.name} 享用了【${food.name}】。${resultMsg}`);
      logs.push(`🏁 ${resultMsg}`);
      
      onUpdatePersona(p);
    }

    setEatingLogs(logs);
  };

  const handleQuickEat = () => {
    if (!activeEatingFood || chewsRemaining <= 0) return;

    const p = { ...persona };
    const food = activeEatingFood;
    
    // Simulate events based on probability
    const roll = Math.random();
    let finalW = food.weightGain;
    let finalE = food.energyRecover;
    let finalS = food.stressRelief;
    let resultMsg = "";
    
    const logs = [...eatingLogs];
    
    food.funNotes.forEach((n: string) => {
      logs.push(`😋 [快速大嚼] ${n}`);
    });

    if (roll < 0.15 && teammates && teammates.length > 0) {
      const randMate = teammates[Math.floor(Math.random() * teammates.length)];
      finalW = parseFloat((food.weightGain / 2).toFixed(2));
      finalE = Math.round(food.energyRecover * 0.55);
      
      p.teammatesFavorability = Math.min(100, (p.teammatesFavorability ?? 50) + 7);
      p.weight = parseFloat(Math.min(80, Math.max(38, p.weight + finalW)).toFixed(2));
      p.energy = Math.min(100, p.energy + finalE);
      p.stress = Math.max(0, p.stress - finalS);
      
      resultMsg = `💖 [战友情深] 快速大嚼中队友 ${randMate.name} 钻进来吵着要分一口，你叹了一口水分了TA一大半！体重增量减半 (+${finalW}kg)，体力恢复 (+${finalE})，你和队友的集体好感上升 (+7)！`;
    } else if (roll >= 0.15 && roll < 0.25 && persona.startType === "idol") {
      finalW = 0;
      finalE = Math.round(food.energyRecover * 0.25);
      p.stress = Math.min(100, p.stress + 15);
      p.energy = Math.min(100, p.energy + finalE);
      
      resultMsg = `😭 [落荒而逃] 正当飞速狼吞虎咽时，闵经纪人突然推门查寝！你大惊失色之下把餐盒踢进床底，没饱成，精神压力狂飙 (+15)，体力仅微弱感应恢复 (+${finalE})。`;
    } else {
      p.weight = parseFloat(Math.min(80, Math.max(38, p.weight + finalW)).toFixed(2));
      p.energy = Math.min(100, p.energy + finalE);
      p.stress = Math.max(0, p.stress - finalS);

      if (food.spicy && Math.random() < 0.3) {
        if (p.skinCondition === "perfect") p.skinCondition = "glowing";
        else if (p.skinCondition === "glowing") p.skinCondition = "troubled";
        else p.skinCondition = "breakout";
        resultMsg = `🌶️ [热辣反弹] 几大口迅速吸完了大餐！肚皮饱满有力，体力恢复 (+${finalE})，但面部极易引发泛红和晨起水肿。`;
      } else if (food.skinImprove) {
        if (p.skinCondition === "exhausted" || p.skinCondition === "breakout") p.skinCondition = "troubled";
        else if (p.skinCondition === "troubled") p.skinCondition = "glowing";
        else p.skinCondition = "perfect";
        resultMsg = `✨ [美颜护体] 光速完成了高档烤肉！优质油脂与氨基酸瞬间温补了你疲惫的底子，体力全部回血 (+${finalE})，连面部光泽都得到了提亮修复！`;
      } else if (food.isDiet) {
        const isVocal = Math.random() < 0.5;
        if (isVocal) {
          p.vocalSkill = Math.min(100, p.vocalSkill + 2);
          resultMsg = `🥗 [丹田提气] 几口咽干了无味鸡胸肉。身体格外清朗无水肿负担，下午排麦课提气中丹田更具爆合张力 (声乐水平 +2)！`;
        } else {
          p.danceSkill = Math.min(100, p.danceSkill + 2);
          resultMsg = `🥗 [轻盈舞姿] 极速解决掉了水煮代餐，胃部空灵轻巧。下午跟拍核心排练时肢体异常灵巧 (舞蹈技巧 +2)！`;
        }
      } else {
        resultMsg = `🏆 [完美偷吃] 速度极快，干净利落地吞嚼吃光了！拍拍肚子没有被经纪人撞见，香气全入肚子。体力回复 (+${finalE})，压力解压！`;
      }
    }

    logs.push(`🏁 ${resultMsg}`);
    onAddLog(`【干饭日志】 ${persona.name} 快速吞食了【${food.name}】。${resultMsg}`);
    
    setChewsRemaining(0);
    setEatingLogs(logs);
    onUpdatePersona(p);
  };

  const handleTherapySubmit = async () => {
    if (!therapyInput.trim()) return;

    const currentPoints = typeof persona.interactionPoints === 'number' ? persona.interactionPoints : 18;
    if (currentPoints < 1) {
      onAddLog("【心理诊疗】互动点不足！呼叫 Dr. Kim 心理咨询会诊需要消耗 1 互动点，但今天仅剩 " + currentPoints + " 点。");
      return;
    }

    setIsAnalyzing(true);
    setTherapyResult(null);
    setStressDelta(null);

    try {
      const customSystemPrompt = `You are Dr. Kim, a highly specialized entertainment-industry clinical psychologist working for the agency's mental care division. Your job is to listen carefully to the idol (the player), analyze their current situation (fandom anxiety, physical exhaustion, group relationships, sasaeng stalker stress), and offer a profound, warm, empathetic, and actionable medical/psychological advice.
      Because you are a professional, you must assess the pressure change quantitatively. You must output a stress delta (stress change) between -35 (extremely relieving) and +5 (very stressful or sobering advice).
      At the very end of your reply, write EXACTLY: [STRESS_CHANGE: -15] (replace -15 with your assessed stress change, which must be an integer, e.g., -20, -10, etc., depending on how comforting and effective your analysis is).
      Keep your advice warm and structured, in professional clinical counselor tone, in Chinese, about 3-4 paragraphs. Use encouraging and warm advice.`;

      const promptContext = `
      Idol Profile:
      - Name: "${persona.name}" (Stage Name: "${persona.stageName || "无"}")
      - Group: "${persona.groupName}"
      - Gender: "${persona.gender === "female" ? "女" : "男"}"
      - MBTI: "${persona.mbti}"
      - Current Physical and Mental Stats:
        - Stress Level: ${persona.stress} / 100
        - Energy Level: ${persona.energy} / 100
        - Weight: ${persona.weight.toFixed(1)} kg, Height: ${persona.height} cm
        - Skin Condition: "${persona.skinCondition}"
      - Fandom Landscape:
        - OT deadhard fans count: ${persona.fansCount} (${otFandom}%)
        - CP Shippers: ${cpShipper}%
        - Malicious Antifans & Sasaengs: ${antiFans + sasaengStalker}%
      
      User's Currently Confessed Feeling / Problem:
      "${therapyInput}"
      
      Dr. Kim, please analyze and reply warmly. Don't forget the required [STRESS_CHANGE: <integer>] tag.
      `;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptContext,
          systemInstruction: customSystemPrompt,
          customApiKey,
          customModel,
          customApiEndpoint
        })
      });

      if (!response.ok) {
        throw new Error("接口返回状态异常");
      }

      const data = await response.json();
      const rawText = data.text || "在这条光芒万丈的路上，你已经做得很好了。放松呼吸，Kim医生一直在这里支持你。 [STRESS_CHANGE: -12]";
      
      // Parse stress level change
      let parsedDelta = -12; // Default fallback
      const deltaMatch = rawText.match(/\[STRESS_CHANGE:\s*(-?\d+)\]/);
      if (deltaMatch) {
        parsedDelta = parseInt(deltaMatch[1], 10);
      }

      // Clean the tag out of the visible text so it looks seamless and pristine
      const cleanedText = rawText.replace(/\[STRESS_CHANGE:\s*-?\d+\]/gi, "").trim();

      const p = { ...persona };
      p.interactionPoints = Math.max(0, currentPoints - 1);
      const oldStress = p.stress;
      const newStress = Math.min(100, Math.max(0, oldStress + parsedDelta));
      p.stress = newStress;

      setTherapyResult(cleanedText);
      setStressDelta(parsedDelta);
      onUpdatePersona(p);

      const sign = parsedDelta >= 0 ? "+" : "";
      onAddLog(`【AI 心理诊疗】Dr. Kim 医生完成深度倾诉分析。消耗 1 互动点，压力变动：${sign}${parsedDelta}%（降至 ${newStress}%）。今日剩余可用互动点：${p.interactionPoints} 点。`);
    } catch (error) {
      console.error("AI 心理咨询大模型调用失败:", error);
      onAddLog("【心理诊疗异常】呼叫 Dr. Kim 医生失败，原因由于特训高压或接口不可达，系统自动由助理进行基础心理安慰。");
      
      const fallbackDelta = -12;
      const p = { ...persona };
      p.interactionPoints = Math.max(0, currentPoints - 1);
      const oldStress = p.stress;
      const newStress = Math.min(100, Math.max(0, oldStress + fallbackDelta));
      p.stress = newStress;

      setTherapyResult(`（助理温馨慰问 fallback）\n孩子，演艺圈的压力确实很重。不论黑粉恶意恶评如何中伤你，也别忘了那些手举灯牌、在台下撕心配裂喊你名字的团粉。在保姆车里吃饱饱，睡一觉吧。`);
      setStressDelta(fallbackDelta);
      onUpdatePersona(p);
      onAddLog(`【心理诊疗】深度倾诉结束。消耗 1 互动点，压力变动：-12%（降至 ${newStress}%）。今日剩余可用互动点：${p.interactionPoints} 点。`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="fandom-analytics-app" className="primary-app-container flex flex-col rounded-2xl bg-[#0d111a] border border-slate-800 text-white glass-panel">
      
      {/* Top Header Selector */}
      <div className="bg-[#161b26] p-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-100 truncate">爱豆大健康与粉丝结构分析 App</h3>
            <p className="text-[9px] text-slate-450 truncate">查看网络粉丝情绪、进行江南皮肤科维护和体重三围控制</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[9px] bg-emerald-900/30 text-emerald-300 border border-emerald-500/10 px-1.5 py-0.5 rounded font-mono font-medium whitespace-nowrap">
                🕒 剩余互动点: {persona.interactionPoints ?? 18}/18点
              </span>
              <span className="text-[9px] bg-amber-900/30 text-amber-300 border border-amber-500/10 px-1.5 py-0.5 rounded font-mono font-medium whitespace-nowrap">
                ⚡ 体力: {persona.energy}/100
              </span>
              <span className="text-[9px] bg-rose-900/30 text-rose-300 border border-rose-500/10 px-1.5 py-0.5 rounded font-mono font-medium whitespace-nowrap">
                🤯 压力: {persona.stress}/100
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0 shrink-0">
          <button
            onClick={() => setActiveSubTab("fandom")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all shrink-0 ${activeSubTab === "fandom" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            粉丝网评情感
          </button>
          <button
            onClick={() => setActiveSubTab("body")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all shrink-0 ${activeSubTab === "body" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            自我身材技能
          </button>
          <button
            onClick={() => setActiveSubTab("dermatology")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all shrink-0 ${activeSubTab === "dermatology" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            江南美容/塑形
          </button>
          <button
            onClick={() => setActiveSubTab("therapy")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all shrink-0 ${activeSubTab === "therapy" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            🧠 AI心理医生
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        
        {activeSubTab === "fandom" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#1f2937]/30 border border-slate-800 rounded-xl p-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">实时回归曲大盘热点指数</span>
                <span className="text-xl font-bold text-indigo-300 font-mono mt-1 block">{(persona.fansCount * 0.12).toFixed(0)} CP-VIRAL STATIONS</span>
              </div>
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Left Column: Breakdown List */}
              <div className="lg:col-span-3 space-y-2 bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                <span className="text-xs font-bold text-purple-300 block mb-2">👥 粉丝大局观及成分列表 (Fandom Structure Breakdown)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>👑 团粉死忠 (OT-fans)</span>
                      <span className="font-mono text-purple-400 font-bold">{otFandom}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${otFandom}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">最核心、最稳固的团队力量，只买正规专辑、疯狂做数据打歌。</p>
                  </div>

                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>🧪 梦男梦女 (Delusionals)</span>
                      <span className="font-mono text-pink-400 font-bold">{delusional}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: `${delusional}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">氪金泡泡极品！幻想与你在首尔恋爱，极度嫉妒你与任何异性入镜。</p>
                  </div>

                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>🍭 邪典CP粉 (Shippers)</span>
                      <span className="font-mono text-blue-400 font-bold">{cpShipper}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${cpShipper}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">死命在你与队友、或者其他异性爱豆之间磕小糖。营销炒作顶梁柱。</p>
                  </div>

                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>💀 团队毒唯 (Malicious Akgaes)</span>
                      <span className="font-mono text-red-400 font-bold">{evilStan}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${evilStan}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">讨厌你以外的所有团员。经常在网上撕逼或者辱骂队友抢资源。</p>
                  </div>

                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5 col-span-1 sm:col-span-2">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>🕵️‍♂️ 私生粉 (Sasaengs) & 黑粉恶意爆黑图 (Antis)</span>
                      <span className="font-mono text-red-500 font-bold">{sasaengStalker + antiFans}%</span>
                    </div>
                    <p className="text-[9px] text-red-400 mt-1 leading-relaxed">
                      私生粉会跟机、跟踪你回首尔公寓大门口，在待机室外偷听。黑粉甚至会制作恶意 P 丑图、散布黑料，极大地考验您的抗压指标。
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Recharts Radial Bar Chart */}
              <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 block mb-1">📊 粉丝形态比例环形图 (Radial Distribution)</span>
                  <p className="text-[9px] text-slate-400">环形图展示 OT死忠粉 vs 唯粉/毒唯 vs 恶毒黑粉/私生 占比</p>
                </div>

                <div id="radial-chart-container" className="h-[150px] w-[150px] mx-auto flex items-center justify-center relative my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="25%"
                      outerRadius="100%"
                      barSize={8}
                      data={chartData}
                      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    >
                      <RadialBar
                        minAngle={15}
                        background={{ fill: "rgba(255, 255, 255, 0.04)" }}
                        clockWise={true}
                        dataKey="value"
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Compact Legend Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-slate-800">
                  {chartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-[9px] text-slate-300 truncate" title={d.name}>{d.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "body" && (
          <div className="space-y-4">
            {/* Growth attribute and body state values */}
            <div className="bg-[#121824] rounded-2xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <span className="text-xs font-bold text-indigo-300 block mb-2">身材体态数据 (Body Indices)</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">目前身高 (Height)</span>
                    <span className="font-mono font-semibold">{persona.height} cm</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">极限体重 (Weight)</span>
                    <span className="font-mono font-semibold text-rose-300">{persona.weight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">人体 BMI</span>
                    <span className={`font-mono font-semibold ${parseFloat(bmi) < 17.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {bmi} {parseFloat(bmi) < 17.5 ? "(严重偏瘦-爱豆标准)" : "(正常状态)"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">皮肤状态 (Skin Glow)</span>
                    <span className="font-bold text-yellow-300 uppercase font-mono">
                      {persona.skinCondition === "perfect" && "💎 晶莹无暇 (Perfect)"}
                      {persona.skinCondition === "glowing" && "✨ 白皙透亮 (Glowing)"}
                      {persona.skinCondition === "troubled" && "🚨 毛孔粗糙 (Troubled)"}
                      {persona.skinCondition === "breakout" && "🌋 痘印爆发 (Breakout)"}
                      {persona.skinCondition === "exhausted" && "🥀 枯黄泛黄 (Exhausted)"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-purple-300 block mb-2">心理及体力消耗 (Vitals)</span>
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">目前精神压力 (Stress)</span>
                      <span className="font-mono font-bold text-red-400">{persona.stress}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full animate-pulse" style={{ width: `${persona.stress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">体力生命池 (Energy)</span>
                      <span className="font-mono font-bold text-emerald-400">{persona.energy}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${persona.energy}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Practical talent growth attributes (Requirement 11) */}
            <div className="bg-[#121824] rounded-2xl p-4 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-3">🏅 练习生四维基础才艺特长数值 (Idol Talent Ratings)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>🎤 声乐实力 (Vocal Talent)</span>
                    <span className="font-mono font-bold">{persona.vocalSkill}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${persona.vocalSkill}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>💃 舞蹈张力 (Dance Pose)</span>
                    <span className="font-mono font-bold">{persona.danceSkill}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${persona.danceSkill}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>⚡️ 吐字Rap硬核 (Rap Flow)</span>
                    <span className="font-mono font-bold">{persona.rapSkill}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${persona.rapSkill}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-300">
                    <span>🎙️ 艺能与口才综艺 (Speech & Variety)</span>
                    <span className="font-mono font-bold">{persona.varietySkill}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-yellow-505 h-full bg-yellow-500" style={{ width: `${persona.varietySkill}%` }} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-550 text-slate-400 mt-3 leading-relaxed">
                * 每次进行练习课、去电视台打歌都会调整以上属性池，技能越强，专辑大盘首日销量就越暴躁。
              </p>
            </div>
          </div>
        )}

        {activeSubTab === "dermatology" && (
          <div className="space-y-4">
            {/* Cardiology Clinique list */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-[#20e9d6] flex items-center gap-1">
                🏥 江南最高端清潭洞皮肤科 (The Gangnam Elite Skincare Clinique)
              </span>
              <p className="text-[10px] text-slate-400">消耗您个人的到手演出费去改善长期熬夜的爆痘、泛黄泛红毛孔问题。</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200">LDM童颜超声波保养</span>
                      <span className="text-[11px] font-bold text-yellow-400">₩35万</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">空腹超声导入维稳屏障。无痛红斑舒缓，皮肤变成‘透亮白皙GLOW’，压力减退，体力消耗极省。</p>
                  </div>
                  <button
                    onClick={() => buyTherapy("ldm")}
                    className="w-full mt-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    接受保养 (₩35万)
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200">全脸多维胶原蛋白水光针</span>
                      <span className="text-[11px] font-bold text-yellow-400">₩65万</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">通过负压注射极深锁水。打完会有微创微红创口点，但2-3天后面部皮肤会飞跃至‘晶莹无暇PERFECT’！</p>
                  </div>
                  <button
                    onClick={() => buyTherapy("injection")}
                    className="w-full mt-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    接受水光中胚 (₩65万)
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200">VIP全脸强力热玛吉 FLX 紧致</span>
                      <span className="text-[11px] font-bold text-yellow-400">₩220万</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">射频深度提拉紧致轮廓，秒出精美的下颌轮廓线，增加额外人气度(+8)和无底面部质感，但极其疼痛，压力增加，极度耗命。</p>
                  </div>
                  <button
                    onClick={() => buyTherapy("thermage")}
                    className="w-full mt-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    VIP激光紧致 (₩220万)
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200">冰美式排水+刮痧急救</span>
                      <span className="text-[11px] font-bold text-yellow-400">₩5万</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">打歌前极速排除面部多余浮肿水渍。体重稍微下降 0.3kg，有助于维持苗条镜头完美感。</p>
                  </div>
                  <button
                    onClick={() => buyTherapy("depuff")}
                    className="w-full mt-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    急速刮痧 (₩5万)
                  </button>
                </div>
              </div>
            </div>

            {/* Extreme body control gym */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-rose-400">🏋️‍♀️ 训练生严酷身姿管理与塑形会所</span>
              <p className="text-[10px] text-slate-400">公司或私立瑜伽。严格限制体重以保证上镜时的少女感猫系轮廓。</p>

              <div className="grid grid-cols-3 gap-2.5 text-center mt-2.5">
                <button
                  onClick={handleFasting}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-rose-300 block">24h无盐绝水断食</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">体重狂掉-0.7kg。极度空腹虚弱，皮肤变坏！</span>
                  </div>
                  <span className="text-[9px] text-rose-400 font-bold block bg-rose-950/20 py-0.5 rounded text-center">空腹断食</span>
                </button>

                <button
                  onClick={handlePilates}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-indigo-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 block">1v1 普拉提塑形</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">费用 ₩45万。体重-0.2kg，舞蹈控制力增加。</span>
                  </div>
                  <span className="text-[9px] text-indigo-400 font-bold block bg-indigo-950/20 py-0.5 rounded text-center">预约 (₩45w)</span>
                </button>

                <button
                  onClick={handleFreeGym}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 block">公司重铁深蹲</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">免费。消耗20体力，瘦身0.1kg，增加体力。</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-bold block bg-emerald-950/20 py-0.5 rounded text-center">撸铁深蹲</span>
                </button>
              </div>
            </div>

            {/* Nutritious Diet & Weight Gain */}
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-sans">🍲 宿舍与深夜偷吃食堂 (The Secret Midnight Kitchen)</span>
                {activeEatingFood && (
                  <span className="text-[9px] tracking-wider bg-red-600/90 border border-red-500/40 text-white px-2 py-0.5 rounded-full animate-pulse font-mono uppercase font-bold">
                    [偷吃突击中]
                  </span>
                )}
              </span>
              <p className="text-[10px] text-slate-400">
                提供6种不同的高/低热量爱豆加餐与挣扎减脂餐。深夜偷吃极易遭遇闵督察查寝危机或队友撞破分食，大口咀嚼体会偶像在极度高敏环境下的爆趣大快朵颐！
              </p>

              {activeEatingFood ? (
                /* --- ACTIVE INTERACTIVE EATING DASHBOARD --- */
                <div className="bg-slate-950 rounded-xl p-4 border border-indigo-500/30 font-sans relative overflow-hidden animate-fadeIn my-2">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none text-8xl font-bold">
                    {activeEatingFood.emoji}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    {/* Visual Dish & Chewing status */}
                    <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
                      <div className="relative text-5xl mb-2 animate-bounce">
                        {activeEatingFood.emoji}
                        {chewsRemaining > 0 && (
                          <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold font-mono shadow">
                            {chewsRemaining}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-100">{activeEatingFood.name}</span>
                      
                      {/* Chews Progress Bar */}
                      <div className="w-full mt-3.5 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>剩余大口份数</span>
                          <span className="font-bold text-indigo-400">{chewsRemaining} / {activeEatingFood.chews} 份</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${(chewsRemaining / activeEatingFood.chews) * 100}%` }}
                          />
                        </div>
                      </div>

                      {chewsRemaining > 0 ? (
                        <button
                          onClick={chewFood}
                          className="w-full mt-3.5 py-1.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-[10px] font-bold rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          👄 咬下一大口 ({chewsRemaining}口)
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveEatingFood(null)}
                          className="w-full mt-3.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-755 text-slate-100 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          收起餐具 (寻找下一顿) ✕
                        </button>
                      )}
                    </div>

                    {/* Live feeding narrative and events log */}
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <div>
                        <span className="text-[10px] text-indigo-300 font-bold block mb-1">📋 干饭动态与事件记录:</span>
                        <div className="bg-[#090d16] border border-slate-800 rounded-xl p-3 h-[115px] overflow-y-auto space-y-1.5 pr-1.5">
                          {eatingLogs.map((log, idx) => (
                            <p 
                              key={idx} 
                              className={`text-[10px] leading-relaxed font-mono ${
                                log.startsWith("🚨") || log.startsWith("⚠️") || log.startsWith("😭") ? "text-red-400 font-semibold" :
                                log.startsWith("👀") || log.startsWith("💖") ? "text-pink-400 font-medium" :
                                log.startsWith("🏁") ? "text-emerald-400 font-bold mt-1.5 border-t border-slate-800/80 pt-1.5" :
                                "text-slate-350"
                              }`}
                            >
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[9px] text-slate-500 font-mono">
                          * 嚼咽间可能引来舍友或惊动闵经纪人突围！
                        </span>
                        {chewsRemaining > 0 && (
                          <button
                            onClick={handleQuickEat}
                            className="text-[9px] text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                          >
                            快速三口闷完 ➔
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* --- SIX SHINY INTERACTIVE FOODS SELECTOR --- */
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2.5">
                  {FOOD_ITEMS.map((item) => {
                    const tooExpensive = persona.money < item.cost && persona.startType === "idol";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => startEating(item)}
                        disabled={tooExpensive}
                        className={`bg-slate-950 p-2.5 rounded-xl border border-white/5 hover:border-amber-500/25 transition-all text-left flex flex-col justify-between min-h-[125px] cursor-pointer relative group ${tooExpensive ? "opacity-45 cursor-not-allowed hover:border-transparent" : ""}`}
                      >
                        <div>
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors flex items-center gap-1.5 min-w-0">
                              <span className="text-sm shrink-0">{item.emoji}</span>
                              <span className="truncate">{item.name}</span>
                            </span>
                            <span className="text-[9px] font-bold text-yellow-400 font-mono shrink-0 ml-1">
                              ₩{item.cost}万
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-1.5 leading-snug">
                            {item.desc}
                          </span>
                        </div>

                        <div className="w-full mt-2 pt-1.5 border-t border-white/5 flex justify-between items-center text-[9px] font-mono">
                          <span className={`${item.weightGain >= 0 ? "text-rose-400" : "text-emerald-400"} font-bold`}>
                            体重 {item.weightGain >= 0 ? `+${item.weightGain}` : item.weightGain}kg
                          </span>
                          <span className="text-slate-500">
                            {item.chews}口嚼
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${tooExpensive ? "bg-slate-800 text-slate-600" : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20"}`}>
                            {tooExpensive ? "资金不够" : "开吃"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "therapy" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-indigo-500/25 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">🌟 AETHER LABEL EXCLUSIVE MENTAL CARE</span>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  公司专属 AI 心理诊疗室 (Clinical AI Psychologist)
                </h4>
                <p className="text-[10px] text-slate-400 max-w-xl">
                  身为高曝光偶像或训练生，高强度竞争和负面舆论常会导致严重的精神紧崩。Kim 医生能深切共情网络恶意暴民、控卡目标、极度疲累和私生粉骚扰为您带来的精神痛苦，为您量身定制临床心里关怀并即刻调养您的<b>精神压力值(Stress)</b>。
                </p>
              </div>

              {/* Stress indicators badge */}
              <div className="bg-[#121824] p-3 rounded-xl border border-white/5 shrink-0 flex items-center gap-3">
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 block font-mono">当前压力级别</span>
                  <span className="text-base font-extrabold font-mono text-rose-400">{persona.stress}%</span>
                </div>
                <div className="h-8 w-[1px] bg-slate-800" />
                <div className="w-24">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full" style={{ width: `${persona.stress}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block text-right font-mono">
                    {persona.stress < 30 ? "😀 心态舒畅" : persona.stress < 75 ? "⚠️ 焦虑积压" : "🥀 精神崩溃边缘"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Interactive Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Left Form column (3 cols) */}
              <div className="lg:col-span-3 bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="therapy-feeling-input" className="text-xs font-bold text-purple-300 block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    请向 Kim 医生描述您近期的痛苦遭遇或心里感受：
                  </label>
                  <textarea
                    id="therapy-feeling-input"
                    value={therapyInput}
                    onChange={(e) => setTherapyInput(e.target.value)}
                    placeholder="例：最近感觉练习室跳得再好，闵经纪人依旧冷言嘲讽。网上还有黑粉散布恶意爆料，私生饭也频繁发送骚扰短信，卡路里控重在严重困扰我，非常空虚焦虑..."
                    className="w-full h-[110px] bg-slate-950 border border-slate-800 focus:border-indigo-600 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none transition-all placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/25"
                  />
                </div>

                {/* Preset Suggestions Quick-click buttons */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-400 block">💡 快捷选择近期困扰（快速加载情境模板）：</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[
                      {
                        label: "🤐 极具不适的私生饭电话与短信骚扰",
                        text: "昨天下午新住宅的安全密码门锁，竟然被私生粉丝高价买通不法渠道获取，半夜还收到了他们拍我宿舍大门包装袋的恐吓短信，整夜后背发凉、安全感到达谷底，现在一听到手机震动就心惊肉跳..."
                      },
                      {
                        label: "🥊 网上饭圈恶意P图与抹黑谣言",
                        text: "最近在网络吃瓜论坛 and Weverse上，有黑子恶意截取我在镜头前早晨浮肿的未修丑图大肆造谣整形，甚至买高赞辱骂我和队友抢占Center资源。真的好压抑、好寒心，明明我每天都练到大汗淋漓啊..."
                      },
                      {
                        label: "🥗 严酷至极的身材控重与绝食压力",
                        text: "闵室长命令我今天必须把体重秤重压到41kg，哪怕高卡路里深夜偷吃一小勺雪冰，也会拉响极度严厉的查寝黑脸警告。全身酸痛却每天只准啃水煮鸡胸，我觉得脑部多巴胺干涸，好想放声大哭..."
                      },
                      {
                        label: "🎤 月度考核及打歌大盘恐慌情绪",
                        text: "马上就要进行本月的打歌代表及PD月度声乐高音考核了。我很怕在一分半的Killing Part音色破音被指控为划水爱豆，昨晚做了一整夜在电视台后台跌落的噩梦，神经绷得紧紧的，完全无法入睡..."
                      }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTherapyInput(item.text)}
                        className="px-2 py-1 text-[9px] bg-[#121824] border border-slate-800 hover:border-indigo-500/35 hover:bg-slate-850 rounded text-slate-300 transition-all text-left truncate max-w-full cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-805">
                  <p className="text-[9px] text-[#20e9d6] animate-pulse flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    Kim 医生时刻在线，聆听你的倾诉
                  </p>
                  <button
                    onClick={handleTherapySubmit}
                    disabled={isAnalyzing || !therapyInput.trim()}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAnalyzing || !therapyInput.trim()
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg active:scale-95 border border-indigo-500/10"
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-slate-300 border-t-white rounded-full animate-spin inline-block mr-1" />
                        分析神情诊断中...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 text-purple-300" />
                        开始心里医学疏导
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Right Result/Feedback column (2 cols) */}
              <div className="lg:col-span-2 bg-[#0d121f] rounded-2xl p-4 border border-white/5 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Smile className="w-4 h-4 text-emerald-400" />
                      Dr. Kim 的诊疗答复与心理药方
                    </span>
                    {stressDelta !== null && (
                      <span className={`px-2 py-px rounded-full text-[9px] font-extrabold font-mono uppercase ${
                        stressDelta <= 0 ? "bg-emerald-950 text-emerald-300 border border-emerald-500/35" : "bg-red-950 text-red-300 border border-red-500/30"
                      }`}>
                        Stress {stressDelta >= 0 ? "+" : ""}{stressDelta}%
                      </span>
                    )}
                  </div>

                  {therapyResult ? (
                    <div className="bg-[#060912] border border-slate-850 p-3 rounded-xl max-h-[190px] overflow-y-auto pr-1">
                      <div className="text-[11px] text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                        {therapyResult}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[140px] border border-dashed border-slate-800/80 rounded-xl text-center p-4">
                      <Brain className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                      <p className="text-[10px] text-slate-500">
                        目前诊疗室药柜空空如也。
                      </p>
                      <p className="text-[9px] text-slate-600 mt-1 max-w-[170px]">
                        请在左侧写下倾诉痛点或心事，随后由 Dr. Kim 为您解压开药。
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/40 text-[9px] text-slate-500 font-mono text-right leading-none">
                  * 每次心里疏导后，都将实时更新您的全局属性参数
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
