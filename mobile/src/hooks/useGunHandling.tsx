import { useEffect, useState, useRef } from 'react';
import { GunHandlingWebSocketService } from '~/services/websocket/gun-handling-websocket.service';
import { HitPerson } from '~/services/websocket/websocket-types';
import { DetectedPerson } from '~/utils/types/detection-types';

export const useGunHandling = () => {
  const gunHandlingService = new GunHandlingWebSocketService();
  const [nextShootAt, setNextShootAt] = useState<number | null>(null);
  const [isAbleToShoot, setIsAbleToShoot] = useState<boolean>(false);
  const [ammoInClip, setAmmoInClip] = useState<number>(0);
  const [totalAmmo, setTotalAmmo] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateShootingAbility = () => {
      if (ammoInClip === 0) {
        setIsAbleToShoot(false);
        return;
      }
      if (!nextShootAt || isNaN(nextShootAt)) {
        setIsAbleToShoot(false);
        return;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      const now = Date.now();
      const timeUntilShoot = nextShootAt - now;

      if (timeUntilShoot <= 0) {
        setIsAbleToShoot(true);
      } else {
        setIsAbleToShoot(false);
          timeoutRef.current = setTimeout(() => {
            setIsAbleToShoot(ammoInClip > 0);
          }, timeUntilShoot);
      }
    };

    updateShootingAbility();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nextShootAt, totalAmmo, ammoInClip]);

  useEffect(() => {console.log('isAbleToShoot', isAbleToShoot);}, [isAbleToShoot]);

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
    totalAmmo,
    reload: () => gunHandlingService.reload()
  };
};
