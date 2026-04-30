import CustomButton from '@/reusables/CustomButton';
import Image from 'next/image';
import { Circle } from 'lucide-react';

interface SetupDetailsProps {
  title: string;
  description: string;
  buttonText: string;
  showCheckmark?: boolean;
  onEdit?: () => void;
  formatTitle?: string | null;
  badge?: React.ReactNode;
}

export const SetupDetails: React.FC<SetupDetailsProps> = ({
  title,
  description,
  buttonText,
  showCheckmark = false,
  onEdit,
  formatTitle,
  badge,
}) => {
  return (
    <div
      className="w-full bg-transparent border-[1.6px] p-3 rounded-lg flex justify-between items-center mt-6"
      style={{ borderColor: '#CACFD8' }}
    >
      <div className="flex gap-4">
        {!showCheckmark ? (
          <Circle size={27} className="text-[#667085]" />
        ) : (
          <Image
            src="/green-check.svg"
            alt="Green Check"
            width={30}
            height={30}
            style={{ width: "auto", height: "auto" }}
          />
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-sofiaPro text-[16px] font-bold">{title}</h3>
            {badge}
          </div>
          {formatTitle && (
            <span className="inline-block bg-[#ECFDF3] text-[#027A48] text-[12px] font-medium font-inter py-1 px-2 rounded-full mt-1 mb-2">
              {formatTitle}
            </span>
          )}
          <p className="font-inter text-[14px] font-normal text-[#475467]">
            {description}
          </p>
        </div>
      </div>
      <CustomButton
        text={buttonText}
        type="button"
        bgColor="bg-transparent"
        color="text-[#344054]"
        className="hover:bg-white font-inter font-semibold"
        onClick={onEdit}
      />
    </div>
  );
};
