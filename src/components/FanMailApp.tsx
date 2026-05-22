import React, { useState } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { Mail, MailOpen, Inbox, Heart, Sparkles, Trash2, BookOpen, Clock, AlertCircle } from "lucide-react";
import { safeFetch } from "./apiHelper";

// Letter type definition
export interface FanLetter {
  id: string;
  sender: string;
  fanType: "OT_fan" | "solo_stan" | "evil_stan" | "shipper" | "sasaeng" | "delusion" | "anti" | "normal";
  fanTypeName: string;
  senderAvatar: string;
  receivedDay: number;
  title: string;
  content: string;
  isRead: boolean;
  themeColor: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    stamp: string;
  };
  stressEffect: number; // e.g. -5, -10 (morale booster)
  popularityEffect: number; // e.g. +1, +2
  energyEffect: number; // e.g. +3, +5
}

interface FanMailAppProps {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  fanLetters: FanLetter[];
  onUpdateLetters: (letters: FanLetter[]) => void;
  onUpdateStats: (popularity: number, reputation: number, energy: number, stress: number) => void;
  onAddLog: (log: string) => void;
  customApiKey?: string;
  customModel?: string;
  customApiEndpoint?: string;
}

// Preset library of authentic K-pop industry letters
const PRESET_FAN_LETTERS = [
  {
    sender: "首尔站姐_Lumiere",
    fanType: "normal" as const,
    fanTypeName: "📷 大炮站姐 (Fansite Master)",
    title: "给我的唯一神颜：从初舞台到登顶的记录",
    content: "亲爱的！今天的高清图我已经用最高画质修好上传到大号啦！看着镜头里跳舞的你，发丝都在闪闪发光，真的觉得为你熬夜排队、扛20斤重的长焦镜头都是一万个值得！\n\n昨天的打歌舞台上，你在第三个副歌转音时，突然看向我的镜头笑了对不对？那一瞬间，我的呼吸都要停了，旁边站起抢镜头的别家粉丝都在说‘你家爱豆下凡了’。我的宝贝，请永远这样自信耀眼地歌唱吧！我会一直陪在镜头这端，纪录你登顶的所有瞬间！Fighting！记得多吃点好吃的，真的太瘦了！",
    stressEffect: -12,
    popularityEffect: 3,
    energyEffect: 5,
    themeColor: {
      bg: "bg-slate-900",
      border: "border-purple-500/30",
      text: "text-purple-300",
      accent: "bg-purple-950/40 text-purple-400",
      stamp: "🌸 #Lumiere"
    }
  },
  {
    sender: "团粉守护星_一二三",
    fanType: "OT_fan" as const,
    fanTypeName: "🌟 挚纯团粉 (OT Faction)",
    title: "致最棒的闪亮星空：团队有你真是太好了",
    content: "欧巴/欧尼！我是从预告片开始就爱上你们的团粉。每次看到你们全员在练习室里把地板踩得发出咚咚巨响、为了刀群舞通宵达旦地练习，我都会流下感泪。\n\n现在的Kpop快餐时代，能看到像你们这样团魂熊熊燃烧、互相支撑、在美容室里互相做发型的真挚友情真的好温暖。谢谢你作为团队的担当这么体贴关照其他成员，没有排挤没有私心。团粉永远是你们最坚硬的后盾，全团登顶预备！Fighting！",
    stressEffect: -8,
    popularityEffect: 2,
    energyEffect: 4,
    themeColor: {
      bg: "bg-emerald-950/20",
      border: "border-emerald-500/25",
      text: "text-emerald-300",
      accent: "bg-emerald-900/30 text-emerald-400",
      stamp: "🍀 #OT4_Ever"
    }
  },
  {
    sender: "唯爱逆袭者",
    fanType: "solo_stan" as const,
    fanTypeName: "🔥 狂热唯粉 (Solo Dedicated)",
    title: "我的眼里只有你：不要被资源克扣打败",
    content: "宝贝！真的气死我了，昨天公司的打歌服又是给你分的最素最土的那套，镜头扫过全景时，那个绿卡队友明明抢拍了，结果热搜上全在夸她！那些毒唯还在黑你高音不稳，明明那天你重感冒还坚持真唱！\n\n你要记住，你才是整个企划的核心和灵魂，你是最闪耀的王牌！不要被公司的偏心和队友的抱团孤立打击到。粉丝只为你一个人花钱、只买你一人的单人封面专辑。挺直腰板，用实力在消音舞台上把他们的嘴全部打碎！我们只爱你一个！",
    stressEffect: -6,
    popularityEffect: 4,
    energyEffect: 3,
    themeColor: {
      bg: "bg-sky-950/20",
      border: "border-sky-500/25",
      text: "text-sky-300",
      accent: "bg-sky-900/30 text-sky-450",
      stamp: "🌻 #OnlyYou"
    }
  },
  {
    sender: "双生花呐喊者_CP520",
    fanType: "shipper" as const,
    fanTypeName: "💞 梦幻CP粉 (Shipper)",
    title: "你们两个人在宿舍真的要一直相爱！",
    content: "啊啊啊啊啊！救命啊！我真的是要磕死在昨天Weverse的自拍里了！你身上穿的粉色小羊卫衣，不就是之前她穿过的那件同款吗！这根本就是同穿一件衣服吧！还有粉丝签售会上，她帮你整理额前碎发的时候，你那个瞬间害羞低下头的微表情，我已经用0.5倍速截了100遍了！\n\n‘双生花’就是最完美的真爱！请你们在宿舍和后台美容室里一直互相喂零食、一直这么亲密无间地走下去！大势同人图我已经画好出本了，希望有一天能让你们亲手签到！祝友谊/爱情长存！",
    stressEffect: -10,
    popularityEffect: 1,
    energyEffect: 5,
    themeColor: {
      bg: "bg-pink-950/25",
      border: "border-pink-500/25",
      text: "text-pink-300",
      accent: "bg-pink-900/30 text-pink-400",
      stamp: "🍬 #DoubleFlower"
    }
  },
  {
    sender: "资深听歌怒那",
    fanType: "normal" as const,
    fanTypeName: "🌸 暖心怒那 (Sweet Noona)",
    title: "今天下雨了，记得要在练习室保暖哦",
    content: "小可爱，今天首尔下起了细密的春雨，天气很湿冷。我看你清晨上班路过斑马线时的素颜照，眼圈重重的，脸色有些疲惫憔悴。闵经纪人还是那么严厉，一直催你上车对不对？\n\n练习生和爱豆的高强度作息真的不是常人能忍受的。看到你每天疯狂跳舞、吃一小碟鸡胸肉减肥，怒那真的很心疼。去药店给你寄了复合维他命和暖宝宝，一定要记得拿。比起大红大紫，我更希望你健健康康、开开心心地活在聚光灯下。你笑起来的样子，是治愈我生活所有疲惫的灵药。练习完了早点回宿舍洗个热水澡吧！",
    stressEffect: -15,
    popularityEffect: 1,
    energyEffect: 8,
    themeColor: {
      bg: "bg-amber-950/20",
      border: "border-amber-500/20",
      text: "text-amber-300",
      accent: "bg-amber-900/30 text-amber-400",
      stamp: "☕ #CareNoona"
    }
  },
  {
    sender: "中国留学生小张",
    fanType: "normal" as const,
    fanTypeName: "🌏 留学生绿卡死忠 (Global Support)",
    title: "来自大洋彼岸的信：异国奋斗的你真的很耀眼",
    content: "你好呀！我是独自在首尔大学读研的中国留学生。在韩国独自租房挤地铁、忍受语言隔阂和职场微妙偏见的时候，每次看你上韩综节目默默站在边缘抠手、被PD少分镜头却还要元气满满大声打招呼，我都感同身受得流下温热的眼泪。\n\n你用非母语把歌词咬字唱得那么清晰纯正，台下付出了怎样的血汗，我们绿卡粉丝心里一清二楚！你是我们在韩华人群体还有所有外籍绿卡奋斗者的绝对骄傲！不要在乎本国网民那些刻薄的言论，向全世界证明，绿卡天选神颜也是顶级霸气的！冲鸭！",
    stressEffect: -14,
    popularityEffect: 2,
    energyEffect: 6,
    themeColor: {
      bg: "bg-blue-950/20",
      border: "border-blue-500/25",
      text: "text-blue-300",
      accent: "bg-blue-900/30 text-blue-400",
      stamp: "✈️ #GlobalBright"
    }
  },
  {
    sender: "爱操心的老歌迷",
    fanType: "anti" as const,
    fanTypeName: "🌶️ 毒舌鞭策粉 (Tsundere Critic)",
    title: "虽然你昨天消音舞台顺拐了，但我还是爱看",
    content: "哼，别以为微博和超话里全是无脑吹。昨天在KBS消音舞台的复盘视频里，你在第二段的主舞部分明显又顺拐了，而且唱第三高音那一下声音都快劈叉了吧！我都怀疑你在声乐课上是不是开小差了。\n\n但是……怎么说呢，虽然你昨天跳得确实像个小鸭子，但看到你紧张得通红的小耳朵，还有唱完后拼命鞠躬道歉的小眼神，居然该死的有些可爱……好吧！李秉旭代表要是不给你开小灶，你就自己加练！别给咱们厂牌拉胯跨！继续努力吧，我这封实体信可不便宜，别让我失望了！",
    stressEffect: -5,
    popularityEffect: 5,
    energyEffect: 2,
    themeColor: {
      bg: "bg-red-950/20",
      border: "border-red-500/25",
      text: "text-red-300",
      accent: "bg-red-900/30 text-red-400",
      stamp: "🔥 #KeepTrying"
    }
  }
];

// Helper to generate a procedural randomized fan mail
export function generateRandomFanLetter(persona: IdolPersona, dayNum = 1): FanLetter {
  const isTrainee = persona.startType === "trainee";
  const numMatches = PRESET_FAN_LETTERS.length;
  const picked = PRESET_FAN_LETTERS[Math.floor(Math.random() * numMatches)];
  
  // Custom adjustments based on persona name
  let processedContent = picked.content
    .replace(/欧巴\/欧尼/g, persona.gender === "female" ? "欧尼" : "欧巴")
    .replace(/宝贝/g, persona.stageName)
    .replace(/亲爱的/g, persona.stageName);

  if (persona.style === "solo") {
    processedContent = processedContent
      .replace(/队友/g, "对头/伴舞")
      .replace(/抢镜头的别家粉丝/g, "对立粉圈")
      .replace(/双生花/g, "你和绯闻对象");
  }

  // Create unique ID
  const idValue = `fan_mail_${Date.now()}_${Math.floor(Math.random()*1000)}`;

  return {
    id: idValue,
    sender: picked.sender,
    fanType: picked.fanType,
    fanTypeName: picked.fanTypeName,
    senderAvatar: `MAIL_${Math.floor(Math.random() * 4) + 1}`,
    receivedDay: dayNum,
    title: picked.title.replace(/神颜/g, persona.stageName),
    content: processedContent,
    isRead: false,
    themeColor: picked.themeColor,
    stressEffect: picked.stressEffect,
    popularityEffect: picked.popularityEffect,
    energyEffect: picked.energyEffect,
  };
}

export default function FanMailApp({
  persona,
  teammates,
  fanLetters,
  onUpdateLetters,
  onUpdateStats,
  onAddLog,
  customApiKey,
  customModel,
  customApiEndpoint
}: FanMailAppProps) {
  const [activeTab, setActiveTab] = useState<"unread" | "archived">("unread");
  const [selectedLetter, setSelectedLetter] = useState<FanLetter | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const unreadLetters = fanLetters.filter(l => !l.isRead);
  const archivedLetters = fanLetters.filter(l => l.isRead);

  // Trigger Letter Reading (Applying Stats & Logging)
  const handleReadLetter = (letter: FanLetter) => {
    setSelectedLetter(letter);

    if (!letter.isRead) {
      // Mark as read
      const updated = fanLetters.map(l => {
        if (l.id === letter.id) {
          return { ...l, isRead: true };
        }
        return l;
      });
      onUpdateLetters(updated);

      // Apply gameplay rewards
      const newStress = Math.max(0, persona.stress + letter.stressEffect);
      const newPopularity = Math.min(100, persona.popularity + letter.popularityEffect);
      const newEnergy = Math.min(100, persona.energy + letter.energyEffect);

      onUpdateStats(newPopularity, persona.reputation, newEnergy, newStress);
      onAddLog(`📬 拆阅了【${letter.sender}】的手写信！高水准粉圈反哺治愈中：精神负荷: ${letter.stressEffect}点, 体力: +${letter.energyEffect}点.`);
    }
  };

  // Delete/Archive a letter
  const handleDeleteLetter = (letterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filter = fanLetters.filter(l => l.id !== letterId);
    onUpdateLetters(filter);
    if (selectedLetter?.id === letterId) {
      setSelectedLetter(null);
    }
    onAddLog(`🗑️ 已经将一封粉丝手写信焚毁或收进箱底藏品库。`);
  };

  // Dynamically generate a premium customized Fan Mail using Google Gemini API based on real live gameplay values
  const handleGenerateAiMail = async () => {
    if (!customApiKey) {
      setAiError("请先在【IdolPad 设置】中配置专属 API 密钥 (Gemini Key)，即可解锁无限次 AI 高级粉丝来信！");
      return;
    }

    setAiError(null);
    setIsAiGenerating(true);

    try {
      const isGrp = persona.style === "group";
      const grpText = isGrp ? `组合团名: "${persona.groupName}"，成员定位是: "${persona.roleInGroup}"。有队友: ${teammates.map(t=>t.name).join(", ")}。` : "Solo大势出道，没有队内拉扯。";
      const skinText = persona.skinCondition === "perfect" || persona.skinCondition === "glowing" ? "皮肤状态极佳发亮" : "皮肤浮肿或者有些憔悴冒粉刺";
      const datingText = persona.hasLover ? `秘密地下交往对象: "${persona.loverName}" 关系状态是: "${persona.relationshipStatus}"。` : "母胎单身，零绯闻。";

      const prompt = `你是一个韩国大势K-Pop娱乐论坛的极度硬核粉丝，今天你选择将一封非常煽情、逗趣或者真挚的手写实体信投递到主角所在厂牌的信箱中。
主角详细信息：
- 艺名：${persona.stageName} (性别: ${persona.gender === "female" ? "女" : "男"}, 国籍: ${persona.specificNationality})
- 出道起点：${persona.startType === "trainee" ? "练习生" : "正式偶像"}，目前处于第 ${persona.dayNumber} 天
- 企划模式：${grpText}
- 当前数值健康：人气值: ${persona.popularity}%, 业界信誉: ${persona.reputation}%, 精力体力: ${persona.energy}/100, 精神红粉压力: ${persona.stress}/100。
- 自我护理细节：上镜体重: ${persona.weight.toFixed(1)}kg，${skinText}
- 隐藏地下恋爱关系：${datingText}

请根据以上的当前真实属性：
1. 撰写一封符合高逼真、带有浓重韩圈熟词腔调（例如：上班路、直拍、主打、切瓜、消音舞台、C位、站姐、毒唯、小卡、私生、打歌一套服、美容室、宿舍）的手写信。
2. 粉丝类型可以随机：可以是极端的战斗小唯粉、护犊子的大站姐、喜欢暗戳戳磕你和队友CP的Shipper粉、或者在异乡打拼的留学生心疼关照你的怒那粉，也可以是毒舌但默默关注你的直男吐槽粉。
3. 如果主角有地下恋爱关系且绯闻传出（status: revealed），请写一封伤心脱粉求证的或者是永远相信你可以守护你的坚强信。
4. 严格只返回以下标准的合法纯 JSON 代码包（不要附加 markdown 代码块前缀）：
{
  "sender": "发信粉丝的ID",
  "fanTypeName": "角色标签（例如：护犊大炮唯粉/宿舍暗中观察CP粉 等）",
  "title": "手写信的外封极简摘要标题",
  "content": "深度爆款粉丝文案手写信（限260~380字。情感起伏大，文笔逼真）",
  "theme": "pink" 或 "purple" 或 "emerald" 或 "blue" 或 "amber"
}`;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: "You are an AI simulated K-Pop Fan Mail engine. Return ONLY the JSON object, absolutely zero text markdown wrappers.",
          customApiKey: customApiKey,
          model: customModel || "gemini-2.5-flash",
          customApiEndpoint: customApiEndpoint
        })
      });

      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      const rawText = await response.text();
      
      let cleanJson = rawText;
      if (cleanJson.includes("```json")) {
        cleanJson = cleanJson.split("```json")[1].split("```")[0];
      } else if (cleanJson.includes("```")) {
        cleanJson = cleanJson.split("```")[1].split("```")[0];
      }

      const parsed = JSON.parse(cleanJson.trim());

      // Map color scheme based on AI response theme or rand
      const colMap: Record<string, any> = {
        pink: { bg: "bg-pink-950/25", border: "border-pink-500/25", text: "text-pink-300", accent: "bg-pink-900/30 text-pink-400", stamp: "🍬 #LoveAI" },
        purple: { bg: "bg-slate-900", border: "border-purple-500/30", text: "text-purple-300", accent: "bg-purple-950/40 text-purple-400", stamp: "🔮 #MagicAI" },
        emerald: { bg: "bg-emerald-950/20", border: "border-emerald-500/25", text: "text-emerald-300", accent: "bg-emerald-900/30 text-emerald-400", stamp: "🍀 #LuckyAI" },
        blue: { bg: "bg-blue-950/20", border: "border-blue-500/25", text: "text-blue-300", accent: "bg-blue-900/30 text-blue-400", stamp: "✈️ #GlobalAI" },
        amber: { bg: "bg-amber-950/20", border: "border-amber-500/20", text: "text-amber-300", accent: "bg-amber-900/30 text-amber-400", stamp: "☕ #CareAI" }
      };

      const theme = colMap[parsed.theme] || colMap.purple;

      // Morale boosts triggers randomly
      const newMail: FanLetter = {
        id: `fan_mail_ai_${Date.now()}`,
        sender: parsed.sender || "暖心路人粉",
        fanType: "normal",
        fanTypeName: parsed.fanTypeName || "💖 AI 梦幻定制粉",
        senderAvatar: `MAIL_${Math.floor(Math.random() * 4) + 1}`,
        receivedDay: persona.dayNumber,
        title: parsed.title || "给宝贝的手写信",
        content: parsed.content || "今天也是闪耀着光芒的一天！",
        isRead: false,
        themeColor: theme,
        stressEffect: -Math.floor(Math.random() * 8) - 8, // reduces stress -8 to -15
        popularityEffect: Math.floor(Math.random() * 4) + 2, // popularity boosts +2 to +5
        energyEffect: Math.floor(Math.random() * 5) + 4 // energy restoring +4 to +8
      };

      const updatedLetters = [newMail, ...fanLetters];
      onUpdateLetters(updatedLetters);
      onAddLog(`🔮 【AI 深度驱动】厂牌邮递箱突然收到了一封高拟真粉丝加急手写信，来自: "${newMail.sender}"!`);
      handleReadLetter(newMail);

    } catch (e: any) {
      console.error(e);
      setAiError("AI 脑波配对失败。请检查 API 节点负载，或者点击直接体验离线预设的豪华信箱！");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Generate a random offline presets letters safely
  const handleDeliverStandardMail = () => {
    const newL = generateRandomFanLetter(persona, persona.dayNumber);
    const updated = [newL, ...fanLetters];
    onUpdateLetters(updated);
    onAddLog(`📬 信邮员刚刚送达了一封来自【${newL.sender}】的粉丝手写信！快点在信箱列表中拆开吧！`);
  };

  return (
    <div id="fanmail-app-view" className="h-full flex flex-col space-y-4 text-white overflow-hidden">
      
      {/* Dynamic Header Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/80 p-4 rounded-2xl border border-white/5 gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
            📬 粉丝手写信物盒 (Fan Mail Desktop)
          </h2>
          <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
            这里堆积着首尔美容室、打歌台、寄宿层前台以及站姐秘密收集来的<strong>实体纸质手写信</strong>。纸短情长，阅读粉丝们真实的唠叨与鼓励能大幅缓解内心寂寞、修复身心负重。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {customApiKey && (
            <button
              onClick={handleGenerateAiMail}
              disabled={isAiGenerating}
              className={`text-[9px] px-3 py-1.5 rounded-xl border border-pink-500/20 font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-pink-300 font-mono ${isAiGenerating ? "bg-slate-950/80 opacity-50 animate-pulse" : "bg-pink-950/30 hover:bg-pink-900/40"}`}
            >
              <Sparkles className="w-3 h-3 text-pink-400 animate-spin" /> {isAiGenerating ? "AI 拟真来信中..." : "AI 定制来信 (Gen)"}
            </button>
          )}
          <button
            onClick={handleDeliverStandardMail}
            className="text-[9px] bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <Mail className="w-3 h-3 text-indigo-400" /> 邮递员送件
          </button>
        </div>
      </div>

      {aiError && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-[10px] text-red-300 leading-relaxed">
            {aiError}
          </div>
        </div>
      )}

      {/* Main Mail Hub Board Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Side: Stacks and Envelopes Lists */}
        <div className="lg:col-span-5 bg-slate-950/50 p-3 rounded-2xl border border-white/5 flex flex-col min-h-0">
          <div className="flex bg-slate-950 p-1 rounded-xl shrink-0 gap-1 border border-white/5 mb-3">
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${activeTab === "unread" ? "bg-purple-600 text-white shadow-md shadow-purple-500/10" : "text-slate-400 hover:text-white"}`}
            >
              <Inbox className="w-3 h-3" /> 待读桌案 ({unreadLetters.length})
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${activeTab === "archived" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <BookOpen className="w-3 h-3" /> 已阅信扎 ({archivedLetters.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {activeTab === "unread" ? (
              unreadLetters.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Mail className="w-8 h-8 mx-auto text-slate-700 stroke-[1.5]" />
                  <p className="text-[10px]">桌膛里空空的，目前没有未读的手手信呢。</p>
                  <p className="text-[9px] text-slate-600">点击右上角“邮递员送件”或让AI起草定制来信吧！</p>
                </div>
              ) : (
                unreadLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => handleReadLetter(letter)}
                    className="group bg-[#0f121d] border border-white/5 hover:border-pink-500/50 rounded-2xl p-3.5 cursor-pointer shadow-lg relative overflow-hidden transition-all duration-300 active:scale-[0.98] hover:translate-y-[-2px] flex flex-col justify-between"
                  >
                    {/* Retro Stamp Ornament styling */}
                    <div className="absolute top-1.5 right-1.5 bg-pink-500/10 text-pink-400/80 font-serif border border-pink-500/20 text-[7px] px-1 rounded-sm uppercase tracking-tighter">
                      {letter.themeColor.stamp}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
                        <span className="text-[10px] text-slate-400 font-mono font-bold">{letter.fanTypeName}</span>
                      </div>
                      <h4 className="text-[11px] font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                        {letter.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                        {letter.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                      <div className="flex items-center gap-1 text-[8px] text-amber-400 font-mono">
                        <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
                        <span>阅得疗效: 精神压力{letter.stressEffect} | 精力+{letter.energyEffect}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-slate-500 font-mono">收于 Day {letter.receivedDay}</span>
                        <button
                          onClick={(e) => handleDeleteLetter(letter.id, e)}
                          className="p-1 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors text-slate-500 cursor-pointer"
                          title="销毁信件"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              archivedLetters.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-[10px]">没有旧信，常打开看心连心。</p>
                </div>
              ) : (
                archivedLetters.map((letter) => (
                  <div
                    key={letter.id}
                    onClick={() => setSelectedLetter(letter)}
                    className={`bg-slate-900/60 border ${selectedLetter?.id === letter.id ? "border-purple-500 text-purple-200" : "border-white/5"} rounded-xl p-3 cursor-pointer hover:bg-slate-900 transition-all`}
                  >
                    <div className="flex justify-between items-center text-[9px] mb-1">
                      <span className="text-slate-450 font-bold">{letter.fanTypeName} • {letter.sender}</span>
                      <span className="text-slate-500">Day {letter.receivedDay} 已读</span>
                    </div>
                    <h5 className="text-[10px] font-bold truncate text-slate-200">{letter.title}</h5>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Side: Handwritten Realistic Styled Letter Pad Viewer */}
        <div className="lg:col-span-7 bg-slate-950/40 rounded-2xl border border-white/5 p-4 flex flex-col min-h-0 relative">
          {selectedLetter ? (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-200">
              
              {/* Outer physical letter head wrap */}
              <div className="flex-1 overflow-y-auto bg-[#efeae3] rounded-2xl p-5 md:p-6 text-slate-800 flex flex-col justify-between shadow-inner relative border-2 border-[#d9d2c2]">
                
                {/* Vintage Letter watermark and grids decoration */}
                <div className="absolute top-4 right-4 text-[9px] font-serif border-2 border-dashed border-slate-500/25 p-2 rounded transform rotate-3 text-slate-600/60 pointer-events-none select-none">
                  <div>POST CARD</div>
                  <div className="text-[8px] font-mono mt-0.5">{selectedLetter.themeColor.stamp}</div>
                  <div className="text-[7.5px] mt-0.2">SEOUL-CITY MAILS</div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-slate-350 pb-2.5">
                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wide">
                      {selectedLetter.fanTypeName} · {selectedLetter.sender}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-2 font-serif">
                      {selectedLetter.title}
                    </h3>
                  </div>

                  {/* Letter Content Styled like real hand-writing script */}
                  <div className="text-xs text-slate-850 whitespace-pre-line leading-relaxed tracking-wide font-sans text-justify md:text-left pr-1 select-text selection:bg-pink-500/30 selection:text-slate-950 font-medium">
                    {selectedLetter.content}
                  </div>
                </div>

                <div className="border-t border-slate-350/50 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="text-[9px] text-slate-600 leading-normal">
                    <div className="flex items-center gap-1 font-bold">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span>粉丝真实意念反哺效果已达成:</span>
                    </div>
                    <div className="font-mono mt-0.5 text-slate-700">
                      焦虑压力(Stress): <strong className="text-emerald-700">{selectedLetter.stressEffect} 点</strong> | 
                      身心体力(Energy): <strong className="text-indigo-700">+{selectedLetter.energyEffect} 点</strong> |
                      知名人气(Pop): <strong className="text-purple-700">+{selectedLetter.popularityEffect}%</strong>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto text-right font-serif">
                    <span className="text-[10px] text-slate-600 block">寄件人: <strong className="text-slate-900">{selectedLetter.sender}</strong></span>
                    <span className="text-[9px] text-slate-500 font-mono">寄于首尔宿舍 • 模拟天数 Day {selectedLetter.receivedDay}</span>
                  </div>
                </div>

              </div>
              
              {/* Back controls */}
              <div className="mt-3 flex justify-between gap-2 shrink-0">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-2xs rounded-xl font-bold transition-all cursor-pointer"
                >
                  关闭阅读器
                </button>
                <button
                  onClick={(e) => {
                    handleDeleteLetter(selectedLetter.id, e);
                    setSelectedLetter(null);
                  }}
                  className="px-4 py-1.5 bg-red-950/50 hover:bg-red-900 text-red-300 text-2xs rounded-xl font-bold transition-all cursor-pointer border border-red-500/10"
                >
                  粉碎销毁此信
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
              <MailOpen className="w-10 h-10 mx-auto text-slate-700 animate-bounce duration-1000" />
              <div className="max-w-xs space-y-1.5">
                <p className="text-xs font-bold text-slate-400">目前没有正在翻阅的信件</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  请在左侧待读桌案或归档扎中，点击任意一封信开始拆阅！拆信不仅能获取大量温暖，还能降低身心值、恢复精力！
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
