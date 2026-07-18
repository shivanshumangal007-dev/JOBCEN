from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.profile import Profile
from app.schemas.profile import UniversalProfileSchema

async def save_universal_profile(db: AsyncSession, user_id: str, structured_profile: UniversalProfileSchema):
    # Check if a profile already exists for this user
    result = await db.execute(select(Profile).filter(Profile.user_id == user_id))
    existing_profile = result.scalars().first()

    profile_data = structured_profile.model_dump(mode="json")

    if existing_profile:
        existing_profile.data = profile_data
    else:
        new_profile = Profile(user_id=user_id, data=profile_data)
        db.add(new_profile)

    await db.commit()
    return existing_profile or new_profile
