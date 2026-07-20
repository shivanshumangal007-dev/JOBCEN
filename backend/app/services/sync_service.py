from fastapi import HTTPException, status
from app.adapters.adapter_config import ADAPTERS_CONFIG


class SyncService:

    @classmethod
    def get_supported_platforms(cls) -> list[str]:
        """Return a list of all supported platform names."""
        return list(ADAPTERS_CONFIG.keys())

    @classmethod
    def generate_filling_plan(cls, profile_data: dict, platform: str, user_email: str) -> dict:
        """
        Generate a simple { link: { "name": "value", ... } } payload for a single platform.
        """
        target_platform = platform.lower().strip()
        adapter = ADAPTERS_CONFIG.get(target_platform)

        if not adapter:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The job platform adapter '{platform}' is not supported yet."
            )

        try:
            data = adapter["transformer"](profile_data, user_email)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to transform profile for {platform}: {str(e)}"
            )

        return {adapter["link"]: data}

    @classmethod
    def generate_all_filling_plans(cls, profile_data: dict, user_email: str) -> dict:
        """
        Generate { link: { "name": "value" }, link2: { ... }, ... } for ALL platforms at once.
        """
        result = {}
        for platform_name, adapter in ADAPTERS_CONFIG.items():
            try:
                data = adapter["transformer"](profile_data, user_email)
                result[adapter["link"]] = data
            except Exception:
                # Skip platforms that fail transformation, don't break the whole response
                continue
        return result