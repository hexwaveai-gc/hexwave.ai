interface ToolsHeaderProps {
  title: string;
  description?: string;
}

export function ToolsHeader({ title, description }: ToolsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-white/50 max-w-xl">{description}</p>
      )}
    </div>
  );
}
