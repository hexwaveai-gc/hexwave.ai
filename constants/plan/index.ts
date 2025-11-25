import { Crown, Sparkles, Gem, Globe } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  monthlyPrice: number;
  originalMonthlyPrice: number;
  nextRenewal: number;
  discount: string;
  borderColor: string;
  bgGradient: string;
  iconColor: string;
  credits: number;
  creditsPer100: number;
  images: number;
  videos: number;
  benefits: string[];
  isNew?: boolean;
}

export interface CreditPackage {
  id: number;
  price: number;
  credits: number;
  baseCredits: number;
  bonusCredits: number;
  bonusPercent: number;
}

export const plans: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    icon: Crown,
    color: "brown",
    monthlyPrice: 6.99,
    originalMonthlyPrice: 10,
    nextRenewal: 8.8,
    discount: "30%",
    borderColor: "border-amber-700/30",
    bgGradient: "linear-gradient(180deg, #3d3d66 0%, #121214 32%, #121214 100%)",
    iconColor: "text-amber-400",
    credits: 1000,
    creditsPer100: 0.70,
    images: 5000,
    videos: 50,
    benefits: [
      "Fast-track generation",
      "Professional mode for videos",
      "Watermark removal",
      "Video extension",
      "Image upscaling",
      "Priority access to new features",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Sparkles,
    color: "blue",
    monthlyPrice: 25.99,
    originalMonthlyPrice: 37,
    nextRenewal: 32.56,
    discount: "30%",
    borderColor: "border-blue-700/30",
    bgGradient: "linear-gradient(180deg, #3d3d66 0%, #121214 32%, #121214 100%)",
    iconColor: "text-blue-400",
    credits: 3000,
    creditsPer100: 1.09,
    images: 15000,
    videos: 150,
    benefits: [
      "Fast-track generation",
      "Professional mode for videos",
      "Watermark removal",
      "Video extension",
      "Image upscaling",
      "Priority access to new features",
    ],
  },
  {
    id: "premier",
    name: "Premier",
    icon: Gem,
    color: "purple",
    monthlyPrice: 64.99,
    originalMonthlyPrice: 92,
    nextRenewal: 80.96,
    discount: "29%",
    borderColor: "border-purple-700/30",
    bgGradient: "linear-gradient(180deg, #3d3d66 0%, #121214 32%, #121214 100%)",
    iconColor: "text-purple-400",
    credits: 8000,
    creditsPer100: 0.81,
    images: 40000,
    videos: 400,
    benefits: [
      "Fast-track generation",
      "Professional mode for videos",
      "Watermark removal",
      "Video extension",
      "Image upscaling",
      "Priority access to new features",
    ],
  },
  {
    id: "ultra",
    name: "Ultra",
    icon: Globe,
    color: "orange",
    monthlyPrice: 127.99,
    originalMonthlyPrice: 180,
    nextRenewal: 159.99,
    discount: "29%",
    borderColor: "border-orange-500/50",
    bgGradient: "linear-gradient(180deg, #332718 0%, #141110 40%, #141212 100%)",
    iconColor: "text-orange-400",
    isNew: true,
    credits: 15000,
    creditsPer100: 0.85,
    images: 75000,
    videos: 750,
    benefits: [
      "Fast-track generation",
      "Professional mode for videos",
      "Watermark removal",
      "Video extension",
      "Image upscaling",
      "Priority access to new features",
    ],
  },
];

export const creditPackages: CreditPackage[] = [
  {
    id: 1,
    price: 5,
    credits: 330,
    baseCredits: 275,
    bonusCredits: 55,
    bonusPercent: 20,
  },
  {
    id: 2,
    price: 10,
    credits: 792,
    baseCredits: 660,
    bonusCredits: 132,
    bonusPercent: 20,
  },
  {
    id: 3,
    price: 20,
    credits: 1584,
    baseCredits: 1320,
    bonusCredits: 264,
    bonusPercent: 20,
  },
  {
    id: 4,
    price: 50,
    credits: 3960,
    baseCredits: 3300,
    bonusCredits: 660,
    bonusPercent: 20,
  },
  {
    id: 5,
    price: 100,
    credits: 9240,
    baseCredits: 6600,
    bonusCredits: 2640,
    bonusPercent: 40,
  },
  {
    id: 6,
    price: 200,
    credits: 18480,
    baseCredits: 13200,
    bonusCredits: 5280,
    bonusPercent: 40,
  },
  {
    id: 7,
    price: 600,
    credits: 55440,
    baseCredits: 39600,
    bonusCredits: 15840,
    bonusPercent: 40,
  },
  {
    id: 8,
    price: 1200,
    credits: 110880,
    baseCredits: 79200,
    bonusCredits: 31680,
    bonusPercent: 40,
  },
];


