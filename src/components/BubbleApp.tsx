import { useState } from "react";
import { BubbleMessage, IdolPersona, SimulatedTeammate } from "../types";
import { MessageSquare, Heart, Volume2, Sparkles, Send } from "lucide-react";
import { safeFetch } from "./apiHelper";

interface BubbleProp {
  persona: IdolPersona;
  teammates: SimulatedTeammate[];
  bubbleMessages: BubbleMessage[];
  customApiKey: string;
  customModel: string;
  customApiEndpoint: string;
  onUpdateBubble: (messages: BubbleMessage[]) => void;
  onUpdateStats: (popularity: number, reputation: number, energy: number, stress: number) => void;
  onAddLog: (log: string) => void;
}

export default function BubbleApp({
  persona,
  teammates,
  bubbleMessages,
  customApiKey,
  customModel,
  customApiEndpoint,
  onUpdateBubble,
  onUpdateStats,
  onAddLog
}: BubbleProp) {
  const [bubbleInputText, setBubbleInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Send a Bubble message (Requirement 14: Fans ask about details of teammates, teammates can interact)
  const handleSendBubbleMessage = async () => {
    if (!bubbleInputText.trim() || isSending) return;

    setIsSending(true);
    const userText = bubbleInputText;

    // 1. Add user's message
    const newIdolMsg: BubbleMessage = {
      id: `b_user_${Date.now()}`,
      sender: "idol",
      text: userText,
      time: "刚刚"
    };

    const currentList = [...bubbleMessages, newIdolMsg];
    onUpdateBubble(currentList);
    setBubbleInputText("");

    // Update stats slightly
    onUpdateStats(persona.popularity + 1, persona.reputation, persona.energy - 3, persona.stress);
    onAddLog(`已经在 Bubble 官咖发出了订阅专属气泡消息！`);

    // 2. Generate randomized response from fans or teammate gossip (Requirement 14)
    try {
      let randMate = teammates && teammates.length > 0 ? teammates[0] : null;
      if (teammates && teammates.length > 0) {
        const found = teammates.find(mate => 
          userText.includes(mate.name) || 
          (mate.stageName && userText.includes(mate.stageName))
        );
        if (found) {
          randMate = found;
        }
      }

      const isTeammateQuestion = userText.includes("队友") || 
        userText.includes("不和") || 
        userText.includes("吵架") || 
        userText.includes("私下") || 
        (teammates && teammates.some(t => userText.includes(t.name) || (t.stageName && userText.includes(t.stageName))) || userText.includes("智雅"));
      
      let promptQuery = `The Kpop Idol "${persona.name}" (Gender: ${persona.gender === "female" ? "female/女性/女爱豆" : "male/男性/男爱豆"}) sent this Bubble to fans: "${userText}". Describe fan feedback or a teammate chime-in. Keep it short. Player Gender is "${persona.gender}".`;
      let systemPrompt = `You are a group of highly passionate subscribers commenting inside a private idol bubble platform. Player Gender: "${persona.gender}". Since the player is ${persona.gender === 'female' ? 'female' : 'male'}, supportive comments and addressing terms inside fan replies MUST use female honorifics like "欧尼/姐姐/她" if referring to a female, or male ones like "欧巴/哥哥/他/哥" if referring to a male. NEVER cross-gender address. Output a couple of fan comments in Chinese starting with fan names, like '智允的小雏菊: ...' or 'MelonMelon: ...'.`;

      if (isTeammateQuestion && randMate) {
        promptQuery = `Idol "${persona.name}" (Gender: ${persona.gender === "female" ? "female/女性/女爱豆" : "male/男性/男爱豆"}) is responding to a question about teammate "${randMate.name}" or group gossip. They wrote: "${userText}". Generate some subscriber responses asking about "${randMate.name}" and the dynamic between you, plus a surprise text chat from "${randMate.name}" who joins the Bubble feed! Player Gender is "${persona.gender}".`;
        systemPrompt = `You are simulated Kpop forum netizens and a funny teammate named "${randMate.name}". MBTI "${randMate.mbti}", role "${randMate.role}". Player Gender: "${persona.gender}". Since the player is ${persona.gender === 'female' ? 'female' : 'male'}, they must be addressed correctly by teammates and fans. Teammates must call a female player "欧尼" or "姐姐" or "她", or call a male player "哥" or "他/家伙". Make ${randMate.name} reply to the idol's Bubble to tease or support them, and fans going crazy with correct addressing terms!`;
      }

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptQuery,
          systemInstruction: systemPrompt,
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
      const fallbackName = randMate ? randMate.name : "智雅";
      const replyMsgStr = data.text || `「哇！宝宝发消息了！好吃惊啊！」\n「哈哈，队友${fallbackName}也入群围观了，太可爱啦！」`;

      // Split responses if multiple lines
      const splitReplies = replyMsgStr.split("\n").filter((l = "") => l.trim() !== "");
      
      const nextMessages = [...currentList];
      splitReplies.forEach((replyStr, i) => {
        nextMessages.push({
          id: `b_auto_${Date.now()}_${i}`,
          sender: "fan_mass",
          text: replyStr,
          time: "刚刚"
        } as BubbleMessage);
      });

      onUpdateBubble(nextMessages);
    } catch (e) {
      console.error(e);
      // fallback
      onUpdateBubble([
        ...currentList,
        {
          id: `b_fallback_${Date.now()}`,
          sender: "fan_mass",
          text: "「天啊！今天的泡泡营业太良心了！宝宝多吃点消肿茶噢！」",
          time: "刚刚"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="bubble-app" className="flex flex-col h-full rounded-2xl overflow-hidden bg-[#e0eafe]/65 glass-panel text-slate-800 border border-indigo-900/10">
      
      {/* Title Header */}
      <div className="bg-white/95 px-4 py-3 border-b border-[#c8d4e7] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow">
            b
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Dear U. bubble for ECLIPSE
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="text-[9px] text-slate-500">
              付费订阅量: <strong className="text-indigo-600">{(persona.fansCount * 0.015).toFixed(0)} 位活跃订阅</strong> (月提成收益: ₩{((persona.fansCount * 0.015) * 0.06).toFixed(0)}万)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[9px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-mono">
          <Volume2 className="w-3 h-3 text-indigo-500 animate-bounce" /> 音频广播已就绪
        </div>
      </div>

      {/* Bubble interactive chat stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] md:max-h-[360px]">
        {bubbleMessages.map((msg) => {
          const isIdol = msg.sender === "idol";
          return (
            <div key={msg.id} className={`flex items-start gap-2 ${isIdol ? "flex-row-reverse" : ""}`}>
              {!isIdol && (
                <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center text-[10px] text-indigo-800 font-bold font-mono">
                  FAN
                </div>
              )}
              <div className="max-w-[75%]">
                <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${isIdol ? "bg-[#3af175]/15 text-slate-800 rounded-tr-none border border-emerald-500/15" : "bg-white text-slate-800 rounded-tl-none border border-[#d2dceb]"}`}>
                  <p className="font-sans whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="block text-[8px] text-slate-500 mt-0.5 text-right font-mono">{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer bubble input */}
      <div className="bg-white p-3 border-t border-[#c8d4e7] flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={bubbleInputText}
          onChange={(e) => setBubbleInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSendBubbleMessage(); }}
          placeholder="向所有付费订阅粉丝发送亲切泡泡，也可以顺带询问队友动态..."
          className="flex-1 bg-slate-100 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 border-none"
        />
        <button
          onClick={handleSendBubbleMessage}
          disabled={!bubbleInputText.trim() || isSending}
          className="p-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Send className="w-3 h-3" />
          {isSending ? "发送中..." : "营业"}
        </button>
      </div>

    </div>
  );
}
