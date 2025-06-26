import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { ClassWithGrade, CreateClassPayload } from '@/types';

export interface ClassesState {
  items: ClassWithGrade[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: ClassesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchClasses = createAsyncThunk('classes/fetchClasses', async (_, { rejectWithValue }) => {
  console.log('🔵 [classesSlice] Attempting to fetch classes...');
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔴 [classesSlice] Failed to fetch classes (API responded with ${response.status}):`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return rejectWithValue(errorJson.message || 'Échec de la récupération des classes');
      } catch (e) {
        return rejectWithValue(errorText || 'Échec de la récupération des classes');
      }
    }
    const data = await response.json();
    console.log('🟢 [classesSlice] Successfully fetched classes:', data);
    return data as ClassWithGrade[];
  } catch (error: any) {
    console.error('🔴 [classesSlice] Failed to fetch classes (Network/Parsing Error):', error);
    return rejectWithValue(error.message);
  }
});

export const addClasse = createAsyncThunk(
  'classes/addClasse',
  async (newClass: CreateClassPayload, { rejectWithValue }) => {
    console.log('🔵 [classesSlice] Attempting to add class:', newClass);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [classesSlice] Failed to add class (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            if (response.status === 409) {
                return rejectWithValue('Class with this name already exists.');
            }
            return rejectWithValue(errorData.message || 'Échec de l\'ajout de la classe');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de l\'ajout de la classe');
        }
      }
      const data = await response.json();
      console.log('🟢 [classesSlice] Successfully added class:', data);
      return data as ClassWithGrade;
    } catch (error: any) {
      console.error('🔴 [classesSlice] Failed to add class (Network/Parsing Error):', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateClasse = createAsyncThunk(
  'classes/updateClasse',
  async (classe: ClassWithGrade, { rejectWithValue }) => {
    const payload = {
        name: classe.name,
        abbreviation: classe.abbreviation,
        capacity: classe.capacity,
        gradeId: classe.gradeId
    };
    console.log(`🔵 [classesSlice] Attempting to update class ${classe.id}:`, payload);
    try {
      const response = await fetch(`/api/classes/${classe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [classesSlice] Failed to update class ${classe.id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de la mise à jour');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de la mise à jour');
        }
      }
      const data = await response.json();
      console.log(`🟢 [classesSlice] Successfully updated class ${classe.id}:`, data);
      return data as ClassWithGrade;
    } catch (error: any) {
      console.error(`🔴 [classesSlice] Failed to update class ${classe.id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteClasse = createAsyncThunk(
  'classes/deleteClasse',
  async (id: number, { rejectWithValue }) => {
    console.log(`🔵 [classesSlice] Attempting to delete class ${id}`);
    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [classesSlice] Failed to delete class ${id} (API responded with ${response.status}):`, errorText);
        try {
            const errorData = JSON.parse(errorText);
            return rejectWithValue(errorData.message || 'Échec de la suppression');
        } catch (e) {
            return rejectWithValue(errorText || 'Échec de la suppression');
        }
      }
      console.log(`🟢 [classesSlice] Successfully deleted class ${id}`);
      return id;
    } catch (error: any) {
      console.error(`🔴 [classesSlice] Failed to delete class ${id} (Network/Parsing Error):`, error);
      return rejectWithValue(error.message);
    }
  }
);


export const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClasses.pending, (state) => {
        console.log('⏳ [classesSlice] fetchClasses.pending');
        state.status = 'loading';
      })
      .addCase(fetchClasses.fulfilled, (state, action: PayloadAction<ClassWithGrade[]>) => {
        console.log('✅ [classesSlice] fetchClasses.fulfilled');
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        console.error('❌ [classesSlice] fetchClasses.rejected:', action.payload);
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addClasse.fulfilled, (state, action: PayloadAction<ClassWithGrade>) => {
        console.log('✅ [classesSlice] addClasse.fulfilled');
        state.items.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(addClasse.rejected, (state, action) => {
        console.error('❌ [classesSlice] addClasse.rejected:', action.error.message || action.payload);
        state.status = 'failed';
        state.error = action.error.message || (action.payload as string) || 'Failed to add class';
      })
      .addCase(updateClasse.fulfilled, (state, action: PayloadAction<ClassWithGrade>) => {
        console.log('✅ [classesSlice] updateClasse.fulfilled');
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteClasse.fulfilled, (state, action: PayloadAction<number>) => {
        console.log('✅ [classesSlice] deleteClasse.fulfilled');
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          if (!state.error && action.payload) { // Avoid overwriting specific error from fetch and only set if payload exists
            state.status = 'failed';
            state.error = action.payload as string;
            console.error(`❌ [classesSlice] Rejected action ${action.type}:`, action.payload);
          }
        }
      );
  },
});

export const selectAllClasses = (state: RootState): ClassWithGrade[] => state.classes.items;
export const getClassesStatus = (state: RootState): string => state.classes.status;
export const getClassesError = (state: RootState): string | null | undefined => state.classes.error;

export default classesSlice.reducer;
