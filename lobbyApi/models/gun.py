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
            ReloadInProgressError("Already reloading")
        self.is_reloading = True
        self.next_shot_at = datetime.now() + self.reload_time
        self.ammo_in_clip = self.clip_size if self.total_ammo >= self.clip_size else self.total_ammo
        self.total_ammo -= self.ammo_in_clip
    
    
    def shoot(self):
        if self.is_reloading:
            raise ReloadError("Cannot shoot while reloading")
        if self.next_shot_at and datetime.now() < self.next_shot_at:
            raise ShootingTooSoonError(f"Next shot available at {self.next_shot_at}")
        if self.ammo_in_clip == 0:
            raise NoAmmoError("No ammo in clip")
        self.ammo_in_clip -= 1
        self.next_shot_at = datetime.now() + self.inter_shot_delay
        damage = self.damage_ratio + random.uniform(
            -self.damage_dispersion,
            self.damage_dispersion
        )
        damage = max(0, damage) 
        return round(damage, 1)
    
    def load_ammo(self, ammo: int):
        self.total_ammo += ammo
        
    def to_dict(self):
        return {
            "name": self.name,
            "ammo_in_clip": self.ammo_in_clip,
            "total_ammo": self.total_ammo,
            "next_shot_at": self.next_shot_at
        }
        
        
        
        
        
class GunError(Exception):
    """Base class for all gun-related errors."""
    pass

class ReloadError(GunError):
    """Raised when a gun operation is attempted during reloading."""
    pass

class ShootingTooSoonError(GunError):
    """Raised when trying to shoot before the inter-shot delay has passed."""
    pass

class NoAmmoError(GunError):
    """Raised when attempting to shoot with an empty clip."""
    pass

class ReloadInProgressError(GunError):
    """Raised when trying to reload while already reloading."""
    pass

class InvalidAmmoOperation(GunError):
    """Raised for invalid ammo management operations."""
    pass