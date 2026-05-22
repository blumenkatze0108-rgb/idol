import { useState } from "react";
import { ChatContact, ChatMessage, IdolPersona, SimulatedTeammate } from "../types";
import { MessageSquare, Send, Zap, User, AlertCircle, Smile } from "lucide-react";

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
  onAddLog
}: KakaoTalkProp) {
  const [selectedContactId, setSelectedContactId] = useState<string>("manager");
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedContact = chatContacts.find((c) => c.id === selectedContactId) || chatContacts[0];
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
        const response = await fetch("/api/gemini/generate", {
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
              <p className="text-[9px] text-slate-500">
                关系好感值: <strong className="text-purple-600">{selectedContact.favorability ?? 50}/100</strong> {(selectedContact.favorability ?? 50) < 35 && " (态度极其冷淡/容易搞小动作)"}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <User className="w-3 h-3" /> KakaoTalk™
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[240px] md:max-h-[300px]">
          {selectedContact.summary && (
            <div className="bg-[#fcf8e3]/80 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-950 flex flex-col gap-1 leading-relaxed">
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
