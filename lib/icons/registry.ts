// Curated icon set for the whole site: stats cards, quality features, the
// services grid, footer, and any future admin-editable content. Keeping this
// list short and named (rather than letting admins/devs reach for any of the
// 1000+ lucide icons) keeps the visual language consistent with the
// approved catalog design.
import {
  Award,
  Building2,
  CheckCircle2,
  DoorOpen,
  Home,
  Layers,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wrench,
  type LucideIcon
} from "lucide-react";

export const ICON_REGISTRY = {
  award: Award,
  "building-2": Building2,
  "check-circle": CheckCircle2,
  "door-open": DoorOpen,
  home: Home,
  layers: Layers,
  mail: Mail,
  "map-pin": MapPin,
  phone: Phone,
  ruler: Ruler,
  shield: Shield,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  truck: Truck,
  users: Users,
  wrench: Wrench
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICON_REGISTRY;

export const ICON_KEYS = Object.keys(ICON_REGISTRY) as IconKey[];

export function isIconKey(value: string): value is IconKey {
  return value in ICON_REGISTRY;
}

// Never throws — an unknown/removed key on a public page falls back instead
// of crashing the render.
export function resolveIcon(key: string | null | undefined, fallback: IconKey = "sparkles"): LucideIcon {
  if (key && isIconKey(key)) return ICON_REGISTRY[key];
  return ICON_REGISTRY[fallback];
}
