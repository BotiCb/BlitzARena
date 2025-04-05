from datetime import datetime, timedelta
import random


class Gun:
    def __init__(self, name, clip_size, reload_time, inter_shot_delay, damage_ratio, damage_dispersion):
        self.name = name
        self.clip_size = clip_size
        self.reload_time = timedelta(seconds=reload_time)
        self.inter_shot_delay = timedelta(seconds=inter_shot_delay)
        self.next_shot_at = datetime.now()
        self.is_reloading = False
        self.ammo_in_clip = 0
        self.total_ammo = 0
        self.damage_ratio = damage_ratio
        self.damage_dispersion = damage_dispersion

    def reload(self):
        if self.is_reloading:
            raise ReloadInProgressError("Already reloading")

        if self.clip_size == self.ammo_in_clip:
            raise ReloadError("Clip is already full")

        if self.total_ammo == 0:
            raise ReloadError("No ammo to reload")

        self.is_reloading = True
        self.next_shot_at = datetime.now() + self.reload_time
        
        ammo_to_reload = min(self.total_ammo, self.clip_size - self.ammo_in_clip)
        self.ammo_in_clip += ammo_to_reload
        self.total_ammo -= ammo_to_reload
        self.is_reloading = False

        print(f'Reloading completed. Ammo in clip: {self.ammo_in_clip}')

    def shoot(self):
        if self.is_reloading:
            raise ReloadError("Cannot shoot while reloading")

        if datetime.now() < self.next_shot_at:
            raise ShootingTooSoonError(f"Next shot available at {self.next_shot_at}")

        if self.ammo_in_clip == 0:
            raise NoAmmoError("No ammo in clip")

        self.ammo_in_clip -= 1
        self.next_shot_at = datetime.now() + self.inter_shot_delay
        damage = self.damage_ratio + random.uniform(-self.damage_dispersion, self.damage_dispersion)
        damage = max(0, damage)  
        print(f"Damage: {damage}, Waiting for next shot: {self.inter_shot_delay.total_seconds()} seconds")
        return int(damage)

    def load_ammo(self, ammo: int):
        self.total_ammo += ammo

    def to_dict(self):
        return {
            "name": self.name,
            "ammo_in_clip": self.ammo_in_clip,
            "total_ammo": self.total_ammo,
            "next_shot_at": int(self.next_shot_at.timestamp()*1000) if self.next_shot_at else None,
            "created_at": int(datetime.now().timestamp()*1000)
        }
        
    def reset(self):
        self.total_ammo += self.ammo_in_clip
        self.ammo_in_clip = 0
        self.next_shot_at = None
        self.is_reloading = False


class GunError(Exception):
    pass


class ReloadError(GunError):
    pass


class ShootingTooSoonError(GunError):
    pass


class NoAmmoError(GunError):
    pass


class ReloadInProgressError(GunError):
    pass
