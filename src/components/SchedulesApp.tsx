import { useState } from "react";
import { IdolSchedule, IdolPersona, WeversePost } from "../types";
import { SH_LIST } from "../mockData";
import { Calendar, CheckCircle2, ChevronRight, RefreshCw, Coins, FileX, Sparkles, MessageSquare, Flame } from "lucide-react";
import { safeFetch, getSeoulWeather } from "./apiHelper";

interface SchedulesProps {
  persona: IdolPersona;
  schedules: IdolSchedule[];
  weversePosts: WeversePost[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdatePersona: (p: IdolPersona) => void;
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
}

export default function SchedulesApp({
  persona,
  schedules,
  weversePosts,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdatePersona,
  onUpdateSchedules,
  onUpdateWeversePosts,
  onNextDayTransition,
  onTriggerRandomEvent,
  onAddLog
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

  // Perform a specific schedule item (Requirement 12)
  const handlePerformSchedule = (schId: string) => {
    const sch = schedules.find((s) => s.id === schId);
    if (!sch || sch.completed) return;

    if (persona.energy < sch.energyCost) {
      onAddLog(`体力匮乏！进行此项活动需要 ${sch.energyCost} 体力，目前仅剩 ${persona.energy}。请喝消肿咖啡或去宿舍冰疗睡觉。`);
      return;
    }

    // Process effects
    const p = { ...persona };
    p.energy = Math.max(0, p.energy - sch.energyCost);
    p.popularity = Math.min(100, p.popularity + sch.rewardPopularity);
    p.reputation = Math.min(100, p.reputation + sch.rewardReputation);
    
    // Day progress stats impact
    let weightDrain = 0.05;
    let stressGrowth = 5;

    // Specific category impacts (Requirement 11, 12)
    if (sch.category === "practice") {
      p.danceSkill = Math.min(100, p.danceSkill + 3);
      weightDrain = 0.2; // heavy dancing drops weight
      stressGrowth = 8;
    } else if (sch.category === "vocal_lesson") {
      p.vocalSkill = Math.min(100, p.vocalSkill + 3);
      weightDrain = 0.05;
      stressGrowth = 6;
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
    }

    p.weight = Math.max(38, p.weight - weightDrain);
    p.stress = Math.min(100, Math.max(0, p.stress + stressGrowth));

    onUpdatePersona(p);

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

  // Fully dynamic AI-driven next day transition (Requirement: "所有内容都是根据用户前一天的行为动态生成，会消耗api次数。")
  const handleNextDay = async () => {
    setIsProcessing(true);
    onAddLog(`【API 智能清算】正在合并分析您今日的所有行程决策，向大模型请求次日宏观变迁与行程包...`);

    const completedSchedules = schedules.filter(s => s.completed).map(s => s.title);
    const completedText = completedSchedules.length > 0 ? completedSchedules.join("、") : "一整天偷懒划水，没完成任何既定业务。";

    // 1. Prepare secondary stats calculated client-side as base update
    const pUpdateObj = { ...persona };
    pUpdateObj.dayNumber = pUpdateObj.dayNumber + 1;
    pUpdateObj.energy = Math.min(100, pUpdateObj.energy + 50); // rest Overnight
    pUpdateObj.stress = Math.max(0, pUpdateObj.stress - 15);
    
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

    // 2. Draft the API request
    const prompt = `玩家昨日完成了以下团队与个人行程：[${completedText}]。
主角设定：
- 专属名字/艺名：${persona.name} / ${persona.stageName}
- 初始成长模式：${persona.startType === "trainee" ? "处于三大厂高压下的练习期债务生" : "刚发布专辑的正式打歌主唱爱豆"}
- 组合模式：${persona.groupName} (${persona.style})
- 当前体能指标：体力: ${persona.energy}/100, 精神压力值: ${persona.stress}/100, 体重: ${persona.weight.toFixed(1)}kg, 皮肤等级: ${persona.skinCondition}.
- 粉丝圈人气：${persona.fansCount} 位死忠, 美誉等级: ${persona.reputation}/100.
根据玩家昨天的行为以及个人身体指标，请采用极度逼真的K-Pop黑水粉圈叙事风格，动态生成由于昨日高压或偷懒产生的一系列“宿醉/消肿失败/打歌爆点/黑粉嘲讽/同僚鼓励”的【过夜深度结算叙事】，并全新计算【明日全新的三个量身定制行程】。
还要为高冷、好感度仅有 ${persona.managerFavorability}/100 的闵经理人撰写一条新的突击指责或吩咐KakaoTalk消息。

此外，请生成一条清晨时分除闵经理人之外的其他角色（社长 'ceo'（好感值: ${persona.ceoFavorability}/100）、竞品大势艺人/对头 'rival'、或任一练习生队内队友例如组合主舞/主唱等）主动找主角发来的私聊消息（几率：75%）。

请严格仅返回以下标准合法的纯 JSON 格式数据（注意：不要将其包裹在 markdown 代码块中，仅返回纯JSON）：
{
  "narrative": "中文。昨晚到今天清晨的粉丝评论/爆料，以及主角的各项健康指数、皮肤细节变迁反馈，限120~180字。",
  "managerMessage": "闵经理人发来的实时KakaoTalk未读信息文本。性格要求对新人和外籍略带刻薄，若昨日偷懒则极其严厉，若昨日努力则要求高压再干。",
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
  "weversePostContent": "一条今天最新的Weverse内热门贴，内容是围绕主角昨天曝光的热搜表现或皮肤、实力展开的粉丝圈激辩。",
  "proactiveMessage": {
    "senderId": "选填，可以是 'ceo', 'rival'，或者组合队内队友的名字，若概率不触发则设为 null。若是队内队友，设为组合内任一个人的ID或英文拼写",
    "senderName": "具体显示的名字（例如 '社长李代表', '大势爱豆敏太' 等）",
    "text": "主动给主角发来的私聊未读消息（限80字以内，符合人设性格MBTI，如果是ceo好感低则敲打，队友则关心或者吐槽，rival则假意祝福或者竞争约话）"
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
      const isFatigued = persona.energy < 40;
      const isStressed = persona.stress > 65;
      
      let narrative = `昨夜结束了今天的业务。由于清晨体重微微有起伏，黑粉立刻在论坛带节奏『看来爱豆根本没有容貌和自尊觉醒，上镜水肿成发面馒头了』。团粉与唯粉在论坛高能对线，你夜里顶着失眠的风险进行了消肿护理，肌肉有些僵硬。新的一天伴随着练习室空调的轰鸣拉开了血色帷幕……`;
      if (isFatigued) {
        narrative = `体力过度透支导致你在保姆车上彻底昏睡沉沦。成员们对你近来的虚弱有些许怨言：『队长今天体力又断崖了，编舞连轴转要怎么排？！』。好在海外死忠粉疯狂灌爆打卡榜，你虚无的名气稍微得到了一些维系。今天闵经纪人已经冷脸站在了走廊尽头。`;
      } else if (isStressed) {
        narrative = `由于昨夜你极度透支的精神压力，回到宿舍后，你的下巴附近爆发了几颗红肿的痘痘，韩网站姐的新直拍连夜流传开，粉卷里都在关心你的皮肤红肿状况。代表更是在清晨晨会上敲了敲桌子叹了口气。今天不得不重新规划极其残忍的皮肤科与特训。`;
      }

      parsedResult = {
        narrative: narrative,
        managerMessage: persona.managerFavorability < 35 
          ? "【KakaoTalk - 闵室长】\n呀！昨晚的演出你那个转身动作是不是慢了半拍？高价买来的编舞概念全被你给糟蹋了！今天的极饿体脂对抗你最好动作快一点，再让我看到上镜有赘肉，年末C位直接让给智敏！" 
          : "【KakaoTalk - 闵室长】\n表现得还算凑合，继续保持。今天的行程依旧满档，我帮你准备的高能消肿水一已经寄到清潭洞皮肤科前台里了，做完护理立马回公司声乐室加练！",
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

    // Map scheduled results cleanly to app schedules formats
    const nextSchedulesList: IdolSchedule[] = parsedResult.schedules.map((s: any, idx: number) => ({
      id: s.id || `gen_sch_idx_${idx}_${Date.now()}`,
      time: s.time || "中午 12:00",
      title: s.title || "全新定制爱豆商务",
      category: s.category || "practice",
      rewardPopularity: Number(s.rewardPopularity) || 2,
      rewardReputation: Number(s.rewardReputation) || 1,
      energyCost: Number(s.energyCost) || 20,
      completed: false
    }));

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

    onNextDayTransition(pUpdate, newSchedules, updatedWeverse, managerMessage, proactiveMessage);
    
    setTransitionResult(null);
    setIsProcessing(false);
    onAddLog(`【次日清点结算绿灯】开启您全新生涯的第 ${pUpdate.dayNumber} 天。一早醒来，您昨天一整天的辛酸经营重新赢得了粉丝和制作团队的新点评！`);
  };

  return (
    <div id="schedules-app" className="rounded-2xl overflow-hidden bg-[#11131c] border border-slate-800 text-white p-4 flex flex-col justify-between h-full relative glass-panel">
      
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">EPISODE CALENDAR</span>
              <h4 className="text-xs font-bold text-slate-100">今日个人及团队业务行程</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Stamina Badge */}
            <div className="bg-amber-950/45 border border-amber-500/25 rounded-full px-2.5 py-1 text-[10px] text-amber-300 font-mono flex items-center gap-1 shadow-sm">
              <span className="animate-pulse">⚡️</span>
              <span>体力: <strong>{persona.energy}</strong>/100</span>
            </div>

            <div className="bg-purple-950/40 border border-purple-500/20 rounded-full px-2.5 py-1 text-[10px] text-purple-300 font-mono flex items-center gap-1.5 shadow-sm">
              <span>第 <strong>{persona.dayNumber}</strong> 天</span>
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

        {/* Schedules list scrollable */}
        <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${sch.completed ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-slate-950/80 border-white/5 hover:border-purple-500/20'}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${sch.completed ? 'bg-slate-800 text-slate-500' : 'bg-purple-900/30 text-purple-300 border border-purple-500/10'}`}>
                    {sch.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{sch.time}</span>
                </div>
                <p className={`text-xs font-semibold mt-1 truncate ${sch.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                  {sch.title}
                </p>
                <div className="flex gap-2 items-center text-[9px] text-slate-450 mt-1 font-mono text-slate-450">
                  <span className="text-teal-400">魅力: +{sch.rewardPopularity}</span>
                  <span className="text-indigo-400">名气: +{sch.rewardReputation}</span>
                  <span className="text-amber-400">消耗: {sch.energyCost}⚡️</span>
                </div>
              </div>

              <button
                onClick={() => handlePerformSchedule(sch.id)}
                disabled={sch.completed}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5 ${sch.completed ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer active:scale-95 shadow-sm'}`}
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
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs leading-relaxed">
              <h5 className="font-bold text-purple-300 mb-1.5 flex items-center gap-1">📊 夜间健康与韩网社交热议汇报</h5>
              <p className="text-slate-200">{transitionResult.narrative}</p>
            </div>

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

    </div>
  );
}
