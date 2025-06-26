
import { configureStore } from '@reduxjs/toolkit';
import matieresReducer from './features/matieres/matieresSlice';
import classesReducer from './features/classes/classesSlice';
import professeursReducer from './features/professeurs/professeursSlice';
import sallesReducer from './features/salles/sallesSlice';
import timetableReducer from './features/timetable/timetableSlice';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const makeStore = () => {
  return configureStore({
    reducer: {
      matieres: matieresReducer,
      classes: classesReducer,
      professeurs: professeursReducer,
      salles: sallesReducer,
      timetable: timetableReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
