import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Subject, CreateSubjectPayload } from '@/types';

export interface SubjectsState {
  items: Subject[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: SubjectsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchMatieres = createAsyncThunk('matieres/fetchMatieres', async (_, { rejectWithValue }) => {
  console.log('🔵 [matieresSlice] Attempting to fetch subjects...');
  try {
    const response = await fetch('/api/matieres');
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔴 [matieresSlice] Failed to fetch subjects (API responded with ${response.status}):`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        return rejectWithValue(errorData.message || 'Failed to fetch subjects');
      } catch(e) {
        return rejectWithValue(errorText || 'Failed to fetch subjects');
      }
    }
    const data = await response.json();
    console.log('🟢 [matieresSlice] Successfully fetched subjects:', data);
    return data as Subject[];
  } catch (error: any) {
    console.error('🔴 [matieresSlice] Failed to fetch subjects (Network/Parsing Error):', error);
    return rejectWithValue(error.message);
  }
});

export const addMatiere = createAsyncThunk(
  'matieres/addMatiere', 
  async (newSubject: CreateSubjectPayload, { rejectWithValue }) => {
    console.log('🔵 [matieresSlice] Attempting to add subject:', newSubject);
    try {
      const response = await fetch('/api/matieres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [matieresSlice] Failed to add subject (API responded with ${response.status}):`, errorText);
        if (response.status === 409) {
          // Specific handling for unique constraint violation
          return rejectWithValue('Subject with this name already exists.');
        } else {
          try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Failed to add subject');
          } catch(e) {
            return rejectWithValue(errorText || 'Failed to add subject');
        }
      }
    }
      const data = await response.json();
      console.log('🟢 [matieresSlice] Successfully added subject:', data);
      return data as Subject;
    } catch (error: any) {
      console.error('🔴 [matieresSlice] Failed to add subject (Network/Parsing Error):', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateMatiere = createAsyncThunk(
  'matieres/updateMatiere',
  async (subject: Subject, { rejectWithValue }) => {
    const { id, ...payload } = subject;
    console.log(`🔵 [matieresSlice] Attempting to update subject ${id}:`, payload);
    try {
      const response = await fetch(`/api/matieres/${subject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [matieresSlice] Failed to update subject ${id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Failed to update subject');
        } catch(e) {
            return rejectWithValue(errorText || 'Failed to update subject');
        }
      }
      const data = await response.json();
      console.log(`🟢 [matieresSlice] Successfully updated subject ${id}:`, data);
      return data as Subject;
    } catch (error: any) {
      console.error(`🔴 [matieresSlice] Failed to update subject ${id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMatiere = createAsyncThunk(
  'matieres/deleteMatiere',
  async (id: number, { rejectWithValue }) => {
    console.log(`🔵 [matieresSlice] Attempting to delete subject ${id}`);
    try {
      const response = await fetch(`/api/matieres/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [matieresSlice] Failed to delete subject ${id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Failed to delete subject');
        } catch(e) {
            return rejectWithValue(errorText || 'Failed to delete subject');
        }
      }
      console.log(`🟢 [matieresSlice] Successfully deleted subject ${id}`);
      return id;
    } catch (error: any) {
      console.error(`🔴 [matieresSlice] Failed to delete subject ${id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const matieresSlice = createSlice({
  name: 'matieres',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatieres.pending, (state) => {
        console.log('⏳ [matieresSlice] fetchMatieres.pending');
        state.status = 'loading';
      })
      .addCase(fetchMatieres.fulfilled, (state, action: PayloadAction<Subject[]>) => {
        console.log('✅ [matieresSlice] fetchMatieres.fulfilled');
        state.status = 'succeeded';
        state.error = null; // Clear error on success
        state.items = action.payload;
      })
      .addCase(fetchMatieres.rejected, (state, action) => {
        console.error('❌ [matieresSlice] fetchMatieres.rejected:', action.error.message);
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addMatiere.fulfilled, (state, action: PayloadAction<Subject>) => {
        console.log('✅ [matieresSlice] addMatiere.fulfilled');
        state.items.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(updateMatiere.fulfilled, (state, action: PayloadAction<Subject>) => {
        console.log('✅ [matieresSlice] updateMatiere.fulfilled');
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMatiere.fulfilled, (state, action: PayloadAction<number>) => {
        console.log('✅ [matieresSlice] deleteMatiere.fulfilled');
        state.items = state.items.filter(s => s.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: any) => { // Use 'any' or a more specific type if possible for rejected actions not covered by addCase
            state.status = 'failed';
            state.error = action.error?.message || action.payload || 'An unknown error occurred.';
            console.error(`❌ [matieresSlice] Rejected action ${action.type}:`, action.error?.message || action.payload);
          });
  },
});

export const selectAllMatieres = (state: RootState): Subject[] => state.matieres.items;
export const getMatieresStatus = (state: RootState): string => state.matieres.status;
export const getMatieresError = (state: RootState): string | null | undefined => state.matieres.error;

export default matieresSlice.reducer;
