import { useEffect, useState, useRef } from 'react';
import { GunHandlingWebSocketService } from '~/services/websocket/gun-handling-websocket.service';
import { HitPerson } from '~/services/websocket/websocket-types';
import { DetectedPerson } from '~/utils/types/detection-types';

export const useGunHandling = () => {
  const gunHandlingService = new GunHandlingWebSocketService();
  const [nextShootAt, setNextShootAt] = useState<string>('');
  const [isAbleToShoot, setIsAbleToShoot] = useState<boolean>(false);
  const [ammoInClip, setAmmoInClip] = useState<number>(0);
  const [totalAmmo, setTotalAmmo] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateShootingAbility = () => {
      if (!nextShootAt) {
        setIsAbleToShoot(false);
        return;
      }

      const nextShotTime = new Date(nextShootAt);
      const now = new Date();

      if (now >= nextShotTime) {
        setIsAbleToShoot(true);
      } else {
        setIsAbleToShoot(false);
        const delay = nextShotTime.getTime() - now.getTime();
        timeoutRef.current = setTimeout(() => {
          setIsAbleToShoot(true);
        }, delay);
      }
    };

    updateShootingAbility();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nextShootAt]);

  useEffect(() => {
    gunHandlingService.setNextShotAtHandlerFunction(setNextShootAt);
    gunHandlingService.setAmmoInClipHandlerFunction(setAmmoInClip);
    gunHandlingService.setTotalAmmoHandlerFunction(setTotalAmmo);
    gunHandlingService.setWebSocketEventListeners();

    return () => {
    };
  }, []);

  return {
    shoot: (detectedPerson: HitPerson | null) => gunHandlingService.shoot(detectedPerson),
    isAbleToShoot,
    nextShootAt,
    ammoInClip,
    totalAmmo
  };
};
