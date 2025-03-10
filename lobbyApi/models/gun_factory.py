from models.gun import Gun


class GunFactory:
    @classmethod
    def create_gun(cls, gun_type: str) -> Gun:
        """Create a Gun instance based on predefined configurations."""
        registry = {
            "AK47": {
                "name": "AK-47",
                "clip_size": 30,
                "reload_time": 2.5,
                "inter_shot_delay": 0.1,
                "damage_ratio": 33,
                "damage_dispersion": 2.5
            },
            "Glock": {
                "name": "Glock 19",
                "clip_size": 15,
                "reload_time": 1.7,
                "inter_shot_delay": 0.15,
                "damage_ratio": 25,
                "damage_dispersion": 1.8
            },
            "Sniper": {
                "name": "Barrett M82",
                "clip_size": 10,
                "reload_time": 4.2,
                "inter_shot_delay": 1.5,
                "damage_ratio": 95,
                "damage_dispersion": 5.0
            },
            "TestPistol": {
                "name": "Test Pistol",
                "clip_size": 10,
                "reload_time": 1.7,
                "inter_shot_delay": 0.15,
                "damage_ratio": 25,
                "damage_dispersion": 1.8
            }
        }

        if gun_type not in registry:
            raise ValueError(f"Unknown gun type: {gun_type}. Available types: {list(registry.keys())}")
        
        return Gun(**registry[gun_type])