interface PixelBoxProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  glow?: boolean;
  bg?: string;
}

export default function PixelBox({ children, color = '#ffd700', className = '', glow = false, bg = '#12122e' }: PixelBoxProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: bg,
        border: `4px solid ${color}`,
        boxShadow: glow
          ? `4px 4px 0 0 ${color}, 0 0 24px ${color}44, inset 0 0 24px ${color}08`
          : `4px 4px 0 0 ${color}`,
      }}
    >
      {children}
    </div>
  );
}
