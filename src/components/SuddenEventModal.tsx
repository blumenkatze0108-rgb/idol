import { SystemEvent, IdolPersona } from "../types";
import { AlertCircle, ShieldAlert, Sparkles, Trophy, Skull } from "lucide-react";

interface EventModalProps {
  event: SystemEvent;
  persona: IdolPersona;
  onChoiceSelected: (
    popularityEffect: number,
    reputationEffect: number,
    energyEffect: number,
    moneyEffect: number,
    stressEffect: number,
    debtChange: number,
    managerChange: number,
    teammatesChange: number,
    outcomeText: string
  ) => void;
}

export default function SuddenEventModal({ event, persona, onChoiceSelected }: EventModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="w-full max-w-xl bg-slate-900 border border-purple-500/20 text-white rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Hologram aesthetic backdrop */}
        <div className="absolute inset-x-0 top-0 h-32 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="p-6 relative">
          <div className="flex items-center gap-2 mb-3">
            {event.type === "challenge" && <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />}
            {event.type === "warning" && <Skull className="w-5 h-5 text-amber-400" />}
            {event.type === "positive" && <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />}
            {event.type === "neutral" && <AlertCircle className="w-5 h-5 text-blue-400" />}

            <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
              {event.type === "challenge" ? "🚯 业界舆论危机挑战 (Crisis Challenge)" : "📢 触发突发事件事件 (Sudden Event)"}
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-100 leading-snug">
            {event.title}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed mt-3.5 bg-slate-950/40 p-4 border border-white/5 rounded-xl font-sans whitespace-pre-line">
            {event.description}
          </p>

          <div className="mt-5 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              请谨慎做出您的回答决定 (Your Response Direction)
            </span>

            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => {
                  onChoiceSelected(
                    choice.popularityEffect || 0,
                    choice.reputationEffect || 0,
                    choice.energyEffect || 0,
                    choice.moneyEffect || 0,
                    choice.stressEffect || 0,
                    choice.debtChange || 0,
                    choice.managerChange || 0,
                    choice.teammateChange || 0,
                    choice.outcomeText
                  );
                }}
                className="w-full text-left p-3 bg-slate-950 border border-white/5 hover:border-purple-500/35 hover:bg-purple-950/10 rounded-xl transition-all cursor-pointer active:scale-99 group flex flex-col justify-between"
              >
                <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 leading-relaxed">
                  {choice.text}
                </p>
                <div className="flex gap-2 text-[8px] text-slate-450 font-mono mt-2 pt-1 border-t border-white/5 w-full">
                  {choice.popularityEffect !== 0 && (
                    <span className={choice.popularityEffect > 0 ? "text-emerald-400" : "text-rose-400"}>
                      人气 {choice.popularityEffect > 0 ? "+" : ""}{choice.popularityEffect}
                    </span>
                  )}
                  {choice.reputationEffect !== 0 && (
                    <span className={choice.reputationEffect > 0 ? "text-indigo-400" : "text-rose-400"}>
                      口碑 {choice.reputationEffect > 0 ? "+" : ""}{choice.reputationEffect}
                    </span>
                  )}
                  {choice.energyEffect !== 0 && (
                    <span className="text-amber-400">体力 {choice.energyEffect}</span>
                  )}
                  {choice.stressEffect && choice.stressEffect !== 0 && (
                    <span className="text-red-400">精神压力 {choice.stressEffect > 0 ? "+" : ""}{choice.stressEffect}</span>
                  )}
                  {choice.debtChange && choice.debtChange !== 0 && (
                    <span className="text-sky-300">债务 {choice.debtChange > 0 ? "+" : ""}{choice.debtChange}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
