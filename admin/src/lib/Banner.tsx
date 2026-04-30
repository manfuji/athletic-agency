'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getImageUrl } from './api';

const Banner = ({ src }: { src: string | null }) => {
  const coverUrl = getImageUrl(src);
  const [imageSrc, setImageSrc] = useState(coverUrl || '/cover.jpg');

  return (
    <div className="w-full h-full relative">
      {src ? (
        <Image
          src={imageSrc}
          alt="Team Cover"
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImageSrc('/cover.jpg')}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 font-evogria">No Cover Photo</span>
        </div>
      )}
    </div>
  );
};

export default Banner;
