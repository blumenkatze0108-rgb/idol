import { useState, useEffect, useRef } from "react";
import { IdolPersona, SimulatedTeammate } from "../types";
import { generateRandomTeammates, generateCoreStaff } from "../mockData";
import { Sparkles, ArrowRight, User, Star, Briefcase, Smile, ShieldAlert, Eye, Heart } from "lucide-react";

interface SetupProps {
  onComplete: (personas: IdolPersona[], teammates: SimulatedTeammate[]) => void;
}

// Utility to calculate constellation/zodiac based on date
function calculateZodiac(dateStr: string): string {
  if (!dateStr) return "魔羯座";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "魔羯座";
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return "魔羯座";

  const zodiacs = ["摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座"];
  const bounds = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
  return day < bounds[month - 1] ? zodiacs[month - 1] : zodiacs[month];
}

// Utility to calculate age from birthday relative to simulation baseline date (May 29, 2026)
function calculateAgeFromBirthday(dateStr: string): number {
  if (!dateStr) return 18;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return 18;
  const by = parseInt(parts[0], 10);
  const bm = parseInt(parts[1], 10);
  const bd = parseInt(parts[2], 10);
  if (isNaN(by) || isNaN(bm) || isNaN(bd)) return 18;

  const currentYear = 2026;
  const currentMonth = 5;
  const currentDay = 29;

  let calculatedAge = currentYear - by;
  if (currentMonth < bm || (currentMonth === bm && currentDay < bd)) {
    calculatedAge--;
  }
  return calculatedAge;
}

export default function IdolProfileSetup({ onComplete }: SetupProps) {
  const [step, setStep] = useState(1);
  const isSwitchingRef = useRef(false);
  const [playMode, setPlayMode] = useState<"single" | "duo" | "trio">("single");
  const [memberEditIdx, setMemberEditIdx] = useState(0);

  const [name, setName] = useState("金智敏");
  const [stageName, setStageName] = useState("JIMIN");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [style, setStyle] = useState<"solo" | "group">("group");
  const [groupName, setGroupName] = useState("ECLIPSE");
  const [roleInGroup, setRoleInGroup] = useState("队长 & 主唱 & 门面担当");
  const [hairStyle, setHairStyle] = useState("层次狼尾鲻鱼头 (Wolf Cut)");
  const [hairColor, setHairColor] = useState("午夜深海蓝黑");
  const [mbti, setMbti] = useState("ENFJ");
  const [conceptTheme, setConceptTheme] = useState("Hip-Hop (嘻哈说唱)");
  const updateConceptTheme = (val: string) => {
    setConceptTheme(val);
    if (playMode !== "single") {
      setMembersData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[Number(k)]) {
            next[Number(k)] = {
              ...next[Number(k)],
              conceptTheme: val
            };
          }
        });
        return next;
      });
    }
  };
  const [isCustomConcept, setIsCustomConcept] = useState(false);
  const [customConceptText, setCustomConceptText] = useState("");
  const [company, setCompany] = useState("Aether Label (三大厂牌旗下 - 待遇高，抽成9:1)");
  const [vibeText, setVibeText] = useState(
    "自带清冷慵懒的面部视觉，跳舞时节奏把控极其犀利，眼神极具野心与侵略感。"
  );

  // New character stats to resolve Criterion 5
  const [startType, setStartType] = useState<"trainee" | "idol">("trainee");
  const [hasLover, setHasLover] = useState<boolean>(false);
  const [loverName, setLoverName] = useState<string>("林舒阳");
  const [loverGender, setLoverGender] = useState<"female" | "male">("male");
  const [loverAge, setLoverAge] = useState<"same_age" | "older" | "younger">("same_age");
  const [loverIdentity, setLoverIdentity] = useState<"non_celeb" | "celebrity">("non_celeb");
  const [romancePosition, setRomancePosition] = useState<"left" | "right">("right"); // Default to right-side (受) unless configured
  const [nationality, setNationality] = useState<"korean" | "chinese_green" | "japanese_green" | "thai_green" | "western_green">("korean");
  const [birthday, setBirthday] = useState("2006-11-23");
  const [zodiac, setZodiac] = useState("射手座");
  const [age, setAge] = useState(19); // Calculated automatically from birthday 2006-11-23 -> 19 in May 2026
  const [validationError, setValidationError] = useState<string | null>(null);
  const [bloodType, setBloodType] = useState("O型");
  const [specificNationality, setSpecificNationality] = useState("韩国首尔特别市江南区");
  const [isMixed, setIsMixed] = useState(false);
  const [mixedCountries, setMixedCountries] = useState("中/韩 (Sino-Korean)");

  // Eye shape, pupil color, nose shape
  const [eyeShape, setEyeShape] = useState("瑞凤眼 (清冷俊雅)");
  const [eyeColor, setEyeColor] = useState("琥珀浅晶茶棕");
  const [noseShape, setNoseShape] = useState("直挺悬胆鼻 (经典立体)");

  // Live Body physical parameters configuration (Criterion 5 custom values)
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState(46.5);

  // New customizable skills states (Vocal, Dance, Rap, Variety)
  const [vocalSkill, setVocalSkill] = useState(30);
  const [danceSkill, setDanceSkill] = useState(30);
  const [rapSkill, setRapSkill] = useState(20);
  const [varietySkill, setVarietySkill] = useState(20);

  const [membersData, setMembersData] = useState<Record<number, any>>({
    0: {
      name: "金智敏",
      stageName: "JIMIN",
      gender: "female",
      style: "group",
      roleInGroup: "队长 & 主唱 & 门面担当",
      hairStyle: "层次狼尾鲻鱼头 (Wolf Cut)",
      hairColor: "午夜深海蓝黑",
      mbti: "ENFJ",
      conceptTheme: "Hip-Hop (嘻哈说唱)",
      vibeText: "自带清冷慵懒的面部视觉，跳舞时节奏把控极其犀利，眼神极具野心与侵略感。",
      startType: "trainee",
      nationality: "korean",
      birthday: "2006-11-23",
      zodiac: "射手座",
      age: 19,
      bloodType: "O型",
      specificNationality: "韩国首尔特别市江南区",
      isMixed: false,
      mixedCountries: "中/韩 (Sino-Korean)",
      eyeShape: "瑞凤眼 (清冷俊雅)",
      eyeColor: "琥珀浅晶茶棕",
      noseShape: "直挺悬胆鼻 (经典立体)",
      height: 167,
      weight: 46.5,
      vocalSkill: 30,
      danceSkill: 30,
      rapSkill: 20,
      varietySkill: 20,
      hasLover: false,
      loverName: "林舒阳",
      loverGender: "male",
      loverAge: "same_age",
      loverIdentity: "non_celeb"
    },
    1: {
      name: "申美延",
      stageName: "MIYEON",
      gender: "female",
      style: "group",
      roleInGroup: "主舞 & 门面担当",
      hairStyle: "慵懒长卷发配一刀切刘海",
      hairColor: "玫瑰雾粉配银丝挂耳染",
      mbti: "ISFP",
      conceptTheme: "Jazz / Soul (复古爵士)",
      vibeText: "釜山海风般温柔动人的质感，舞台表情和感染力出彩。",
      startType: "trainee",
      nationality: "korean",
      birthday: "2006-01-31",
      zodiac: "水瓶座",
      age: 20,
      bloodType: "B型",
      specificNationality: "韩国釜山广域市",
      isMixed: false,
      mixedCountries: "",
      eyeShape: "桃花眼 (含情脉脉、男女莫辨)",
      eyeColor: "琥珀浅晶茶棕 (水润灵气)",
      noseShape: "圆润小翘鼻 (可爱自然亲切感)",
      height: 165,
      weight: 45.0,
      vocalSkill: 35,
      danceSkill: 30,
      rapSkill: 20,
      varietySkill: 35,
      hasLover: false,
      loverName: "",
      loverGender: undefined,
      loverAge: undefined,
      loverIdentity: undefined
    },
    2: {
      name: "韩媛雅",
      stageName: "WONY",
      gender: "female",
      style: "group",
      roleInGroup: "领舞 & 团宠担当",
      hairStyle: "清爽高马尾配碎发",
      hairColor: "甜酷焦糖栗子深棕",
      mbti: "ENFP",
      conceptTheme: "Bubblegum / Teen Pop (糖果流行)",
      vibeText: "元气满满的活力美少女，甜美亲和度十足，台下鬼马精灵。",
      startType: "trainee",
      nationality: "korean",
      birthday: "2007-08-31",
      zodiac: "处女座",
      age: 18,
      bloodType: "A型",
      specificNationality: "韩国大邱广域市",
      isMixed: false,
      mixedCountries: "",
      eyeShape: "下垂狗狗眼 (极致无辜、人畜无害)",
      eyeColor: "曜石浓墨黑 (深沉吸粉)",
      noseShape: "直挺悬胆鼻 (传统精雕神颜模板)",
      height: 168,
      weight: 46.0,
      vocalSkill: 25,
      danceSkill: 35,
      rapSkill: 30,
      varietySkill: 30,
      hasLover: false,
      loverName: "",
      loverGender: undefined,
      loverAge: undefined,
      loverIdentity: undefined
    }
  });

  const getMemberName = (idx: number) => {
    if (memberEditIdx === idx) return name;
    return membersData[idx]?.name || (idx === 0 ? "金智敏" : idx === 1 ? "申美延" : "韩媛雅");
  };

  const getMemberStageName = (idx: number) => {
    if (memberEditIdx === idx) return stageName;
    return membersData[idx]?.stageName || (idx === 0 ? "JIMIN" : idx === 1 ? "MIYEON" : "WONY");
  };

  const saveMember = (idx: number) => {
    const data = {
      name,
      stageName,
      gender,
      style: playMode === "single" ? style : "group",
      roleInGroup,
      hairStyle,
      hairColor,
      mbti,
      conceptTheme,
      vibeText,
      startType,
      nationality,
      birthday,
      zodiac,
      age,
      bloodType,
      specificNationality,
      isMixed,
      mixedCountries,
      eyeShape,
      eyeColor,
      noseShape,
      height,
      weight,
      vocalSkill,
      danceSkill,
      rapSkill,
      varietySkill,
      hasLover,
      loverName,
      loverGender,
      loverAge,
      loverIdentity,
      romancePosition
    };
    setMembersData(prev => ({
      ...prev,
      [idx]: data
    }));
  };

  const loadMember = (idx: number, optData?: any) => {
    const data = optData || membersData[idx];
    if (!data) return;

    isSwitchingRef.current = true;
    setValidationError(null);
    setName(data.name);
    setStageName(data.stageName);
    setGender(data.gender);
    setRoleInGroup(data.roleInGroup || (idx === 0 ? "队长 & 主唱 & 门面担当" : idx === 1 ? "主舞 & 门面担当" : "领舞 & 团宠担当"));
    if (playMode === "single") {
      setStyle(data.style || "group");
    } else {
      setStyle("group");
    }
    setHairStyle(data.hairStyle);
    setHairColor(data.hairColor);
    setMbti(data.mbti);
    if (playMode === "single") {
      setConceptTheme(data.conceptTheme || "Hip-Hop (嘻哈说唱)");
    } else {
      // Force all members to use the unified group concept theme
      setConceptTheme(conceptTheme);
    }
    setVibeText(data.vibeText);
    setStartType(data.startType);
    setNationality(data.nationality);
    setBirthday(data.birthday);
    setZodiac(data.zodiac);
    setAge(data.age);
    setBloodType(data.bloodType);
    setSpecificNationality(data.specificNationality);
    setIsMixed(data.isMixed);
    setMixedCountries(data.mixedCountries);
    setEyeShape(data.eyeShape);
    setEyeColor(data.eyeColor);
    setNoseShape(data.noseShape);
    setHeight(data.height);
    setWeight(data.weight);
    setVocalSkill(data.vocalSkill);
    setDanceSkill(data.danceSkill);
    setRapSkill(data.rapSkill);
    setVarietySkill(data.varietySkill);
    setHasLover(data.hasLover);
    setLoverName(data.loverName);
    setLoverGender(data.loverGender);
    setLoverAge(data.loverAge);
    setLoverIdentity(data.loverIdentity);
    setRomancePosition(data.romancePosition || "right");

    setTimeout(() => {
      isSwitchingRef.current = false;
    }, 50);
  };

  // Synchronize initial skill attributes with startType
  useEffect(() => {
    if (isSwitchingRef.current) return;
    if (startType === "trainee") {
      setVocalSkill(30);
      setDanceSkill(30);
      setRapSkill(20);
      setVarietySkill(20);
    } else {
      setVocalSkill(70);
      setDanceSkill(75);
      setRapSkill(50);
      setVarietySkill(55);
    }
    setValidationError(null); // Reset safety errors when switching start type
  }, [startType]);

  // Synchronize height and weight with gender swaps
  useEffect(() => {
    if (isSwitchingRef.current) return;
    setHeight(gender === "female" ? 167 : 181);
    setWeight(gender === "female" ? 46.5 : 62.0);
  }, [gender]);

  // Adjust default lover details based on gender/identity swaps for convenience
  useEffect(() => {
    if (isSwitchingRef.current) return;
    const oppGender = gender === "female" ? "male" : "female";
    setLoverGender(oppGender);
    
    if (loverIdentity === "non_celeb") {
      setLoverName(oppGender === "male" ? "林舒阳" : "韩智媛");
    } else {
      setLoverName(oppGender === "male" ? "姜在赫" : "申美延");
    }
  }, [gender, loverIdentity]);

  // Automatically calculate Zodiac and Age when birthday modifications happen
  useEffect(() => {
    if (isSwitchingRef.current) return;
    setZodiac(calculateZodiac(birthday));
    const calcedAge = calculateAgeFromBirthday(birthday);
    setAge(calcedAge);
    setValidationError(null); // Reset validation errors when birthday is changed
  }, [birthday]);

  // Adjust default specific nationality based on general nationality
  useEffect(() => {
    if (isSwitchingRef.current) return;
    if (nationality === "korean") {
      setSpecificNationality("韩国首尔特别市江南区");
    } else if (nationality === "chinese_green") {
      setSpecificNationality("中国四川省成都市");
    } else if (nationality === "japanese_green") {
      setSpecificNationality("日本东京都涉谷区");
    } else if (nationality === "thai_green") {
      setSpecificNationality("泰国曼谷皇家红灯特区");
    } else {
      setSpecificNationality("加拿大温哥华列治文市");
    }
  }, [nationality]);

  const nationalityLabels = {
    korean: "🇰🇷 韩国本土国籍 (Native Korean)",
    chinese_green: "🇨🇳 华裔外籍绿卡 (Chinese Green Card - 易受网暴排挤)",
    japanese_green: "🇯🇵 日裔外籍绿卡 (Japanese Green Card - 历史或发言容易无限放大)",
    thai_green: "🇹🇭 泰裔外籍绿卡 (Thai Green Card - 商业价值极高但分词少)",
    western_green: "🇺🇸 欧美/澳洲绿卡 (Western/Aussie Green Card - 舞蹈好文化存在壁垒)"
  };

  const eyeShapeOptions = [
    "瑞凤眼 (极其清美、高贵冷淡)",
    "桃花眼 (含情脉脉、男女莫辨)",
    "杏眼 (温润明亮、极致清爽感)",
    "狐狸眼 (眼尾挑起、极具妖性侵略度)",
    "下垂狗狗眼 (极致无辜、人畜无害)"
  ];

  const eyeColorOptions = [
    "曜石浓墨黑 (深沉吸粉)",
    "琥珀浅晶茶棕 (水润灵气)",
    "迷雾深海极光蓝 (深邃贵气 - 混血儿完美契合)",
    "波罗的海祖母绿 (神秘野性 - 极罕见瞳色)",
    "迷失红茶红棕 (神秘混血暖色)"
  ];

  const noseShapeOptions = [
    "直挺悬胆鼻 (传统精雕神颜模板)",
    "圆润小翘鼻 (可爱自然亲切感)",
    "驼峰艺术鼻 (高级厌世电影视觉)",
    "欧式高陡立体盒鼻 (混血硬骨相级)"
  ];

  const bloodTypeOptions = ["A型", "B型", "AB型", "O型", "稀有Rh阴性 (熊猫血)"];

  const rolesOptionsByGender = {
    female: [
      "队长 & 主舞 & 门面担当",
      "主唱 & 高音担当",
      "全能ACE & 舞台核心爆点",
      "忙内 (Maknae) & 领舞 & 团宠",
      "主Rapper & 酷女孩 (Girl Crush) 担当",
    ],
    male: [
      "队长 & 主唱 & 创作制作人担当",
      "领舞 & 副主唱 & 核心颜值担当",
      "主Rapper & 酷盖ACE担当",
      "忙内 (Maknae) & 主舞 & 热力团宠",
      "门面 Center & 综艺才气爆笑担当",
    ],
  };

  const hairStyleOptions = [
    "层次狼尾鲻鱼头 (Wolf Cut)",
    "慵懒长卷发配一刀切刘海",
    "清爽高马尾配碎发",
    "齐肩微翘高级感短直发",
    "日系纯真少年感微碎卷发",
    "复古中分长发配冷酷油头"
  ];

  const hairColorOptions = [
    "午夜深海蓝黑",
    "玫瑰雾粉配银丝挂耳染",
    "极光冷白金发",
    "甜酷焦糖栗子深棕",
    "炽热熔岩野草莓红",
    "清冷银灰独角兽梦幻色"
  ];

  const conceptualThemes = [
    "Hip-Hop (嘻哈说唱)",
    "Jazz / Soul (复古爵士)",
    "R&B / Neo-Soul (现代节奏蓝调)",
    "Synthpop / Retro Wave (合成器流行)",
    "House / Garage (电子浩室)",
    "Pop Rock / Alternative (摇滚朋克)",
    "Bubblegum / Teen Pop (糖果流行)",
    "R&B Velvet (暗黑节奏蓝调)",
    "Ballad (感性抒情)",
    "Latin / Afrobeat (拉丁/非洲律动)"
  ];

  const companyLabels = [
    "Aether Label (三大厂牌旗下 - 待遇高，抽成9:1)",
    "YG-Style Studio (重金打造的街头厂牌 - 创作自由，抽成8:2)",
    "Lighthouse Indie (自由随性的独立企划社 - 分成优厚7:3)",
    "Planet-9 Network (擅长粉丝打卷的小社 - 抽成严苛，债务结算高)"
  ];

  const maxPool = startType === "trainee" ? 120 : 285;
  const currentTotal = vocalSkill + danceSkill + rapSkill + varietySkill;
  const remainingPoints = maxPool - currentTotal;

  const adjustSkill = (skill: string, amount: number) => {
    if (amount > 0 && remainingPoints <= 0) return; // no points left
    const minVal = startType === "trainee" ? 10 : 30;
    const maxVal = startType === "trainee" ? 60 : 99;
    
    if (skill === "vocal") {
      setVocalSkill(prev => Math.max(minVal, Math.min(maxVal, prev + amount)));
    } else if (skill === "dance") {
      setDanceSkill(prev => Math.max(minVal, Math.min(maxVal, prev + amount)));
    } else if (skill === "rap") {
      setRapSkill(prev => Math.max(minVal, Math.min(maxVal, prev + amount)));
    } else if (skill === "variety") {
      setVarietySkill(prev => Math.max(minVal, Math.min(maxVal, prev + amount)));
    }
  };

  const getRecommendedRole = () => {
    const skills = [
      { label: "主唱 & 高音担当", value: vocalSkill },
      { label: "全能ACE & 舞台核心爆点", value: danceSkill },
      { label: "主Rapper & 酷女孩 (Girl Crush) 担当", value: rapSkill },
      { label: "忙内 (Maknae) & 领舞 & 团宠", value: varietySkill }
    ];
    // For male, map accordingly:
    const maleSkills = [
      { label: "队长 & 主唱 & 创作制作人担当", value: vocalSkill },
      { label: "忙内 (Maknae) & 主舞 & 热力团宠", value: danceSkill },
      { label: "主Rapper & 酷盖ACE担当", value: rapSkill },
      { label: "门面 Center & 综艺才气爆笑担当", value: varietySkill }
    ];
    const targetArr = gender === "female" ? skills : maleSkills;
    // Sort descending by score
    const sorted = [...targetArr].sort((a, b) => b.value - a.value);
    return sorted[0].label;
  };

  const generateVibeText = () => {
    let text = "";
    if (conceptTheme.includes("Hip-Hop")) {
      text = "眼神犀利冷峻，带有街头律动骨相。无论是Rap急速弹射还是帅气的Hiphop即兴舞步都手到擒来，生来就是舞台上的绝对领头羊。";
    } else if (conceptTheme.includes("Jazz") || conceptTheme.includes("Soul")) {
      text = "自带微醺慵懒的复古嗓音与艺术故事感。眼神如深夜烟海般深沉，极具高阶审美与独特的清冷文艺气息。";
    } else if (conceptTheme.includes("R&B") || conceptTheme.includes("Velvet")) {
      text = "嗓音微哑慵懒，独具黑丝绒般的质感。动作掌控极其细腻，眼神清冷而勾人，是极具致命吸引力的舞台杀手。";
    } else if (conceptTheme.includes("Synthpop") || conceptTheme.includes("House") || conceptTheme.includes("Garage")) {
      text = "节奏感极强，舞蹈动作干练利落、毫不拖泥带水。周身散发着摩登复古的电子科技冷艳感，是行走的画报。";
    } else if (conceptTheme.includes("Rock") || conceptTheme.includes("Alternative")) {
      text = "自带摇滚歌手骨子里的野性叛逆与不羁。台风极其硬核霸气，嗓音穿透力拉满，拥有瞬间点燃全场的现场爆发力。";
    } else if (conceptTheme.includes("Bubblegum") || conceptTheme.includes("Pop") || conceptTheme.includes("Summer")) {
      text = "充满了高能元气和果汁感。甜美和少年感并存，笑容极具治愈力和感染力，每个镜头对视都仿佛洋溢着夏日的温度。";
    } else if (conceptTheme.includes("Ballad")) {
      text = "声线澄澈深情，极具画面共情力。无需繁琐的舞美，只需静静站立歌唱便能触动灵魂，散发出惹人怜惜的清冷易碎感。";
    } else {
      text = "具备顶级的概念化理解力与极高辨识度的神颜。自带引人瞩目的爱豆光环，能将独一无二的先锋美学在舞台上完美定格。";
    }
    setVibeText(text);
  };

  const getAgeValidationError = (ageVal: number, careerType: "trainee" | "idol"): string | null => {
    if (careerType === "trainee") {
      if (ageVal < 12) {
        return "⚠️ 爱豆年龄偏小（当前通过生日算得为 " + ageVal + " 岁）！练习生训练生起点最低年龄限制为 12 岁，请重新挑选您的出生日期。";
      }
      if (ageVal > 24) {
        return "⚠️ 爱豆年龄偏大（当前设想年岁为 " + ageVal + " 岁）！练习生起步推荐最大年龄为 24 岁以内，请重新挑选。";
      }
    } else { // idol
      if (ageVal < 15) {
        return "⚠️ 成型明星在业界的最低出道合法年龄不得小于 15 岁（当前算得为 " + ageVal + " 岁）！若要开此低龄挡请切换为【练习生模式】经历累积！";
      }
      if (ageVal > 30) {
        return "⚠️ 成型打歌爱豆推荐年龄不超过 30 岁（当前算得为 " + ageVal + " 岁）！请重新挑选出生日期。";
      }
    }
    return null;
  };

  const handleNext = () => {
    const ageError = getAgeValidationError(age, startType);
    if (ageError) {
      setValidationError(ageError);
      return;
    } else {
      setValidationError(null);
    }

    if (step === 2) {
      generateVibeText();
    }
    if (step < 3) {
      saveMember(memberEditIdx);
      setStep(step + 1);
    } else {
      // Save current member form states first to the member index before compiling
      saveMember(memberEditIdx);

      // Create dynamically generated teammates & default profile entries
      const isTrainee = startType === "trainee";
      const actualSplit = company.includes("7:3") ? "7:3" : (company.includes("8:2") ? "8:2" : "9:1");

      const finalPersonas: IdolPersona[] = [];
      const numMembers = playMode === "single" ? 1 : (playMode === "duo" ? 2 : 3);

      // Prevent duplicate roles/responsibilities and duplicate names/stageNames
      const namesSet = new Set<string>();
      const stageNamesSet = new Set<string>();
      const staffInfoForCheck = generateCoreStaff(gender);
      const teammateListForCheck = generateRandomTeammates(gender, 4);

      const staffNamesToCheck = [
        staffInfoForCheck.manager.name,
        staffInfoForCheck.ceo.name,
        staffInfoForCheck.rival.name
      ].map(n => n.split(" ")[0].trim().toLowerCase()); // Get first name or full name split

      const teammateNamesToCheck = teammateListForCheck.map(t => t.name.trim().toLowerCase());
      const teammateStageNamesToCheck = teammateListForCheck.map(t => t.stageName.trim().toUpperCase());

      for (let i = 0; i < numMembers; i++) {
        const m = i === memberEditIdx
          ? { name, stageName, roleInGroup }
          : membersData[i];
        if (m) {
          const cleanName = m.name?.trim() || "";
          const cleanNameLower = cleanName.toLowerCase();
          const cleanStageName = m.stageName?.trim().toUpperCase() || "";

          if (!cleanName) {
            setValidationError(`⚠️ 请填写第 ${i + 1} 位组合成员的本名！`);
            return;
          }
          if (!cleanStageName) {
            setValidationError(`⚠️ 请填写第 ${i + 1} 位组合成员的舞台艺名！`);
            return;
          }

          // 1. Playable members with themselves
          if (namesSet.has(cleanNameLower)) {
            setValidationError(`⚠️ 组合内成员本名不能重复！检测到重复的候选本名：『${cleanName}』。请点击左侧各成员的头像卡片，为其起一个独特的本名。`);
            return;
          }
          if (stageNamesSet.has(cleanStageName)) {
            setValidationError(`⚠️ 组合内成员舞台艺名不能重复！检测到重复的艺名：『${cleanStageName}』。请点击左侧各成员的头像卡片修改。`);
            return;
          }

          // 2. Playable members with staff
          if (staffNamesToCheck.some(sn => cleanNameLower.includes(sn) || sn.includes(cleanNameLower))) {
            setValidationError(`⚠️ 设定的本名『${cleanName}』不能与系统企划社核心人物（经纪人、代表董事、Rival明星等）产生重名冲突！请重新起名。`);
            return;
          }

          // 3. Playable members with default companions
          if (playMode === "single" && style === "group") {
            if (teammateNamesToCheck.includes(cleanNameLower)) {
              setValidationError(`⚠️ 设定的本名『${cleanName}』与系统默认自动生成的刀群舞队友名冲突！请重新起名，以防引发通信与数据归档逻辑碰撞。`);
              return;
            }
            if (teammateStageNamesToCheck.includes(cleanStageName)) {
              setValidationError(`⚠️ 设定的舞台艺名『${cleanStageName}』与系统默认自动生成的队友艺名冲突！请重新换个艺名。`);
              return;
            }
          }

          namesSet.add(cleanNameLower);
          stageNamesSet.add(cleanStageName);
        }
      }

      if (playMode !== "single") {
        const rolesSet = new Set<string>();
        for (let i = 0; i < numMembers; i++) {
          const m = i === memberEditIdx
            ? { name, roleInGroup }
            : membersData[i];
          if (m) {
            if (!m.roleInGroup) {
              setValidationError(`⚠️ %%% 错误：% - 组合内全部成员都必须确定一个定位担当！`);
              return;
            }
            if (rolesSet.has(m.roleInGroup)) {
              setValidationError(`⚠️ 团队内成员的独立主打定位/担当不能重复！检测到重复的担当：『${m.roleInGroup}』。请点击左侧各成员的头像卡片，为其挑选专属性质担当。`);
              return;
            }
            rolesSet.add(m.roleInGroup);
          }
        }
      }

      for (let i = 0; i < numMembers; i++) {
        let m = i === memberEditIdx ? {
          name,
          stageName,
          gender,
          style: playMode === "single" ? style : "group",
          roleInGroup,
          hairStyle,
          hairColor,
          mbti,
          conceptTheme,
          vibeText,
          startType,
          nationality,
          birthday,
          zodiac,
          age,
          bloodType,
          specificNationality,
          isMixed,
          mixedCountries: isMixed ? mixedCountries : "",
          eyeShape,
          eyeColor,
          noseShape,
          height,
          weight,
          vocalSkill,
          danceSkill,
          rapSkill,
          varietySkill,
          hasLover,
          loverName,
          loverGender,
          loverAge,
          loverIdentity
        } : membersData[i];

        // Fallback matching default empty values if not touched
        if (!m) {
          if (i === 1) {
            m = {
              name: "申美延",
              stageName: "MIYEON",
              gender: "female",
              style: "group",
              roleInGroup: "主舞 & 门面担当",
              hairStyle: "慵懒长卷发配一刀切刘海",
              hairColor: "玫瑰雾粉配银丝挂耳染",
              mbti: "ISFP",
              conceptTheme: "Jazz / Soul (复古爵士)",
              vibeText: "釜山海风般温柔动人的质感，舞台表情和感染力出彩。",
              startType,
              nationality: "korean",
              birthday: "2006-01-31",
              zodiac: "水瓶座",
              age: 20,
              bloodType: "B型",
              specificNationality: "韩国釜山广域市",
              isMixed: false,
              mixedCountries: "",
              eyeShape: "桃花眼 (含情脉脉、男女莫辨)",
              eyeColor: "琥珀浅晶茶棕 (水润灵气)",
              noseShape: "圆润小翘鼻 (可爱自然亲切感)",
              height: 165,
              weight: 45.0,
              vocalSkill: isTrainee ? 35 : 70,
              danceSkill: isTrainee ? 30 : 65,
              rapSkill: isTrainee ? 20 : 50,
              varietySkill: isTrainee ? 35 : 75,
              hasLover: false,
              loverName: "",
              loverGender: undefined,
              loverAge: undefined,
              loverIdentity: undefined
            };
          } else {
            m = {
              name: "韩媛雅",
              stageName: "WONY",
              gender: "female",
              style: "group",
              roleInGroup: "领舞 & 团宠担当",
              hairStyle: "清爽高马尾配碎发",
              hairColor: "甜酷焦糖栗子深棕",
              mbti: "ENFP",
              conceptTheme: "Bubblegum / Teen Pop (糖果流行)",
              vibeText: "元气满满的活力美少女，甜美亲和度十足，台下鬼马精灵。",
              startType,
              nationality: "korean",
              birthday: "2007-08-31",
              zodiac: "处女座",
              age: 18,
              bloodType: "A型",
              specificNationality: "韩国大邱广域市",
              isMixed: false,
              mixedCountries: "",
              eyeShape: "下垂狗狗眼 (极致无辜、人畜无害)",
              eyeColor: "曜石浓墨黑 (深沉吸粉)",
              noseShape: "直挺悬胆鼻 (传统精雕神颜模板)",
              height: 168,
              weight: 46.0,
              vocalSkill: isTrainee ? 25 : 62,
              danceSkill: isTrainee ? 35 : 78,
              rapSkill: isTrainee ? 30 : 68,
              varietySkill: isTrainee ? 30 : 70,
              hasLover: false,
              loverName: "",
              loverGender: undefined,
              loverAge: undefined,
              loverIdentity: undefined
            };
          }
        }

        const startPopularity = isTrainee ? 0 : (playMode === "single" && m.style === "solo" ? 50 : 65);
        const startReputation = isTrainee ? 40 : 70;
        const startFans = isTrainee ? 50 : (playMode === "single" && m.style === "solo" ? 750000 : 1800000);
        const startAlbumSales = isTrainee ? 0 : (playMode === "single" && m.style === "solo" ? 35000 : 190000);
        const startMoney = isTrainee ? 10 : 1200;
        const debt = isTrainee ? 15000 : 1200;
        const personMBTI = m.mbti.toUpperCase() || "ENFJ";

        const pObj: IdolPersona = {
          name: m.name,
          stageName: m.stageName.toUpperCase() || m.name,
          gender: m.gender,
          style: playMode === "single" ? m.style : "group",
          groupName: playMode === "single" ? (m.style === "group" ? groupName : "独立Solo客制人设") : groupName,
          roleInGroup: playMode === "single" ? (m.style === "group" ? roleInGroup : "独立全能唱作歌手") : (m.roleInGroup || "主唱 & 领舞"),
          hairStyle: m.hairStyle,
          hairColor: m.hairColor,
          mbti: personMBTI,
          conceptTheme: m.conceptTheme,
          company,
          vibeText: m.vibeText,
          startType: m.startType,
          nationality: m.nationality,
          birthday: m.birthday,
          zodiac: m.zodiac,
          age: m.age,
          bloodType: m.bloodType,
          specificNationality: m.specificNationality,
          isMixed: m.isMixed,
          mixedCountries: m.isMixed ? m.mixedCountries : "",
          eyeShape: m.eyeShape,
          eyeColor: m.eyeColor,
          noseShape: m.noseShape,
          height: m.height,
          weight: m.weight,
          skinCondition: "perfect",
          vocalSkill: m.vocalSkill,
          danceSkill: m.danceSkill,
          rapSkill: m.rapSkill,
          varietySkill: m.varietySkill,
          stress: isTrainee ? 15 : 40,
          traineeDebt: debt,
          companySplit: actualSplit,
          managerFavorability: isTrainee ? 12 : 35, 
          teammatesFavorability: isTrainee ? 10 : 42, 
          ceoFavorability: isTrainee ? 8 : 30, 
          pdFavorability: isTrainee ? 15 : 45, 
          popularity: startPopularity,
          reputation: startReputation,
          energy: 100,
          fansCount: startFans,
          albumSales: startAlbumSales,
          money: startMoney,
          dayNumber: 1,
          hasLover: m.hasLover,
          loverName: m.hasLover ? (m.loverName?.trim() || (m.loverGender === "female" ? "韩熙珍" : "宋承泽")) : "",
          relationshipStatus: m.hasLover ? "dating" : "single",
          scandalPrejudice: m.hasLover ? (isTrainee ? 45 : 35) : 8,
          loverGender: m.hasLover ? m.loverGender : undefined,
          loverAge: m.hasLover ? m.loverAge : undefined,
          loverIdentity: m.hasLover ? m.loverIdentity : undefined,
          loverMood: m.hasLover ? 85 : undefined,
          romancePosition: m.hasLover ? (m.romancePosition || "right") : undefined,
          fansDistribution: isTrainee ? {
            otFans: 70,
            soloFans: 15,
            cpFans: 5,
            antiFans: 10
          } : {
            otFans: 45,
            soloFans: 30,
            cpFans: 15,
            antiFans: 10
          }
        };

        const currentLoverMood = m.hasLover ? 85 : undefined;
        if (m.hasLover) {
          pObj.loverMood = currentLoverMood;
        }

        finalPersonas.push(pObj);
      }

      // Generate companions
      // If single and group: generate companions (4 companions to make 5 total). If duo/trio, keep 0 companion teammates as K-pop has 2-3 member group debuts.
      const numCompanionsNeeded = playMode === "single" ? (style === "group" ? 4 : 0) : 0;
      let companions = numCompanionsNeeded > 0 ? generateRandomTeammates(gender, numCompanionsNeeded) : [];
      
      if (numCompanionsNeeded === 4 && companions.length === 4 && finalPersonas.length > 0) {
        const playerRole = finalPersonas[0].roleInGroup;
        const allRoles = rolesOptionsByGender[gender] || [];
        // Extract 4 companion roles separate from the chosen player's role
        const companionAvailableRoles = allRoles.filter(r => r !== playerRole);
        
        companions = companions.map((t, idx) => {
          const assignedRole = companionAvailableRoles[idx] || t.role;
          return {
            ...t,
            role: assignedRole,
            favorability: isTrainee ? 10 : 42
          };
        });
      } else {
        companions = companions.map(t => ({
          ...t,
          favorability: isTrainee ? 10 : 42
        }));
      }

      onComplete(finalPersonas, companions);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      saveMember(memberEditIdx);
      setStep(step - 1);
      setValidationError(null);
    }
  };

  return (
    <div id="idol-profile-setup" className="fixed inset-0 z-50 bg-[#06080e] overflow-y-auto font-sans">
      <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-transparent to-transparent pointer-events-none animate-pulse" />
      
      <div className="min-h-full w-full flex items-start md:items-center justify-center p-2 sm:p-4 md:p-6 relative z-10">
        {/* Modern High-End Glass Container */}
        <div className="w-full max-w-5xl bg-[#0d121c]/90 text-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row relative backdrop-blur-xl my-4 md:my-0">
          
          {/* Left Interactive Cosmic Rails */}
          <div className="md:w-[320px] lg:w-[350px] bg-gradient-to-b from-[#111726] via-[#090d16] to-[#04060b] p-5 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 shrink-0 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-full text-[10px] text-indigo-300 font-mono mb-4 md:mb-6">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                IDOL PAD PRO V2.5
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-pink-300 bg-clip-text text-transparent leading-none">
                IdolPad™ OS
              </h1>
              <p className="text-xs text-slate-400 mt-2.5 md:mt-3 leading-relaxed">
                业界首个高保真深度爱豆企划模拟系统。
                创建最真实的爱豆履历，从江南皮肤科敷麻加练到体验血雨腥风的绿卡身份危机与零结算财务折磨！
              </p>
            </div>

            <div className="my-5 md:my-0 space-y-3 md:space-y-6 relative z-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3.5 md:gap-4 transition-all">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${step === s ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400 shadow-lg shadow-purple-500/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                    {s}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] md:text-[11px] uppercase font-mono tracking-wider ${step === s ? "text-purple-400 font-bold" : "text-slate-500"}`}>
                      STAGE_0{s}
                    </p>
                    <p className={`text-[11px] md:text-xs ${step === s ? 'text-white font-semibold' : 'text-slate-400'}`}>
                      {s === 1 ? "基本个人档案与出生命格" : s === 2 ? "面部精雕与回归画卷" : "选聘娱乐社与最终确认"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3 mt-4 md:mt-0">
              © K-POP REALTIME STRATEGY OS SIMULATOR
            </div>
          </div>

          {/* Right Detail parameters */}
          <div className="flex-1 p-5 md:p-10 flex flex-col justify-between min-h-[380px] md:min-h-[560px] bg-slate-900/20">
          <div>
            {/* Switch tab buttons for custom character profiles editing - Persistently visible across all steps */}
            {playMode !== "single" && (
              <div className="flex items-center gap-2 bg-slate-950/30 p-2.5 rounded-xl border border-indigo-500/20 overflow-x-auto select-none mb-6">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono shrink-0 mr-1 flex items-center gap-1">
                  <span>🛠️ 编辑中自选成员:</span>
                </span>
                {[0, 1, 2].slice(0, playMode === "duo" ? 2 : 3).map((idx) => {
                  const isCurrent = memberEditIdx === idx;
                  const mName = getMemberName(idx);
                  const mStage = getMemberStageName(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        saveMember(memberEditIdx);
                        setMemberEditIdx(idx);
                        loadMember(idx);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-bold flex items-center gap-1.5 transition-all outline-none shrink-0 ${
                        isCurrent
                          ? "bg-gradient-to-br from-[#6366f1]/40 to-[#a855f7]/40 border-indigo-500 text-white shadow-md animate-pulse shadow-indigo-500/10"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:border-white/25"
                      }`}
                    >
                      <span>👤 {isCurrent ? "✍️ " : ""}成员 {idx + 1}: {mName} ({mStage.toUpperCase()})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2.5">
                    <User className="text-purple-400 w-6 h-6" /> 1. 建立爱豆骨相基本履历与出生命格
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    系统为您提供高自由度的自定义基础！拒绝死板选项，制定真实的生日、血型和高自由度本姓名片。
                  </p>
                </div>

                {/* 🔮 组合/双开/人设模式特色控制选择器 */}
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    🔮 企划扮演模式 (Gameplay Scenario Node)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        saveMember(memberEditIdx);
                        setPlayMode("single");
                        setMemberEditIdx(0);
                        setStyle("group");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                        playMode === "single"
                          ? "bg-gradient-to-br from-purple-950/30 via-indigo-950/20 to-indigo-900/30 border-purple-500 text-white shadow-lg"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">🕴️ 单人常规操控模式</span>
                      <span className="text-[10px] text-slate-400 leading-normal block">标准单角色深度扮演</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveMember(memberEditIdx);
                        setPlayMode("duo");
                        setMemberEditIdx(0);
                        setStyle("group");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                        playMode === "duo"
                          ? "bg-gradient-to-br from-pink-950/30 via-rose-950/20 to-rose-900/30 border-pink-500 text-white shadow-lg"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">👯 双人组合双开模式</span>
                      <span className="text-[10px] text-pink-300/80 leading-normal block">自建 2 人小分队同时操作</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveMember(memberEditIdx);
                        setPlayMode("trio");
                        setMemberEditIdx(0);
                        setStyle("group");
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                        playMode === "trio"
                          ? "bg-gradient-to-br from-teal-950/30 via-emerald-950/20 to-emerald-900/40 border-teal-500 text-white shadow-lg"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">🎤 三人精锐打歌模式</span>
                      <span className="text-[10px] text-teal-300/80 leading-normal block">自建 3 人超新星企划双开</span>
                    </button>
                  </div>
                </div>

                {/* Name, StageName inputs and Genders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">练习生本名 (Korean Name)</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-all font-semibold font-sans text-white focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">舞台艺名 (Stage Name)</label>
                    <input 
                      type="text" 
                      value={stageName} 
                      onChange={(e) => setStageName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-all uppercase font-bold tracking-wider font-sans text-white focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-2 uppercase font-mono">本位性别 (Gender Identity)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" onClick={() => setGender("female")}
                        className={`py-2 text-xs rounded-xl border font-bold transition-all ${gender === "female" ? "bg-purple-600/20 border-purple-500 text-purple-200" : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80"}`}
                      >
                        🚺 女爱豆
                      </button>
                      <button 
                        type="button" onClick={() => setGender("male")}
                        className={`py-2 text-xs rounded-xl border font-bold transition-all ${gender === "male" ? "bg-indigo-600/20 border-indigo-500 text-indigo-400" : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80"}`}
                      >
                        🚹 男爱豆
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">生化血型特征 (Blood Type)</label>
                    <select 
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-medium text-slate-200"
                    >
                      {bloodTypeOptions.map((opt) => (
                        <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Birthday, Age and Zodiac (NEW - Requirement 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-950/20 p-3.5 rounded-2xl border border-purple-500/20">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">📅 专属生日 (Birthday)</label>
                    <input 
                      type="date" 
                      value={birthday} 
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">⏳ 判定年龄 (Calculated Age)</label>
                    <div className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-purple-300 font-bold font-mono">
                      {age} 岁
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">🌌 出生星座 (Zodiac)</label>
                    <div className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-bold font-mono">
                      {zodiac}
                    </div>
                  </div>
                </div>

                {/* Birthday/age validation warning */}

                {/* Customizable Physical Metrics (Criterion 5) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/30 p-3.5 rounded-2xl border border-white/5 bg-slate-900/40">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-mono uppercase">📏 定制身高 (Custom Height)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="140"
                        max="210"
                        id="setup-height-input"
                        value={height} 
                        onChange={(e) => setHeight(parseInt(e.target.value) || 165)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="text-xs text-slate-400">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-mono uppercase">⚖️ 定制初始体重 (Custom Initial Weight)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.1"
                        min="30"
                        max="120"
                        id="setup-weight-input"
                        value={weight} 
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 45)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="text-xs text-slate-400">kg</span>
                    </div>
                  </div>
                </div>

                {/* Career Starting mode and Layout mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 text-xs col-span-1">
                    <span className="block font-semibold text-slate-400 uppercase font-mono">演艺生涯起点选择 (Career Entrance)</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button 
                        type="button" onClick={() => setStartType("trainee")}
                        className={`p-3 rounded-xl border text-left transition-all ${startType === "trainee" ? "bg-purple-950/30 border-purple-500 text-white shadow" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                      >
                        <p className="font-bold text-xs">👶 练习生模式</p>
                        <p className="text-[9px] text-slate-400 mt-1 leading-tight">0粉丝起步，背负 ₩1.5亿 (一亿五千万) 的练习生债务，前几年拼命争取一位！</p>
                      </button>
                      <button 
                        type="button" onClick={() => setStartType("idol")}
                        className={`p-3 rounded-xl border text-left transition-all ${startType === "idol" ? "bg-pink-950/30 border-pink-500 text-white shadow" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                      >
                        <p className="font-bold text-xs">💎 成型明星模式</p>
                        <p className="text-[9px] text-slate-400 mt-1 leading-tight">自带初始上万粉丝，债务基本还清，属性顶尖，享受奢华时尚通告。</p>
                      </button>
                    </div>
                  </div>

                  {playMode === "single" && (
                    <div className="space-y-1.5 text-xs col-span-1">
                      <span className="block font-semibold text-slate-400 uppercase font-mono">偶像出道构架方式 (Promotion Structure)</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button 
                          type="button" onClick={() => setStyle("solo")}
                          className={`p-3 rounded-xl border text-left transition-all ${style === "solo" ? "bg-indigo-950/30 border-indigo-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                        >
                          <p className="font-bold text-xs">🎙️ 独立Solo歌手</p>
                          <p className="text-[9px] text-slate-400 mt-1 leading-tight">独享全部舞台及分词高规格待遇，但宣发预算较小抗网暴难度高。</p>
                        </button>
                        <button 
                          type="button" onClick={() => setStyle("group")}
                          className={`p-3 rounded-xl border text-left transition-all ${style === "group" ? "bg-emerald-950/30 border-emerald-500 text-white" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                        >
                          <p className="font-bold text-xs">👯‍♂️ 5人高精度组合</p>
                          <p className="text-[9px] text-slate-400 mt-1 leading-tight">自动随机生成4位各有高光反差 of 宿怨队友，暗潮涌动争抢核心Center！</p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secret relationship available to both trainees and idols */}
                <div className="p-3.5 rounded-2xl bg-pink-950/20 border border-pink-500/25 space-y-2.5 mt-2 animate-in fade-in slide-in-from-top-1.5 col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-400">💞 地下恋爱秘密选择 (Secret Relationship Setup)</span>
                    <span className="bg-pink-500/20 text-pink-300 font-mono text-[8px] px-1.5 py-0.5 rounded border border-pink-500/20">隐藏恋爱挂件</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal">
                    不管是练习生还是出道偶像，你是否正瞒着公司、粉丝和队友在地下偷偷谈恋爱？
                    如果你选择携同地下恋人，你将解锁专属的「秘密恋人Kakaotalk聊天通道」，需要时刻维持对方的心情与安全防线。恋人由于压力、对粉丝的愧疚有可能向你提出分手！
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button 
                      type="button"
                      onClick={() => setHasLover(false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${!hasLover ? "bg-[#1f1922] border-pink-500 text-pink-400 shadow-md" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                    >
                      🙅‍♀️ 专注于事业 (单身守戒派)
                    </button>
                    <button 
                      type="button"
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${hasLover ? "bg-pink-950/40 border-pink-500 text-pink-300 shadow-lg" : "bg-slate-950/40 border-white/5 text-slate-500"}`}
                      onClick={() => setHasLover(true)}
                    >
                      💖 偷偷恋爱中 (携带秘密情人)
                    </button>
                  </div>

                  {hasLover && (
                    <div className="space-y-3 mt-2 bg-slate-950/50 p-3.5 rounded-xl border border-pink-500/15 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Identity Selection */}
                        <div>
                          <label className="text-[10px] text-pink-400 font-bold block mb-1">🎭 恋人身份</label>
                          <select 
                            value={loverIdentity}
                            onChange={(e) => setLoverIdentity(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                          >
                            <option value="non_celeb">👤 圈外普通素人 (常人)</option>
                            <option value="celebrity">🌟 圈内业界明星 (明星/爱豆)</option>
                          </select>
                        </div>

                        {/* Gender Selection */}
                        <div>
                          <label className="text-[10px] text-pink-400 font-bold block mb-1">🚻 恋人性别</label>
                          <select 
                            value={loverGender}
                            onChange={(e) => setLoverGender(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                          >
                            <option value="female">♀️ 女性 (Female)</option>
                            <option value="male">♂️ 男性 (Male)</option>
                          </select>
                        </div>

                        {/* Age Selection */}
                        <div>
                          <label className="text-[10px] text-pink-400 font-bold block mb-1">⏳ 恋人年龄</label>
                          <select 
                            value={loverAge}
                            onChange={(e) => setLoverAge(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                          >
                            <option value="same_age">同龄 (Classmate / Same Age)</option>
                            <option value="older">年上 (Older / Noona / Oppa)</option>
                            <option value="younger">年下 (Younger / Dongsaeng)</option>
                          </select>
                        </div>
                      </div>

                      {/* Name input */}
                      <div className="pt-1.5">
                        <label className="text-[10px] text-pink-300 font-bold block mb-1">✍️ 自定义恋人姓名 / 艺名：</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={loverName}
                            onChange={(e) => setLoverName(e.target.value)}
                            placeholder="请输入你的专属小太阳姓名..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-yellow-300 focus:outline-none focus:border-pink-500 font-extrabold tracking-wide"
                          />
                          {loverIdentity === "celebrity" && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) setLoverName(e.target.value);
                              }}
                              className="bg-slate-800 border border-white/10 rounded-lg px-2 text-[10px] text-slate-300"
                            >
                              <option value="">🔮 快捷导入明星</option>
                              <option value="队内高冷颜值门面队友 - 申美延">申美延 (队内高冷颜值队友 - 队内恋爱)</option>
                              <option value="队内元气甜酷主舞队友 - 韩媛雅">韩媛雅 (队内元气甜酷队友 - 队内恋爱)</option>
                              <option value="顶流行星男团 Center - 姜在赫">姜在赫 (大势顶流团)</option>
                              <option value="同厂牌高音SOLO天后 - Miyeon">Miyeon (巨肺SOLO同门)</option>
                              <option value="忠武路大牌青年人气男演员 - 崔胜贤">崔胜贤 (影坛巨头新人)</option>
                              <option value="队内御用顶级先锋编舞总监 - JAY">JAY (舞室王牌)</option>
                            </select>
                          )}
                          {loverIdentity === "non_celeb" && (
                            <button
                              type="button"
                              onClick={() => {
                                const names = loverGender === "female" ? ["韩熙珍", "金荷娜", "朴敏智", "李瑞雅"] : ["宋承泽", "林禹汐", "崔俊熙", "姜在旭"];
                                const rand = names[Math.floor(Math.random() * names.length)];
                                setLoverName(rand);
                              }}
                              className="px-2 bg-slate-800 text-slate-300 border border-white/10 rounded-lg text-[10px] hover:bg-slate-700"
                            >
                              🎲 随机名
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Left/Right Position selection */}
                      <div className="pt-1 border-t border-white/5">
                        <label className="text-[10px] text-pink-300 font-bold block mb-1">💑 双人合照偏好：玩家在恋爱剧情中偏好什么定位？</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRomancePosition("left")}
                            className={`py-1.5 rounded-lg border text-xs font-bold text-center transition-all ${romancePosition === "left" ? "bg-purple-950/40 border-purple-500 text-purple-300 shadow-md" : "bg-slate-900 border-white/5 text-slate-400"}`}
                          >
                            左位 (左 / 攻 / Top / 主动保护)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRomancePosition("right")}
                            className={`py-1.5 rounded-lg border text-xs font-bold text-center transition-all ${romancePosition === "right" ? "bg-pink-950/40 border-pink-500 text-pink-300 shadow-md" : "bg-slate-900 border-white/10 text-slate-400"}`}
                          >
                            右位 (右 / 受 / Bottom / 被宠依恋)
                          </button>
                        </div>
                        <p className="text-[8px] text-slate-500 mt-1 leading-tight">不同的定位不仅会改变恋爱提示词，还会极大影响恋爱倾诉的感情基调与互动甜度！</p>
                      </div>
                    </div>
                  )}
                </div>


                {(style === "group" || playMode !== "single") && (
                  <div className="animate-in fade-in slide-in-from-top-1.5">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase font-mono">组合团体企划代号 (Group Project Code)</label>
                    <input 
                      type="text" 
                      value={groupName} 
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., ECLIPSE, NEWWAVE"
                      className="w-full bg-slate-955/70 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-bold uppercase tracking-widest text-white font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2.5">
                    <Star className="text-yellow-400 w-6 h-6" /> 2. 绿卡国境困局、混血设计与面部美学精雕
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    自定义具体国籍与眼型、瞳色、鼻部曲线。这些参数会重构您在公共社交平媒中的争议关注与好感度。
                  </p>
                </div>

                {/* 国籍 details with specific Green Card Dilemma simulation preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-350 mb-1 uppercase font-mono">国籍标签定位 (Nationality Standard)</label>
                      <select 
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value as any)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-100 font-medium"
                      >
                        {Object.entries(nationalityLabels).map(([key, value]) => (
                          <option className="bg-[#0b0e17] text-white" key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-350 mb-1 uppercase font-mono">详细地缘国籍 (Specific Origin)</label>
                      <input 
                        type="text"
                        value={specificNationality}
                        onChange={(e) => setSpecificNationality(e.target.value)}
                        placeholder="e.g. 中国辽宁省沈阳市"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Biracial Mixed configuration - Criterion 5 */}
                  <div className="space-y-3.5 border-l border-white/5 pl-0 md:pl-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-350 mb-1.5 uppercase font-mono">跨国混血谱系 (Biracial/Mixed Heritage)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button" onClick={() => setIsMixed(false)}
                          className={`py-1.5 text-xs rounded-lg border font-bold transition-all ${!isMixed ? "bg-indigo-900/10 border-indigo-500 text-indigo-300" : "bg-slate-905 border-white/5 text-slate-500"}`}
                        >
                          ❌ 纯血血统
                        </button>
                        <button
                          type="button" onClick={() => setIsMixed(true)}
                          className={`py-1.5 text-xs rounded-lg border font-bold transition-all ${isMixed ? "bg-purple-900/10 border-purple-500 text-purple-300" : "bg-slate-905 border-white/5 text-slate-500"}`}
                        >
                          ✨ 多国混血
                        </button>
                      </div>
                    </div>

                    {isMixed && (
                      <div className="animate-in fade-in slide-in-from-top-1">
                        <label className="block text-[10px] font-semibold text-slate-350 mb-1 font-mono">具体混血亲代国家 (Mixed Countries)</label>
                        <input 
                          type="text"
                          value={mixedCountries}
                          onChange={(e) => setMixedCountries(e.target.value)}
                          placeholder="e.g. 中韩/德韩混血 (German-Korean)"
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 text-yellow-300 font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {nationality !== "korean" && (
                  <div className="flex items-start gap-2 bg-red-950/20 border border-red-500/20 p-2.5 rounded-xl text-[10px] text-red-200 leading-relaxed animate-pulse">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>
                      ⚠️ <strong>绿卡风暴警报 (The Foreign Member Dilemma)</strong>: 
                      外籍绿卡选手在南韩往往被有意克扣年末高赞镜头，签售会极易突发语言理解障碍挑唆，更有网暴黑粉长期拿放大镜挑刺“鞠躬角度不够90度”或“无爱国精神”等严酷审判，高好感度攻略难度倍增！
                    </span>
                  </div>
                )}

                {/* Highly requested refined facial options - Criterion 5 */}
                <div className="bg-[#111622]/40 border border-white/5 p-4 rounded-2xl">
                  <span className="block text-[11px] font-bold text-indigo-300 font-mono uppercase tracking-wide mb-3">
                    📐 细节面相精雕面板 (Fine-Grained Facial Sculpting)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">眼形细节精选 (Eye Shape)</label>
                      <select 
                        value={eyeShape}
                        onChange={(e) => setEyeShape(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-500 text-slate-200"
                      >
                        {eyeShapeOptions.map((opt) => (
                          <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">定制瞳色 (Eye Color / Pupils)</label>
                      <select 
                        value={eyeColor}
                        onChange={(e) => setEyeColor(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-500 text-slate-200"
                      >
                        {eyeColorOptions.map((opt) => (
                          <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">鼻部雕刻 (Nose Line Curve)</label>
                      <select 
                        value={noseShape}
                        onChange={(e) => setNoseShape(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none focus:border-purple-500 text-slate-200"
                      >
                        {noseShapeOptions.map((opt) => (
                          <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Traditional custom hairstyle details */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">头发梳理样式</label>
                    <select 
                      value={hairStyle}
                      onChange={(e) => setHairStyle(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 text-slate-200"
                    >
                      {hairStyleOptions.map((opt) => (
                        <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">定制发色</label>
                    <select 
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 text-slate-200"
                    >
                      {hairColorOptions.map((opt) => (
                        <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">MBTI 生涯心性</label>
                    <input 
                      type="text" 
                      value={mbti} 
                      onChange={(e) => setMbti(e.target.value)}
                      placeholder="e.g. ENFP, ENFJ"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 text-center text-white font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                {/* 🎭 主概念回归风格 Selection */}
                <div className="mt-4 bg-[#111622]/40 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-indigo-300 font-mono uppercase tracking-wide">
                      🎭 出道暨首张回归主概念 (Main Comeback Theme / Music Genre)
                    </label>
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 text-[9px] px-2 py-0.5 rounded font-black font-mono">回归流派</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                    爱豆首张出道或回归专辑的大盘流派核心概念。这不仅决定您在卡片及电台跑马灯上的视觉流派，也会影响后期所有社交平媒上的粉丝和黑粉讨论！
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <select 
                        value={isCustomConcept ? "custom" : (conceptualThemes.includes(conceptTheme) ? conceptTheme : "custom")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsCustomConcept(true);
                            const defaultCustom = "Chic Minimalist Noir (清冷极简主义风格)";
                            setCustomConceptText(defaultCustom);
                            updateConceptTheme(defaultCustom);
                          } else {
                            setIsCustomConcept(false);
                            updateConceptTheme(val);
                          }
                        }}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-slate-205 font-medium"
                      >
                        {conceptualThemes.map((opt) => (
                          <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option className="bg-[#0b0e17] text-yellow-300 font-bold" value="custom">✍️ ➕ 自定义回归风格 (Custom Style)</option>
                      </select>
                    </div>

                    {(isCustomConcept || !conceptualThemes.includes(conceptTheme)) && (
                      <div className="animate-in fade-in duration-200">
                        <input 
                          type="text" 
                          value={conceptTheme} 
                          onChange={(e) => {
                            setCustomConceptText(e.target.value);
                            updateConceptTheme(e.target.value);
                            setIsCustomConcept(true);
                          }}
                          placeholder="手动键盘定格专属概念，例如：德式暗黑工业风"
                          className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 text-yellow-300 font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="text-pink-400 w-5 h-5 animate-pulse" /> 3. 实力初审与娱乐经纪社签约
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    审阅并分配您的初始实力资质，系统将根据最终属性推荐你在团队中的担当名牌，您亦可依心意自主选择！
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-350 mb-1 uppercase font-mono">签约经纪公司 (Select Your Agency Label)</label>
                      <select 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 text-slate-100 font-medium font-sans"
                      >
                        {companyLabels.map((opt) => (
                          <option className="bg-[#0b0e17] text-white" key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Skill-point choice section */}
                    <div className="bg-[#111622]/60 p-3 rounded-xl border border-white/5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-300 font-mono uppercase tracking-wide flex items-center gap-1">
                          ⚡ 实力属性加点 (Allocate talent points) 
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${remainingPoints >= 0 ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 animate-pulse' : 'bg-red-600/20 text-red-300 border border-red-500/30'}`}>
                          余 {remainingPoints} 点
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 text-[10px]">主唱实力 🎙️</span>
                            <span className="font-mono font-bold text-purple-400">{vocalSkill}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <button type="button" onClick={() => adjustSkill("vocal", -5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">-</button>
                            <span className="text-[9px] text-slate-500">5</span>
                            <button type="button" onClick={() => adjustSkill("vocal", 5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 text-[10px]">舞蹈实力 💃</span>
                            <span className="font-mono font-bold text-emerald-400">{danceSkill}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <button type="button" onClick={() => adjustSkill("dance", -5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">-</button>
                            <span className="text-[9px] text-slate-500">5</span>
                            <button type="button" onClick={() => adjustSkill("dance", 5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 text-[10px]">说唱实力 🎤</span>
                            <span className="font-mono font-bold text-yellow-500">{rapSkill}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <button type="button" onClick={() => adjustSkill("rap", -5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">-</button>
                            <span className="text-[9px] text-slate-500">5</span>
                            <button type="button" onClick={() => adjustSkill("rap", 5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">+</button>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 p-2 rounded-lg border border-white/5 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 text-[10px]">综艺才气 🎭</span>
                            <span className="font-mono font-bold text-pink-400">{varietySkill}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <button type="button" onClick={() => adjustSkill("variety", -5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">-</button>
                            <span className="text-[9px] text-slate-500">5</span>
                            <button type="button" onClick={() => adjustSkill("variety", 5)} className="w-5 h-5 rounded bg-white/5 hover:bg-white/15 text-xs text-slate-300 transition shrink-0">+</button>
                          </div>
                        </div>
                      </div>

                      {/* Recommend box */}
                      <div className="bg-purple-950/30 p-2 border border-purple-500/20 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-[9px] text-purple-300 font-semibold leading-none mb-1">🏅 依据数值推荐本位担当：</p>
                          <p className="text-xs text-white font-bold">{getRecommendedRole()}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setRoleInGroup(getRecommendedRole())}
                          className="text-[10px] px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/60 active:scale-95 text-purple-100 border border-purple-400/30 rounded-lg font-bold transition font-sans"
                        >
                          应用推荐
                        </button>
                      </div>
                    </div>

                    {(style === "group" || playMode !== "single") && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-350 mb-1 uppercase font-mono">自主确定或更改队伍中的定位担当 (Group Position)</label>
                        <div className="grid grid-cols-1 gap-1 max-h-[120px] overflow-y-auto pr-1">
                          {rolesOptionsByGender[gender].map((role) => {
                            // Find if someone else is already taking this role
                            const takenByIdx = playMode !== "single" ? (() => {
                              const numMembers = playMode === "duo" ? 2 : 3;
                              for (let i = 0; i < numMembers; i++) {
                                if (i !== memberEditIdx && membersData[i]?.roleInGroup === role) {
                                  return i;
                                }
                              }
                              return undefined;
                            })() : undefined;
                            const isTaken = takenByIdx !== undefined;
                            const otherMemberName = isTaken ? (membersData[takenByIdx!].name || `成员 ${takenByIdx! + 1}`) : "";

                            return (
                              <button
                                key={role}
                                type="button"
                                disabled={isTaken}
                                onClick={() => {
                                  if (isTaken) return;
                                  setRoleInGroup(role);
                                }}
                                className={`text-left px-3 py-1.5 text-xs rounded-xl border flex items-center justify-between transition-all ${
                                  roleInGroup === role 
                                    ? "border-purple-500 bg-purple-500/10 text-white font-bold" 
                                    : isTaken
                                      ? "border-red-950/10 bg-slate-950/10 text-slate-600 opacity-60 cursor-not-allowed select-none"
                                      : "border-white/5 bg-slate-950/40 text-slate-400 hover:bg-slate-950/80"
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{role}</span>
                                  {isTaken && (
                                    <span className="text-[8px] leading-none border border-red-500/30 text-red-400 bg-red-950/20 rounded px-1.5 py-0.5 font-bold animate-pulse">
                                      🚫 已由 {otherMemberName} 担当
                                    </span>
                                  )}
                                </span>
                                {roleInGroup === role ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                ) : (!isTaken && role === getRecommendedRole()) ? (
                                  <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider bg-purple-950/50 px-1 border border-purple-500/20 rounded">推荐</span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-350 mb-1">主打自叙氛围细节 (Character Bio vibe)</label>
                      <textarea 
                        rows={1}
                        value={vibeText}
                        onChange={(e) => setVibeText(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-purple-500 leading-normal"
                      />
                    </div>
                  </div>

                  <div className="bg-[#121828]/55 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                    <div>
                      <span className="text-xs font-bold text-yellow-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        爱豆卡片预览 (Idol Summary)
                      </span>
                      
                      <div className="mt-4 space-y-2 text-xs text-slate-200 font-sans leading-relaxed">
                        <p>👤 <strong>姓名</strong>: {name} ({stageName}) — <span className="text-sky-300 font-bold uppercase">{gender === "female" ? "女爱豆" : "男爱豆"}</span></p>
                        <p>⚖️ <strong>身姿骨相</strong>: 身高 {height} cm / 初始体重 {weight} kg</p>
                        <p>🎂 <strong>生日星象</strong>: {birthday} / {zodiac} | 年龄: {age} 岁 ({bloodType})</p>
                        <p>🗺️ <strong>地缘与背景</strong>: {isMixed ? `【混血】${mixedCountries}` : "纯血本土"} | {specificNationality}</p>
                        <p>👁️ <strong>外貌雕琢</strong>: {eyeShape} | 瞳色:{eyeColor} | 鼻型:{noseShape}</p>
                        <p>💇 <strong>发型发色</strong>: {hairStyle} | {hairColor}</p>
                        <p>🎭 <strong>主概念回归</strong>: {conceptTheme}</p>
                      </div>
                    </div>

                    <div className="bg-purple-950/20 border border-purple-500/15 text-[10px] text-purple-300 p-2.5 rounded-xl leading-normal mt-3 flex items-start gap-1.5">
                      <Smile className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                      <span>
                        团队好感度初始锁定为 <strong>从零开始的超度内讧地狱 5%-20%</strong>。由于好感数值极低，队友日常会冷淡不理人、经纪人冷血训话。准备去用行动捂热他们、或者把作风恶劣的内讧大喇叭说闲话孤立出局吧！
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {validationError && (
            <div className="bg-red-950/40 border-2 border-red-500/40 p-4 rounded-2xl text-xs text-red-200 font-semibold mb-3 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {validationError}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-8 shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-xs text-slate-400 hover:text-white transition-all font-bold"
              >
                返回上一步
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              id="setup-complete-btn"
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-purple-600/10 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              {step === 3 ? "立即签署合同并进入练习室" : "继续，雕刻爱豆名帖"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
);
}
