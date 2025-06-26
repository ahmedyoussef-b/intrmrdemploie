
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { LessonWithDetails, CreateLessonPayload } from '@/types';

export interface TimetableState {
  items: LessonWithDetails[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: TimetableState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTimetable = createAsyncThunk('timetable/fetchTimetable', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch('/api/timetable');
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData.message || 'Failed to fetch timetable');
    }
    return (await response.json()) as LessonWithDetails[];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const saveTimetable = createAsyncThunk(
  'timetable/saveTimetable',
  async (lessons: CreateLessonPayload[], { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessons),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to save timetable');
      }
      // After saving, fetch the new timetable to update the state
      await dispatch(fetchTimetable());
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimetable.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTimetable.fulfilled, (state, action: PayloadAction<LessonWithDetails[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(saveTimetable.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveTimetable.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // saveTimetable.fulfilled is handled by the fetchTimetable dispatch
      .addCase(saveTimetable.fulfilled, (state) => {
        // The state will be updated by the fetchTimetable call, so we can just set status here
        state.status = 'succeeded';
      });
  },
});

export const selectAllLessons = (state: RootState): LessonWithDetails[] => state.timetable.items;
export const getTimetableStatus = (state: RootState): string => state.timetable.status;
export const getTimetableError = (state: RootState): string | null | undefined => state.timetable.error;

export default timetableSlice.reducer;
