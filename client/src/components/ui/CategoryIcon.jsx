import {
  Utensils, Car, ShoppingBag, Zap, Film, HeartPulse, BookOpen, Tag, Briefcase, Laptop,
  TrendingUp, CirclePlus, House, Gift, Plane, Coffee, Music, Smartphone, PiggyBank, Wallet,
} from 'lucide-react';

// The backend stores the icon as a string ("utensils"); this maps it to the real icon.
export const ICONS = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  zap: Zap,
  film: Film,
  'heart-pulse': HeartPulse,
  'book-open': BookOpen,
  tag: Tag,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  'plus-circle': CirclePlus,
  home: House,
  gift: Gift,
  plane: Plane,
  coffee: Coffee,
  music: Music,
  smartphone: Smartphone,
  'piggy-bank': PiggyBank,
  wallet: Wallet,
};

export default function CategoryIcon({ name, color = '#6366f1', size = 16 }) {
  const Icon = ICONS[name] || Tag;
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Icon size={size} />
    </span>
  );
}
