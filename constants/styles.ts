/**
 * Reusable Style Constants
 * 
 * Pre-defined Tailwind class combinations for consistent styling.
 * Use with cn() utility for conditional classes.
 */

// Card styles
export const cardStyles = {
  base: "rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm",
  hover: "hover:bg-white/10 hover:border-white/20 transition-all duration-300",
  active: "bg-white/10 border-white/20",
  padding: {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  },
} as const;

// Button styles
export const buttonStyles = {
  // Primary action button (green)
  primary: "px-6 py-3 rounded-xl bg-[#74FF52] text-[#0a0a0a] font-semibold hover:bg-[#66e648] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Secondary button (outline)
  secondary: "px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  
  // Ghost button (minimal)
  ghost: "px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 disabled:opacity-50",
  
  // Danger button (destructive actions)
  danger: "px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50",
  
  // Icon button (square)
  icon: "p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50",
  
  // Size variants
  sizes: {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  },
} as const;

// Input styles
export const inputStyles = {
  base: "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/30 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed",
  
  error: "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
  
  success: "border-green-500/50 focus:border-green-500 focus:ring-green-500/20",
  
  withIcon: "pl-12", // Add when input has left icon
  
  sizes: {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-5 py-4 text-lg",
  },
} as const;

// Text styles
export const textStyles = {
  // Headings
  h1: "text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F9FBFC]",
  h2: "text-3xl sm:text-4xl font-bold text-[#F9FBFC]",
  h3: "text-xl sm:text-2xl font-semibold text-[#F9FBFC]",
  h4: "text-lg font-semibold text-[#F9FBFC]",
  
  // Body text
  body: "text-base text-white/70",
  bodyLarge: "text-lg text-white/70",
  bodySmall: "text-sm text-white/60",
  
  // Utility text
  muted: "text-sm text-white/40",
  label: "text-sm font-medium text-white/80",
  error: "text-sm text-red-400",
  success: "text-sm text-green-400",
  link: "text-[#74FF52] hover:text-[#9fff75] transition-colors underline-offset-4 hover:underline",
} as const;

// Badge styles
export const badgeStyles = {
  base: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
  
  variants: {
    default: "bg-white/10 text-white/80",
    primary: "bg-[#74FF52]/20 text-[#74FF52] border border-[#74FF52]/30",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
} as const;

// Container/layout styles
export const containerStyles = {
  page: "container mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-12 sm:py-16 lg:py-20",
  narrow: "max-w-3xl mx-auto",
  wide: "max-w-7xl mx-auto",
} as const;

// Animation styles
export const animationStyles = {
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-200",
  slideInUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideInDown: "animate-in slide-in-from-top-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
} as const;

// Gradient styles
export const gradientStyles = {
  // Background gradients
  bgPurplePink: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
  bgBlueCyan: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
  bgGreenEmerald: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
  bgOrangeRed: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
  
  // Text gradients
  textPrimary: "bg-gradient-to-r from-[#74FF52] to-[#52ff8a] bg-clip-text text-transparent",
  textAccent: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
  
  // Border gradients (use with border-image or pseudo-elements)
  borderPrimary: "from-[#74FF52]/50 to-[#52ff8a]/50",
} as const;

// Focus ring styles
export const focusStyles = {
  default: "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
  primary: "focus:outline-none focus:ring-2 focus:ring-[#74FF52]/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
  none: "focus:outline-none",
} as const;

// Overlay/backdrop styles
export const overlayStyles = {
  modal: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
  dropdown: "absolute z-50 bg-[#15171A] border border-white/10 rounded-xl shadow-xl",
  tooltip: "absolute z-50 px-3 py-2 bg-[#1a1c1f] border border-white/10 rounded-lg text-sm text-white shadow-lg",
} as const;

