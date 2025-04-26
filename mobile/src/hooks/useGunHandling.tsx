import { useEffect, useState, useRef } from 'react';
import { GunHandlingWebSocketService } from '~/services/websocket/gun-handling-websocket.service';
import { HitPerson } from '~/services/websocket/websocket-types';
import { Vibration } from 'react-native';

export const useGunHandling = () => {
  const gunHandlingService = GunHandlingWebSocketService.getInstance();
  const [nextShootAt, setNextShootAt] = useState<number | null>(null);
  const [isAbleToShoot, setIsAbleToShoot] = useState<boolean>(false);
  const [ammoInClip, setAmmoInClip] = useState<number>(0);
  const [totalAmmo, setTotalAmmo] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(false);
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
        setIsReloading(false);
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


  useEffect(() => {
    gunHandlingService.setNextShotAtHandlerFunction(setNextShootAt);
    gunHandlingService.setAmmoInClipHandlerFunction(setAmmoInClip);
    gunHandlingService.setTotalAmmoHandlerFunction(setTotalAmmo);
    gunHandlingService.setWebSocketEventListeners();

    return () => {
    };
  }, []);

  const handleShoot = (detectedPerson: HitPerson | null)  => {
    Vibration.vibrate(50);
    gunHandlingService.shoot(detectedPerson)
  }

  return {
    shoot: handleShoot,
    isAbleToShoot,
    nextShootAt,
    ammoInClip,
    totalAmmo,
    isReloading,
    reload: () => gunHandlingService.reload()
  };
};
