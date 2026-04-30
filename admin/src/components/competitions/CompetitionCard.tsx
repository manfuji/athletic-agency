'use client';

import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { useSession } from '@/providers/supabase-auth';

interface Competition {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  banner?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  status?: string;
  isPublished?: number;
}

interface Category {
  id: string;
  name: string;
}

interface CompetitionCardProps {
  comp: Competition;
  categories: Category[];
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const suffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return `${month} ${day}${suffix(day)} ${year}`;
};

const CompetitionCard = ({ comp, categories }: CompetitionCardProps) => {
  const {
    banner,
    title,
    description,
    start_date,
    end_date,
    location,
    category_id,
    status = 'draft',
    isPublished = 0,
  } = comp;
  const bannerUrl = getImageUrl(banner ?? null) || '/AALogo.svg';
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const categoryName =
    categories.find((cat) => cat.id === category_id)?.name || '';

  const handleManageClick = () => {
    if (userRole === 'collator') {
      router.push(`/setup-competition/${comp.id}/results-and-standings`);
    } else {
      router.push(`/setup-competition/${comp.id}`);
    }
  };

  // Status badge color mapping
  const statusStyles: { [key: string]: string } = {
    draft: 'bg-[#F8F9FC] text-[#6941C6]',
    started: 'bg-[#F0F9FF] text-[#026AA2]',
    ended: 'bg-[#FEF3F2] text-[#B42318]',
  };

  const publishedStyle = 'bg-[#ECFDF3] text-[#027A48]';

  const showDraftBadge = status.toLowerCase() === 'draft' && isPublished !== 1;
  const showStartedBadge = status.toLowerCase() === 'started';
  const showEndedBadge = status.toLowerCase() === 'ended';
  const showPublishedBadge = isPublished === 1;

  return (
    <div className="flex md:flex-row flex-col bg-white shadow-md p-6 mb-4 border border-[#D0D5DD] rounded-lg">
      {banner && (
        <div className="w-[250px] mr-6 flex-shrink-0 md:mb-0 mb-4">
          <Image
            src={bannerUrl}
            alt="Competition"
            width={350}
            height={250}
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {showDraftBadge && (
            <span
              className={`text-[12px] py-1 px-3 rounded-full font-inter font-medium capitalize inline-block ${statusStyles['draft']}`}
            >
              Draft
            </span>
          )}

          {showStartedBadge && (
            <span
              className={`text-[12px] py-1 px-3 rounded-full font-inter font-medium capitalize inline-block ${statusStyles['started']}`}
            >
              Started
            </span>
          )}

          {showEndedBadge && (
            <span
              className={`text-[12px] py-1 px-3 rounded-full font-inter font-medium capitalize inline-block ${statusStyles['ended']}`}
            >
              Ended
            </span>
          )}

          {showPublishedBadge && (
            <span
              className={`text-[12px] py-1 px-3 rounded-full font-inter font-medium capitalize inline-block ${publishedStyle}`}
            >
              Published
            </span>
          )}
          {categoryName && (
            <span className="text-[12px] bg-[#F2F4F7] py-1 px-3 rounded-full font-inter font-medium text-[#344054] capitalize inline-block">
              {categoryName}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[24px] font-evogria mt-2">{title}</h3>
        {description && (
          <p className="text-[16px] text-[#000000] font-inter font-normal mt-2 mb-8 leading-6">
            {description}
          </p>
        )}
        <div className="flex items-center space-x-4">
          {location && (
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-1 text-[#000000] font-bold" />
              <p className="text-[#000000] text-[14px] font-bold font-inter">
                {location}
              </p>
            </div>
          )}
          {start_date && end_date && (
            <div className="flex items-center text-[#000000] text-[14px] font-semibold font-inter">
              <Calendar size={18} className="mr-1 text-[#000000] font-bold" />
              <p>
                {formatDate(start_date)} - {formatDate(end_date)}
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={handleManageClick}
          className="bg-transparent border-[#344054] border-[1.6px] text-[14px] text-[#344054] hover:bg-slate-200 font-evogria mt-8 w-full"
        >
          <Settings className="w-10 h-10" />
          Manage Competition
        </Button>
      </div>
    </div>
  );
};

export default CompetitionCard;
