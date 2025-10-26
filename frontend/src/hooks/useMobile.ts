import * as React from 'react';

const MOBILE_BREAKPOINT = 516;
const TABLET_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const tabletMql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`,
    );

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      setIsTablet(
        window.innerWidth >= MOBILE_BREAKPOINT &&
          window.innerWidth < TABLET_BREAKPOINT,
      );
    };

    mql.addEventListener('change', onChange);
    tabletMql.addEventListener('change', onChange);
    onChange();
    return () => {
      mql.removeEventListener('change', onChange);
      tabletMql.removeEventListener('change', onChange);
    };
  }, []);

  return { isMobile: !!isMobile, isTablet: !!isTablet };
}
