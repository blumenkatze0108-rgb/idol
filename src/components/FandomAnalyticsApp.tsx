import { useState } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { TrendingUp, User, ShieldAlert, Heart, Calendar, Activity, Zap, Coins, Sliders, Play } from "lucide-react";
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from "recharts";

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

export default function FandomAnalyticsApp({
  persona,
  teammates,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdatePersona,
  onAddLog
}: FandomAnalyticsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fandom" | "body" | "dermatology">("fandom");

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
    const p = { ...persona };

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
      onAddLog("【江南清潭洞皮肤科】您完成了LDM童颜超声波维稳，面部重新焕发出健康蜜桃光泽，疲劳有所缓解！");
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
      onAddLog("【江南清潭洞皮肤科】打完高级胶原蛋白水光针！虽然针口有些红肿微疼，但2D无底妆素颜状态达到了巅峰！");
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
      onAddLog("【江南清潭洞皮肤科】接受了高端热玛吉(Thermage FLX)面部抗衰提拉。下颌线清晰到能削苹果，路人缘与精美度大幅提升！");
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
      onAddLog("【急速排水】您空腹灌下了两杯超浓缩冰美式，并进行了面部刮痧，体重急速下降了 0.3kg！");
    }

    onUpdatePersona(p);
  };

  // Slimming purchases (Requirement 11, 12)
  const handleFasting = () => {
    const p = { ...persona };
    p.weight = Math.max(38, p.weight - 0.7);
    p.energy = Math.max(5, p.energy - 25); // very exhausting!
    p.stress = Math.min(100, p.stress + 18);
    // Bad for skin
    p.skinCondition = "troubled";
    onAddLog("【极端消肿】连续24小时无盐断食。体重狂掉 0.7kg，但你已经眼冒金星，面色缺乏血气，皮肤开始粗糙。");
    onUpdatePersona(p);
  };

  const handlePilates = () => {
    const cost = 45;
    const p = { ...persona };
    if (p.money < cost && p.startType === "idol") {
      onAddLog("资金不足！普拉提1对1私教课程需要 ₩45万。");
      return;
    }
    p.money = Math.max(0, p.money - cost);
    p.weight = Math.max(38, p.weight - 0.2);
    p.danceSkill = Math.min(100, p.danceSkill + 4);
    p.energy = Math.max(0, p.energy - 12);
    p.stress = Math.max(0, p.stress - 8); // destress!
    onAddLog("【普拉提塑形】伴随着优美的古典配乐，您拉伸了韧带及马甲线。核心控制力与核心舞感舞蹈技巧 (+4) 明显提高！");
    onUpdatePersona(p);
  };

  const handleFreeGym = () => {
    const p = { ...persona };
    p.energy = Math.max(0, p.energy - 20);
    p.weight = Math.max(38, p.weight - 0.1);
    p.vocalSkill = Math.min(100, p.vocalSkill + 1);
    p.stress = Math.min(100, p.stress + 6);
    onAddLog("【公司免费健身房】高强度深蹲与肺活量慢跑，流出了大汗，体力稍微提升，稍微有助于面部消肿。");
    onUpdatePersona(p);
  };

  const handleFriedChicken = () => {
    const cost = 3;
    const p = { ...persona };
    if (p.money < cost && p.startType === "idol") {
      onAddLog("资金不足！深夜炸鸡宵夜需要 ₩3万。");
      return;
    }
    p.money = Math.max(0, p.money - cost);
    p.weight = Math.min(80, p.weight + 0.5);
    p.energy = Math.min(100, p.energy + 30);
    p.stress = Math.max(0, p.stress - 15);
    onAddLog("【宿舍炸鸡宵夜】宿舍熄灯后偷偷点了一份韩式香脆炸鸡外卖。幸福满满，压力全消，体重健康增加 0.5kg！");
    onUpdatePersona(p);
  };

  const handleHanwoo = () => {
    const cost = 15;
    const p = { ...persona };
    if (p.money < cost && p.startType === "idol") {
      onAddLog("资金不足！特级炭火韩牛大餐需要 ₩15万。");
      return;
    }
    p.money = Math.max(0, p.money - cost);
    p.weight = Math.min(80, p.weight + 0.3);
    p.energy = Math.min(100, p.energy + 55);
    p.stress = Math.max(0, p.stress - 25);
    
    // Improve skin because of top tier collagen & protein
    if (p.skinCondition === "exhausted") p.skinCondition = "troubled";
    else if (p.skinCondition === "breakout") p.skinCondition = "troubled";
    else if (p.skinCondition === "troubled") p.skinCondition = "glowing";
    else if (p.skinCondition === "glowing" || p.skinCondition === "perfect") p.skinCondition = "perfect";

    onAddLog("【顶级烤韩牛】一顿滋滋作响的高级炭火大韩牛！优质蛋白充足恢复，精神焕发，压力狂降，皮肤甚至透亮了起来，体重健康增长 0.3kg！");
    onUpdatePersona(p);
  };

  const handleGainerShake = () => {
    const cost = 6;
    const p = { ...persona };
    if (p.money < cost && p.startType === "idol") {
      onAddLog("资金不足！专业高能碳水增肌奶昔需要 ₩6万。");
      return;
    }
    p.money = Math.max(0, p.money - cost);
    p.weight = Math.min(80, p.weight + 0.8);
    p.energy = Math.min(100, p.energy + 20);
    p.stress = Math.max(0, p.stress - 5);
    onAddLog("【清洁高卡碳水糊】饮用专业营养师配制的饱满干净增重燕麦燕麦糊。能量稳健，干净且规律地增重 0.8kg！");
    onUpdatePersona(p);
  };

  return (
    <div id="fandom-analytics-app" className="flex flex-col h-full rounded-2xl overflow-hidden bg-[#0d111a] border border-slate-800 text-white glass-panel">
      
      {/* Top Header Selector */}
      <div className="bg-[#161b26] p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-100">爱豆大健康与粉丝结构分析 App</h3>
            <p className="text-[9px] text-slate-400">查看网络粉丝情绪、进行江南皮肤科维护和体重三围控制</p>
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => setActiveSubTab("fandom")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all ${activeSubTab === "fandom" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            粉丝网评情感
          </button>
          <button
            onClick={() => setActiveSubTab("body")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all ${activeSubTab === "body" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            自我身材技能
          </button>
          <button
            onClick={() => setActiveSubTab("dermatology")}
            className={`px-3 py-1 text-[10px] rounded-lg transition-all ${activeSubTab === "dermatology" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}
          >
            江南美容/塑形
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[340px] md:max-h-[380px]">
        
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
                
                <div className="grid grid-cols-2 gap-3">
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

                  <div className="bg-[#1f293d]/30 p-2.5 rounded-xl border border-white/5 col-span-2">
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
            <div className="bg-[#121824] rounded-2xl p-4 border border-slate-800 grid grid-cols-2 gap-4">
              
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
              
              <div className="grid grid-cols-2 gap-3.5 text-xs">
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
              <span className="text-xs font-bold text-amber-400">🍲 爱豆高能营养膳食与健康增重补给</span>
              <p className="text-[10px] text-slate-400">提供高热量加餐。可在因过度节食或锻炼而体重偏轻、虚弱时进行健康增重增肌与压力释放。</p>

              <div className="grid grid-cols-3 gap-2.5 text-center mt-2.5">
                <button
                  onClick={handleFriedChicken}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 block">宿舍深夜炸鸡宵夜</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">费用 ₩3万。体重 +0.5kg，体力恢复 +30，压力舒缓 -15。</span>
                  </div>
                  <span className="text-[9px] text-amber-500 font-bold block bg-amber-950/20 py-0.5 rounded text-center">点外卖 (₩3w)</span>
                </button>

                <button
                  onClick={handleHanwoo}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-pink-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-pink-300 block">炭火顶级韩牛大餐</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">费用 ₩15万。体重 +0.3kg，体力 +55，压力 -25，明显改善肤质。</span>
                  </div>
                  <span className="text-[9px] text-pink-400 font-bold block bg-pink-950/20 py-0.5 rounded text-center">犒劳全牛 (₩15w)</span>
                </button>

                <button
                  onClick={handleGainerShake}
                  className="bg-slate-950 p-2 rounded-xl border border-white/5 hover:border-teal-500/20 transition-all text-left flex flex-col justify-between h-[105px] cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-300 block">高卡碳水燕麦奶昔</span>
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight">费用 ₩6万。体重 +0.8kg，体力 +20，科学干净地增重。</span>
                  </div>
                  <span className="text-[9px] text-teal-400 font-bold block bg-teal-950/20 py-0.5 rounded text-center">科学加餐 (₩6w)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
