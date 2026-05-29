import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to generate extremely engaging and customized mock responses when Gemini key isn't provided/loaded
function getMockResponse(prompt: string, sInstruction?: string): string {
  const pLower = prompt.toLowerCase();
  const sLower = sInstruction ? sInstruction.toLowerCase() : "";
  
  // Try to parse who we are talking to or what App it is
  if (sLower.includes("kakaotalk")) {
    const favMatch = prompt.match(/favorability score of (\d+)/) || sLower.match(/favorability score.*: (\d+)/) || prompt.match(/relationship score of (\d+)/);
    const favorability = favMatch ? parseInt(favMatch[1], 10) : 50;

    let role = "member";
    if (sLower.includes("manager") || sLower.includes("室长") || sLower.includes("经纪人")) {
      role = "manager";
    } else if (sLower.includes("ceo") || sLower.includes("代表") || sLower.includes("社长")) {
      role = "ceo";
    } else if (sLower.includes("celeb") || sLower.includes("rival") || sLower.includes("竞品") || sLower.includes("好友")) {
      role = "celeb";
    }

    let isFemalePlayer = false;
    if (sLower.includes('player gender: "female"') || sLower.includes("player gender: female") || sLower.includes("player_gender: \"female\"") || sLower.includes("player is female")) {
      isFemalePlayer = true;
    } else if (sLower.includes('player gender: "male"') || sLower.includes("player gender: male") || sLower.includes("player_gender: \"male\"") || sLower.includes("player is male")) {
      isFemalePlayer = false;
    } else {
      isFemalePlayer = sLower.includes("female") || sLower.includes("女") || pLower.includes("欧尼") || pLower.includes("姐");
      if ((sLower.includes("male") || sLower.includes("男")) && !sLower.includes("female") && !sLower.includes("女")) {
        isFemalePlayer = false;
      }
    }
    const playerGreeting = isFemalePlayer ? "欧尼" : "哥";

    if (role === "manager") {
      if (favorability < 20) {
        const mgrRepliesBad = [
          "既然你都这么发消息过来了，看来是对自己昨天的练习极其满意了？下午体脂称重考核要是超标哪怕0.1kg，明天你准备加练十组折返跑！别找借口！",
          "呀！昨晚练习室的监控我都看过了，你那个踢腿动作像是在划水吗？马上来我办公室，说不明白今天就别睡觉了！",
          "别废话！公司的保姆车已经在宿舍门口准备出发了。马上去清潭洞做皮秒维稳和脸部消肿，迟到一分钟后果自负！"
        ];
        return mgrRepliesBad[Math.floor(Math.random() * mgrRepliesBad.length)];
      } else if (favorability >= 20 && favorability < 50) {
        const mgrRepliesMid = [
          "收到。今天的新主打歌编舞强度极大，感觉累的话就喝一瓶我给你寄过去的消肿冰美式。脸部状态一定要维持，下午体脂考核前半天禁水！",
          "知道了，下午动作利索点。记住，今天社长代表和PD们都会去现场监控你个人的那段声乐高音，关键时候绝对不能给我掉链子，加油吧。"
        ];
        return mgrRepliesMid[Math.floor(Math.random() * mgrRepliesMid.length)];
      } else {
        const mgrRepliesGood = [
          "表现得相当不错！最近真的很辛苦，刚才在公司路过便利店，我给你顺手带了一盒高能无糖消肿饮和电解质维他命，已经放你柜子里了。昨晚练习表现很棒，保持住！✨",
          "嗯哼，看到你回复了。注意休息，晚点练习完了别吃拉面之类的，去喝点红豆消肿水。我们这次音源绝对空降 Melon 一位，对你有信心！"
        ];
        return mgrRepliesGood[Math.floor(Math.random() * mgrRepliesGood.length)];
      }
    }

    if (role === "ceo") {
      if (favorability < 20) {
        const ceoRepliesBad = [
          "我收到你的回复了。但作为 Aether Label 首发精锐中的一员，你现在展现的饥饿感和敬业精神远未达到公司的底限。希望在下午的月度称重体脂考核里能看到你作为专业爱豆应有的自我管理。",
          "Aether Label 从不为温吞的练习生提供续存土壤。如果你的练习和形体管理永远跟不上节奏，新主打歌 Center 的预备顺位，外面有的是比你更高强练度的新人虎视眈眈。"
        ];
        return ceoRepliesBad[Math.floor(Math.random() * ceoRepliesBad.length)];
      } else {
        const ceoRepliesGood = [
          "最近这段时间辛苦了。作为队里的核心，一定要注意调整心态并保护好膝盖。我很看好你之前那个个人刀群舞直拍里的眼神掌控力，下午好好发挥，我期待看到优秀的结果。",
          "有心了。这段时间的高压训练是有些挑战性，但只要这次实体专辑销量突破五万，后续所有最顶级的综艺 and 打歌舞台资源，我都会特批倾斜给你作为褒奖。继续加油。"
        ];
        return ceoRepliesGood[Math.floor(Math.random() * ceoRepliesGood.length)];
      }
    }

    if (role === "celeb") {
      if (favorability < 50) {
        const celebRepliesMid = [
          `哇！恭喜你们这次的主打歌预告也太绝了吧，那个清冷猫系妆造完全是神仙下凡，看MV我都忍不住重播了好几遍！这次回归绝对爆火，羡慕啦～❤️`,
          `宝宝！今天我们在电视台后台待机室刚好和你们同一栋楼呢！打歌后台便利店的草莓冰美式超好喝，有空悄悄溜到楼梯间见面嘛，我请你喝！`
        ];
        return celebRepliesMid[Math.floor(Math.random() * celebRepliesMid.length)];
      } else {
        const celebRepliesGood = [
          `宝贝！你们昨天的个人汗水直拍已经彻底冲上韩网热搜了一位啦！那个wink细节把我都给钓到了！我连夜带着全队给你疯狂灌水刷一位票，下次打歌完了绝对要一起去吃江南炭火烤肉！🍻🍖`,
          `太强了！能和你在同一个娱乐圈赛道拼搏感觉真的很开心。我们下周在舞台上对决归对决，但私底下必须贴贴！明天预录加油哦，等我的神仙下午茶外送！🥰✨`
        ];
        return celebRepliesGood[Math.floor(Math.random() * celebRepliesGood.length)];
      }
    }

    // Default "member" (teammate) simulated response matching MBTI and favorability (Requirement 13 & 15)
    if (favorability < 25) {
      const mateRepliesBad = [
        "好... 知道了。那我先跟着随行老师去声乐室过麦了，感觉自己的那两个乐句好像还不太稳... 待会儿见吧。",
        "收到。等一下下午称重检测的时候，室长会冷着脸亲自站秤子旁边盯着看，希望等一下大家都没事吧。加油。"
      ];
      return mateRepliesBad[Math.floor(Math.random() * mateRepliesBad.length)];
    } else if (favorability >= 25 && favorability < 60) {
      const mateRepliesMid = [
        `${playerGreeting}！刚才新主打歌的1.5倍速汗水连跳两轮跳完，我感觉整个人腿在打颤。今晚称重考核求放水同盟啊，我昨晚只敢啃了半颗西红柿，现在肚子还在咕咕乱叫呢🥺`,
        `${playerGreeting}！今天美容室等一下一起点冷冻极饿体脂沙拉呗？刚才打听到今天隔壁公司的竞品要推迟两个月回归了，太好了，咱们这次的打歌回归撞车威胁没了，哈哈！`
      ];
      return mateRepliesMid[Math.floor(Math.random() * mateRepliesMid.length)];
    } else {
      const mateRepliesGood = [
        `${playerGreeting}！刚才看到有唯粉站姐在Weverse给你专门手写了三页的小长文告白呢，好戳人心窝！今天舞蹈特训我也帮补准备好消肿水和葡萄柚电解质了，我们一起大杀四方！💃`,
        `嘿嘿！${playerGreeting}，刚才路过一楼，我偷偷藏了两杯带薄荷碎的冰美式在咱们宿舍客厅储物格里哦！趁闵室长在开会，我们偷偷去匀几口，今晚称重评测和声乐考核稳过的！❤️🤫`
      ];
      return mateRepliesGood[Math.floor(Math.random() * mateRepliesGood.length)];
    }
  }

  if (sLower.includes("xiaohongshu")) {
    return "【小红书 - 自动生成的小红书风格草稿】\n🎉私藏K-Pop爱豆上班路私服大公开！今天这套OOTD直接被成员们夸爆！\n\n小慵懒但超显高级的针织外搭 ＋ 纯欲低腰牛仔裤裤，配上我的本命爱用黑框眼镜👓，简直就是清冷感天花板！\n大家一直在问我的今日香水，其实是木质雪松调的，喷上感觉一秒置身清晨雨后的森林🌲。下次给你们录开包视频！\n\n#爱豆私服 #今日OOTD #上班路私服 #爱豆香水推荐 #日常穿搭 #K-Pop";
  }

  if (sLower.includes("tiktok")) {
    return "【TikTok - 挑战策划案建议】\n✨爱豆同款！新歌主打《Siren Dance》副歌节奏挑战策划✨\n\n1. 【手部Wink变装】(0:00 - 0:05): 穿着宽松睡衣在宿舍，用手掌挡住镜头，随着重低音Drop瞬间切到舞台华丽打歌服，并高难度单眼Wink！\n2. 【队友合体乱入】(0:05 - 0:15): 和队内的双人舞蹈挑战，前段装作在认真喝美式咖啡，后段突然进入1.5倍速标志性刀群舞，反差萌拉满.\n3. 配乐标签: 使用最热加速版(Sped Up)背景原声，并添加 #KpopChallenge #IdolLife 话题。";
  }

  return "「谢谢你的互动！在这个充满闪光灯和汗水的舞台世界里，有你的支持我才能闪闪发光。今天的练习虽然很累，但是一想到粉丝们的笑脸，我就觉得所有付出都值了。我们会一直走在花路上的！🌸✨」";
}
// API Routes
app.post("/api/gemini/generate", async (req, res) => {
  const { prompt, systemInstruction, customApiKey, model, customApiEndpoint } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const activeKey = customApiKey || process.env.GEMINI_API_KEY;

  // If there is no active key at all, use our engaging high-fidelity local simulator
  if (!activeKey || activeKey === "MY_GEMINI_API_KEY" || activeKey.trim() === "") {
    const simulated = getMockResponse(prompt, systemInstruction);
    return res.json({ text: simulated, simulated: true });
  }

  const useOpenAi = !!customApiEndpoint && !customApiEndpoint.includes("googleapis.com");

  if (useOpenAi) {
    try {
      let targetUrl = customApiEndpoint.trim();
      if (!targetUrl.endsWith("/chat/completions")) {
        targetUrl = targetUrl.replace(/\/$/, "");
        if (targetUrl.endsWith("/v1")) {
          targetUrl = `${targetUrl}/chat/completions`;
        } else {
          targetUrl = `${targetUrl}/v1/chat/completions`;
        }
      }

      console.log(`Routing OpenAI-Compatible generation to: ${targetUrl} with model: ${model || "openai-model"}`);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: model || "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemInstruction || "You are a professional AI companion." },
            { role: "user", content: prompt }
          ],
          temperature: 1.0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI HTTP ${response.status}: ${errorText}`);
      }

      const json: any = await response.json();
      const reply = json.choices?.[0]?.message?.content || "";
      return res.json({ text: reply });

    } catch (error: any) {
      console.error("OpenAI Compatible Call Error:", error);
      const simulated = getMockResponse(prompt, systemInstruction);
      return res.json({
        text: simulated,
        simulated: true,
        warn: `Failed to query OpenAI-compatible model: ${error.message}. Local idol simulator engaged.`
      });
    }
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: {
        baseUrl: customApiEndpoint || undefined,
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Valid standard model check
    const selectedModel = model || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a professional AI companion.",
        temperature: 1.0,
      },
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    let friendlyMessage = error.message;
    if (error.message && (error.message.includes("Unexpected token") || error.message.includes("is not valid JSON") || error.message.includes("<"))) {
      friendlyMessage = "Google GenAI API endpoint returned an HTML or unexpected text response rather than JSON. This can happen if the API key is invalid or if there is a network proxy restriction.";
    }
    console.error("Gemini API Error details:", friendlyMessage);
    // If API error occurs (like quota, network), fallback to highly interactive simulator gracefully
    const simulated = getMockResponse(prompt, systemInstruction);
    res.json({ 
      text: simulated, 
      simulated: true, 
      warn: `System failed to query Google GenAI model: ${friendlyMessage}. Local idol simulator engaged.`
    });
  }
});

// Added model discovery route
app.post("/api/gemini/models", async (req, res) => {
  const { customApiKey, customApiEndpoint } = req.body;
  const activeKey = customApiKey || process.env.GEMINI_API_KEY;

  const defaultModels = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (推荐)" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (强力)" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash Experimental" },
  ];

  if (!activeKey || activeKey === "MY_GEMINI_API_KEY" || activeKey.trim() === "") {
    return res.json({ models: defaultModels, simulated: true });
  }

  const useOpenAi = !!customApiEndpoint && !customApiEndpoint.includes("googleapis.com");

  try {
    let fetchedModels: any[] = [];
    
    // 1. If it's a custom third-party endpoint, try standard list API of OpenAI compatibility
    if (useOpenAi) {
      try {
        let cleanEndpoint = customApiEndpoint.trim();
        cleanEndpoint = cleanEndpoint.replace(/\/$/, "");
        cleanEndpoint = cleanEndpoint.replace(/\/chat\/completions$/, "");
        
        let modelsUrl = cleanEndpoint;
        if (!modelsUrl.endsWith("/models")) {
          modelsUrl = `${modelsUrl}/models`;
        }

        console.log(`Fetching models from OpenAI-Compatible endpoint: ${modelsUrl}`);

        const fetchRes = await fetch(modelsUrl, {
          headers: {
            "Authorization": `Bearer ${activeKey}`,
            "Content-Type": "application/json"
          }
        });
        if (fetchRes.ok) {
          const json: any = await fetchRes.json();
          if (json && Array.isArray(json.data)) {
            fetchedModels = json.data.map((m: any) => ({
              id: m.id,
              name: m.id
            }));
          }
        }
      } catch (e) {
        console.warn("Direct endpoint model fetch failed, trying SDK...", e);
      }
    }

    // 2. Try SDK list models
    if (fetchedModels.length === 0 && !useOpenAi) {
      const ai = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          baseUrl: customApiEndpoint || undefined,
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.list();
      const list = Array.isArray(response) ? response : (response as any).models || [];
      fetchedModels = list.map((m: any) => {
        const id = m.name?.startsWith("models/") ? m.name.substring(7) : (m.name || m.id || "");
        return {
          id: id,
          name: m.displayName || id
        };
      });
    }

    // Merge default models with fetched if any
    const uniqueIds = new Set(fetchedModels.map(m => m.id));
    const merged = [...fetchedModels];
    for (const def of defaultModels) {
      if (!uniqueIds.has(def.id)) {
        merged.push({ id: def.id, name: def.name });
      }
    }

    res.json({ models: merged });
  } catch (error: any) {
    let friendlyMessage = error.message;
    if (error.message && (error.message.includes("Unexpected token") || error.message.includes("is not valid JSON") || error.message.includes("<"))) {
      friendlyMessage = "API returned an HTML response instead of JSON. Ensure the custom API endpoint config or third-party proxy is valid.";
    }
    console.error("Fetch models error details:", friendlyMessage);
    res.json({ models: defaultModels, simulated: true, error: friendlyMessage });
  }
});

// Server static files in Production & use Vite middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
  });
}

startServer();
