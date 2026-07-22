import { create } from 'zustand';

export type UpdateType = 'Experience' | 'Education' | 'Career Bridge' | 'Project' | 'Skill' | 'Link' | 'Bio';

export interface ProfileUpdate {
  id: string;
  type: UpdateType;
  date: string;
  data: any;
}

interface UserProfile {
  name: string;
  bio: string;
  location: string;
}

interface StoreState {
  hasProfile: boolean;
  profile: UserProfile;
  updates: ProfileUpdate[];
  setHasProfile: (val: boolean) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addUpdate: (update: Omit<ProfileUpdate, 'id' | 'date'>) => void;
}

export const useStore = create<StoreState>((set) => ({
  hasProfile: false,
  profile: {
    name: '',
    bio: '',
    location: '',
  },
  updates: [],
  setHasProfile: (val) => set({ hasProfile: val }),
  updateProfile: (data) => 
    set((state) => ({ profile: { ...state.profile, ...data } })),
  addUpdate: (update) => 
    set((state) => {
      const newUpdate: ProfileUpdate = {
        ...update,
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
      };
      return { updates: [newUpdate, ...state.updates] };
    }),
}));
