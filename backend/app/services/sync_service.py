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
        Generate the filling plan for a specific platform.
        Returns: { link1: { "name": "value", ... }, link2: { ... } }
        """
        target_platform = platform.lower().strip()
        adapter = ADAPTERS_CONFIG.get(target_platform)

        if not adapter:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The job platform adapter '{platform}' is not supported yet."
            )

        try:
            # The transformer now directly returns the { link: { data } } dictionary
            return adapter["transformer"](profile_data, user_email)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Failed to transform profile for {platform}: {str(e)}"
            )

    @classmethod
    def generate_all_filling_plans(cls, profile_data: dict, user_email: str) -> dict:
        """
        Generate filling plans for ALL platforms at once.
        Returns: { 
           "linkedin": { link: { ... } }, 
           "wellfound": { link1: { ... }, link2: { ... } } 
        }
        """
        result = {}
        for platform_name, adapter in ADAPTERS_CONFIG.items():
            try:
                data = adapter["transformer"](profile_data, user_email)
                result[platform_name] = data
            except Exception:
                # Skip platforms that fail transformation
                continue
        return result