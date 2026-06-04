import { 
  IdolPersona, 
  ChatContact, 
  ChatMessage, 
  WeversePost, 
  BubbleMessage, 
  TikTokVideo, 
  XiaohongshuPost, 
  SystemEvent, 
  IdolSchedule,
  SimulatedTeammate
} from "./types";

// Dynamic names generation pools for realistic procedurally generated characters (Requirement 15)
const KOREAN_SURNAMES = ["金", "朴", "李", "崔", "姜", "赵", "尹", "韩", "郑", "林", "申", "柳", "徐", "吴"];
const FEMALE_NAMES = ["智雅", "美延", "彩领", "真率", "世正", "恩熙", "有静", "昭妍", "礼志", "珉周", "秀彬", "多贤", "夏荣", "允儿", "惠仁"];
const MALE_NAMES = ["在贤", "宇彬", "道贤", "胜宇", "敏赫", "彬宇", "镇浩", "盛骏", "炫宇", "泰亨", "书俊", "俊熙", "秀贤", "世勋"];
const KPOP_MBTI = ["ENFP", "INFP", "INFJ", "ENFJ", "ISFP", "ESFP", "ESTP", "ISTP", "INTP", "ENTP", "ISFJ", "ESFJ"];

const CHINESE_SURNAMES = ["王", "张", "刘", "陈", "杨", "黄", "沈", "钱", "周"];
const CHINESE_FEMALE_NAMES = ["雨欣", "梦瑶", "佳怡", "思妍", "雅涵", "依婷", "雪纯", "诗琪"];
const CHINESE_MALE_NAMES = ["天宇", "梓轩", "子墨", "浩然", "睿渊", "泽洋", "俊杰", "博文"];

const JAPANESE_SURNAMES = ["渡边", "佐藤", "高桥", "田中", "伊藤", "山本", "中村", "小林"];
const JAPANESE_FEMALE_NAMES = ["樱子", "菜菜子", "明日香", "美月", "遥香", "爱子", "绘里", "真央"];
const JAPANESE_MALE_NAMES = ["拓海", "健太", "翔太", "莲", "大树", "阳太", "和也", "浩介"];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Procedurally generate a teammate list (Requirement 15) - Standardized fixed teammates to prevent inconsistency
export function generateRandomTeammates(gender: "male" | "female", count = 4): SimulatedTeammate[] {
  if (gender === "female") {
    return [
      {
        id: "team_1",
        name: "金智雅",
        stageName: "JI_AH",
        mbti: "ENFP",
        role: "队内主唱 & 核心高音高光",
        nationality: "韩国本国籍",
        favorability: 10,
        trait: "舍己为人治愈大天使：情商极高，总是贴心地给你带低卡咖啡，包容所有闲言碎语默默奉献",
        avatar: "",
        age: 19
      },
      {
        id: "team_2",
        name: "李智恩",
        stageName: "K_2",
        mbti: "INFP",
        role: "队内主舞 & 刀群舞核心",
        nationality: "韩国本国籍",
        favorability: 8,
        trait: "社恐脆弱训练虫：虽然老实听话，但敏感自卑，夜里独自在被窝里翻看黑粉直拍恶评痛哭",
        avatar: "",
        age: 18
      },
      {
        id: "team_3",
        name: "朴香橙",
        stageName: "GREEN_3",
        mbti: "ENTP",
        role: "主Rapper & 综艺感及艺能担当",
        nationality: "华裔外籍绿卡",
        favorability: 8,
        trait: "练习室大喇叭：心直口快嘴大，极度爱打听谈八卦、说小闲话，说话经常不过脑子不顾及队友想法",
        avatar: "",
        age: 20
      },
      {
        id: "team_4",
        name: "渡边樱子",
        stageName: "GREEN_4",
        mbti: "ESFJ",
        role: "核心门面 Center & 领舞",
        nationality: "日裔外籍绿卡",
        favorability: 6,
        trait: "顶级功利唯己型高冷皇族：实力出众但极其好强防爆同伴，镜头前营业、台下眼神冰冷争抢Center",
        avatar: "",
        age: 18
      }
    ];
  } else {
    return [
      {
        id: "team_1",
        name: "郑宇彬",
        stageName: "WOO_BIN",
        mbti: "ENFP",
        role: "队内主唱 & 核心高音高光",
        nationality: "韩国本国籍",
        favorability: 10,
        trait: "舍己为人治愈大天使：情商极高，总是贴心地给你带低卡咖啡，包容所有闲言碎语默默奉献",
        avatar: "",
        age: 20
      },
      {
        id: "team_2",
        name: "韩在贤",
        stageName: "K_2",
        mbti: "INFP",
        role: "队内主舞 & 刀群舞核心",
        nationality: "韩国本国籍",
        favorability: 8,
        trait: "社恐脆弱训练虫：虽然老实听话，但敏感自卑，夜里独自在被窝里翻看黑粉直拍恶评痛哭",
        avatar: "",
        age: 19
      },
      {
        id: "team_3",
        name: "张子墨",
        stageName: "GREEN_3",
        mbti: "ENTP",
        role: "主Rapper & 综艺感及艺能担当",
        nationality: "华裔外籍绿卡",
        favorability: 8,
        trait: "练习室大喇叭：心直口快嘴大，极度爱打听谈八卦、说小闲话，说话经常不过脑子不顾及队友想法",
        avatar: "",
        age: 21
      },
      {
        id: "team_4",
        name: "佐藤莲",
        stageName: "GREEN_4",
        mbti: "ESFJ",
        role: "核心门面 Center & 领舞",
        nationality: "日裔外籍绿卡",
        favorability: 6,
        trait: "顶级功利唯己型高冷皇族：实力出众但极其好强防爆同伴，镜头前营业、台下眼神冰冷争抢Center",
        avatar: "",
        age: 18
      }
    ];
  }
}

// Procedurally generate other major characters (Requirement 15) - Standardized fixed Staff
export function generateCoreStaff(playerGender: "male" | "female" = "female") {
  return {
    manager: {
      name: playerGender === "female" ? "严相勋 (室长级经纪人)" : "闵相勋 (室长级经纪人)",
      mbti: "ESTJ",
      avatar: ""
    },
    ceo: {
      name: "李秉旭 (娱乐社代表董事)",
      mbti: "ENTJ",
      avatar: ""
    },
    rival: {
      name: playerGender === "female" ? "张秀彬 (阻击大势Center)" : "崔镇浩 (阻击大势Center)",
      mbti: "ISTP",
      avatar: ""
    }
  };
}

// Default base setup parameters
export const DEFAULT_PERSONA: IdolPersona = {
  name: "金智允",
  stageName: "YUNA",
  gender: "female",
  style: "group",
  groupName: "ECLIPSE",
  roleInGroup: "队长 & 主舞 & 门面担当",
  hairStyle: "慵懒长卷发配齐刘海",
  hairColor: "玫瑰雾粉配银丝挂耳染",
  mbti: "ENFJ (社会型领袖)",
  conceptTheme: "High Teen (美式复古学院风)",
  company: "Aether Label (三大厂旗下)",
  vibeText: "自带清冷而充满氛围感的猫系脸，跳舞时眼神极具侵略性，台下却是贴心的温暖大姐姐。",
  
  startType: "trainee",
  nationality: "korean",
  
  // Custom birth / zodiac details
  birthday: "2006-01-08",
  zodiac: "摩羯座",
  bloodType: "O型",
  specificNationality: "韩国首尔江南区",
  isMixed: false,
  mixedCountries: "",
  eyeShape: "瑞凤眼",
  eyeColor: "黑曜石浓墨黑",
  noseShape: "圆润小翘鼻",

  height: 167,
  weight: 48.5,
  skinCondition: "glowing",
  vocalSkill: 35,
  danceSkill: 42,
  rapSkill: 20,
  varietySkill: 22,
  stress: 25,
  
  traineeDebt: 12000, // 1.2 billion KRW default trainee debt
  companySplit: "9:1", // Standard rookie split
  
  // High difficulty starting favorability: From zero/very low!
  managerFavorability: 15,
  teammatesFavorability: 10,
  ceoFavorability: 5,
  pdFavorability: 8,
  
  popularity: 15,
  reputation: 60,
  energy: 85,
  fansCount: 4200,
  albumSales: 0,
  money: 50,
  dayNumber: 1,
  
  hasLover: false,
  loverName: "",
  relationshipStatus: "single",
  scandalPrejudice: 5,
  fansDistribution: {
    otFans: 40,
    soloFans: 30,
    cpFans: 15,
    antiFans: 15
  }
};

export const INITIAL_WEVERSE_POSTS: WeversePost[] = [
  {
    id: "w_1",
    content: "［官咖更新］\n各位小天使！今天练习室里的灯光真的很棒呢～✨ 刚结束了10个小时的刀群舞集训，虽然腰酸背疼，但只要一听到我们在录音室里的新歌Demo，就觉得血液都在沸腾！明天就是我们本周的称重月度评测，真的有点小紧张呢。希望能多听听你们说加油呀！💕📱",
    image: "",
    likes: 3100,
    commentsCount: 3,
    time: "2小时前",
    comments: [
      {
        id: "wc_1",
        author: "KIdolLover99",
        authorAvatar: "",
        content: "宝宝加油！你今天的练习视频跳得太好了，那个踩点角度绝对是团队第一！大腿上的淤青看得好心疼呜呜🥺",
        likes: 120,
        time: "1:55前",
        fanType: "OT_fan"
      },
      {
        id: "wc_2",
        author: "Anti_Eclipse",
        authorAvatar: "",
        content: "虽然练习辛苦，但你刚才在直播背景里是不是对队友Somin翻了个白眼啊？果然是不和传闻实锤吧？",
        likes: 15,
        time: "1:40前",
        fanType: "anti"
      },
      {
        id: "wc_3",
        author: "SweetYuna",
        authorAvatar: "",
        content: "宝宝！少熬夜吧！你的脸似乎有点水肿噢，明天称重前喝杯黑咖啡，然后做一下热玛吉紧致下。爱死你了！",
        likes: 85,
        time: "1:30前",
        fanType: "delusion"
      }
    ]
  }
];

export const INITIAL_BUBBLE_MESSAGES: BubbleMessage[] = [
  {
    id: "b_1",
    sender: "fan_mass",
    text: "宝子！明天就是三大厂出道名单最终考核了吧？求透露一点内幕！",
    time: "下午 1:02"
  },
  {
    id: "b_2",
    sender: "idol",
    text: "嗯... 考核结果我也很忐忑。不过听说代表这次会亲自来评判。我今天只吃了一份鸡胸肉加一小袋无糖红豆薏仁水。希望不要水肿，大家一定要替我祈祷哦！🤫🥩",
    time: "下午 1:05"
  }
];

export const INITIAL_TIKTOK_VIDEOS: TikTokVideo[] = [
  {
    id: "t_1",
    title: "#IdolTrainee 日常！凌晨3点的清晨刀群舞打卡，1.5倍速汗水狂飙 ⚡️🩰",
    views: 45000,
    likes: 3200,
    comments: 240,
    musicName: "Trainee Beat - Original Sound"
  }
];

export const INITIAL_XIAOHONGSHU_POSTS: XiaohongshuPost[] = [
  {
    id: "xhs_1",
    title: "赴韩练习生包包公开🎒｜包里到底装了什么减脂抗肿神仙好物？",
    content: "哈喽红薯宝宝们！自从拿到了公司的A级绿卡名额后，就被室长强制开始了【极限消肿+身形管理】。\n今天来分享下我平时高强度训练包里的随身好物：\n1. 【大豆消肿颗粒】一早空腹配温水，排出积水贼快！\n2. 【玫瑰清爽水雾】让昏昏欲睡的我瞬间清醒。\n3. 【舒缓肌腱弹性绷带】贴伤处很赞！\n\n#赴韩练习生 #我的包包里有什么 #好物分享 #体态管理 #瘦脸消肿",
    likes: 1200,
    stars: 840,
    comments: 98,
    time: "3天前"
  }
];

// Rich clinical and diet schedules (Requirement 11, 12)
export const SH_LIST: IdolSchedule[] = [
  {
    id: "sch_r_1",
    time: "上午 05:00 - 08:00",
    title: "江南清潭洞皮肤科：顶级皮秒敷麻与LDM童颜超声波维稳 🏥",
    category: "clinical_dermatology",
    rewardPopularity: 0,
    rewardReputation: 1,
    energyCost: 10,
    completed: false
  },
  {
    id: "sch_r_2",
    time: "上午 08:30 - 中午 12:00",
    title: "极饿空腹高能有氧：暴汗单车与体脂率月度称重对抗 🚲",
    category: "restrictive_diet",
    rewardPopularity: 0,
    rewardReputation: 0,
    energyCost: 30,
    completed: false
  },
  {
    id: "sch_v_1",
    time: "下午 13:00 - 15:30",
    title: "公司声乐特训：韩籍声乐导师一对一打磨高开麦真声咬字  micrófono",
    category: "vocal_lesson",
    rewardPopularity: 1,
    rewardReputation: 1,
    energyCost: 20,
    completed: false
  },
  {
    id: "sch_p_1",
    time: "下午 16:00 - 19:30",
    title: "编舞合流特训：严酷进行12人超整齐角度主打歌刀群舞加练 💃",
    category: "practice",
    rewardPopularity: 2,
    rewardReputation: 2,
    energyCost: 35,
    completed: false
  },
  {
    id: "sch_f_1",
    time: "晚上 20:00 - 22:30",
    title: "首尔电视台下班路：面对深夜寒风守候粉丝的3秒极致饭撒眼神 📸",
    category: "fansign",
    rewardPopularity: 5,
    rewardReputation: 3,
    energyCost: 15,
    completed: false
  },
  {
    id: "sch_s_1",
    time: "晚上 23:00 - 01:00",
    title: "宿醉感冷气房全开睡眠：深度精神减压与全身关节敷冰疗 💤",
    category: "rest_sleep",
    rewardPopularity: 0,
    rewardReputation: 0,
    energyCost: 0, // restores 40 energy
    completed: false
  }
];

// A vastly richer, more dramatic database of industry scenarios (Requirements 3, 5, 6, 7, 8, 13, 14)
export const ENHANCED_RANDOM_EVENTS: SystemEvent[] = [
  {
    id: "e_g1",
    title: "绿卡偏见：打歌镜头遭严重剪切 & 空降网络审判 (Bias & Bowing Gate)",
    description: "在一场大型KBS打歌LIVE直拍下，作为外籍绿卡成员，你的Ending镜头被导播直接遮挡推远。而当晚，南韩某知名匿名论坛（Nate Pann）疯传一张你似乎没有对主持人『前辈子路过鞠躬90度』的模糊动图，韩网网民瞬间贴上『恃宠而骄、外籍白眼狼』的标签进行疯狂爆破！",
    type: "challenge",
    choices: [
      {
        text: "直播自证：在Bubble顺便提到自己其实当时低血糖眼花在扶墙，并不是故意不 bow",
        popularityEffect: 6,
        reputationEffect: -15,
        energyEffect: -15,
        moneyEffect: 0,
        stressEffect: 18,
        managerChange: -12,
        outcomeText: "南韩网民非常要面子，你的急忙自证被部分大嘴UP主曲解为『没礼貌还在狡辩推脱』。公司室长非常愤怒地没收了你的发贴权限，大声责备你破坏了公司的公关。但是外省/海外粉丝却极其感动，为你发起疯狂抵抗，热度意外上涨。"
      },
      {
        text: "绝对低头：在明天的上下班路上，当着满屏闪光灯和镜头的面，对所有路人行100度超大幅深鞠躬",
        popularityEffect: -5,
        reputationEffect: 15,
        energyEffect: -10,
        moneyEffect: 0,
        stressEffect: 28,
        teammateChange: 5,
        outcomeText: "极其卑微、完美的南韩式『赎罪大鞠躬』在极短时间内平息了网民怒火。媒体纷纷感慨你态度端正、知错能改。室长满意地点了点头，但是你跪地那一刻心里也尝到了强烈的绿卡偏见带来的无尽辛酸与内耗，压力飞涨。"
      }
    ]
  },
  {
    id: "e_d1",
    title: "练习生首批负债账单结算：触目惊心的『零结算』深渊 (Debt Nightmare)",
    description: "所属社财务室发来了你的首季度演艺活动对账单。虽然上一周专辑首日销量高达5万张，但扣除出道前租住宿舍、昂贵的牙齿正畸矫正、名校私教导师舞蹈费（即练习生负债：₩1.5亿/合约分利9:1），你最终实际得到的到手结算金额是完整的：₩0 万韩元，甚至名下还背负债务！",
    type: "warning",
    choices: [
      {
        text: "忍气吞声：心存感激，毕竟大厂提供了高档清潭洞公寓和上百名幕后策划",
        popularityEffect: 0,
        reputationEffect: 10,
        energyEffect: 0,
        moneyEffect: 0,
        stressEffect: 8,
        ceoFavorability: 15,
        outcomeText: "你安静温顺地在结算单上签字。经纪人和代表极其欣慰：『这孩子懂感恩、有大局观，不像外面那些动不动拿劳动法仲裁的中小公司训练生。』社长大手一挥，多给了你一个电视剧OST的录音试唱推荐席位，好感度飞涨！"
      },
      {
        text: "抗拒询问：向财务和闵大元试探性申请生活补助：『室长，我兜里连回清潭洞的轻轨票钱都不够了...』",
        popularityEffect: 0,
        reputationEffect: -5,
        energyEffect: -5,
        moneyEffect: 150, // yields 1.5 million KRW loan
        stressEffect: 10,
        managerChange: -15,
        outcomeText: "闵室长冷漠地看了你一眼：『呀，现在还在背债期，谁不是这么过来的？』但在你再三恳求下，他极其不耐烦地签发了月度『极简餐食贷款福利』，给你卡里划了 ₩150万。但这笔钱会自动作为练习生负债叠加在账单最后。经纪人看你的眼神变得有些刻薄。"
      }
    ]
  },
  {
    id: "e_s1",
    title: "私生粉骚扰：保姆车被不明黑色卡车跟拍、私域尾随 (Sasaeng Invasion)",
    description: "夜里彩排结束，你和队友拖着疲惫不堪的身体回宿舍，一辆没有贴车牌的黑面包车突然逼停了你们。几个手持重型长焦镜头的狂热粉丝（俗称私生粉）对着车窗疯狂闪光拍，更可怕的是有人大声呼喊你在外地预定美容室的真实时间！",
    type: "challenge",
    choices: [
      {
        text: "拉上窗帘置之不理，并拍照报警交由公司专业法务部法办",
        popularityEffect: -2,
        reputationEffect: 10,
        energyEffect: -10,
        moneyEffect: 0,
        stressEffect: 15,
        managerChange: 8,
        outcomeText: "司机一踩油门突破阻拦返回，公司对保卫处加强了警惕。第二天热搜公开了这些私生的违法车牌。粉丝圈开始疯狂谴责这些病态私生，你获得了良好的路人名声。只是一想到行踪被严重窥视，你夜里睡觉开始习惯性锁两道门。"
      },
      {
        text: "摇下车窗：不顾闵经纪人阻拦大声喝斥，指责对方已经严重触犯红线！",
        popularityEffect: 18,
        reputationEffect: -15,
        energyEffect: -5,
        moneyEffect: 0,
        stressEffect: 22,
        outcomeText: "你怒目圆瞪指责私生的直拍被对面的镜头恶意传回，随后引爆全球KPop站姐圈：『虽然私生有错，但是这态度未免也太过于疯狂和暴躁了吧？高贵的人设瞬间滤镜稀碎。』你虽然瞬间喜提推特多个全球趋势红字，但韩国本土的乖巧高雅人设已经严重受损。"
      }
    ]
  },
  {
    id: "e_cp1",
    title: "致命CP炒作：毒唯反扑与磕CP流量的危险平衡 (CP & Shipping Tempest)",
    description: "最近在打歌节目后台，你在一边把玩队友智雅的猫耳耳环，刚好被同台当红男爱豆拉到背景里一同入镜。CP粉（磕糖粉）极其疯狂，在同城剪辑平台上疯狂拉配皮，甚至造谣你们在江南某酒店秘会共餐。接着，另外两个队友那边的『毒唯』（唯恐唯粉被抢）开始在Weverse官咖大肆攻击你抢资源抱大腿！",
    type: "warning",
    choices: [
      {
        text: "公开切割：在Weverse上传与智雅吃外卖的自拍澄清：『没有其他人，今晚我和智雅是麻辣烫CP！』",
        popularityEffect: 8,
        reputationEffect: 20,
        energyEffect: -2,
        moneyEffect: 0,
        stressEffect: 5,
        teammateChange: 15,
        outcomeText: "这一巧妙的反手击破让绯闻不攻自破！粉丝们不仅对你高超的情商赞不绝口，也极度喜欢看你和智雅的姐妹贴贴互动。团粉死忠力量迎来暴涨，队友对你的好感同样大增！"
      },
      {
        text: "借机吃红利：在接下来的打歌舞台上，故意和那位高人气男爱豆在过道上眼神拉扯几秒，让站姐抓拍",
        popularityEffect: 35,
        reputationEffect: -25,
        energyEffect: -5,
        moneyEffect: 0,
        stressEffect: 30,
        ceoFavorability: -15,
        outcomeText: "全网CP脑直接脑补成真，全推特瘫痪！但这也彻底激怒了对方的高人气女友粉群体。无数极具侮辱性的黑图、合成丑图被海量发送到你的小红书和Weverse私信中。公司代表亲自打电话警告：『如果再不收敛，直接封锁你下半年的回归企划。』"
      }
    ]
  },
  {
    id: "e_c1",
    title: "毒唯在签售会上恶意挑衅：『为什么和我们智雅不合？』 (Fandom Bully Case)",
    description: "在一场耗资巨大的线下豪华签售会上，一位买了200张专辑的唯粉把一本写满『为什么总抢我们主唱分词？你这个资本咖恶心！』的册子拍在你面前的桌上。旁边是全程摄影记录的粉丝站姐，你怎么处理？",
    type: "challenge",
    choices: [
      {
        text: "情绪崩溃：直接双手捂脸离场，由后台随行的心理室老师安抚情绪",
        popularityEffect: -8,
        reputationEffect: -5,
        energyEffect: -12,
        moneyEffect: 0,
        stressEffect: 25,
        outcomeText: "签售大乱。网民迅速截取了你的黑脸痛苦动图，称你『花着粉丝钱买的高昂门票，却不肯付出情绪价值。』虽然该唯粉遭到人肉封锁，但在韩国演艺圈，『没抗压能力的脆弱爱豆』对你的商业大秀和CF大片签约产生了不小的负面阻力。"
      },
      {
        text: "极致表情管理：眼含泪水地微笑着写下『抱歉，智雅是我最珍惜的主唱，我会加倍练习不配词。』然后给对方捏小手",
        popularityEffect: 25,
        reputationEffect: 30,
        energyEffect: -15,
        moneyEffect: 0,
        stressEffect: 32,
        teammateChange: 12,
        outcomeText: "震撼韩流！！！隔壁围观的女粉站姐用超短焦拍下了这一幕，在贴吧发布了长文，标题为『金智允被毒唯辱骂还拼死克制微笑的高清全视频』。全网极度怜爱！！！全员暴风雨式粉你：『金智允是天使！』 你的口碑和美誉直接封王，甚至连智雅也跑过来紧抱着你哭泣了整晚。"
      }
    ]
  },
  {
    id: "e_m1",
    title: "年末舞台企划：高赞抢夺C位分词还是顾及团内好感？ (Center Stealing)",
    description: "著名年末颁奖典礼（MAMA）的舞台交给了我们Eclipse来展现5分钟高难度Remix概念巨作。由于你近期人气表现出众，主打制作人（PD）建议由你独自霸占舞台最醒目的中间30秒古典乐独舞Solo，但这意味着同团苦练主舞5年的另一名队友的分词和站位会被完全砍得只剩边缘的一束光。",
    type: "neutral",
    choices: [
      {
        text: "坚守王座：听从公司PD和代表的安排，全力以赴跳这三十秒神级Center",
        popularityEffect: 25,
        reputationEffect: 10,
        energyEffect: -15,
        stressEffect: 15,
        teammateChange: -25,
        outcomeText: "你在MAMA舞台上的绝美羽毛独舞彻底引爆韩流，吸粉无数，一战奠定了你的顶级门面C位主导力。但是回到待机室后，队友全程低头，在保姆车里谁也没跟你说第二句话。今晚宿舍里的冷暴力如同凝固的坚冰。"
      },
      {
        text: "顾及情谊：主动跟室长提请：『我和智恩一起双人华尔兹出场吧，我们的身高比例双Center双杀才更完美！』",
        popularityEffect: 12,
        reputationEffect: 20,
        energyEffect: -10,
        stressEffect: 5,
        teammateChange: 35,
        pdFavorability: 10,
        outcomeText: "在你的坚持 and 高情商游说下，双华尔兹概念完美震撼过审。年末舞台效果出人意料地完美平衡，连苛刻的评论家也对Eclipse的高度一体性大加赞誉。队友在演出后台抱着你喜极而泣。这朵高傲的冷艳野玫瑰对你敞开了最真挚的心扉！"
      }
    ]
  },
  {
    id: "e_romance1",
    title: "【绯闻风暴】地下恋爱曝光危机：D社深夜长焦约会照 (Paparazzi Caught Dating Scandal)",
    description: "夜里你与秘密热恋的同僚顶流偶像在汉江地下车库秘密幽会，不料被D社的长焦狗仔队一路尾随并狂拍十多张亲密照！爆料组已把照片作为「独家新闻备忘」送到了娱乐社董事长的案头。如果你不肯采取铁腕，照片将在明晚打歌黄金档全网散播，要么大额公关费私了，要么官宣退团，要么斩断情劫公开分手否认！你的生涯迎来了最致命的抉择：",
    type: "warning",
    choices: [
      {
        text: "【大额消灾】立刻从微薄的个人结算账上掏出 ₩2,000万 韩元公关费（Money -2000）平息D社爆料",
        popularityEffect: 0,
        reputationEffect: 10,
        energyEffect: -10,
        moneyEffect: -20, // since we store money in 20/50 scale or similar, let's use corresponding changes
        stressEffect: 35,
        outcomeText: "公关大获成功。董事长帮你兜住了底牌，D社高抬贵手撤下了预告。但也因此，你之前辛辛苦苦攒下的辛苦分成和资金极大幅缩减（资金大消耗），你在宿舍大哭一场，不得不和心爱的人签订「近期全面禁止联系和见面」的地下条约。"
      },
      {
        text: "【顶风向粉丝坦诚】在Weverse官咖发表亲笔手写信，大方官宣：『拥有了想相互守护并支撑彼此脆弱的力量，望粉丝见谅』",
        popularityEffect: -45,
        reputationEffect: -40,
        energyEffect: -15,
        stressEffect: 60,
        outcomeText: "【全网脱粉惨剧】一夜之间全韩站姐黑掉一大半！数十台载满抗议卡车和花圈的唯粉在公司大门口前疯狂嘲讽，指责你『恋爱脑、一人不配毁掉全团汗水』。甚至连队友在练习室里也对你彻底冷淡切断，唯有海外部分看重人权的真爱粉全力刷话题保留了一丝微弱的人气大盘。"
      },
      {
        text: "【铁腕斩立决】发表不合冷库声明：『仅是练习生时代互勉的普通前后辈，已全部拉黑绝交回归职业主线』",
        popularityEffect: 20,
        reputationEffect: 25,
        energyEffect: -5,
        stressEffect: 30,
        outcomeText: "危机公关神速！大众和毒唯对你「高度的爱豆职业觉醒、快刀斩乱麻」的雷厉风行态度大喜过望，本土人缘和销量反倒因为你变身坚毅搞事业女皇/男皇而绝地大逆袭！你在录制节目时强忍红着的眼圈大跳热烈打歌舞，背过身去时不得不硬生生吞下撕心裂肺的眼泪..."
      }
    ]
  }
];
