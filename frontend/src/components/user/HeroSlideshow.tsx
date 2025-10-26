import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getLatestUploads } from '@/api/movie';
import { useNotification } from '@/hooks';
import { useIsMobile } from '@/hooks/useMobile';
import type { MovieListItem } from '@/types';

import 'swiper/swiper-bundle.css';

interface SlideProps {
  title: string;
  id: string;
  src?: string;
  className?: string;
}

export default function HeroSlidShow() {
  const [slides, setSlides] = useState<MovieListItem[] | undefined>(undefined);
  const { isMobile, isTablet } = useIsMobile();

  const { updateNotification } = useNotification();

  const fetchLatestUploads = async (signal: AbortSignal) => {
    const { data, error } = await getLatestUploads(signal);
    if (error || !data)
      return updateNotification('error', error || 'An error occurred');

    setSlides([...data.movies]);
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchLatestUploads(ac.signal);

    return () => ac.abort();
  }, []);

  return (
    <div className="flex w-full flex-col pt-6">
      <h2 className="mb-5 text-2xl font-semibold text-secondary dark:text-white">
        Latest releases
      </h2>
      <div>
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          spaceBetween={isMobile || isTablet ? 25 : 50}
          slidesPerView={isMobile ? 1 : isTablet ? 3 : 4}
          navigation
          pagination={{ clickable: true }}
        >
          {slides &&
            slides?.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Slide
                  title={slide?.title}
                  src={slide?.poster}
                  id={slide?.id}
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
}

const Slide = ({ title, id, src, className, ...rest }: SlideProps) => {
  return (
    <Link
      to={`/movie/${id}`}
      className={clsx('block w-full cursor-pointer', className)}
      {...rest}
    >
      {src ? (
        <img className="object-cover" src={src} alt={`${title}-poster`} />
      ) : null}
      {title ? (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-white via-transparent py-3 dark:from-primary dark:via-transparent">
          <h1 className="mb-6 text-center text-2xl font-semibold text-highlight dark:text-highlight-dark">
            {title}
          </h1>
        </div>
      ) : null}
    </Link>
  );
};
