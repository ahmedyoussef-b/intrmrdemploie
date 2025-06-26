import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { TeacherWithDetails, CreateTeacherPayload } from '@/types'; 

export interface TeachersState {
  items: TeacherWithDetails[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: TeachersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProfesseurs = createAsyncThunk('professeurs/fetchProfesseurs', async (_, { rejectWithValue }) => {
  console.log('🔵 [professeursSlice] Attempting to fetch teachers...');
  try {
    const response = await fetch('/api/professeurs');
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔴 [professeursSlice] Failed to fetch teachers (API responded with ${response.status}):`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        return rejectWithValue(errorData.message || 'Échec de la récupération des professeurs');
      } catch (e) {
        return rejectWithValue(errorText || 'Échec de la récupération des professeurs');
      }
    }
    const data = await response.json();
    console.log('🟢 [professeursSlice] Successfully fetched teachers:', data);
    return data as TeacherWithDetails[];
  } catch (error: any) {
    console.error('🔴 [professeursSlice] Failed to fetch teachers (Network/Parsing Error):', error);
    return rejectWithValue(error.message);
  }
});

export const addProfesseur = createAsyncThunk(
  'professeurs/addProfesseur',
  async (newTeacher: CreateTeacherPayload, { rejectWithValue }) => {
    console.log('🔵 [professeursSlice] Attempting to add teacher:', newTeacher);
    try {
      const response = await fetch('/api/professeurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [professeursSlice] Failed to add teacher (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de l\'ajout du professeur');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de l\'ajout du professeur');
        }
      }
      const data = await response.json();
      console.log('🟢 [professeursSlice] Successfully added teacher:', data);
      return data as TeacherWithDetails;
    } catch (error: any) {
      console.error('🔴 [professeursSlice] Failed to add teacher (Network/Parsing Error):', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfesseur = createAsyncThunk(
    'professeurs/updateProfesseur',
    async (teacher: TeacherWithDetails, { rejectWithValue }) => {
        const payload = {
          name: teacher.name,
          surname: teacher.surname,
          phone: teacher.phone,
          address: teacher.address
        };
        console.log(`🔵 [professeursSlice] Attempting to update teacher ${teacher.id}:`, payload);
        try {
            const response = await fetch(`/api/professeurs/${teacher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`🔴 [professeursSlice] Failed to update teacher ${teacher.id} (API responded with ${response.status}):`, errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    return rejectWithValue(errorData.message || 'Échec de la mise à jour');
                } catch (e) {
                    return rejectWithValue(errorText || 'Échec de la mise à jour');
                }
            }
            const data = await response.json();
            console.log(`🟢 [professeursSlice] Successfully updated teacher ${teacher.id}:`, data);
            return data as TeacherWithDetails;
        } catch (error: any) {
            console.error(`🔴 [professeursSlice] Failed to update teacher ${teacher.id} (Network/Parsing Error):`, error);
            return rejectWithValue(error.message);
        }
    }
);

export const deleteProfesseur = createAsyncThunk(
    'professeurs/deleteProfesseur',
    async (teacherId: string, { rejectWithValue }) => {
        console.log(`🔵 [professeursSlice] Attempting to delete teacher ${teacherId}`);
        try {
            const response = await fetch(`/api/professeurs/${teacherId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`🔴 [professeursSlice] Failed to delete teacher ${teacherId} (API responded with ${response.status}):`, errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    return rejectWithValue(errorData.message || 'Échec de la suppression');
                } catch (e) {
                    return rejectWithValue(errorText || 'Échec de la suppression');
                }
            }
            const data = await response.json();
            console.log(`🟢 [professeursSlice] Successfully deleted teacher ${teacherId}`);
            return data.id; // Return the ID of the deleted teacher
        } catch (error: any) {
            console.error(`🔴 [professeursSlice] Failed to delete teacher ${teacherId} (Network/Parsing Error):`, error);
            return rejectWithValue(error.message);
        }
    }
);

export const professeursSlice = createSlice({
  name: 'professeurs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfesseurs.pending, (state) => {
        console.log('⏳ [professeursSlice] fetchProfesseurs.pending');
        state.status = 'loading';
      })
      .addCase(fetchProfesseurs.fulfilled, (state, action: PayloadAction<TeacherWithDetails[]>) => {
        console.log('✅ [professeursSlice] fetchProfesseurs.fulfilled');
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProfesseurs.rejected, (state, action) => {
        console.error('❌ [professeursSlice] fetchProfesseurs.rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addProfesseur.fulfilled, (state, action: PayloadAction<TeacherWithDetails>) => {
        console.log('✅ [professeursSlice] addProfesseur.fulfilled');
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
        state.status = 'succeeded';
      })
      .addCase(updateProfesseur.fulfilled, (state, action: PayloadAction<TeacherWithDetails>) => {
        console.log('✅ [professeursSlice] updateProfesseur.fulfilled');
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
            state.items[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(deleteProfesseur.fulfilled, (state, action: PayloadAction<string>) => {
        console.log('✅ [professeursSlice] deleteProfesseur.fulfilled');
        state.items = state.items.filter(p => p.id !== action.payload);
        state.status = 'succeeded';
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          if (!state.error) {
            state.status = 'failed';
            state.error = action.payload as string || action.error.message;
            console.error(`❌ [professeursSlice] Rejected action ${action.type}:`, action.payload);
          }
        }
      );
  },
});

export const selectAllProfesseurs = (state: RootState): TeacherWithDetails[] => state.professeurs.items;
export const getProfesseursStatus = (state: RootState): string => state.professeurs.status;
export const getProfesseursError = (state: RootState): string | null | undefined => state.professeurs.error;

export default professeursSlice.reducer;
