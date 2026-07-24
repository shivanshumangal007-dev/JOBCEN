import { create } from 'zustand';
import { UniversalProfile } from '@/hooks/Profile';

export type UpdateType = 'Experience' | 'Education' | 'Career Bridge' | 'Project' | 'Skill' | 'Link' | 'Bio';

export interface ProfileUpdate {
  id: string;
  type: UpdateType;
  date: string;
  data: any;
}

interface StoreState {
  hasProfile: boolean;
  profile: UniversalProfile | null;
  updates: ProfileUpdate[];
  setHasProfile: (val: boolean) => void;
  updateProfile: (data: Partial<UniversalProfile>) => void;
  addUpdate: (update: Omit<ProfileUpdate, 'id' | 'date'>) => void;
}

export const useStore = create<StoreState>((set) => ({
  hasProfile: false,
  profile: null,
  updates: [],
  setHasProfile: (val) => set({ hasProfile: val }),
  updateProfile: (data) => 
    set((state) => ({ 
      profile: state.profile 
        ? { ...state.profile, ...data } 
        : (data as UniversalProfile) 
    })),
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
