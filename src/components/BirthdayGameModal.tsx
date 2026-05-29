import { useState } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { Sparkles, Cake, Gift, Heart, Tv, Award, Smile, CheckCircle2 } from "lucide-react";

interface BirthdayGameModalProps {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  onComplete: (updatedPersona: IdolPersona) => void;
  onAddLog: (log: string) => void;
}

export default function BirthdayGameModal({
  persona,
  teammates,
  onComplete,
  onAddLog
}: BirthdayGameModalProps) {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);

  // Selections
  const [phase1Selected, setPhase1Selected] = useState<number | null>(null);
  const [phase2Selected, setPhase2Selected] = useState<number | null>(null);
  const [phase3Selected, setPhase3Selected] = useState<number | null>(null);

  // Cumulative adjustments
  const [rewards, setRewards] = useState({
    popularity: 0,
    reputation: 0,
    energy: 0,
    stress: 0,
    money: 0,
    debtReduction: 0,
    teammatesFavorability: 0,
    vocalSkill: 0,
    danceSkill: 0,
    varietySkill: 0,
    skinCondition: persona.skinCondition
  });

  const handleSelectPhase1 = (option: number) => {
    setPhase1Selected(option);
    let pop = 0;
    let rep = 0;
    let nrg = 0;
    let str = 0;
    let tf = 0;
    let logStr = "";

    if (option === 1) {
      logStr = "你感动得抱住队友们大哭并吃掉大草莓。队友关系空前升温！";
      tf = 15;
      str = -20;
      nrg = 15;
    } else if (option === 2) {
      logStr = "你理智优雅地对镜头摆出返图完美表情。粉丝被惊艳生日生图秒出圈！";
      pop = 100000;
      rep = 5;
      varietySkill: 3;
    } else {
      if (persona.relationshipStatus === "dating" || persona.relationshipStatus === "revealed") {
        logStr = `在这个特别的日子，你心底泛起涟漪，脑海中全是秘密爱人 ${persona.loverName || "林舒阳"} 的手写贺卡：【做你的底气】。`;
        str = -35;
        nrg = 10;
      } else {
        logStr = "你默默许愿：早日解除清算，成为登顶大赏的顶流！你内心充满搞事业的无限干劲。";
        str = -25;
        nrg = 20;
        rep = 5;
      }
    }

    onAddLog(`【生日限定剧情】${logStr}`);
    setRewards(r => ({
      ...r,
      popularity: r.popularity + pop,
      reputation: r.reputation + rep,
      energy: Math.min(100, r.energy + nrg),
      stress: r.stress + str,
      teammatesFavorability: r.teammatesFavorability + tf
    }));

    setTimeout(() => {
      setPhase(2);
    }, 1800);
  };

  const handleSelectPhase2 = (option: number) => {
    setPhase2Selected(option);
    let pop = 0;
    let rep = 0;
    let str = 0;
    let vs = 0;
    let ds = 0;
    let tf = 0;
    let logStr = "";

    if (option === 1) {
      const isSkilled = (persona.vocalSkill || 30) >= 40 || (persona.danceSkill || 30) >= 40;
      if (isSkilled) {
        logStr = "直播中展现顶级声演实力，弹幕疯狂点赞支持，口碑逆天！";
        pop = 220000;
        rep = 8;
        vs = 2;
      } else {
        logStr = "虽然气息微微带喘，但诚意满满的生唱打动了在场直播的所有唯粉！";
        pop = 140000;
        rep = 4;
        vs = 1;
      }
    } else if (option === 2) {
      logStr = "各种wink和双马尾/兔耳朵情话大派送，韩网粉丝心碎大喊『怎么会这么可爱欧尼』！";
      pop = 280000;
      str = 10;
    } else {
      const mateName = teammates.length > 0 ? teammates[0].name : "队内好友";
      logStr = `邀请了队内人气队友 ${mateName} 友情出镜，直播内鬼故事互相大爆黑历史，CP超级出圈！`;
      pop = 250000;
      tf = 10;
    }

    onAddLog(`【生日限定 W-LIVE】${logStr}`);
    setRewards(r => ({
      ...r,
      popularity: r.popularity + pop,
      reputation: r.reputation + rep,
      stress: r.stress + str,
      vocalSkill: r.vocalSkill + vs,
      danceSkill: r.danceSkill + ds,
      teammatesFavorability: r.teammatesFavorability + tf
    }));

    setTimeout(() => {
      setPhase(3);
    }, 1800);
  };

  const handleSelectPhase3 = (option: number) => {
    setPhase3Selected(option);
    let debtRed = 0;
    let pop = 0;
    let rep = 0;
    let cash = 0;
    let str = 0;
    let skin: IdolPersona["skinCondition"] = persona.skinCondition;
    let logStr = "";

    if (option === 1) {
      if (persona.startType === "trainee") {
        logStr = "社长特许：生日回馈减免 ₩4,000w 的练习生清算前长约高额债务！";
        debtRed = 4000;
      } else {
        logStr = "生日特殊大赏红利发放：结算账户直接派发 ₩2,500w 可支配奖金！";
        cash = 2500;
      }
    } else if (option === 2) {
      logStr = "身披 Dior/Chanel 生日名奢特别限时高订，机场神级名生图霸榜首尔时尚娱乐头条！";
      pop = 320000;
      rep = 15;
    } else {
      logStr = "公司江南顶级会所敷麻，LDM水光注入，你的皮肤条件完美自愈，疲惫风暴全扫！";
      skin = "perfect";
      str = -50;
    }

    onAddLog(`【生日大牌资源】${logStr}`);
    setRewards(r => ({
      ...r,
      popularity: r.popularity + pop,
      reputation: r.reputation + rep,
      money: r.money + cash,
      debtReduction: debtRed,
      stress: r.stress + str,
      skinCondition: skin
    }));

    setTimeout(() => {
      setPhase(4);
    }, 1800);
  };

  const handleClaimAndClose = () => {
    // Apply final sum to copy
    const p = { ...persona };

    // Increase stats
    p.popularity = Math.min(100, p.popularity + Math.floor(rewards.popularity / 10000)); // normalized popup multiplier
    p.reputation = Math.max(0, Math.min(100, p.reputation + rewards.reputation));
    p.energy = Math.max(0, Math.min(100, p.energy + rewards.energy));
    p.stress = Math.max(0, Math.min(100, Math.max(0, p.stress + rewards.stress)));
    p.teammatesFavorability = Math.max(0, Math.min(100, p.teammatesFavorability + rewards.teammatesFavorability));
    
    // Skills
    p.vocalSkill = Math.min(100, p.vocalSkill + rewards.vocalSkill);
    p.danceSkill = Math.min(100, p.danceSkill + rewards.danceSkill);
    
    // Debt & Cash split
    if (p.startType === "trainee") {
      p.traineeDebt = Math.max(0, p.traineeDebt - rewards.debtReduction);
      p.money = p.money + 50; // extra cash
    } else {
      p.money = p.money + rewards.money;
    }

    // Fans count direct modifier based on popularity explosion
    p.fansCount = p.fansCount + rewards.popularity;
    p.skinCondition = rewards.skinCondition;

    onComplete(p);
  };

  return (
    <div id="birthday-game-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[300] p-4 select-none">
      <div className="bg-[#0b0e17] border-2 border-pink-500/35 rounded-[28px] max-w-xl w-full p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Sparkly Background visuals */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header indicator */}
        <div className="flex items-center gap-3 border-b border-pink-500/15 pb-4 mb-5">
          <div className="bg-pink-500/20 text-pink-400 p-2.5 rounded-2xl">
            <Cake className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase font-mono tracking-widest text-pink-400">
              SPECIAL ANNIVERSARY EVENT
            </span>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              🎂 {persona.stageName} 的生日限时惊喜大赏剧情！
            </h2>
          </div>
        </div>

        {/* Phase 1: Interactive Practice Room surprise */}
        {phase === 1 && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-pink-300 mb-1">【江清潭洞 企划社练习室】</p>
              夜里十一点，当你做完最后的平衡拉伸刚要收拾包离开时，练习室的大灯突然熄灭。在一片寂静中，队友们手里捧着插着蜡烛的经典红丝绒奶油蛋糕缓缓推门进来，欢快的生日歌响彻整座空旷安静的公司大楼。
              {persona.relationshipStatus === "dating" && (
                <span className="text-pink-300 font-medium">（特别提醒：由于你目前处于恋爱，在保姆车的暗匣里还惊喜放有一条写有温暖情话的手作香芬卡片！）</span>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">🕯️ 吹灭蜡烛并接受这份纯真情谊：</span>
              
              <button 
                onClick={() => handleSelectPhase1(1)}
                disabled={phase1Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase1Selected === 1 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">🍓</span>
                <div>
                  <p className="font-bold text-slate-200">嗷呜吃掉最大的那颗草莓并紧搂大家大哭</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">温暖真实的互动极度治愈！队友默契与好感度疯狂大涨，精神压力得到大幅释放。</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase1(2)}
                disabled={phase1Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase1Selected === 2 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">📸</span>
                <div>
                  <p className="font-bold text-slate-200">极具镜头感地轻抚发丝、甜笑摆拍名星生图</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">时刻谨记偶像专业修养。生图返图在论坛流传并光速登上热门，人气与表现力见涨。</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase1(3)}
                disabled={phase1Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase1Selected === 3 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">❤️</span>
                <div>
                  <p className="font-bold text-slate-200">
                    {persona.relationshipStatus === "dating" || persona.relationshipStatus === "revealed" ? "阅读秘密恋人寄来的精致贺卡并会心甜笑" : "双手合十，默默许下自己登顶大赏的事业心愿"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {persona.relationshipStatus === "dating" || persona.relationshipStatus === "revealed" ? `【恋爱专属祝福】静静感悟 ${persona.loverName} 的甜蜜鼓舞，长夜中不再有压力寒冬。` : "内心充盈搞事业的钢铁信念，获得极强的体能充沛感！"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Live chat feed Q&A mini game */}
        {phase === 2 && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-indigo-300 mb-1">【W-LIVE 生日感谢专属直播】</p>
              你开启了久违的生日庆祝直播！短短几分钟，中、韩、日、西方数十万在线粉丝瞬间将直播间塞爆！飞快的滚动弹幕和漫天的粉丝吹捧让你应接不暇。你需要挑选最适合今晚的互动回馈方式：
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">🎙️ 挑选您在今晚直播的主打卖点与大秀：</span>
              
              <button 
                onClick={() => handleSelectPhase2(1)}
                disabled={phase2Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase2Selected === 1 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">🎤</span>
                <div>
                  <p className="font-bold text-slate-200">硬核清唱！生日专属生演高保真声带大秀</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    用扎实、极具画面穿透感的底气生唱回报粉丝。如果你的 <strong>声乐或舞蹈技能 ≥ 40</strong> 能够赢得神级讨论狂澜！
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase2(2)}
                disabled={phase2Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase2Selected === 2 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">🐰</span>
                <div>
                  <p className="font-bold text-slate-200">元气拉满！各种兔耳撒娇、Wink与粉丝情话连弹</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    极致的媚粉撒娇让唯粉彻底窒息，海外金主和妈粉、男友粉疯狂点赞塞爆打赏，直接实现人气大爆炸！
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase2(3)}
                disabled={phase2Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase2Selected === 3 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">✨</span>
                <div>
                  <p className="font-bold text-slate-200">拉来队内人气队友友情入镜、全网CP粉狂欢</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    让组合成员抱在一起吹蜡烛，互相讲述练习生期的沙雕黑历史，CP粉喜迎合规过节，团队好感度直线上升。
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Premium payout option */}
        {phase === 3 && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-semibold text-yellow-400 mb-1">【企划社李社长的生日黄金特免契礼】</p>
              看到你最近飙升的粉丝黏度以及超话人气，社长（代表）面心大慰，并亲自在年末预算中特批了仅限于生日当天提取的三个高额重置权益包之一。你要带走哪一份生日贺礼？
            </div>

            <div className="space-y-2.5 pt-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">🎁 单选挑选你的年度金牌契约特权：</span>
              
              <button 
                onClick={() => handleSelectPhase3(1)}
                disabled={phase3Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase3Selected === 1 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">💸</span>
                <div>
                  <p className="font-bold text-slate-200">
                    {persona.startType === "trainee" ? "【免清算减债】社长特许：折抵 ₩4,000w 练习生合约欠款" : "【大赏预支金】直接入账 ₩2,500w 可自由支配可提现纯奖金"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    {persona.startType === "trainee" ? "最直接的解债黄金途径！免除 4000w 长久压抑在身上的沉重训练和江南美容债务。" : "直接向可支配金融资产里划拨大笔资金！大牌理财、私人宿舍采购有大底气。"}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase3(2)}
                disabled={phase3Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase3Selected === 2 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">🧥</span>
                <div>
                  <p className="font-bold text-slate-200">【顶奢时尚神图】由 Chanel/Dior 送抵的顶级时尚私服限时穿戴</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    全身披挂闪亮的秋季限定重头时装，在年末红毯或下车路直面万千摄影，狂涨超凡粉丝人气 320,000 位！
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleSelectPhase3(3)}
                disabled={phase3Selected !== null}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer select-none active:scale-98 ${phase3Selected === 3 ? "bg-pink-950/30 border-pink-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-900/40"}`}
              >
                <span className="text-xl">🛁</span>
                <div>
                  <p className="font-bold text-slate-200">【极上自愈】全套江南高级皮秒水光疗愈 + 自死忠安神深度Spa</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    将积攒的一切疲劳、红肿、暗沉一扫而光！皮肤状态直接调回 <strong>完美 (perfect)</strong>，精神压力与疲惫值双双大雪崩清零！
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Special summaries and claim button */}
        {phase === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-3 border border-pink-505/20 animate-pulse">
                <Gift className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-base font-black text-slate-100">🎂 生日特别大礼包清点完成！</h3>
              <p className="text-xs text-slate-400 mt-1">恭喜您，艺能生涯的这个生日极具意义且硕果累累：</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-450">📈 斩获全网死忠粉:</span>
                <span className="text-pink-300 font-bold font-mono">+{rewards.popularity.toLocaleString()} 粉丝</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-450">🛡️ 积累美誉星级:</span>
                <span className="text-indigo-300 font-bold font-mono">+{rewards.reputation} 星</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-450">🧩 队友关怀度:</span>
                <span className="text-amber-300 font-bold font-mono">+{rewards.teammatesFavorability} 恩度</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-450">⏳ 精神压力值:</span>
                <span className="text-emerald-300 font-bold font-mono">{rewards.stress} 降温</span>
              </div>
              
              {persona.startType === "trainee" ? (
                <div className="flex justify-between items-center bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/15 col-span-2">
                  <span className="text-purple-300 font-sans font-bold flex items-center gap-1">💸 企划社长生日特赦免债:</span>
                  <span className="text-white font-black font-mono">减免 ₩{(rewards.debtReduction).toLocaleString()}w</span>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/15 col-span-2">
                  <span className="text-emerald-300 font-sans font-bold flex items-center gap-1">💰 生日大赏直派金奖:</span>
                  <span className="text-white font-black font-mono">+ ₩{rewards.money.toLocaleString()}w 可支配</span>
                </div>
              )}

              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-white/5 col-span-2">
                <span className="text-slate-350">🧬 宿损皮肤净化:</span>
                <span className={`font-bold font-sans px-2 py-0.5 rounded text-[10px] uppercase text-white bg-indigo-600/30 border border-indigo-500/25`}>
                  {rewards.skinCondition === "perfect" ? "完美皮肤完美复甦" : "气色微微见好"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClaimAndClose}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-pink-600/15 flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                我已知悉，吹灭蜡烛并确认收获生日红利包
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
