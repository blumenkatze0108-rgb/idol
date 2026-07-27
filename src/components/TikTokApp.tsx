import { useState, useEffect } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { Send, Zap, Play, Flame, Film, UserMinus, Plus } from "lucide-react";
import { safeFetch } from "./apiHelper";

interface TikTokProp {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdateStats: (popularity: number, reputation: number, energy: number, stress: number) => void;
  onAddLog: (log: string) => void;
  personas?: IdolPersona[];
  tiktokVideos: VideoPost[];
  onUpdateTiktokVideos: (videos: VideoPost[]) => void;
}

interface VideoPost {
  id: string;
  title: string;
  danceChoice?: string;
  collabWith?: string;
  views?: number;
  likes?: number;
  shares?: number;
  viralIndex?: number; // 0-100
  time?: string;
}

export default function TikTokApp({
  persona,
  teammates,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdateStats,
  onAddLog,
  personas,
  tiktokVideos,
  onUpdateTiktokVideos
}: TikTokProp) {
  const [activeTab, setActiveTab] = useState<"feed" | "plan">("feed");
  const [danceChoice, setDanceChoice] = useState("新歌主打《Siren Dance》魔性震动挑战");
  const [collabPartner, setCollabPartner] = useState("solo");
  const [isShooting, setIsShooting] = useState(false);

  // Detail Modal popup states (Requirement: all posts clickable)
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
  const [customReplyText, setCustomReplyText] = useState("");
  const [addedReplies, setAddedReplies] = useState<Record<string, { author: string; text: string; time: string; id: string }[]>>({});

  const handleAddCustomReply = () => {
    if (!customReplyText.trim() || !selectedVideo) return;
    const newReply = {
      id: `rep_${Date.now()}`,
      author: `${persona.stageName} (作者 👑)`,
      text: customReplyText,
      time: "刚刚"
    };
    const prevReplies = addedReplies[selectedVideo.id] || [];
    setAddedReplies({
      ...addedReplies,
      [selectedVideo.id]: [...prevReplies, newReply]
    });
    setCustomReplyText("");
    onAddLog(`成功在 TikTok《${(selectedVideo.danceChoice || selectedVideo.title || "挑战").substring(0, 15)}》视频评论中发布了爱豆暖心饭撒！`);
  };

  const isMale = persona.gender === "male";

  // Dynamically initialize of feed videos to maintain consistency
  useEffect(() => {
    if (tiktokVideos.length === 0) {
      if (persona.style === "solo") {
        onUpdateTiktokVideos([
          {
            id: "v_1",
            title: isMale ? `【个人练习】在练习室跳 1.5倍速新歌副歌，清爽爆汗超有力量感！⚡️` : `【个人练习】卸了妆在练习室跳 1.5倍速新歌副歌，跳完直接累倒在地...`,
            danceChoice: "主打歌快速版 1.5x Dance Challenge",
            collabWith: "solo",
            views: 1250000,
            likes: 98000,
            shares: 14200,
            viralIndex: 85,
            time: "2天前"
          },
          {
            id: "v_2",
            title: isMale ? "【高难度变装】打歌服一秒切换！造型师给做的大背头高清抓拍！🔥✨" : "【高难度Wink变装】打歌服一秒切！看出来今天造型师给我染的高光粉发了吗？💅✨",
            danceChoice: "Wink变装主旋律挑战",
            collabWith: "solo",
            views: 3400000,
            likes: 410000,
            shares: 31000,
            viralIndex: 94,
            time: "4天前"
          }
        ]);
      } else {
        const firstMate = teammates && teammates.length > 0 ? teammates[0] : null;
        const mateName = firstMate ? firstMate.name : "智雅";
        const mateCollab = firstMate ? firstMate.id : "JI_AH";
        
        onUpdateTiktokVideos([
          {
            id: "v_1",
            title: `【练习日常】跟${mateName}跳 1.5倍速新歌副歌，跳完汗水狂飙！`,
            danceChoice: "主打歌快速版 1.5x Dance Challenge",
            collabWith: mateCollab,
            views: 1250000,
            likes: 98000,
            shares: 14200,
            viralIndex: 85,
            time: "2天前"
          },
          {
            id: "v_2",
            title: isMale ? "【高难度变装】打歌服一秒切换！造型师给做的大背头高清抓拍！🔥✨" : "【高难度Wink变装】打歌服一秒切！看出来今天造型师给我染的高光粉发了吗？💅✨",
            danceChoice: "Wink变装主旋律挑战",
            collabWith: "solo",
            views: 3400000,
            likes: 410000,
            shares: 31000,
            viralIndex: 94,
            time: "4天前"
          }
        ]);
      }
    }
  }, [teammates, tiktokVideos.length, persona.style, isMale]);

  const handleShootChallenge = async () => {
    setIsShooting(true);
    onAddLog(`正在摄制并上传抖音/TikTok 短视频: ${danceChoice}...`);

    try {
      let partnerName = "Solo 独舞";
      if (collabPartner !== "solo") {
        if (personas && personas.length > 1) {
          const found = personas.find((p) => p.name === collabPartner);
          partnerName = found ? `${found.name} (艺名: ${found.stageName})` : "团队成员";
        } else {
          const found = teammates.find((t) => t.id === collabPartner);
          partnerName = found ? found.name : "队友";
        }
      }

      // Generate simulation stats
      const randomMultiplier = Math.random() * 2 + 0.5;
      const baseViews = Math.floor((persona.popularity * 10000 + 100000) * randomMultiplier);
      const likes = Math.floor(baseViews * 0.12);
      const shares = Math.floor(likes * 0.15);
      const viralScore = Math.floor(Math.random() * 40) + 60; // high viral potential

      // Call LLM for custom creative script or suggestion
      let sysPrompt = `You are a creative social media consultant for a K-Pop idol on TikTok. Help write a cute, viral TikTok description based on:
      Idol Stage Name: "${persona.stageName}"
      Idol Gender: "${isMale ? "MALE (男爱豆/男性歌手)" : "FEMALE (女爱豆/女性歌手)"}"
      Challenge Choice: "${danceChoice}"
      Collaboration: "${partnerName}"`;

      if (isMale) {
        sysPrompt += `\n【极其重要 性别限制】玩家当前为【男爱豆/男性歌手】！TikTok文案与标签必须100%基于男爱豆视角（如帅气/男神/大背头/帅气变装/帅气舞蹈），绝对禁止使用女性词汇或女团/女装/姐妹词汇！`;
      }
      
      if (persona.style === "solo") {
        sysPrompt += `\n【极其重要 Solo 模式限制】玩家当前为 Solo 个人歌手，全过程绝对没有任何组合队友！文案描述、表情与标签绝对禁止提到队友、团队或队友合照，完全围绕爱豆个人的 Solo 舞台与个人日常！`;
      } else if (personas && personas.length > 1) {
        const grpMembers = personas.map(p => `${p.name} (艺名: ${p.stageName}, 担当: ${p.roleInGroup})`).join(", ");
        sysPrompt += `\n极其重要限制：该组合目前属于高保真多角色主掌模式，全明星团队名为 "${persona.groupName}"，成员阵容仅限以下这几位：[${grpMembers}]。绝对禁止在TikTok描述、文案或标签里捏造、幻想、提到任何其他未包含的用户设计组合队友。文案应该多以全团角度出发！`;
      }
      
      sysPrompt += `\nKeep the description within 1-2 lines, in Chinese, with cute young-style hashtags (e.g. #Kpop #TikTokChallenge #IdolPad).`;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Give us a short, engaging description for our TikTok challenge.`,
          systemInstruction: sysPrompt,
          customApiKey,
          model: customModel,
          customApiEndpoint
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
      const textResult = data.text || `【挑战赛】今天跟 ${partnerName} 的默契配合简直爆表，大家快去支持我们的最新曲回归吧！✨⚡️ #TikTokChallenge #IdolStyle`;

      const newVideo: VideoPost = {
        id: `v_${Date.now()}`,
        title: textResult,
        danceChoice,
        collabWith: collabPartner,
        views: baseViews,
        likes,
        shares,
        viralIndex: viralScore,
        time: "刚刚"
      };

      onUpdateTiktokVideos([newVideo, ...tiktokVideos]);

      // Calculate reward effects
      const popGain = Math.floor(viralScore * 0.15);
      const repGain = collabPartner !== "solo" ? 2 : 0;
      const energyLoss = 15;
      const stressIncrease = 5;

      onUpdateStats(
        Math.min(100, persona.popularity + popGain),
        Math.min(100, persona.reputation + repGain),
        Math.max(0, persona.energy - energyLoss),
        Math.min(100, persona.stress + stressIncrease)
      );

      onAddLog(`TikTok 《${danceChoice}》拍摄大获成功！点击播放量突破 ${baseViews.toLocaleString()} 次，吸粉名气上涨了 ${popGain}%！`);
      setActiveTab("feed");
    } catch (err) {
      console.error(err);
    } finally {
      setIsShooting(false);
    }
  };

  return (
    <div id="tiktok-app" className="primary-app-container flex flex-col rounded-2xl border border-slate-800 bg-[#000] text-slate-100">
      
      {/* Top Header tab switcher */}
      <div className="bg-[#0b0c10] px-4 py-3 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold font-sans tracking-wide truncate">TikTok 爱豆短视频挑战 (Requirement 2)</span>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg ${activeTab === "feed" ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            🔥 视频流
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg ${activeTab === "plan" ? "bg-[#00f7ff]/20 text-[#00f7ff] border border-[#00f7ff]/30" : "text-slate-400 hover:text-white"}`}
          >
            📹 新建企划变装
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "feed" ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900/60 border border-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed">
              💡 <strong>运营秘籍:</strong> 发送跳舞和变装短视频能大幅拉高你的<strong>实时人气 (Pop)</strong>。
              {persona.style === "solo"
                ? "作为 Solo 独立歌手，展示个人极致舞技与冷艳舞台气场能迅速征服路人粉，斩获业界美誉！"
                : "如果你邀请了关系尚佳的队员联合出镜，还能加深组合在饭圈里的家族感(Synergy)，从而获得少量的美誉加成！"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {tiktokVideos.map((video) => (
                <div 
                  key={video.id} 
                  id={`tiktok-card-${video.id}`}
                  onClick={() => setSelectedVideo(video)}
                  className="bg-slate-950 p-4 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-red-500/40 hover:scale-[1.01] transition-all cursor-pointer active:translate-y-px"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/5 to-red-500/5 rounded-full pointer-events-none" />
                  
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono font-bold block uppercase border border-red-500/15">
                        {(video.danceChoice || video.title || "舞蹈挑战").substring(0, 18)}...
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">{video.time || "近期"}</span>
                    </div>

                    <p className="text-xs text-slate-200 mt-2.5 font-sans leading-relaxed">
                      {video.title}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900/40 p-1.5 rounded-lg">
                        <span className="text-[8px] text-slate-500 block uppercase font-mono">观热 Views</span>
                        <span className="text-xs font-bold font-mono text-cyan-300">{(video.views / 10000).toFixed(1)}w</span>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded-lg">
                        <span className="text-[8px] text-slate-500 block uppercase font-mono">喜欢 Likes</span>
                        <span className="text-xs font-bold font-mono text-red-400">{(video.likes / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded-lg">
                        <span className="text-[8px] text-slate-500 block uppercase font-mono">爆破度 Viral</span>
                        <span className="text-xs font-bold font-mono text-yellow-300">⚡️ {video.viralIndex}</span>
                      </div>
                    </div>
                    <span className="block text-[8px] text-red-400 text-right mt-2 font-semibold">🔍 点击卡片查阅高订粉丝评论 & 饭弄交流</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-slate-950/70 border border-white/5 p-5 rounded-2xl space-y-4 shadow-xl">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest font-mono">
              🎬 拍摄新的 K-Pop 挑战短片
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">1. 选配当下大热背景卡点音乐挑战</label>
                <select
                  value={danceChoice}
                  onChange={(e) => setDanceChoice(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white font-medium"
                >
                  <option value="新歌主打《Siren Dance》魔性震动挑战">📊 新歌主打《Siren Dance》魔性震动挑战</option>
                  <option value="清纯少女风 OOTD 配 0.8x 逆向卡音">🌸 清纯少女风 OOTD 配 0.8x 逆向卡音</option>
                  <option value="超炫皮衣打歌服一秒帅气 wink 变装秀">😎 超炫皮衣打歌服一秒帅气 wink 变装秀</option>
                  <option value={persona.style === "solo" ? "保姆车/公寓深夜偷吃辛拉面被经纪人抓获挑战" : "宿舍深夜偷吃辛拉面被经纪人抓获挑战"}>
                    🍜 {persona.style === "solo" ? "保姆车/公寓深夜偷吃辛拉面被经纪人抓获挑战" : "宿舍深夜偷吃辛拉面被经纪人抓获挑战"}
                  </option>
                  <option value={persona.style === "solo" ? "主打歌2x速超级Solo高难度编舞练习打卡" : "主打歌2x速超级刀群舞不划水练习打卡"}>
                    ⚡️ {persona.style === "solo" ? "主打歌2x速超级Solo高难度编舞练习打卡" : "主打歌2x速超级刀群舞不划水练习打卡"}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">2. 联合出镜队友/Solo模式</label>
                <select
                  value={collabPartner}
                  onChange={(e) => setCollabPartner(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white font-medium"
                >
                  <option value="solo">🧍 Solo 独树一帜单跳</option>
                  {persona.style !== "solo" && (
                    personas && personas.length > 1 ? (
                      personas
                        .filter((p) => p.name !== persona.name)
                        .map((p) => (
                          <option key={p.name} value={p.name}>
                            👯‍♂️ 共同录制: {p.name} (艺名:{p.stageName || p.name}) — {p.roleInGroup || "队友"}
                          </option>
                        ))
                    ) : (
                      teammates.map((t) => (
                        <option key={t.id} value={t.id}>
                          👯‍♂️ 共同录制: {t.name} (好感:{t.favorability}/100) — {t.trait.substring(0, 15)}...
                        </option>
                      ))
                    )
                  )}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="shoot-tiktok-btn"
                  onClick={handleShootChallenge}
                  disabled={isShooting}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 text-white shrink-0 animate-pulse" />
                  {isShooting ? "爱豆极力录制、剪辑、添加卡点标签中..." : "启动前置美颜相机，开拍！"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Immersive interactive detail popup modal */}
      {selectedVideo && (
        <div id="tiktok-detail-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50">
          <div className="w-full max-w-lg bg-black border border-white/15 rounded-[24px] p-5 md:p-6 max-h-[85vh] overflow-y-auto flex flex-col justify-between text-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">TikTok Detail Panel (Requirement 5)</span>
                </div>
                <button 
                  id="tiktok-modal-close-btn"
                  onClick={() => setSelectedVideo(null)} 
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer"
                >
                  返回 (Back)
                </button>
              </div>

              {/* Channel video info */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs font-mono">
                      {persona.stageName.substring(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{persona.stageName} <span className="text-[9px] bg-red-500 text-white px-1 py-0.2 rounded uppercase ml-1">Creator</span></span>
                      <span className="text-[9px] text-slate-400 font-mono block">分类: {selectedVideo.danceChoice || "舞蹈挑战"}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 leading-normal font-sans">
                    {selectedVideo.title}
                  </p>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-slate-500 block font-mono">VIEWS</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono">{((selectedVideo.views || 0) / 10000).toFixed(1)}w</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-slate-500 block font-mono">LIKES</span>
                    <span className="text-xs font-bold text-rose-450 font-mono">{((selectedVideo.likes || 0) / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-slate-500 block font-mono">SHARES</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{(selectedVideo.shares || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                    <span className="text-[8px] text-slate-500 block font-mono">VIRAL</span>
                    <span className="text-xs font-bold text-yellow-400 font-mono">⚡️ {selectedVideo.viralIndex}</span>
                  </div>
                </div>

                {/* Interactive fan critiques */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">🌟 粉丝高赞评论区 (Fan Commentary)</span>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {/* Default simulated comments based on metrics */}
                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300 font-sans">唯</div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-350 block">CherryJiminFans_06:</span>
                        <p className="text-[11px] text-slate-200 mt-0.5 leading-normal">
                          {persona.style === "solo" 
                            ? "看完这个Solo直拍卡点太治愈了！我们的独唱舞台果然没有一个动作是划水的，野心冷艳个人气场爆发！" 
                            : "看完这个直拍卡点太治愈了！我们的主打舞台果然没有一个动作是划水的，野心冷艳美人天生属于大舞台！"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300 font-sans">
                        {persona.style === "solo" ? "死忠" : "OT"}
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-350 block">
                          {persona.style === "solo" ? "舞台支配者" : "团团大狂热者"}:
                        </span>
                        <p className="text-[11px] text-slate-200 mt-0.5 leading-normal">
                          {persona.style === "solo"
                            ? "练习室里个人舞步利落到不行，一个人撑爆全场，多发点日常，为你冲趋势！"
                            : "宿舍内和队友跳那段真的笑死我，两个宝贝舞步利落到不行，多发点日常，给你们冲趋势！"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-2.5 rounded-xl border border-white/5 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-300 font-sans">黑</div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-350 block">甜酒柠檬酸黑:</span>
                        <p className="text-[11px] text-slate-450 mt-0.5 leading-normal">
                          {persona.style === "solo"
                            ? "个人独舞动作表情怎么感觉用力过猛？眼里全是写满野心..."
                            : "绿卡成员动作怎么总比其余南韩本队员更抢镜？是不是拼了命想争夺舞台的绝对高位Center，真是个野心怪物..."}
                        </p>
                      </div>
                    </div>

                    {/* Added custom replies to comments by the player */}
                    {(addedReplies[selectedVideo.id] || []).map((reply) => (
                      <div key={reply.id} className="bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/10 flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold font-mono">👑</div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-purple-300 block">{reply.author}:</span>
                          <p className="text-[11px] text-slate-100 mt-0.5 leading-normal">{reply.text}</p>
                          <span className="text-[8px] text-slate-500 font-mono block mt-1">{reply.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Reply sender bar */}
            <div className="border-t border-white/10 pt-3 mt-4 flex gap-2 shrink-0">
              <input 
                type="text"
                placeholder="亲临下场，给粉丝暖心留言或直接亮剑回应黑粉..."
                value={customReplyText}
                id="tiktok-modal-reply-input"
                onChange={(e) => setCustomReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomReply()}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button 
                id="tiktok-modal-reply-btn"
                onClick={handleAddCustomReply}
                className="px-4 py-1.5 bg-red-650 hover:bg-red-550 text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shrink-0"
              >
                发送回复
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
