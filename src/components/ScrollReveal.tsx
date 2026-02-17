import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  className = ''
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation();

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'up': return 'translate(0, 40px)';
      case 'down': return 'translate(0, -40px)';
      case 'left': return 'translate(40px, 0)';
      case 'right': return 'translate(-40px, 0)';
      case 'fade': return 'translate(0, 0)';
      default: return 'translate(0, 40px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
