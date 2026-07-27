import { useState } from "react";
import { IdolPersona, PersonalDiaryEntry, getCalendarPeriod } from "../types";
import { BookOpen, Sparkles, Heart, Flame, Calendar, Plus, RefreshCw, MessageSquare, Tag, PenTool, CheckCircle2, Award, Smile, ShieldAlert } from "lucide-react";
import { safeFetch } from "./apiHelper";
import { getManagerShortTitle } from "../utils/managerUtils";

interface PersonalDiaryAppProps {
  persona: IdolPersona;
  customApiKey: string;
  customApiEndpoint: string;
  onUpdatePersona: (p: IdolPersona) => void;
  onAddLog: (log: string) => void;
}

export function generateFallbackWeeklyDiaryEntry(persona: IdolPersona, weekNumber: number): PersonalDiaryEntry {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber * 7;
  const period = getCalendarPeriod(endDay, persona.cycleDays || 36);

  const isSolo = persona.style === "solo";
  const name = persona.stageName || persona.name;
  const genderTerm = persona.gender === "male" ? "哥" : "姐";
  const groupOrSoloStr = isSolo ? "Solo 独立舞台" : `${persona.groupName} 团界`;

  // Mood tags and emojis
  const moods = [
    { emoji: "✨", tag: "破茧微光 · 舞台悸动" },
    { emoji: "🔥", tag: "登顶狂热 · 爆款打歌" },
    { emoji: "🌧️", tag: "深夜雨夜 · 蜕变隐忍" },
    { emoji: "🌟", tag: "聚光灯下 · 璀璨交响" },
    { emoji: "🍷", tag: "微醺感怀 · 宿舍独白" },
  ];
  const selectedMood = moods[(weekNumber - 1) % moods.length];

  // Memorable moments based on persona
  const memorableMoments = [
    `第 ${startDay + 1} 天打歌舞台镜头下直拍爆火，首测九头身名模体态，镜头感与音准斩获弹幕疯狂夸赞；`,
    `第 ${startDay + 4} 天在粉丝签售会现场收到沉甸甸的手写信与专属破防贴纸，感受到了真爱粉无条件的偏爱；`,
    `第 ${endDay - 1} 天完成了极高难度的练习室消音训练，舞蹈与声望完成关键突破。`,
  ];

  // Stress peak detail
  let stressPeak = "";
  if (persona.stress > 60) {
    stressPeak = `第 ${startDay + 3} 天面对极高强度的体能压迫与严格控制，压力一度攀升至 ${persona.stress}%！皮肤出现严重红肿警戒，深夜靠去 SPA 与饮用绿汁冰疗才化险为夷。`;
  } else {
    stressPeak = `第 ${startDay + 2} 天深夜训练后感到短暂的心身疲倦（压力值约 ${persona.stress}%），但适时的水分补充与冷敷调整让体能快速复原，未影响次日大表。`;
  }

  // Relationship milestone detail
  let relationshipMilestone = "";
  if (persona.hasLover && persona.loverName) {
    relationshipMilestone = `与秘密恋人 ${persona.loverName} 在 KakaoTalk 上完成了深夜悄悄话互动（剧情攻受定位：${persona.romancePosition === "left" ? "左位主导" : "右位依恋"}），在镜头之外守护着这份最珍贵的地下温存。`;
  } else if (!isSolo && (persona.teammatesFavorability || 0) >= 60) {
    relationshipMilestone = `与队内成员完成宿舍深夜客厅长谈，团魂好感攀升至 ${persona.teammatesFavorability || 60}/100！彼此卸下防备，解锁了隐藏 MBTI 侧写与深层默契。`;
  } else {
    relationshipMilestone = `与${getManagerShortTitle(persona)}和经纪团队保持了高度专业的业务信任（室长好感 ${persona.managerFavorability || 50}/100），并凭借精湛的直拍在全网唯粉与路人圈中树立了敬业口碑。`;
  }

  const diaryContent = `【第 ${weekNumber} 周星途私密手记 · 写给首尔深夜的自己】

深夜 02:15 的宿舍客厅，只剩下咖啡机滴答作响的声音。回看这 7 天（Day ${startDay} - Day ${endDay}）的漫长征程，心里有种难以言喻的充实与震颤。

从第 ${startDay} 天踩着晨光踏入演艺厅的那一刻起，聚光灯的炙热感就从未退去。在 ${groupOrSoloStr} 的世界里，每一秒钟的镜头都像是一场严酷的试炼。这周最让我难忘的，是全网直拍破圈的那晚，弹幕里铺天盖地的夸赞让我第一次真切地感受到，那些在练习室泡过无尽汗水的深夜没有被辜负。

当然，也有过濒临极限的时刻。当体力和压力在周中飙升时，镜子里略显憔悴的脸庞和紧绷的神经曾让我一度怀疑自己。但幸好，身边有无条件支持我的真爱粉丝，有在后台默默递给我冰咖啡的团队，还有在最疲惫时给予我温暖慰藉的羁绊。

下周，舞台还会更宏大，挑战也会更刁钻。但只要手握麦克风，我就依然是舞台上无可替代的 ${name}。明天，继续全力以赴！`;

  return {
    id: `diary_week_${weekNumber}_${Date.now()}`,
    weekNumber,
    startDay,
    endDay,
    dateStr: period.text,
    title: `「第 ${weekNumber} 周星途私密手记 · ${selectedMood.tag}」`,
    content: diaryContent,
    memorableMoments,
    stressPeak,
    relationshipMilestone,
    moodEmoji: selectedMood.emoji,
    moodTag: selectedMood.tag,
    createdAt: new Date().toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
  };
}

export default function PersonalDiaryApp({
  persona,
  customApiKey,
  customApiEndpoint,
  onUpdatePersona,
  onAddLog,
}: PersonalDiaryAppProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editingNoteForId, setEditingNoteForId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const diaryEntries = persona.diaryEntries || [];
  const currentWeek = Math.max(1, Math.ceil(persona.dayNumber / 7));

  // Handle generating or regenerating a weekly diary entry
  const handleGenerateWeeklyDiary = async (weekNum: number) => {
    setIsGenerating(true);
    onAddLog(`【星途手记】正在汇总分析第 ${weekNum} 周（Day ${(weekNum - 1) * 7 + 1} - Day ${weekNum * 7}）的宏观高光、压力峰值与情感里程碑...`);

    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = weekNum * 7;
    const isSolo = persona.style === "solo";

    // Attempt AI Generation if keys exist or fallback to high-fidelity template
    try {
      const prompt = `你是一位顶级 K-pop 爱豆 ${persona.stageName} (${persona.gender === "male" ? "男爱豆" : "女爱豆"}，${isSolo ? "Solo歌手" : persona.groupName + "成员"}) 的私人助理与回忆随笔AI。
请为爱豆撰写一封极具文学感染力、真挚唯美、专属于爱豆首尔宿舍深夜私密日志（第 ${weekNum} 周总结，包含 Day ${startDay} 到 Day ${endDay}）。

爱豆当前状态数据：
- 艺名/名字：${persona.stageName} / ${persona.name}
- 粉丝数：${persona.fansCount.toLocaleString()}
- 绝美知名度/声望：${persona.popularity}/100, ${persona.reputation}/100
- 压力峰值表现：当前压力 ${persona.stress}%, 皮肤状态 ${persona.skinCondition}
- 情感羁绊：${persona.hasLover ? `与地下秘密恋人 ${persona.loverName} 交往中（定位: ${persona.romancePosition === "left" ? "左位/攻" : "右位/受"}）` : "专注事业与粉丝"}
- 团魂/队内好感：${isSolo ? "Solo独立路线" : `队内好感度 ${persona.teammatesFavorability}/100`}

请返回一个标准的 JSON 对象，包含以下字段（格式严格，不要包裹代码块）：
{
  "title": "日志标题（例如：『第 ${weekNum} 周星途私密手记 · 破茧与光影之交响』）",
  "moodEmoji": "代表本周心情的1个Emoji（如 ✨, 🔥, 🍷, 🌟, 🌧️）",
  "moodTag": "4-8字的短语情绪标签（如 破茧微光 · 舞台悸动）",
  "content": "一封约300字、第一人称语气（以‘我’视角）撰写的温暖、深刻、感人的深夜日志文案（包含首尔夜色、练习室汗水、对粉丝和羁绊的深情感怀）",
  "memorableMoments": [
    "难忘高光瞬间1",
    "难忘高光瞬间2",
    "难忘高光瞬间3"
  ],
  "stressPeak": "一句话详细描写本周压力最高峰与身体/皮肤极值挑战",
  "relationshipMilestone": "一句话详细总结本周与队友、恋人或经纪团队的情感突破里程碑"
}`;

      const response = await safeFetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: "You are a specialized K-Pop idol personal diary generator engine. Return ONLY the strict JSON block requested.",
          customApiKey: customApiKey,
          customApiEndpoint: customApiEndpoint,
        }),
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

      if (rawText.includes("```json")) {
        rawText = rawText.split("```json")[1].split("```")[0];
      } else if (rawText.includes("```")) {
        rawText = rawText.split("```")[1].split("```")[0];
      }

      if (rawText.trim()) {
        const parsed = JSON.parse(rawText.trim());

        const newEntry: PersonalDiaryEntry = {
          id: `diary_week_${weekNum}_${Date.now()}`,
          weekNumber: weekNum,
          startDay,
          endDay,
          dateStr: getCalendarPeriod(endDay, persona.cycleDays || 36).text,
          title: parsed.title || `「第 ${weekNum} 周星途私密手记」`,
          content: parsed.content || "",
          memorableMoments: parsed.memorableMoments || [],
          stressPeak: parsed.stressPeak || "",
          relationshipMilestone: parsed.relationshipMilestone || "",
          moodEmoji: parsed.moodEmoji || "✨",
          moodTag: parsed.moodTag || "星途随笔",
          createdAt: new Date().toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        };

        saveNewDiaryEntry(newEntry);
        onAddLog(`✨ 【星途手记生成成功】第 ${weekNum} 周周度星途私密日志已保存入库！`);
      } else {
        throw new Error("AI Direct call empty response, triggering local engine");
      }
    } catch (e) {
      console.warn("Using offline high-fidelity fallback diary generator:", e);
      const fallbackEntry = generateFallbackWeeklyDiaryEntry(persona, weekNum);
      saveNewDiaryEntry(fallbackEntry);
      onAddLog(`✨ 【星途手记离线生成】第 ${weekNum} 周星途日志总结已成功生成！`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveNewDiaryEntry = (entry: PersonalDiaryEntry) => {
    const existing = persona.diaryEntries || [];
    // Replace if week already exists, or unshift new
    const filtered = existing.filter((e) => e.weekNumber !== entry.weekNumber);
    const updatedEntries = [entry, ...filtered].sort((a, b) => b.weekNumber - a.weekNumber);

    const updatedP = { ...persona, diaryEntries: updatedEntries };
    onUpdatePersona(updatedP);
    setSelectedEntryId(entry.id);
  };

  const handleSaveUserNote = (entryId: string) => {
    if (!noteInput.trim()) return;
    const existing = persona.diaryEntries || [];
    const updatedEntries = existing.map((e) => {
      if (e.id === entryId) {
        return { ...e, userNote: noteInput.trim() };
      }
      return e;
    });

    onUpdatePersona({ ...persona, diaryEntries: updatedEntries });
    setEditingNoteForId(null);
    setNoteInput("");
    onAddLog(`📝 【随笔备注更新】已为第 ${entryId} 条星途手记添加个人感悟！`);
  };

  const selectedEntry = diaryEntries.find((e) => e.id === selectedEntryId) || diaryEntries[0];

  return (
    <div id="personal-diary-app" className="primary-app-container scrollable-desktop bg-[#0a0714] border border-purple-500/20 rounded-2xl p-4 sm:p-5 space-y-4 relative overflow-hidden text-slate-100">
      {/* Background glowing ambience */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* App Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600/30 to-amber-500/30 rounded-2xl border border-purple-400/40 shadow-lg text-amber-300">
            <BookOpen className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase font-mono tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/30">
                📖 IDOL PERSONAL DIARY · 星途私密手记
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                每 7 天周度自动总结
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-wide mt-0.5">
              {persona.stageName} 的深夜私密星途日志 ({persona.gender === "male" ? "男爱豆" : "女爱豆"} · 第 {currentWeek} 周)
            </h2>
          </div>
        </div>

        <button
          onClick={() => handleGenerateWeeklyDiary(currentWeek)}
          disabled={isGenerating}
          className={`py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-purple-400/30 shrink-0 ${
            isGenerating ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <Sparkles className={`w-4 h-4 text-amber-300 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "正在撰写本周总结..." : `立即整理第 ${currentWeek} 周星途小结`}</span>
        </button>
      </div>

      {/* Main Grid: Left List of Weeks, Right Selected Entry Detail */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
        
        {/* Left Side: Weekly List */}
        <div className="md:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200 font-mono">
            <span>📅 周度日志列表 ({diaryEntries.length} 篇)</span>
            <span className="text-[10px] text-slate-400">当前天数: Day {persona.dayNumber}</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {diaryEntries.length === 0 ? (
              <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-5 text-center space-y-3">
                <Calendar className="w-8 h-8 text-purple-400/50 mx-auto" />
                <p className="text-xs text-purple-200/80 leading-relaxed font-sans">
                  暂未自动生成周度日志。系统会在每满 7 天（第 7、14、21...天）自动帮您归纳星途高光与压力极值。
                </p>
                <button
                  onClick={() => handleGenerateWeeklyDiary(currentWeek)}
                  disabled={isGenerating}
                  className="py-2 px-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs shadow transition-all cursor-pointer inline-flex items-center gap-1.5 border border-purple-400/30"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-300" />
                  提前生成第 {currentWeek} 周随笔
                </button>
              </div>
            ) : (
              diaryEntries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? "bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                        : "bg-slate-900/70 border-purple-500/20 hover:border-purple-400/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                        {entry.moodEmoji} Week {entry.weekNumber}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{entry.createdAt}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                      {entry.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-purple-200/70 font-mono mt-2 pt-2 border-t border-purple-500/10">
                      <span>Day {entry.startDay} - Day {entry.endDay}</span>
                      <span className="text-purple-300 font-bold">{entry.moodTag}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Entry Detailed View */}
        <div className="md:col-span-8">
          {selectedEntry ? (
            <div className="bg-[#0f0b1a] border border-purple-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-5">
              {/* Entry Title Header */}
              <div className="border-b border-purple-500/20 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedEntry.moodEmoji}</span>
                    <span className="text-xs font-black font-mono uppercase tracking-widest text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-400/30">
                      【 Week {selectedEntry.weekNumber} · {selectedEntry.moodTag} 】
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-300/80 font-mono">
                    📅 Day {selectedEntry.startDay} - Day {selectedEntry.endDay} ({selectedEntry.dateStr})
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white tracking-wide mt-1">
                  {selectedEntry.title}
                </h3>
              </div>

              {/* Journal Stylized Narrative Content */}
              <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-4.5 relative shadow-inner">
                <div className="text-4xl text-purple-400/20 font-serif leading-none absolute top-2 left-3 select-none">“</div>
                <div className="text-xs sm:text-sm text-purple-100 leading-relaxed font-sans whitespace-pre-line pl-6 pr-2 pt-1 font-normal">
                  {selectedEntry.content}
                </div>
                <div className="text-right text-[10px] font-bold text-amber-300/90 font-mono pt-3 pr-2 border-t border-purple-500/10 mt-3">
                  —— 笔于首尔深夜宿舍 · 爱豆 {persona.stageName} 亲记
                </div>
              </div>

              {/* 3 Core Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Memorable Moments */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>🌟 难忘高光时刻</span>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedEntry.memorableMoments.map((moment, idx) => (
                      <li key={idx} className="text-[11px] text-purple-100/90 leading-tight flex items-start gap-1">
                        <span className="text-amber-400 shrink-0">•</span>
                        <span>{moment}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Stress Peak Detail */}
                <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-300" />
                    <span>⚡ 压力与身体极值</span>
                  </div>
                  <p className="text-[11px] text-rose-100/90 leading-relaxed">
                    {selectedEntry.stressPeak}
                  </p>
                </div>

                {/* 3. Relationship Milestones */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Heart className="w-4 h-4 text-pink-300" />
                    <span>💖 羁绊与情感里程碑</span>
                  </div>
                  <p className="text-[11px] text-indigo-100/90 leading-relaxed">
                    {selectedEntry.relationshipMilestone}
                  </p>
                </div>

              </div>

              {/* User Custom Note Block */}
              <div className="bg-slate-900/80 border border-purple-500/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-amber-300" />
                    <span>📝 我的个人随手感悟 (Personal Mood Note)</span>
                  </span>
                  {editingNoteForId !== selectedEntry.id && (
                    <button
                      onClick={() => {
                        setEditingNoteForId(selectedEntry.id);
                        setNoteInput(selectedEntry.userNote || "");
                      }}
                      className="text-[10px] text-amber-300 hover:underline font-mono cursor-pointer"
                    >
                      {selectedEntry.userNote ? "编辑感悟" : "+ 添加随手贴记"}
                    </button>
                  )}
                </div>

                {editingNoteForId === selectedEntry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="写下你作为玩家对这周发生的精彩经历、角色成长或恋爱细节的心情随笔..."
                      rows={2}
                      className="w-full bg-slate-950 border border-purple-500/40 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingNoteForId(null)}
                        className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-white"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSaveUserNote(selectedEntry.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg shadow"
                      >
                        保存感悟
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 italic font-sans pl-1">
                    {selectedEntry.userNote || "暂未添加个人随手感悟。点击右上角随时补充你的心情心得。"}
                  </p>
                )}
              </div>

              {/* Action Buttons: Regenerate or Export */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                <span className="text-[10px] text-slate-400 font-mono">
                  记录编号: {selectedEntry.id}
                </span>
                <button
                  onClick={() => handleGenerateWeeklyDiary(selectedEntry.weekNumber)}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-purple-500/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>重新精研 AI 整理本周</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-12 text-center text-slate-400">
              请选择左侧的周度星途手记卡片查看详情
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
