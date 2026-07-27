import { IdolPersona } from "../types";

export function getManagerShortTitle(persona?: Partial<IdolPersona>): string {
  if (!persona) return "室长";
  const name = persona.managerCustomName || (persona.gender === "female" ? "严相勋" : "闵相勋");
  const title = persona.managerCustomTitle || "室长";
  
  if (name.includes("室长") || name.includes("经理") || name.includes("经纪人") || name.includes("总监")) {
    return name;
  }
  
  const surname = name ? name[0] : (persona.gender === "female" ? "严" : "闵");
  let shortTitle = "室长";
  if (title.includes("经理")) shortTitle = "经理";
  else if (title.includes("总监")) shortTitle = "总监";
  else if (title.includes("主管")) shortTitle = "主管";
  else if (title.includes("经纪人") && !title.includes("室长")) shortTitle = "经纪人";
  
  return `${surname}${shortTitle}`;
}

export function getManagerFullName(persona?: Partial<IdolPersona>): string {
  if (!persona) return "严相勋 (室长级经纪人)";
  const name = persona.managerCustomName || (persona.gender === "female" ? "严相勋" : "闵相勋");
  const title = persona.managerCustomTitle || "室长级经纪人";
  if (name.includes("(")) return name;
  return `${name} (${title})`;
}

export function replaceManagerPlaceholders(text: string, persona?: Partial<IdolPersona>): string {
  if (!text) return text;
  const rawName = persona?.managerCustomName || (persona?.gender === "female" ? "严相勋" : "闵相勋");
  const surname = rawName[0] || "严";
  const title = persona?.managerCustomTitle || "室长";
  
  let shortTitle = `${surname}室长`;
  if (title.includes("经理")) shortTitle = `${surname}经理`;
  else if (title.includes("总监")) shortTitle = `${surname}总监`;
  else if (title.includes("主管")) shortTitle = `${surname}主管`;
  else if (title.includes("经纪人") && !title.includes("室长")) shortTitle = `${surname}经纪人`;
  if (rawName.includes("室长") || rawName.includes("经理") || rawName.includes("经纪人")) {
    shortTitle = rawName;
  }

  return text
    .replace(/闵室长|严室长/g, shortTitle)
    .replace(/闵经纪人|严经纪人/g, `${surname}经纪人`)
    .replace(/闵经理人|严经理人/g, `${surname}经理人`)
    .replace(/闵经理|严经理/g, `${surname}经理`)
    .replace(/闵相勋|严相勋/g, rawName)
    .replace(/闵纪人|严纪人/g, `${surname}经纪人`)
    .replace(/闵室|严室/g, shortTitle);
}
