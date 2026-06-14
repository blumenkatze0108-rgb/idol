import { useState, useEffect } from "react";
import { IdolSchedule, IdolPersona, WeversePost, getCalendarPeriod } from "../types";
import { SH_LIST } from "../mockData";
import { Calendar, CheckCircle2, ChevronRight, RefreshCw, Coins, FileX, Sparkles, MessageSquare, Flame, AlertCircle } from "lucide-react";
import { safeFetch, getSeoulWeather } from "./apiHelper";

export function getFixedSkillSchedules(dayN: number, cycleDays: number = 36): IdolSchedule[] {
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
      title: `【${period.text}·固定舞蹈课】高强度超整齐刀群舞角度肢体节拍矫正 💃`,
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
  onBlockingChange?: (blocking: boolean) => void;
}

export default function SchedulesApp({
  persona,
  personas = [],
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

  useEffect(() => {
    if (onBlockingChange) {
      onBlockingChange(isProcessing || transitionResult !== null || emergencyHarassment !== null);
    }
  }, [isProcessing, transitionResult, emergencyHarassment, onBlockingChange]);

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
    const ageing_factor = Math.floor((pUpdateObj.dayNumber - 1) / (pUpdateObj.cycleDays || 36));
    pUpdateObj.ageing_factor = ageing_factor;
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

    // 2. Draft the API request with scientific BMI calculation from tomorrow's metrics
    const heightM = (pUpdateObj.height / 100);
    const calcBmi = (pUpdateObj.weight / (heightM * heightM)).toFixed(1);
    let bmiEvaluation = "";
    const bmiVal = parseFloat(calcBmi);
    if (bmiVal < 16.0) {
      bmiEvaluation = "骨感极度偏瘦型 (危及生体，部分粉丝或唯粉会公开心疼、怒骂公司压榨，也有黑粉嘲讽『病态骷髅骨相』)";
    } else if (bmiVal < 17.5) {
      bmiEvaluation = "上镜完美爱豆标准型 (完美符合南韩神颜偶像的高冷标准，粉丝狂赞『神颜九头身、上镜绝美慵懒猫系冷脸纸片人』，但可能有路人、父母粉心疼觉得太瘦)";
    } else if (bmiVal < 18.5) {
      bmiEvaluation = "轻度偏瘦型 (粉丝普遍觉得挺好，但在极苛刻的高清打歌视频镜头下，部分挑剔黑粉和唯粉可能会评价肚子略微有肉)";
    } else if (bmiVal < 22.0) {
      bmiEvaluation = "健康正常状态 (普通人健全健康标准，但在苛刻畸形的韩娱饭圈，部分刻薄黑粉和激进毒唯会恶评攻击『上镜脸圆、发面馒头、不敬业、身材管理灾难偷吃零食』，而真爱粉则会出面努力反击黑子并呼吁健康)";
    } else {
      bmiEvaluation = "微胖偏重型 (已大幅超出南韩爱豆严酷出道红线，会遭到大范围脱粉，黑粉疯狂嘲讽『面如盆大、背影如熊、不务正业偷吃油腻汉堡炸鸡、男/女德大面积滑坡、职业道德彻底崩溃』)";
    }

    const prompt = `玩家昨日完成了以下团队与个人行程：[${completedText}]。
主角设定：
- 专属名字/艺名：${persona.name} / ${persona.stageName}
- 初始成长模式：${persona.startType === "trainee" ? "处于三大厂高压下的练习期债务生" : "刚发布专辑的正式打歌主唱爱豆"}
- 组合模式：${persona.groupName} (${persona.style})
- 当前体能指标（已安享一夜睡眠恢复后的明日真实体力）：体力值: ${pUpdateObj.energy}/100（提示：主角已经通过第二天的恢复机制得到了充足的精力充盈，不要再一味责备TA感到过度劳累 and 很虚弱了！）, 精神压力值: ${pUpdateObj.stress}/100, 身高: ${pUpdateObj.height}cm, 体重: ${pUpdateObj.weight.toFixed(1)}kg, 人体身体BMI值: ${calcBmi}, 胖瘦评估状态: ${bmiEvaluation}, 皮肤状况: ${pUpdateObj.skinCondition}.
- 粉丝圈人气：${pUpdateObj.fansCount} 位死忠, 美誉等级: ${pUpdateObj.reputation}/100.
- 职业资历与衰老成熟指数：ageing_factor: ${pUpdateObj.ageing_factor || 0}（说明：每 ${pUpdateObj.cycleDays || 36} 天为一个合约年。0 = 青涩活泼的新手练习生期；1 = 沉淀磨砺出的成熟过渡阶段；2 = 资深、练达、自持的K-Pop大前辈阶段；3+ = 殿堂级成熟前辈顶峰阶段，能自如控制情绪并宠辱不惊）。

请根据上述的 ageing_factor 资历指标，精准微调 AI 生成的角色对话语气（包括闵经理人发来的 managerMessage 消息以及主动找主角的 proactiveMessage.text 未读信息）：
- 如果 ageing_factor 为 0：角色言谈表现得非常直率、对新人严格，指导或嘱咐多带有教训和指点口吻。
- 如果 ageing_factor 为 1：由于艺人积累了一年多的行当沉淀，配角说话能微露出对你业务和心理成熟度的认可与尊重，不再一味怒骂。
- 如果 ageing_factor >= 2：语气转向极其稳重、妥帖、饱经世故的资深对话口吻，少了一些毛躁的呵斥敲打，多了一些对待行业资深老手、成熟老艺人的成熟理解，甚至会有更多的商务关切、顶层演艺方向寄语与稳重自持的信任嘱托。

请采用极度逼真的K-Pop黑水粉圈叙事风格，动态生成由于昨日高压或偷懒产生的一系列“宿醉/消肿失败/打歌爆点/黑粉嘲讽/同僚鼓励”的【过夜深度结算叙事】（请围绕上述具体BMI身材类型，让粉丝或黑粉在评论中激烈辩驳起来，使黑粉、唯粉和各路路人粉的激辩极其饱满、尖锐、贴合Kpop现实！）。并全新计算【明日全新的三个量身定制行程】。
还要为高冷、好感度仅有 ${pUpdateObj.managerFavorability}/100 的闵经理人撰写一条新的突击指责或吩咐KakaoTalk消息。

此外，请生成一条清晨时分除闵经理人之外的其他角色（社长 'ceo'（好感值: ${pUpdateObj.ceoFavorability}/100）、竞品大势艺人/对头 'rival'、或任一练习生队内队友例如组合主舞/主唱等）主动找主角发来的私聊消息（几率：75%）。

请严格仅返回以下标准合法的纯 JSON 格式数据（注意：不要将其包裹在 markdown 代码块中，仅返回纯JSON）：
{
  "narrative": "中文。昨晚到今天清晨的粉丝评论/爆料，以及主角的各项健康指数、皮肤细节变迁反馈，限120~180字。",
  "managerMessage": "根据 ageing_factor 特点撰写。闵经理人发来的实时KakaoTalk未读信息文本。性格要求对新人和外籍略带刻薄（在 ageing_factor = 0 时尤甚），若 ageing_factor 较高、昨日努力或好感度高则转为更专业稳健的工作探讨语调。",
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
    "text": "根据 ageing_factor 调优口吻。主动给主角发来的私聊未读消息（限80字以内，符合人设性格MBTI，如果是ceo好感低则敲打，队友则关心或者吐槽，rival则假意祝福或者竞争约话）"
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
      
      let narrative = `昨夜结束了今天的业务。由于清晨体重微微有起伏，黑粉立刻在论坛带节奏『看来爱豆根本没有容貌和自尊觉醒，上镜水肿成发面馒头了』。团粉与唯粉在论坛高能对线，你夜里顶着失眠的风险进行了消肿护理，肌肉有些僵硬。新的一天伴随着练习室空调的轰鸣拉开了血色帷幕……`;
      if (isFatigued) {
        narrative = `体力过度透支导致你在保姆车上彻底昏睡沉沦。成员们对你近来的虚弱有些许怨言：『队长今天体力又断崖了，编舞连轴转要怎么排？！』。好在海外死忠粉疯狂灌爆打卡榜，你虚无的名气稍微得到了一些维系。今天闵经纪人已经冷脸站在了走廊尽头。`;
      } else if (isStressed) {
        narrative = `由于昨夜你极度透支的精神压力，回到宿舍后，你的下巴附近爆发了几颗红肿的痘痘，韩网站姐的新直拍连夜流传开，粉卷里都在关心你的皮肤红肿状况。代表更是在清晨晨会上敲了敲桌子叹了口气。今天不得不重新规划极其残忍的皮肤科与特训。`;
      }

      let managerMessage = persona.managerFavorability < 35 
        ? "【KakaoTalk - 闵室长】\n呀！昨晚的演出你那个转身动作是不是慢了半拍？高价买来的编舞概念全被你给糟蹋了！今天的极饿体脂对抗你最好动作快一点，再让我看到上镜有赘肉，年末C位直接让给智敏！" 
        : "【KakaoTalk - 闵室长】\n表现得还算凑合，继续保持。今天的行程依旧满档，我帮你准备的高能消肿水一已经寄到清潭洞皮肤科前台里了，做完护理立马回公司声乐室加练！";

      const factor = pUpdateObj.ageing_factor || 0;
      if (factor === 1) {
        managerMessage = "【KakaoTalk - 闵室长】\n你已经度过了第一年的新手期，如今举手投足成熟沉稳了许多。今天的业务行程我发你了，放手去做，团队需要你拿出资深爱豆的担当和沉淀气质来，继续保持高标准运营！";
      } else if (factor >= 2) {
        managerMessage = "【KakaoTalk - 闵室长】\n作为厂牌的资深元老和大前辈，咱们之间就不用那些客套教训了。刚才和PD、李社长开会重点提了你接下来的长期演艺身价定位，希望今天你也能展现最巅峰和完美练达的舞台风范。";
      }

      let proactiveMsgObj = null;
      if (factor > 0) {
        const senderText = factor === 1 
          ? "【KakaoTalk - 社长李代表】\n不错，经过这一年的磨练你的行事说话是稳重成熟了不少。未来厂牌和新人的风向标还得看你的表现，加油吧。"
          : "【KakaoTalk - 社长李代表】\n刚才听闵经纪人说你在决策和应答方面大显沉稳练达的大前辈风采。我很欣慰能在这个顶峰期见证你心智的蜕变成熟，厂牌很看好你的高阶表现。";
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
    const fixedSchedules = getFixedSkillSchedules(pUpdateObj.dayNumber, pUpdateObj.cycleDays || 36);
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
    if (pUpdate.fansCount > 15000 && Math.random() < 0.6 && !emergencyHarassment) {
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
    <div id="schedules-app" className="rounded-2xl overflow-y-auto bg-[#11131c] border border-slate-800 text-white p-4 flex flex-col justify-between h-full min-h-0 relative glass-panel">
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">EPISODE CALENDAR</span>
              <h4 className="text-xs font-bold text-slate-100">今日个人及团队业务行程</h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
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

        {/* Schedules list scrollable */}
        <div className="space-y-1.5 overflow-y-auto max-h-[160px] xs:max-h-[200px] sm:max-h-[220px] md:max-h-[220px] pr-1 flex-1 min-h-0">
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
                <div className="flex gap-2 items-center text-[9px] text-slate-450 mt-1 font-mono text-slate-450 flex-wrap">
                  <span className="text-teal-400">魅力: +{sch.rewardPopularity}</span>
                  <span className="text-indigo-400">名气: +{sch.rewardReputation}</span>
                  <span className="text-amber-405">消耗: {sch.energyCost}⚡️</span>
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

    </div>
  );
}
