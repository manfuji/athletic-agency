import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CustomButtonProps {
  text: string;
  bgColor?: string;
  color?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  bgColor = 'bg-primary',
  color,
  type = 'button',
  onClick,
  className = '',
  disabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      className={cn(
        bgColor,
        color,
        'font-evogria border',
        className,
        isLoading && 'cursor-not-allowed opacity-75'
      )}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {text}
        </span>
      ) : (
        text
      )}
    </Button>
  );
};

export default CustomButton;
