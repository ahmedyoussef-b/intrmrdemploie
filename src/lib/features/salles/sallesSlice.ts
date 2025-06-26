import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Classroom, CreateClassroomPayload } from '@/types';

export interface SallesState {
  items: Classroom[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: SallesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchSalles = createAsyncThunk('salles/fetchSalles', async (_, { rejectWithValue }) => {
  console.log('🔵 [sallesSlice] Attempting to fetch classrooms...');
  try {
    const response = await fetch('/api/salles');
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔴 [sallesSlice] Failed to fetch classrooms (API responded with ${response.status}):`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        return rejectWithValue(errorData.message || 'Échec de la récupération des salles');
      } catch (e) {
        return rejectWithValue(errorText || 'Échec de la récupération des salles');
      }
    }
    const data = await response.json();
    console.log('🟢 [sallesSlice] Successfully fetched classrooms:', data);
    return data as Classroom[];
  } catch (error: any) {
    console.error('🔴 [sallesSlice] Failed to fetch classrooms (Network/Parsing Error):', error);
    return rejectWithValue(error.message);
  }
});

export const addSalle = createAsyncThunk(
  'salles/addSalle',
  async (newClassroom: CreateClassroomPayload, { rejectWithValue }) => {
    console.log('🔵 [sallesSlice] Attempting to add classroom:', newClassroom);
    try {
      const response = await fetch('/api/salles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassroom),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [sallesSlice] Failed to add classroom (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de l\'ajout de la salle');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de l\'ajout de la salle');
        }
      }
      const data = await response.json();
      console.log('🟢 [sallesSlice] Successfully added classroom:', data);
      return data as Classroom;
    } catch (error: any) {
      console.error('🔴 [sallesSlice] Failed to add classroom (Network/Parsing Error):', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateSalle = createAsyncThunk(
  'salles/updateSalle',
  async (classroom: Classroom, { rejectWithValue }) => {
    const { id, ...payload } = classroom;
    console.log(`🔵 [sallesSlice] Attempting to update classroom ${id}:`, payload);
    try {
      const response = await fetch(`/api/salles/${classroom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [sallesSlice] Failed to update classroom ${id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de la mise à jour');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de la mise à jour');
        }
      }
      const data = await response.json();
      console.log(`🟢 [sallesSlice] Successfully updated classroom ${id}:`, data);
      return data as Classroom;
    } catch (error: any) {
      console.error(`🔴 [sallesSlice] Failed to update classroom ${id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSalle = createAsyncThunk(
  'salles/deleteSalle',
  async (id: number, { rejectWithValue }) => {
    console.log(`🔵 [sallesSlice] Attempting to delete classroom ${id}`);
    try {
      const response = await fetch(`/api/salles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [sallesSlice] Failed to delete classroom ${id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de la suppression');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de la suppression');
        }
      }
      console.log(`🟢 [sallesSlice] Successfully deleted classroom ${id}`);
      return id;
    } catch (error: any) {
      console.error(`🔴 [sallesSlice] Failed to delete classroom ${id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const sallesSlice = createSlice({
  name: 'salles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalles.pending, (state) => {
        console.log('⏳ [sallesSlice] fetchSalles.pending');
        state.status = 'loading';
      })
      .addCase(fetchSalles.fulfilled, (state, action: PayloadAction<Classroom[]>) => {
        console.log('✅ [sallesSlice] fetchSalles.fulfilled');
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSalles.rejected, (state, action) => {
        console.error('❌ [sallesSlice] fetchSalles.rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addSalle.fulfilled, (state, action: PayloadAction<Classroom>) => {
        console.log('✅ [sallesSlice] addSalle.fulfilled');
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
        state.status = 'succeeded';
      })
      .addCase(updateSalle.fulfilled, (state, action: PayloadAction<Classroom>) => {
        console.log('✅ [sallesSlice] updateSalle.fulfilled');
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteSalle.fulfilled, (state, action: PayloadAction<number>) => {
        console.log('✅ [sallesSlice] deleteSalle.fulfilled');
        state.items = state.items.filter(s => s.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          if (!state.error) {
            state.status = 'failed';
            state.error = action.payload as string;
            console.error(`❌ [sallesSlice] Rejected action ${action.type}:`, action.payload);
          }
        }
      );
  },
});

export const selectAllSalles = (state: RootState): Classroom[] => state.salles.items;
export const getSallesStatus = (state: RootState): string => state.salles.status;
export const getSallesError = (state: RootState): string | null | undefined => state.salles.error;

export default sallesSlice.reducer;
