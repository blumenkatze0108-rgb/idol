import { useState } from "react";
import { ChatContact, ChatMessage, IdolPersona, SimulatedTeammate } from "../types";
import { MessageSquare, Send, Zap, User, AlertCircle, Smile } from "lucide-react";
import { safeFetch } from "./apiHelper";

interface KakaoTalkProp {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  chatContacts: ChatContact[];
  chatHistories: Record<string, ChatMessage[]>;
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdateHistories: (histories: Record<string, ChatMessage[]>, contacts: ChatContact[]) => void;
  onAddLog: (log: string) => void;
  onUpdatePersona?: (p: IdolPersona) => void;
}

export default function KakaoTalkApp({
  persona,
  teammates,
  chatContacts,
  chatHistories,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdateHistories,
  onAddLog,
  onUpdatePersona
}: KakaoTalkProp) {
  const [selectedContactId, setSelectedContactId] = useState<string>("manager");
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loverError, setLoverError] = useState<string | null>(null);

  const selectedContact = chatContacts.find((c) => c.id === selectedContactId) || chatContacts[0];

  const handleLoverAction = (actionType: "date" | "gift" | "letter" | "reconcile") => {
    if (!persona.hasLover || !onUpdatePersona) return;
    setLoverError(null);

    const nextPersona = { ...persona };
    const pMood = persona.loverMood ?? 80;
    
    let msgText = "";
    let logText = "";
    let alertMsg = "";
    
    if (actionType === "date") {
      if (nextPersona.energy < 30) {
        setLoverError("精力值低于30点，现在带Ta出去会疲劳驾驶哦，先回宿舍睡一觉恢复体力吧！");
        return;
      }
      nextPersona.energy = Math.max(0, nextPersona.energy - 30);
      nextPersona.stress = Math.min(100, nextPersona.stress + 10);
      nextPersona.scandalPrejudice = Math.min(100, (nextPersona.scandalPrejudice ?? 8) + 15);
      
      const nextMood = Math.min(100, pMood + 20);
      nextPersona.loverMood = nextMood;
      
      msgText = `[💕 深夜自驾汉江兜风] 你们戴着黑色鸭舌帽跟口罩，开着租来的轻便车游荡在深夜2点的汉江大桥下。虽然你有些提心吊胆，生怕路过的夜跑保姆车或跟拍镜头发现，但Ta在暗处轻轻捏了捏你的手，眼里满是热诚。 (地下恋人安定度 +20, 个人体力 -30, 曝光概率上升 15)`;
      logText = `[💞 地下恋爱] 深夜汉江秘密兜风：恋人 ${persona.loverName} 的心境安定度上升了20点（目前为 ${nextMood}/100）。但受制于熬夜外出，您的体力下浮30点，绯闻曝光暗雷预存上升！`;
    } 
    else if (actionType === "gift") {
      const giftCost = 150; // ₩150万韩元 ($1.1k approx) 
      if (nextPersona.money < giftCost) {
        // If money not enough, can expand trainee debt
        const extendDebt = giftCost - nextPersona.money;
        nextPersona.money = 0;
        nextPersona.traineeDebt += extendDebt;
        alertMsg = `（由于您手上持有的现资产不足 ₩150w，超出差额的 ₩${extendDebt}w 已记在您的爱豆危机垫缴账目中，增添了债务积累！）`;
      } else {
        nextPersona.money -= giftCost;
      }
      
      nextPersona.stress = Math.max(0, nextPersona.stress - 12);
      const nextMood = Math.min(100, pMood + 35);
      nextPersona.loverMood = nextMood;
      
      msgText = `[🎁 匿名赠礼：轻奢定制心形珠宝首饰] 匿名为Ta定做了一件极具纪念意义的精雕项链首饰，并委托美容室熟稔的助理不留痕迹地交给Ta。Ta收到后狂喜地在小号发了贴，配文：‘世上最偏袒的浪漫，谢谢宝宝...’ (地下恋人心情 +35, 扣除手头财富以抚平Ta的动摇，压力下浮 12)`;
      logText = `[💞 地下恋爱] 托造型助理秘密赠送轻奢对戒项链：恋人 ${persona.loverName} 的动摇心境得到大比例抚平！好感提升35点（当前 ${nextMood}/100）。${alertMsg}`;
    } 
    else if (actionType === "letter") {
      if (nextPersona.energy < 40) {
        setLoverError("太疲劳了（精力值不足40点），现在无法静下心来用心撰写具有说服力的灵魂长信。先在日程管理里休息休息吧！");
        return;
      }
      nextPersona.energy = Math.max(0, nextPersona.energy - 40);
      nextPersona.scandalPrejudice = Math.max(0, (nextPersona.scandalPrejudice ?? 8) - 10);
      
      const nextMood = Math.min(100, pMood + 15);
      nextPersona.loverMood = nextMood;
      
      msgText = `[✍️ 亲笔书写灵魂告白情书] 趁着舍友沉睡，你手写了一份深沉的三页长文，追述了自练习生起携手至今的隐忍细节，并表明大火一位后将无偿庇护关系的坚决信心。信件纸张细密折好放置于Ta的秘密信盒。 (地下恋人心情 +15, 降低了漏洞几率 10, 精力损耗 40)`;
      logText = `[💞 地下恋爱] 亲笔修撰手作灵魂长信安抚：真挚的情辞大幅瓦解了Ta的内疚感，恋人 ${persona.loverName} 的心情安定度上升15点（当前为 ${nextMood}/100），并加固了言论防线（风险值减 10）。`;
    } 
    else if (actionType === "reconcile") {
      const costAmount = 100;
      if (nextPersona.money < costAmount) {
        const debtAdd = costAmount - nextPersona.money;
        nextPersona.money = 0;
        nextPersona.traineeDebt += debtAdd;
        alertMsg = `（由于您手上余额不足，超出差额的 ₩${debtAdd}w 将在结算时滚入您的总预备债务中！）`;
      } else {
        nextPersona.money -= costAmount;
      }
      
      nextPersona.energy = Math.max(0, nextPersona.energy - 25);
      const nextMood = Math.min(100, pMood + 25);
      nextPersona.loverMood = nextMood;
      
      if (nextMood >= 50) {
        nextPersona.relationshipStatus = "dating";
        msgText = `[🥺 捧一束黄玫瑰登门复合 ➔ 挽回成功！] 你在深夜打完卡后，连夜冒雪在Ta下班录音棚门口拦截。你在雪地里冻得牙齿打颤，双手通红地诚挚道歉，并握紧Ta发红的手泪流恳请给对这桩地下恋情一次重塑希望的机会。看到你冻僵的样子和红红的鼻子，Ta的心情彻底破防并痛哭合抱，冰释前嫌！（重归恋爱关系！）`;
        logText = `[💞 地下恋爱] 挽回复合大功告成！致歉黄玫瑰触动了Ta的心坎阻碍，秘密退隐红线重连！状态恢复为【偷偷恋爱中 ${persona.loverName}】。`;
      } else {
        msgText = `[🥺 捧一束黄玫瑰登门复合 ➔ 惨遭婉拒] 你极度低姿态诚恳致歉挽回，但Ta依然只是神色落寞地抽手离开：‘对不起，玫瑰很漂亮，但我真不习惯每次听到你粉丝说你是唯一的光、不近凡人时那种像贼一样的憋闷罪感了。回去吧，我们先做好本质工作...’ (挽回搁浅：好感值尚且低于 50 点，请继续通过聊天提升其心情数值！)`;
        logText = `[💞 地下恋爱] 玫瑰致歉挽回复合并未成功！Ta内心的对粉愧疚过关尚浅，关系仍属离间。继续通过 Kakaotalk 交心倾述安抚心情，冲线50点及格分后即可重归旧好！`;
      }
    }

    const systemMsg: ChatMessage = {
      id: `system_love_${Date.now()}`,
      sender: "system",
      text: msgText,
      time: "刚刚"
    };

    const updatedHist = {
      ...chatHistories,
      [selectedContact.id]: [...(chatHistories[selectedContact.id] || []), systemMsg]
    };

    const updatedContacts = chatContacts.map(c => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          lastMessage: msgText.substring(0, 35) + "...",
          favorability: nextPersona.loverMood
        };
      }
      return c;
    });

    onUpdateHistories(updatedHist, updatedContacts);
    onUpdatePersona(nextPersona);
    onAddLog(logText);
  };

  const currentMessages = chatHistories[selectedContact.id] || [];

  // Count how many files have pending queued messages
  const getQueuedCount = () => {
    let count = 0;
    Object.values(chatHistories).forEach((msgs) => {
      if (msgs.some((m) => m.sender === "idol" && m.queueOnly)) {
        count++;
      }
    });
    return count;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText("");

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "idol",
      text: userText,
      time: "刚刚",
      queueOnly: true
    };

    const updatedMsgs = [...currentMessages, newMsg];
    let newHistories = {
      ...chatHistories,
      [selectedContact.id]: updatedMsgs
    };

    // Update last message in contacts list
    let updatedContacts = chatContacts.map((c) => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          lastMessage: userText,
          time: "刚刚"
        };
      }
      return c;
    });

    onUpdateHistories(newHistories, updatedContacts);
    onAddLog(`[暂存于待发队列] 已成功向【${selectedContact.name}】投递了一条暂存消息。您可以切换到其他成员继续留言，留言完毕后点击左下角的「一键拉取所有角色回复」统一呼叫 AI 抓取回复！`);
  };

  // Central trigger to process all queued messages in parallel (Requirement 9)
  const handleBatchProcessReplies = async () => {
    const queuedCount = getQueuedCount();
    if (queuedCount === 0) return;

    setIsGenerating(true);
    onAddLog(`正在对 ${queuedCount} 个联系人批量抓取 AI 偶像人设回复...`);

    const newHistories = { ...chatHistories };
    const updatedContacts = [...chatContacts];

    // Identify contacts with queued messages
    const contactsToProcess = chatContacts.filter((c) => 
      (newHistories[c.id] || []).some((m) => m.sender === "idol" && m.queueOnly)
    );

    // Parallel calls
    const promises = contactsToProcess.map(async (contact) => {
      const msgs = newHistories[contact.id] || [];
      const queuedIdolMsgs = msgs.filter((m) => m.sender === "idol" && m.queueOnly);
      
      // Combine messages to understand user intent
      const userFullQuery = queuedIdolMsgs.map((m) => m.text).join(" 同时还有: ");
      
      // Create character instruction context (Requirement 13 & 15)
      let customSystemPrompt = `You are a character in Korea's Entertainment world replying via KakaoTalk. Do not break character. Keep it in Chinese.
      Your Name: "${contact.name}"
      Your Role: "${contact.role}" (${contact.id === 'lover' ? '偷偷交往的地下恋爱恋人' : contact.role === 'manager' ? '总负责人/经纪人' : contact.role === 'member' ? '队内合伙队友' : '社长高级领袖'}).
      MBTI Profile: "${contact.mbti || 'ESTJ'}".
      Favorability score toward the player: ${contact.favorability ?? 50}/100.
      ${contact.id === 'lover' ? 'Critical Constraint: You are the player\'s secret dating partner in the K-Pop world where dating is heavily banned. Respond in a very sweet, warm, deeply caring, yet slightly nervous/secretive tone. Use words like 亲爱的, 宝贝, 汉江. Suggest meeting up stealthily, checking for cameras or managers.' : ''}
      ${contact.summary ? `Dialogue History Milestones Summary: "${contact.summary}". Maintain continuity with these compiled memories!` : ""}
      Player is a ${persona.startType === 'trainee' ? '训练生' : '出道人气爱豆'} named "${persona.name}" (Stage name: ${persona.stageName}), who is of ${persona.nationality === 'korean' ? '韩国本土' : '外籍绿卡员'} nationality. 
      Note: Korean entertainment companies may show subtle bias against green-card members. Use this background if favorability is low or nationality is foreign green card.
      If favorability is < 30 (for non-lovers), be cold, formal, and micro-aggressive. If favorability is > 70, be very friendly, tease, or speak warmly. Include authentic Kpop slang (like "Fighting", "Wink", "美容室", "主打歌", "出圈").`;

      // Call API
      try {
        const response = await safeFetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Player sent: "${userFullQuery}". Give a natural short conversational reply as '${contact.name}' in active Korean Kakao style. Minimum 2 lines, maximum 4 lines. Use realistic emoji if friendly.`,
            systemInstruction: customSystemPrompt,
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
        
        // Remove queue labels and add reply
        const cleanedMsgs = msgs.map(m => ({ ...m, queueOnly: false }));
        cleanedMsgs.push({
          id: `reply_${Date.now()}_${contact.id}`,
          sender: "other",
          text: data.text || "呀，收到你的消息啦。练习室见！",
          time: "刚刚",
          queueOnly: false
        });

        newHistories[contact.id] = cleanedMsgs;

        // Perform keyword analysis inside batch process loop for underground lover
        if (contact.id === "lover") {
          let loverMoodShift = 0;
          const positiveKeywords = ["爱", "疼", "宝贝", "亲爱", "对不起", "亏欠", "解释", "别哭", "相信", "守护", "坚守", "坚定", "抱抱", "贴贴", "在乎", "理解", "没关系", "乖"];
          const negativeKeywords = ["分手", "公开", "冷落", "无所谓", "退团", "累", "烦", "退", "划清", "断绝"];
          
          const hasPos = positiveKeywords.some(k => userFullQuery.includes(k));
          const hasNeg = negativeKeywords.some(k => userFullQuery.includes(k));
          
          if (hasPos) loverMoodShift += 8;
          if (hasNeg) loverMoodShift -= 10;
          
          if (loverMoodShift !== 0 && onUpdatePersona) {
            const currentMood = persona.loverMood ?? 80;
            const targetMood = Math.max(0, Math.min(100, currentMood + loverMoodShift));
            const hasLoverRestored = (targetMood >= 55 && persona.relationshipStatus === "broken_up");
            
            const nextPersona = { 
              ...persona, 
              loverMood: targetMood,
              relationshipStatus: hasLoverRestored ? ("dating" as const) : persona.relationshipStatus
            };
            setTimeout(() => {
              onUpdatePersona(nextPersona);
            }, 50);
            
            onAddLog(`💞 【地下恋人心情变动】秘密恋人 ${persona.loverName} 的心里波动了：好感值 ${currentMood} ➔ ${targetMood} ${loverMoodShift > 0 ? "📈 (感念于您的温柔安抚)" : "📉 (顾虑加重更加觉得对不起粉丝)"}${hasLoverRestored ? "！Ta已在您的软语宽慰下回心转意，地下恋爱关系已重组恢复！" : ""}`);
          }
        }

        // Update contact last message
        const idx = updatedContacts.findIndex((c) => c.id === contact.id);
        if (idx !== -1) {
          updatedContacts[idx] = {
            ...updatedContacts[idx],
            lastMessage: data.text ? data.text.substring(0, 30) + "..." : "收到你的消息了，谢谢！",
            unread: true,
            time: "刚刚"
          };
        }
      } catch (err) {
        console.error(err);
      }
    });

    await Promise.all(promises);
    onUpdateHistories(newHistories, updatedContacts);
    setIsGenerating(false);
    onAddLog("批量 AI 回复获取完毕！点击各个聊天框并进行查看。");
  };

  return (
    <div id="kakaotalk-app" className="flex flex-col md:flex-row h-full rounded-2xl overflow-hidden border border-amber-900/10 bg-[#ffeee0]/45 glass-panel text-slate-800">
      
      {/* Left Chat list */}
      <div className="w-full md:w-[260px] bg-white/70 border-r border-[#edd8c4] flex flex-col justify-between p-3 shrink-0">
        <div>
          <div className="flex items-center justify-between border-b border-[#edd8c4] pb-2 mb-2">
            <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-yellow-600" />
              KakaoTalk (练习互聊)
            </span>
            <span className="bg-amber-900/10 text-[10px] text-amber-900 px-2 py-0.5 rounded-full font-mono">
              {chatContacts.length} 个联系人
            </span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[300px] md:max-h-[380px] pr-1">
            {chatContacts.map((c) => {
              const hasQueued = (chatHistories[c.id] || []).some((m) => m.sender === "idol" && m.queueOnly);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedContactId(c.id)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all ${selectedContactId === c.id ? "bg-yellow-500/15 border border-yellow-500/20" : "hover:bg-slate-100/60"}`}
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full shrink-0 bg-yellow-500 text-slate-900 font-extrabold text-xs flex items-center justify-center border border-yellow-300">
                      {c.name.substring(0, 1)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{c.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {hasQueued ? (
                        <span className="text-yellow-600 font-semibold flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 animate-pulse" /> Wait Response...
                        </span>
                      ) : (
                        c.lastMessage
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central batch processing button (Requirement 9) */}
        <div className="border-t border-[#edd8c4] pt-2 mt-2">
          <button
            onClick={handleBatchProcessReplies}
            disabled={getQueuedCount() === 0 || isGenerating}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${getQueuedCount() > 0 ? 'bg-yellow-500 hover:bg-yellow-400 text-amber-950 cursor-pointer active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-bounce' : 'animate-pulse'}`} />
            {isGenerating ? "正在处理AI回复..." : `一键拉取所有角色回复 (${getQueuedCount()})`}
          </button>
          <p className="text-[9px] text-center text-slate-400 mt-1.5 leading-tight">
            提示: 可以连续对多个成员发送多条消息，点击上方总按钮后一次性收取符合人设的 AI 回复！
          </p>
        </div>
      </div>

      {/* Right chat screen */}
      <div className="flex-1 bg-[#b2c7da] flex flex-col justify-between min-h-[320px] relative">
        
        {/* Chat topbar */}
        <div className="bg-white/90 px-4 py-2.5 border-b border-slate-250 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            {selectedContact.avatar ? (
              <img src={selectedContact.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-yellow-500 text-slate-900 font-extrabold text-xs flex items-center justify-center border border-yellow-300 shrink-0">
                {selectedContact.name.substring(0, 1)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">{selectedContact.name}</span>
                <span className="text-[9px] bg-slate-250 font-mono px-1.5 py-0.5 rounded text-slate-600">{selectedContact.mbti}</span>
              </div>
              <p className="text-[9px] text-slate-500 flex items-center gap-1.5">
                {selectedContact.id === "lover" ? (
                  <>
                    地下恋爱维系值: <strong className="text-pink-600 font-semibold">{persona.loverMood ?? 80}/100</strong>
                    <span className="text-[10px] rounded px-1.5 py-0.2 bg-pink-100 text-pink-700 font-bold ml-1">
                      {persona.relationshipStatus === "broken_up" ? "💔 已分手" : "🤫 暗恋厮守中"}
                    </span>
                  </>
                ) : (
                  <>
                    关系好感值: <strong className="text-purple-600">{selectedContact.favorability ?? 50}/100</strong> {(selectedContact.favorability ?? 50) < 35 && " (态度极其冷淡/容易搞小动作)"}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <User className="w-3 h-3" /> KakaoTalk™
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[240px] md:max-h-[300px]">
          {/* ROMANCE RECONCILE AND MAINTENANCE ACTION PANEL (Requirement 13) */}
          {selectedContact.id === "lover" && persona.hasLover && (
            <div className="bg-pink-50/95 border border-pink-200 rounded-2xl p-3.5 text-xs text-pink-950 flex flex-col gap-2 shadow-sm mb-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-pink-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💞</span>
                  <div>
                    <h4 className="font-extrabold tracking-tight text-pink-900 text-xs flex items-center gap-1.5">
                      地下恋爱私密控制台
                      <span className="text-[8px] bg-pink-200 text-pink-800 font-mono px-1 py-0.5 rounded-md">
                        {persona.relationshipStatus === "broken_up" ? "💔 对方已封锁心扉" : "🤫 无人知晓的眷恋"}
                      </span>
                    </h4>
                    <p className="text-[9px] text-pink-700/80 mt-0.5">
                      性别: {persona.loverGender === "female" ? "小姐姐" : "小哥哥"} | 齿轮: {persona.loverAge === "same_age" ? "同龄" : persona.loverAge === "older" ? "年上" : "年下"} | 阶层: {persona.loverIdentity === "celebrity" ? "业界大势" : "圈外素人"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-[10px] font-bold text-pink-800">
                    安民值: {persona.loverMood ?? 80}/100
                  </div>
                  <div className="text-[8px] text-pink-600 font-medium">
                    {(persona.loverMood ?? 80) >= 80 ? "💖 齁甜·极度沉溺" : (persona.loverMood ?? 80) >= 50 ? "💛 忧心恐惧·怕被曝光" : "💔 濒临决裂·负罪沉重"}
                  </div>
                </div>
              </div>

              {/* Slider simulation progress bar */}
              <div className="w-full bg-pink-200/50 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    (persona.loverMood ?? 80) >= 80 ? "bg-pink-500" : (persona.loverMood ?? 80) >= 50 ? "bg-amber-400" : "bg-red-500"
                  }`}
                  style={{ width: `${persona.loverMood ?? 80}%` }}
                />
              </div>

              {/* Interactive buttons list for romance */}
              <div className="grid grid-cols-2 gap-2 mt-1 bg-white/60 p-2 rounded-xl border border-pink-100">
                {persona.relationshipStatus === "broken_up" ? (
                  <button
                    onClick={() => handleLoverAction("reconcile")}
                    className="col-span-2 py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    🥺 携「歉意黄玫瑰」登门复合 (资产扣减 ₩100万 | 耗费精力 25)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleLoverAction("date")}
                      className="py-1.5 px-1 bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🚗 Midnight汉江自驾游
                    </button>
                    <button
                      onClick={() => handleLoverAction("gift")}
                      className="py-1.5 px-1 bg-pink-100 hover:bg-pink-200 text-pink-900 border border-pink-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center"
                    >
                      🎁 匿名定制高级冷戒
                    </button>
                    <button
                      onClick={() => handleLoverAction("letter")}
                      className="col-span-2 py-1.5 px-2 bg-pink-900/10 hover:bg-pink-900/20 text-pink-900 border border-pink-900/10 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer text-center"
                    >
                      ✍️ 熬夜修心灵魂告白长信 (耗费精力 40 | 绯闻泄漏暗雷 -10)
                    </button>
                  </>
                )}
              </div>

              {/* Romance error warnings inline */}
              {loverError && (
                <div className="bg-red-50 text-red-900 border border-red-200 p-2 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 animate-pulse mt-1">
                  <span className="text-red-500 shrink-0">⚠️</span>
                  <span>{loverError}</span>
                </div>
              )}

              <p className="text-[9px] text-pink-700/70 text-center leading-normal mt-1 bg-pink-100/40 p-1.5 rounded-lg border border-pink-150">
                公告：当恋人安民值低于50时，Ta对大势爱豆粉圈的深沉愧疚、亏盗感将占上风而提出冷静分手。可通过手写纸扎长信及聊天甜言软语安抚来阻止！
              </p>
            </div>
          )}

          {selectedContact.summary && (
            <div className="bg-[#fcf8e3]/80 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-950 flex flex-col gap-1 leading-relaxed mb-2">
              <span className="font-extrabold uppercase shrink-0 bg-yellow-500/20 px-1.5 py-0.5 rounded text-[8px] tracking-wider text-amber-900 w-fit">
                📚 阶段性记忆归档总结 (Archived dialogue summary to save tokens)
              </span>
              <div>{selectedContact.summary}</div>
            </div>
          )}
          {currentMessages.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs text-[#556b82]">
              暂时没有历史记录。发送几句心里话开始探讨吧！
            </div>
          ) : (
            currentMessages.map((msg) => {
              const isIdol = msg.sender === "idol";
              return (
                <div key={msg.id} className={`flex items-start gap-2 ${isIdol ? "flex-row-reverse" : ""}`}>
                  {!isIdol && (
                    selectedContact.avatar ? (
                      <img src={selectedContact.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white/50 shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-yellow-500 text-slate-900 font-extrabold text-[10px] flex items-center justify-center border border-yellow-300 shrink-0">
                        {selectedContact.name.substring(0, 1)}
                      </div>
                    )
                  )}
                  <div className="max-w-[70%]">
                    {!isIdol && <p className="text-[9px] text-slate-600 mb-0.5">{selectedContact.name}</p>}
                    <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${isIdol ? "bg-[#fef01b] text-slate-900 rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"} ${msg.queueOnly ? "border-2 border-yellow-500 border-dashed animate-pulse" : ""}`}>
                      {msg.text}
                      {msg.queueOnly && (
                        <span className="block text-[8px] text-yellow-800 text-right mt-1 font-semibold font-mono font-bold animate-ping">
                          [ 等待一键收取回复中 ]
                        </span>
                      )}
                    </div>
                    <span className="block text-[8px] text-slate-500 mt-0.5 text-right font-mono">{msg.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat input footer */}
        <div className="bg-white p-2.5 border-t border-slate-200 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
            placeholder={`给 ${selectedContact.name} 发送信息...`}
            className="flex-1 bg-slate-100 text-xs text-slate-800 rounded-xl px-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-800 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
      
    </div>
  );
}
