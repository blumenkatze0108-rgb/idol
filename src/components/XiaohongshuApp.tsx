import { useState } from "react";
import { IdolPersona } from "../types";
import { Send, Zap, Eye, Image as ImageIcon, Sparkles, Heart } from "lucide-react";
import { safeFetch } from "./apiHelper";

interface XiaohongshuProp {
  persona: IdolPersona;
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdateStats: (popularity: number, reputation: number, energy: number, stress: number) => void;
  onAddLog: (log: string) => void;
  personas?: IdolPersona[];
}

interface RedPost {
  id: string;
  title: string;
  tagline: string;
  ootdStyle: string;
  makeupChoice: string;
  likes: number;
  saves: number;
  comments: number;
  time: string;
}

export default function XiaohongshuApp({
  persona,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdateStats,
  onAddLog,
  personas
}: XiaohongshuProp) {
  const [activeTab, setActiveTab] = useState<"diary" | "create">("diary");
  const [ootdStyle, setOotdStyle] = useState("清冷感白大衣+超大黑框极简黑眼镜 (Noir Minimalist)");
  const [makeupChoice, setMakeupChoice] = useState("清晨江南美容室冷感猫系伪素颜妆");
  const [isPosting, setIsPosting] = useState(false);

  // Detail Modal popup states (Requirement: all posts clickable)
  const [selectedPost, setSelectedPost] = useState<RedPost | null>(null);
  const [customReplyText, setCustomReplyText] = useState("");
  const [addedReplies, setAddedReplies] = useState<Record<string, { author: string; text: string; time: string; id: string }[]>>({});

  const handleAddCustomReply = () => {
    if (!customReplyText.trim() || !selectedPost) return;
    const newReply = {
      id: `xhs_rep_${Date.now()}`,
      author: `${persona.stageName} (作者 👑)`,
      text: customReplyText,
      time: "刚刚"
    };
    const prevReplies = addedReplies[selectedPost.id] || [];
    setAddedReplies({
      ...addedReplies,
      [selectedPost.id]: [...prevReplies, newReply]
    });
    setCustomReplyText("");
    onAddLog(`成功在小红书《${selectedPost.title.substring(0, 15)}...》帖子下给粉丝翻牌子回复啦！`);
  };

  const [posts, setPosts] = useState<RedPost[]>([
    {
      id: "p_1",
      title: "【OOTD】机场上班私服被要链接了！慵懒极简的高级感穿搭大公开 🧥✨",
      tagline: "#爱豆上班路 #私服穿搭 #清冷感穿搭 #OOTD",
      ootdStyle: "慵懒黑色工装皮上衣 + 极简复古微宽牛仔裤 + 雪松木质调冷感香水",
      makeupChoice: "冷郁烟熏小猫猫伪素颜妆",
      likes: 42000,
      saves: 18400,
      comments: 650,
      time: "1天前"
    },
    {
      id: "p_2",
      title: "【日常爱用好物】随身携带的江南名品气垫与本命口红，黄皮爱豆直接锁死！💄",
      tagline: "#爱用物分享 #爱豆开包记 #今日口红 #黄皮友好",
      ootdStyle: "白色羊绒开衫配碎金戴眼线",
      makeupChoice: "元气蜜桃减龄夏日妆",
      likes: 58000,
      saves: 31000,
      comments: 1100,
      time: "3天前"
    }
  ]);

  const handleCreatePost = async () => {
    setIsPosting(true);
    onAddLog(`正在小红书发布今日 OOTD 风尚草稿...`);

    try {
      // Call LLM
      let sysPrompt = `You are a trendy Xiaohongshu (小红书) lifestyle editor for a high-profile K-Pop idol. Help write an incredibly engaging, emoji-rich, friendly lifestyle post in Chinese with topics like:
      OOTD Style: "${ootdStyle}"
      Makeup Detail: "${makeupChoice}"
      Idol Stage Name: "${persona.stageName}"`;

      if (personas && personas.length > 1) {
        const grpMembers = personas.map(p => `${p.name} (艺名: ${p.stageName}, 担当: ${p.roleInGroup})`).join(", ");
        sysPrompt += `\n极其重要限制：该组合目前属于高保真多角色主掌模式，自建全唯舞团名为 "${persona.groupName}"，成员明细绝对只能是这几位：[${grpMembers}]。在这篇小红书笔记里，如果提及团队或日常，绝对禁止脑补、幻想或捏造任何其他未列在此列表中的虚拟组合队友。文案应该充分融入这些真实的名字，体现队粉狂热。`;
      }
      
      sysPrompt += `\nEnsure there are many tags like #爱豆私服 #江南美容室 #MyOOTD at the end of the content. Keep it to 3 short bullet point statements.`;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a beautiful OOTD Red Post content outline.`,
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
      const contentText = data.text || `🧥 今日份机场清冷感私服打卡！\n- 选择了 ${ootdStyle}，极简高级又遮肉！\n- 搭配 ${makeupChoice}，氛围感瞬间拉满～\n期待大家在后台跟我探讨链接噢！ #爱豆私服 #OOTD #美容室好用物`;

      // Statistics calculations
      const randomWeight = Math.random() * 1.5 + 0.6;
      const likesGained = Math.floor((persona.popularity * 350 + 1500) * randomWeight);
      const savesGained = Math.floor(likesGained * 0.45);
      const commentsGained = Math.floor(likesGained * 0.05);

      const newPost: RedPost = {
        id: `p_${Date.now()}`,
        title: contentText.split('\n')[0] || "【OOTD】今日高级感私服上镜！",
        tagline: contentText,
        ootdStyle,
        makeupChoice,
        likes: likesGained,
        saves: savesGained,
        comments: commentsGained,
        time: "刚刚"
      };

      setPosts([newPost, ...posts]);

      // Stat impacts
      const popReward = Math.floor(randomWeight * 4);
      const repReward = Math.floor(randomWeight * 3);
      const energyLost = 10;
      const stressIncreased = 2;

      onUpdateStats(
        Math.min(100, persona.popularity + popReward),
        Math.min(100, persona.reputation + repReward),
        Math.max(0, persona.energy - energyLost),
        Math.min(100, persona.stress + stressIncreased)
      );

      onAddLog(`小红书风尚分享发布成功！获得了 ${likesGained.toLocaleString()} 点赞，粉丝们纷纷询问粉色头发和唇彩卡号！`);
      setActiveTab("diary");
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div id="xiaohongshu-app" className="primary-app-container flex flex-col rounded-2xl border border-red-950/20 bg-[#fff5f5]/60 glass-panel text-slate-800">
      
      {/* Red Navbar top */}
      <div className="bg-[#ff2442] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2 text-white">
          <ImageIcon className="w-5 h-5 text-white animate-pulse shrink-0" />
          <span className="text-xs font-extrabold font-sans tracking-wide truncate">小红书 - 爱豆私服好物精选 (Requirement 2)</span>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("diary")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg ${activeTab === "diary" ? "bg-white text-red-600" : "text-red-100 hover:text-white"}`}
          >
            📔 风尚日记
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg ${activeTab === "create" ? "bg-red-700 text-white" : "text-red-100 hover:text-white"}`}
          >
            ➕ 发布今日OOTD
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "diary" ? (
          <div className="space-y-4">
            <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-[10px] text-red-900 leading-relaxed font-sans">
              ℹ️ <strong>穿搭日记:</strong> 小红书是展示私人审美品味、吸高级高购买力粉丝的最佳社交利器。精心设计的机场上班图（OOTD）与江南名媛美容室妆面，能稳固你的业界口碑并获得不俗的实时人气！
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  id={`xhs-card-${post.id}`}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white p-4 border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer hover:border-red-400/40 hover:scale-[1.01] active:translate-y-px"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-100 text-red-600 font-bold block">
                        👗 {post.makeupChoice.substring(0, 10)}...
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{post.time}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 mt-2.5 truncate">{post.title}</h5>
                    <p className="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-relaxed bg-[#fbf5f5] p-2.5 rounded-xl border border-red-50/50 line-clamp-3">
                      {post.tagline}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-450 font-mono">
                    <div className="flex gap-3">
                      <span>❤️ {post.likes.toLocaleString()}</span>
                      <span>⭐️ {post.saves.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] font-semibold text-red-500 hover:underline">点击查看评论细节 & 营业回复 🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white border border-red-100 p-5 rounded-2xl shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest font-sans flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
              发布今日私服搭配 & 美丽分享
            </h4>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-650 mb-1 font-semibold">1. 精选今日机场及上班路 OOTD (Outfit)</label>
                <select
                  value={ootdStyle}
                  onChange={(e) => setOotdStyle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-slate-800"
                >
                  <option value="清冷感白大衣+超大黑框极简黑眼镜 (Noir Minimalist)">🧥 清冷感白大衣+超大极简黑框配饰 (Minimalist Lux)</option>
                  <option value="甜辣系挂脖抹胸牛仔外搭+粉发微醺腮红 (Korean Summer Sweet)">👖 甜辣系挂脖抹胸牛仔外搭+挂耳粉发 (Korean Summer)</option>
                  <option value="美贵风羊绒灰色开衫+黑色马海毛冷帽 (Chic Casual)">🧶 美贵风灰色羊绒开衫+黑色马海毛冷帽 (Aesthetic Cozy)</option>
                  <option value="暗黑无机质皮质夹克+阔腿拖底工装裤 (Avant-garde Cyber)">🖤 暗黑无机质皮质夹克+阔腿拖底工装裤 (Cyber Goth)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-650 mb-1 font-semibold">2. 江南美容室指定神仙妆容 (Makeup Preset)</label>
                <select
                  value={makeupChoice}
                  onChange={(e) => setMakeupChoice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-slate-800"
                >
                  <option value="清晨江南美容室冷感猫系伪素颜妆">🐱 清晨江南美容室冷感猫系伪素颜妆 (Cold Kitten)</option>
                  <option value="纯欲剔透水光果汁玻璃唇蜜妆">🍒 纯欲剔透水光果汁玻璃唇蜜妆 (Juicy Glassy Lip)</option>
                  <option value="厌世感美式雾面微烟熏落日腮红妆">🍂 厌世感美式雾面微烟熏落日腮红 (Matte Sunkissed Sunset)</option>
                  <option value="赛博冷艳金属挂泪闪片精灵眼妆">✨ 赛博冷艳金属挂泪闪片精灵妆 (Chrome Tears Cyberpixie)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id="shoot-redbook-btn"
                  onClick={handleCreatePost}
                  disabled={isPosting}
                  className="w-full py-2.5 bg-[#ff2442] hover:bg-[#e01f3a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  {isPosting ? "小红书AI助手正在精修草稿图片及配卡标签中..." : "发布到今日爱豆时尚草账板！"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Immersive Xiaohongshu Styled modal */}
      {selectedPost && (
        <div id="xhs-detail-modal" className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50">
          <div className="w-full max-w-lg bg-white border border-red-100 rounded-[24px] p-5 md:p-6 max-h-[95%] overflow-y-auto flex flex-col justify-between text-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">小红书·时尚日记 (RED Interactive Diary)</span>
                </div>
                <button 
                  id="xhs-modal-close-btn"
                  onClick={() => setSelectedPost(null)} 
                  className="px-3 py-1 bg-red-100 hover:bg-red-500 text-red-650 hover:text-white rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer"
                >
                  返回 (Back)
                </button>
              </div>

              {/* Red post contents */}
              <div className="space-y-4">
                <div className="bg-[#fffcfc] p-4 border border-rose-50 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs font-mono">
                      {persona.stageName.substring(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-905 block">{persona.stageName} <span className="text-[9px] bg-red-550 text-white px-1 py-0.1 rounded uppercase ml-1">Verified</span></span>
                      <span className="text-[9px] text-slate-400 font-mono block">OOTD 穿搭推荐</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1.5">{selectedPost.title}</h4>
                  <p className="text-[11px] text-slate-650 leading-relaxed whitespace-pre-line">
                    {selectedPost.tagline}
                  </p>
                </div>

                {/* Dashboard Metrics */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-[#fff9fa] p-2 rounded-xl border border-rose-50/50">
                    <span className="text-[8px] text-slate-400 block font-mono">LIKES</span>
                    <span className="text-xs font-bold text-red-550 font-mono">{selectedPost.likes.toLocaleString()}次</span>
                  </div>
                  <div className="bg-[#fff9fa] p-2 rounded-xl border border-rose-50/50">
                    <span className="text-[8px] text-slate-400 block font-mono">SAVES</span>
                    <span className="text-xs font-bold text-yellow-600 font-mono">{selectedPost.saves.toLocaleString()}次</span>
                  </div>
                  <div className="bg-[#fff9fa] p-2 rounded-xl border border-rose-50/50">
                    <span className="text-[8px] text-slate-400 block font-mono">PRESET</span>
                    <span className="text-[10px] font-bold text-pink-600 truncate block">CAT EYE</span>
                  </div>
                </div>

                {/* Simulated RED fan feedback */}
                <div className="space-y-2 border-t border-rose-100 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">🌸 薯友热议高赞评 (Redbook Reviews)</span>
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    <div className="bg-[#fafafa] p-2.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-500 font-mono">P</div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-700 block">PinkPanda:</span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">大衣和墨镜的冷感美度真的绝了！求一波鞋子和墨镜的链接！不愧是团队的门面担当，审美太在线了。</p>
                      </div>
                    </div>

                    <div className="bg-[#fafafa] p-2.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-500 font-mono">H</div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-700 block">Honey_Cat:</span>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">今天上班图已经在推特热搜韩趋前面了！水光唇妆完全是我的取向狙击，想买口红预备了。</p>
                      </div>
                    </div>

                    <div className="bg-[#fafafa] p-2.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#fef2f2] text-[10px] flex items-center justify-center font-bold text-red-500 font-mono">X</div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-slate-700 block">极速冲浪吃瓜猹:</span>
                        <p className="text-[11px] text-slate-550 mt-0.5 leading-normal">总是一股脑秀私服，作为爱豆，舞台练习有在好好练吗？别变成无能花瓶了...</p>
                      </div>
                    </div>

                    {/* Interactive inputs */}
                    {(addedReplies[selectedPost.id] || []).map((reply) => (
                      <div key={reply.id} className="bg-[#fff1f2] p-2.5 rounded-xl border border-rose-200 flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-red-550 text-white text-[10px] flex items-center justify-center font-bold">👑</div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-red-600 block">{reply.author}:</span>
                          <p className="text-[11px] text-slate-700 mt-0.5 leading-normal">{reply.text}</p>
                          <span className="text-[8px] text-slate-400 font-mono block mt-1">{reply.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sender panel */}
            <div className="border-t border-rose-100 pt-3 mt-4 flex gap-2 shrink-0">
              <input 
                type="text"
                placeholder="给小红书粉丝点赞翻牌，或者优雅开怼酸民..."
                value={customReplyText}
                id="xhs-modal-reply-input"
                onChange={(e) => setCustomReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomReply()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              <button 
                id="xhs-modal-reply-btn"
                onClick={handleAddCustomReply}
                className="px-4 py-1.5 bg-[#ff2442] hover:bg-[#e01f3a] text-white rounded-xl text-xs font-bold transition duration-150 cursor-pointer shrink-0"
              >
                评论
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
