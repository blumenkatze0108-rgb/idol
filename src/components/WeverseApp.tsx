import { useState } from "react";
import { WeversePost, WeverseComment, IdolPersona } from "../types";
import { Heart, MessageCircle, Send, Sparkles, Tv, ShieldAlert } from "lucide-react";
import { safeFetch } from "./apiHelper";

interface WeverseAppProps {
  persona: IdolPersona;
  weversePosts: WeversePost[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdatePosts: (posts: WeversePost[]) => void;
  onUpdateStats: (popularity: number, reputation: number, energy: number, stress: number) => void;
  onAddLog: (log: string) => void;
  personas?: IdolPersona[];
}

export default function WeverseApp({
  persona,
  weversePosts,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdatePosts,
  onUpdateStats,
  onAddLog,
  personas
}: WeverseAppProps) {
  const [activePostId, setActivePostId] = useState<string>("w_1");
  const [newPostContent, setNewPostContent] = useState("");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  const selectedPost = weversePosts.find((p) => p.id === activePostId) || weversePosts[0];

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    onAddLog("正在通过 AI 引擎生成粉丝对 Weverse 动态的最新回复...");

    const promptText = `On Weverse, a Kpop idol named "${persona.stageName}" (Stage name, concept: ${persona.conceptTheme}) just posted this:
"${newPostContent}"

Generate exactly TWO comments from different netizen/fan profiles:
1. One from a deeply supportive obsessed fan (author avatar/username e.g., LoveStage11, KpopStar_cute). They support and hype up the post passionately.
2. One from a cynical Netizen/Hater (author avatar/username e.g., NetizenTruth, antiHype_01). They criticize, complain, or post passive-aggressive comments.

Return the reply as a valid JSON array or structured text block with exactly two sections so we can parse them.
Format your output exactly like:
FAN_COMMENT_USER: <username>
FAN_COMMENT_TXT: <supportive comment content in Chinese>
HATER_COMMENT_USER: <username>
HATER_COMMENT_TXT: <critical/anti-fan comment content in Chinese>
Do not write any markdown tags or other intro/outro.`;

    let supportiveUser = "KpopSTAN_forever";
    let supportiveText = "啊啊啊宝贝更新了！今天也是为你倾倒的一天！";
    let haterUser = "NetizenHater";
    let haterText = "怎么天天有空发Weverse，到底有没有好好练习唱歌啊？发音一塌糊涂。";

    let systemInstruction = `You are an expert game master managing Kpop social fan simulations. Player Gender: "${persona.gender}". Since the player is ${persona.gender === "female" ? "FEMALE (女性/女爱豆)" : "MALE (男性/男爱豆)"}, all generated fan comments in Chinese must address them appropriately, using terms like "欧尼/姐姐" if supportive/fans call her, and NEVER use male-only terms like "欧巴/哥哥/他/哥" to describe her. If male, fans call them "欧巴/哥哥/他" and NEVER use female-only terms like "欧尼/姐姐/她".`;
    if (personas && personas.length > 1) {
      const gDesc = personas.map((p, idx) => `- 成员 ${idx + 1}: ${p.name} (艺名: ${p.stageName}), 担当: ${p.roleInGroup}, MBTI: ${p.mbti}`).join("\n");
      systemInstruction += `\n\n【重要：当前属于一个 ${personas.length} 人的自制高保真高定全明星组合 "${persona.groupName}"】
组合成员如下：
${gDesc}
任何粉丝在评价发帖和吐槽、或者唯粉评价当前说话的爱豆 "${persona.stageName}" 时，可能会提起并提及其他组合成员的名字或才艺状态（例如炒CP、或者拿队员来进行数值/才华拉踩对比），言之有物，带有最逼真的Kpop粉圈属性互撕与饭圈抱团乱象！
极其重要限制：该组合仅限于以上这 ${personas.length} 位成员姓名，绝对禁止幻想、捏造或虚构在此名字明细之外的不知名假队员！内容评价须尽量以团体高度开展，禁止脑补不存在的拉胯关系！`;
    }

    try {
      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction,
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
      const rawText = data?.text || "";
      
      const fUserMatch = rawText.match(/FAN_COMMENT_USER:\s*(.*)/i);
      const fTxtMatch = rawText.match(/FAN_COMMENT_TXT:\s*(.*)/i);
      const hUserMatch = rawText.match(/HATER_COMMENT_USER:\s*(.*)/i);
      const hTxtMatch = rawText.match(/HATER_COMMENT_TXT:\s*(.*)/i);

      if (fUserMatch && fUserMatch[1]) supportiveUser = fUserMatch[1].trim();
      if (fTxtMatch && fTxtMatch[1]) supportiveText = fTxtMatch[1].trim();
      if (hUserMatch && hUserMatch[1]) haterUser = hUserMatch[1].trim();
      if (hTxtMatch && hTxtMatch[1]) haterText = hTxtMatch[1].trim();
    } catch(e) {
      console.warn("Weverse dynamic comment generation failed. Fallback to templates", e);
    } finally {
      setIsPosting(false);
    }

    const newPost: WeversePost = {
      id: `w_post_${Date.now()}`,
      content: `［${persona.stageName}］\n${newPostContent}`,
      likes: Math.floor(Math.random() * 300) + 100,
      commentsCount: 2,
      time: "刚刚",
      comments: [
        {
          id: `wc_new_1_${Date.now()}`,
          author: supportiveUser,
          authorAvatar: "",
          content: supportiveText,
          likes: Math.floor(Math.random() * 50) + 10,
          time: "刚刚",
          fanType: "OT_fan"
        },
        {
          id: `wc_new_2_${Date.now()}`,
          author: haterUser,
          authorAvatar: "",
          content: haterText,
          likes: Math.floor(Math.random() * 10) + 1,
          time: "刚刚",
          fanType: "anti"
        }
      ]
    };

    onUpdatePosts([newPost, ...weversePosts]);
    setActivePostId(newPost.id);
    setNewPostContent("");
    
    // Changing stats slightly
    onUpdateStats(persona.popularity + 2, persona.reputation, persona.energy - 5, persona.stress);
    onAddLog("成功通过 AI 生态在 Weverse 发布动态！粉丝和黑子们正在火速赶来。");
  };

  const handleReplyToComment = (commentId: string) => {
    const textText = replyInput[commentId];
    if (!textText?.trim()) return;

    // Search the comment and attach reply
    const updatedPosts = weversePosts.map((post) => {
      if (post.id === selectedPost.id) {
        const updatedComments = post.comments.map((comm) => {
          if (comm.id === commentId) {
            return {
              ...comm,
              replied: true,
              replyText: textText
            };
          }
          return comm;
        });
        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    });

    onUpdatePosts(updatedPosts);
    setReplyInput({ ...replyInput, [commentId]: "" });

    // Evaluate response effects (No Explicit indicators for sentiment, Requirement 5)
    // If the reply is very defensive/aggressive, it might trigger some backlash, polite replies increase reputation
    const isDefensive = textText.includes("闭嘴") || textText.includes("滚") || textText.toLowerCase().includes("hater") || textText.includes("恶意") || textText.includes("造谣");
    
    let popImpact = 1;
    let repImpact = 1;
    let stressImpact = 2;

    if (isDefensive) {
      popImpact = 15; // drama brings viral traffic
      repImpact = -10; // backlash from Korean companies
      stressImpact = 15;
      onAddLog("您的回复极具锋芒！粉丝和营销号瞬间截屏，韩网正在疯狂围观，引发了极大的议论。");
    } else {
      popImpact = 3;
      repImpact = 5; // polite reply increases idol posture
      onAddLog("你温柔得体的回复，向粉丝展现了完美的爱豆素养与克制性。");
    }

    onUpdateStats(
      persona.popularity + popImpact,
      Math.max(5, persona.reputation + repImpact),
      persona.energy,
      Math.min(100, persona.stress + stressImpact)
    );
  };

  // Requirement 5: Trigger live stream to communicate directly with comments
  const handleTriggerLiveStream = async () => {
    onAddLog("您在 Weverse 开启了紧急一小时‘感谢粉丝’官方直播...");
    onUpdateStats(persona.popularity + 8, persona.reputation + 4, persona.energy - 20, Math.min(100, persona.stress + 10));
    
    let commentAuthor = "YunaAngel";
    let commentTxt = "直播里的智允宝宝太可爱了，素颜状态也超级好，清冷感美女实锤！";

    let sysInstruction = `You are in a live streaming room for Kpop idol "${persona.stageName}". Player Gender: "${persona.gender}". Since the player is ${persona.gender === "female" ? "FEMALE (女性/女爱豆)" : "MALE (男性/男爱豆)"}, all generated fan comments in Chinese must address them appropriately, using terms like "欧尼/姐姐/她" if female, and NEVER use male-only terms like "欧巴/哥哥/他" to describe her. If male, fans call them "欧巴/哥哥/慢/他/哥" and NEVER use female terms like "欧尼/姐姐/她".`;
    if (personas && personas.length > 1) {
      const gDesc = personas.map((p, idx) => `- 成员 ${idx + 1}: ${p.name} (艺名: ${p.stageName}), 担当: ${p.roleInGroup}`).join("\n");
      sysInstruction += `\n\n【重要：官方组合 "${persona.groupName}" 直播背景】
本场直播属于组合官方频道。其余亲生姐妹/兄弟自创玩家输入角色是：
${gDesc}
在直播间留言里，观众可能会很惊喜、很激动、或很有爱地询问其他同组多开成员的最新去向或消息（例如“XX姐去哪里了呀，今晚不跟宝宝一起吗？”、“XX和宝宝刚才是在厨房打架吗哈哈”），以增加真实的团队直播互动氛围！
极其重要：该自选团队仅限于上述这些玩家定制的成员姓名，绝对禁止捏造、脑补或提及任何此列表名字之外的捏造韩国队友！提问或留言须符合高保真全队氛围。`;
    }

    try {
      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a short sweet comment (1 sentence) in Chinese from an active streaming spectator watching Kpop star ${persona.stageName}'s video livestream. Tell them they look gorgeous, congrats, or ask a cute question. Only return the comment text, no formatting. Player gender is "${persona.gender}". If female, fans call them "欧尼" or "姐姐"; if male, fans call them "欧巴" or "哥哥".`,
          systemInstruction: sysInstruction,
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
      if (data?.text) {
        commentTxt = data.text.replace(/["'「」]/g, "").trim();
        const creators = ["YunaAngel", "LovelaceK", "MoMo_Sugar", "KpopDancer", "Hana_Cute"];
        commentAuthor = creators[Math.floor(Math.random() * creators.length)] + Math.floor(Math.random() * 99);
      }
    } catch (e) {
      console.warn("Weverse Live Stream comment generation fallback", e);
    }

    // Simulate comments answering this
    const updatedPosts = weversePosts.map((post) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [
            {
              id: `wc_live_${Date.now()}`,
              author: commentAuthor,
              authorAvatar: "",
              content: commentTxt,
              likes: Math.floor(Math.random() * 500) + 100,
              time: "刚刚",
              fanType: "OT_fan"
            } as WeverseComment,
            ...post.comments
          ]
        };
      }
      return post;
    });
    onUpdatePosts(updatedPosts);
  };

  return (
    <div id="weverse-app" className="flex flex-col md:flex-row h-full rounded-2xl overflow-hidden bg-[#242735] text-slate-100 border border-slate-700">
      
      {/* Left panel posts list */}
      <div className="w-full md:w-[260px] bg-[#1a1c27] border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3 font-mono">
            WEVERSE ARTIST COMM
          </span>

          <div className="space-y-2 overflow-y-auto max-h-[160px] md:max-h-[250px] pr-1">
            {weversePosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setActivePostId(post.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border outline-none ${activePostId === post.id ? 'bg-purple-950/40 border-purple-500' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/70'}`}
              >
                <p className="text-[11px] leading-relaxed line-clamp-2 text-slate-300">
                  {post.content}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                  <span>♥️ {post.likes}</span>
                  <span>💬 {post.comments.length}</span>
                  <span className="ml-auto">{post.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create manual post */}
        <div className="border-t border-slate-800 pt-3 mt-4">
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">写一篇新的官咖文章 (Post update)</label>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={2}
            placeholder="和粉丝们分享一下今天的练习日常或消肿技巧吧..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleCreatePost}
            className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> 发送至 Weverse
          </button>
        </div>
      </div>

      {/* Right side interactions */}
      <div className="flex-1 bg-[#1e202d] flex flex-col justify-between min-h-[350px]">
        {/* Post showcase header */}
        <div className="bg-[#242637] p-4 border-b border-slate-800 shrink-0 flex items-center justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">［{persona.stageName}］- 官咖官宣</span>
              <span className="text-[9px] bg-purple-900/40 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase font-mono">{persona.conceptTheme.split(" ")[0]}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">发帖能吸引团粉和梦男粉。合理回复恶评或开启直播。</p>
          </div>

          <button
            onClick={handleTriggerLiveStream}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5" /> 开启Weverse直播
          </button>
        </div>

        {/* Post content display & comments section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Post main content text */}
          <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3.5">
            <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {selectedPost.content}
            </p>
            {selectedPost.image && (
              <img src={selectedPost.image} alt="post_img" className="w-full max-h-[140px] object-cover rounded-lg mt-3 border border-white/5" referrerPolicy="no-referrer" />
            )}
            <div className="flex items-center gap-3 mt-3.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {selectedPost.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-purple-400" /> {selectedPost.comments.length} 个粉丝讨论</span>
            </div>
          </div>

          {/* Comments list (Requirement 5: Remove explicit pos/neg, user judges) */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
              全网粉丝实时留言 (无过滤，需自主判断评判类型)
            </span>

            {selectedPost.comments.map((comm) => (
              <div key={comm.id} className="bg-slate-900/60 p-3 rounded-xl border border-white/5 relative group">
                <div className="flex items-start gap-2.5">
                  {comm.authorAvatar ? (
                    <img src={comm.authorAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-extrabold text-[10px] uppercase flex items-center justify-center shrink-0 border border-slate-755">
                      {comm.author.substring(0, 1)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 truncate">{comm.author}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{comm.time}</span>
                    </div>

                    <p className="text-xs text-slate-200 text-slate-300 leading-relaxed mt-1 font-sans">
                      {comm.content}
                    </p>

                    {/* Replies feed */}
                    {comm.replied && (
                      <div className="mt-2.5 bg-purple-950/20 border-l-2 border-purple-500 p-2 rounded text-[11px] text-purple-200 leading-relaxed">
                        <strong className="text-purple-300">［{persona.stageName}］回复:</strong> {comm.replyText}
                      </div>
                    )}

                    {/* Unreplied inputs */}
                    {!comm.replied && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={replyInput[comm.id] || ""}
                          onChange={(e) => setReplyInput({ ...replyInput, [comm.id]: e.target.value })}
                          placeholder="选择温柔回复、硬刚、或澄清事实..."
                          className="flex-1 bg-slate-950 border border-white/10 rounded px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          onClick={() => handleReplyToComment(comm.id)}
                          className="p-1 px-2.5 bg-[#2bc1b2] hover:bg-[#22af9f] text-slate-900 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <Send className="w-2.5 h-2.5" /> 回复
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
