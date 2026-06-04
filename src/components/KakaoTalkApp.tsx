import { useState, useEffect, useRef } from "react";
import { ChatContact, ChatMessage, IdolPersona, SimulatedTeammate, getCurrentAge } from "../types";
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
  personas?: IdolPersona[];
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
  onUpdatePersona,
  personas
}: KakaoTalkProp) {
  const [selectedContactId, setSelectedContactId] = useState<string>("manager");
  const [activeMobileView, setActiveMobileView] = useState<"contacts" | "chat">("contacts");
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loverError, setLoverError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedContact = chatContacts.find((c) => c.id === selectedContactId) || chatContacts[0];

  const getContactAge = (contactId: string): number => {
    const yearsPassed = Math.floor((persona.dayNumber - 1) / 36);
    if (contactId === "manager") return 32 + yearsPassed;
    if (contactId === "ceo") return 48 + yearsPassed;
    if (contactId === "rival") return 19 + yearsPassed;
    if (contactId === "lover") {
      const playerStartAge = persona.age ?? 18;
      if (persona.loverAge === "older") return playerStartAge + 2 + yearsPassed;
      if (persona.loverAge === "younger") return Math.max(15, playerStartAge - 2) + yearsPassed;
      return playerStartAge + yearsPassed;
    }
    // For teammates, find them in the teammates list
    const foundMate = teammates.find(t => t.id === contactId);
    if (foundMate) {
      return (foundMate.age ?? 18) + yearsPassed;
    }
    // Also check if it's one of the playable twins!
    if (contactId.startsWith("player_mate_")) {
      const otherIdx = parseInt(contactId.replace("player_mate_", ""), 10);
      const otherP = personas?.[otherIdx];
      if (otherP) {
        return (otherP.age ?? 18) + yearsPassed;
      }
    }
    return 18 + yearsPassed; // Fallback
  };

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
  const selectedContactHasQueued = currentMessages.some((m) => m.sender === "idol" && m.queueOnly);

  useEffect(() => {
    // Scroll to bottom when messages list, active generating state, or selected contact changes
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [currentMessages, isGenerating, selectedContactId]);

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

  // Check Character-based Jaccard similarity to filter out semantic duplicates
  const isSemanticDuplicate = (text1: string, text2: string): boolean => {
    if (!text1 || !text2) return false;
    const clean1 = text1.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"' \n\s；：，。！？、“”（）]/g, "");
    const clean2 = text2.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"' \n\s；：，。！？、“”（）]/g, "");
    if (clean1 === clean2) return true;
    
    // If one is highly inclusive of the other and they are of generic length
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      if (Math.min(clean1.length, clean2.length) > 8) {
        return true;
      }
    }
    
    // Calculate character bigrams
    const set1 = new Set<string>();
    for (let i = 0; i < clean1.length - 1; i++) {
      set1.add(clean1.substring(i, i + 2));
    }
    const set2 = new Set<string>();
    for (let i = 0; i < clean2.length - 1; i++) {
      set2.add(clean2.substring(i, i + 2));
    }
    
    if (set1.size === 0 || set2.size === 0) return false;
    let intersection = 0;
    set1.forEach(val => {
      if (set2.has(val)) intersection++;
    });
    
    const similarity = intersection / Math.max(set1.size, set2.size);
    return similarity > 0.65; // Highly similar expressions get deduplicated (65% bigram match)
  };

  // Central trigger to process all queued messages in parallel (Requirement 9)
  const handleBatchProcessReplies = async () => {
    const queuedCount = getQueuedCount();
    if (queuedCount === 0) return;

    setIsGenerating(true);
    onAddLog(`正在对 ${queuedCount} 个联系人批量抓取 AI 偶像人设回复...`);

    const newHistories = { ...chatHistories };
    const updatedContacts = [...chatContacts];
    const newlyGeneratedReplies: string[] = [];

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
      
      // Get the last 3 messages as history context (excluding system or current queue messages)
      const recentHistoryMsgs = msgs
        .filter((m) => m.sender !== "system" && !m.queueOnly)
        .slice(-3);
      
      const historyContext = recentHistoryMsgs.length > 0
        ? `\n【当前对话最近上文历史（请以此作为最近沟通背景，绝对禁止复读或使用其中已说过的相同语气词、核心句式或类似想法，保持回复的连续性与新颖度）：】\n` + 
          recentHistoryMsgs.map(m => `${m.sender === "idol" ? "我" : contact.name}: "${m.text}"`).join("\n")
        : "";

      // Create character instruction context (Requirement 13 & 15)
      let customSystemPrompt = `You are a character in Korea's Entertainment world replying via KakaoTalk. Do not break character. Keep it in Chinese.
      Your Name: "${contact.name}"
      Your Role: "${contact.role}" (${contact.id === 'lover' ? '偷偷交往的地下恋爱恋人' : contact.role === 'manager' ? '总负责人/经纪人' : contact.role === 'member' ? '队内合伙队友' : '社长高级领袖'}).
      MBTI Profile: "${contact.mbti || 'ESTJ'}".
      Favorability score toward the player: ${contact.favorability ?? 50}/100.
      ${contact.id === 'lover' ? `Critical Constraint: You are the player's secret underground dating partner in the K-Pop world where dating is heavily banned. Respond in a very sweet, warm, deeply caring, yet slightly nervous/secretive tone. Use words like 亲爱的, 宝贝, 汉江. Suggest meeting up stealthily, checking for cameras or managers.
      Current Roleplay Position: Player is configured in settings as "${persona.romancePosition || 'right'}" (左位 means the player is dominant/Top/Gong; 右位 means the player is reliant/Bottom/Shou).
      ${(persona.romancePosition || 'right') === 'left'
        ? 'Because the player is Top/Gong (左位), YOU (the replier) are Bottom/Shou (右位). Your response should be incredibly cute, gentle, soft, delicate, reliant, and slightly shy. Emphasize that you feel completely safe with them, ask them to hug or pet you, act spoiled, write with delicate emotion, and describe wanting to rest on their shoulder.'
        : 'Because the player is Bottom/Shou (右位), YOU (the replier) are Top/Gong (左位). Your response should be deeply protective, pampering, strong-willed, dominant, and assertively caring. Treat them like your adorable baby who needs protection from manager eyes and full spoiling. Call them cute nicknames or pet names like 宝宝, 傻瓜, 小鬼, my little one. Tell them you will hold them tightly and face any stress together.'
      }` : ''}
      ${contact.summary ? `Dialogue History Milestones Summary: "${contact.summary}". Maintain continuity with these compiled memories!` : ""}
      
      Player Gender: "${persona.gender}".
      CRITICAL ROLEPLAY/GENDER ADDR CONSTRAINTS:
      - The player's gender is ${persona.gender === "female" ? "FEMALE (女性/女爱豆)" : "MALE (男性/男爱豆)"}.
      - When addressing the player, other characters MUST use correct gender-appropriate titles:
        * If player is FEMALE: You must call them "欧尼" (Onni/Sister) or "姐姐", and refer to them with female terms (she/her/她). Never call them "哥", "欧巴", "哥哥".
        * If player is MALE: You must call them "哥哥" / "欧巴" / "哥" (if you are a girl/female fan/teammates addressing them) or "哥" / "老弟" / "小子/家伙" (if you are a guy), and refer to them with male terms (he/him/他). Never call them "欧尼", "姐姐".
      - Keep all dialogue consistent with player being a ${persona.gender === 'female' ? 'female' : 'male'} idol.
      
      Player is a ${persona.startType === 'trainee' ? '训练生' : '出道人气爱豆'} named "${persona.name}" (Stage name: ${persona.stageName}), who is of ${persona.nationality === 'korean' ? '韩国本土' : '外籍绿卡员'} nationality. 
      Note: Korean entertainment companies may show subtle bias against green-card members. Use this background if favorability is low or nationality is foreign green card.
      Current Artist Ageing Factor: ${persona.ageing_factor || 0} out of a long-term contract career tracking scale (0 = newbie, 1 = steady maturing, 2 = veteran senior, 3+ = legendary star).
      Tone adaptation rules based on Ageing Factor:
      - If ageing_factor is 0: Treat them with basic guidance or standard trainee/rookie strict instructions.
      - If ageing_factor is 1: Be slightly more respectful or subtle in acknowledging their growth.
      - If ageing_factor >= 2: Speak to them in a more mature, refined, professional colleague-to-colleague tone rather than random yelling, showing respect for their established seniority, veteran experience and veteran patience.
      If favorability is < 30 (for non-lovers), be cold, formal, and micro-aggressive. If favorability is > 70, be very friendly, tease, or speak warmly. Include authentic Kpop slang (like "Fighting", "Wink", "美容室", "主打歌", "出圈").`;

      customSystemPrompt += historyContext;

      if (personas && personas.length > 1) {
        const groupDesc = personas.map((p, pIdx) => {
          return `- 成员 ${pIdx + 1}: ${p.name} (艺名: ${p.stageName}), 担当: ${p.roleInGroup}, MBTI: ${p.mbti}, 国籍: ${p.nationality}`;
        }).join("\n");
        customSystemPrompt += `\n\n【极其重要：多开组合团队背景】
当前玩家所在的是一个 ${personas.length} 人的高精度组合，名字叫 "${persona.groupName}"，所属经纪公司为 "${persona.company}"。
这个组合内的所有成员都是玩家同时可切换扮演的主角。成员明细如下：
${groupDesc}
现在正在和你说话的扮演者当前是："${persona.name}"（艺名 "${persona.stageName}"）。
当你们交流时，请时刻保持对这个组合以及其他合伙成员的充分认知。在言谈中可以自然地提及其他成员并关注组合的近期练习、称重、债务情况、生活日常或打歌互助关系，让对话极具团队实感与多角色沉浸度！
极其重要限制：玩家所在的组合仅限于上述 [${personas.map(p => p.stageName || p.name).join(", ")}] 成员，绝对禁止脑补或虚构出任何此明细名字之外的捏造韩国名假队友！所有团内互动只能谈及这几位成员，展现极高团队属性和高定沉浸感！`;
      }

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
        
        let replyText = data.text || "呀，收到你的消息啦。练习室见！";

        // Remove queue labels
        const cleanedMsgs = msgs.map(m => ({ ...m, queueOnly: false }));

        // Check duplication against both previous history and other replies generated in this batch
        const recentHistoryTexts = msgs
          .filter(m => m.sender !== "system" && !m.queueOnly)
          .slice(-4)
          .map(m => m.text);

        let isDup = false;
        for (const prevText of [...recentHistoryTexts, ...newlyGeneratedReplies]) {
          if (isSemanticDuplicate(replyText, prevText)) {
            isDup = true;
            break;
          }
        }

        if (isDup) {
          // Change/Fallback the reply to something completely different and customized
          let fallbackPool: string[] = [];
          
          if (contact.id === "lover") {
            fallbackPool = [
              "好啦，听你的，等结束了我们悄悄联络，千万要保护好自己喔。😘",
              "傻瓜，知道你压力大。等晚上我跑腿去买消肿美式，咱们晚点偷偷见面！🤫",
              "收到啦！刚才差点被拍到在看手机，晚点回宿舍我给你发照片，加油！",
              "明白啦！我也在想你，刚才跳完舞蹈全身都湿透了，晚上洗完澡我们再详细聊哦。✨"
            ];
          } else if (contact.role === "manager" || contact.id === "manager") {
            fallbackPool = [
              "行了，废话少说。今天的称重测评和考勤抓紧时间，表现不好下张专辑资源直接推后！",
              "收到你的进度汇报了，下午两点在公司会议室，代表在等你的声乐考核，机灵点！",
              "今天美容室的行程已经核准了。记住，在媒体面前情绪管理第一，千万别说不该说的话。"
            ];
          } else if (contact.role === "member" || contact.id === "ceo") {
            fallbackPool = [
              "哈哈，收到啦！等会儿去排练室我们单独对一下那段主打曲的副歌，Fighting！",
              "收到！中午在宿舍等我，我们一起用那个新的低卡油醋汁拌点轻食鸡胸肉沙拉！🥣",
              "明白明白！那我先把闹钟调好。昨晚你在Weverse上被热搜安利了，超级厉害啊！✨",
              "刚才看舞台走位回放，你昨天的直拍效果极好，简直是Killing part的神！今天也要加油啊！"
            ];
          } else {
            fallbackPool = [
              "原来如此！你的小窗留言我收到啦，这真是帮了大忙了，一起加油吧！",
              "哈哈，收到你的小窗消息啦。我们美容室/练习室见，今天也要元气满满地努力哦！",
              "呀，了解你的想法啦！那我们继续按照既定行程正常推进，千万不要感冒了！"
            ];
          }
          
          const randIdx = Math.floor(Math.random() * fallbackPool.length);
          replyText = fallbackPool[randIdx];
        }

        // Record this reply content to prevent other contacts from sending a duplicate in the same batch
        newlyGeneratedReplies.push(replyText);

        cleanedMsgs.push({
          id: `reply_${Date.now()}_${contact.id}`,
          sender: "other",
          text: replyText,
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
            lastMessage: replyText.substring(0, 30) + (replyText.length > 30 ? "..." : ""),
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
    <div id="kakaotalk-app" className="flex flex-col landscape:flex-row md:flex-row h-full rounded-2xl overflow-hidden border border-amber-900/10 bg-[#ffeee0]/45 glass-panel text-slate-800 min-h-0">
      
      {/* Left Chat list */}
      <div className={`w-full landscape:w-[200px] md:w-[260px] bg-white/70 border-r border-[#edd8c4] flex flex-col justify-between p-2.5 sm:p-3 shrink-0 ${activeMobileView === "contacts" ? "flex" : "hidden landscape:flex md:flex"}`}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-[#edd8c4] pb-2 mb-2 shrink-0">
            <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-yellow-600" />
              KakaoTalk (练习互聊)
            </span>
            <span className="bg-amber-900/10 text-[10px] text-amber-900 px-2 py-0.5 rounded-full font-mono">
              {chatContacts.length} 个
            </span>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 pr-1 min-h-0">
            {chatContacts.map((c) => {
              const hasQueued = (chatHistories[c.id] || []).some((m) => m.sender === "idol" && m.queueOnly);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContactId(c.id);
                    setActiveMobileView("chat");
                  }}
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
                      <div className="flex items-center min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{c.name}</span>
                        <span className="text-[8px] text-amber-800 bg-amber-500/10 font-mono px-1 rounded ml-1 font-bold shrink-0">{getContactAge(c.id)}岁</span>
                      </div>
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
      <div className={`flex-1 bg-[#b2c7da] flex flex-col justify-between min-h-0 relative ${activeMobileView === "chat" ? "flex" : "hidden landscape:flex md:flex"}`}>
        
        {/* Chat topbar */}
        <div className="bg-white/90 px-4 py-2 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            {/* Back button on mobile */}
            <button
              onClick={() => setActiveMobileView("contacts")}
              className="md:hidden landscape:hidden p-1 px-2.5 bg-yellow-400 hover:bg-yellow-350 text-slate-900 font-bold text-[10px] rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            >
              ◀ <span>列表</span>
            </button>

            {selectedContact.avatar ? (
              <img src={selectedContact.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-yellow-500 text-slate-900 font-extrabold text-xs flex items-center justify-center border border-yellow-300 shrink-0">
                {selectedContact.name.substring(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <span className="text-xs font-bold text-slate-800 truncate">{selectedContact.name}</span>
                <span className="text-[9px] bg-slate-250 font-mono px-1.5 py-0.5 rounded text-slate-600 shrink-0">{selectedContact.mbti}</span>
                <span className="text-[9px] bg-amber-500/10 font-mono px-1.5 py-0.5 rounded text-amber-700 font-extrabold shrink-0">{getContactAge(selectedContact.id)}岁</span>
              </div>
              <p className="text-[9px] text-slate-500 flex items-center gap-1.5 truncate">
                {selectedContact.id === "lover" ? (
                  <>
                    <span className="shrink-0">地下恋爱:</span> <strong className="text-pink-600 font-semibold shrink-0">{persona.loverMood ?? 80}/100</strong>
                    <span className="text-[10px] rounded px-1.5 py-0.2 bg-pink-100 text-pink-700 font-bold truncate">
                      {persona.relationshipStatus === "broken_up" ? "💔已分手" : "🤫秘恋"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="shrink-0">好感:</span> <strong className="text-purple-600 shrink-0">{selectedContact.favorability ?? 50}/100</strong> {(selectedContact.favorability ?? 50) < 35 && " (态度极其冷淡)"}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
            <User className="w-3 h-3" /> KakaoTalk™
          </div>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
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
                    <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm ${isIdol ? "bg-[#fef01b] text-slate-900 rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"} ${msg.queueOnly ? "border border-yellow-600/30 border-dashed" : ""}`}>
                      {msg.text}
                      {msg.queueOnly && (
                        <span className="block text-[8px] text-slate-500 text-right mt-1 font-mono">
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

          {/* Typing Indicator Animated Bubble */}
          {isGenerating && selectedContactHasQueued && (
            <div className="flex items-start gap-2 animate-fadeIn pb-3">
              {selectedContact.avatar ? (
                <img src={selectedContact.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white/50 shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-yellow-500 text-slate-900 font-extrabold text-[10px] flex items-center justify-center border border-yellow-300 shrink-0">
                  {selectedContact.name.substring(0, 1)}
                </div>
              )}
              <div className="max-w-[70%]">
                <p className="text-[9px] text-slate-600 mb-0.5">{selectedContact.name}</p>
                <div className="bg-white text-slate-800 p-3 px-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-8 w-16 justify-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-typing-dot-1"></span>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-typing-dot-2"></span>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-typing-dot-3"></span>
                </div>
                <span className="block text-[8px] text-amber-800 font-medium mt-1 pl-1 animate-pulse font-mono">
                  正在输入中...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
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
