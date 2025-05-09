import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Joke, type JokeState, RequestStatus } from '../types';
import type { RootState } from './store';
import { loadJokesFromLs, saveJokesToLs } from '../services/LocalStorageService';
import { initialLoadJokes, loadMoreJokes, refreshJoke, addRandomJoke } from './jokeThunks';

const initialState: JokeState = {
  data: loadJokesFromLs(),
  requestStatus: RequestStatus.succeeded,
  error: null,
};

const updateAndSaveJokes = (state: JokeState, newJokesArray: Joke[]) => {
  state.data = newJokesArray;
  saveJokesToLs(state.data);
};

export const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    deleteJoke: (state, action: PayloadAction<number>) => {
      const updatedJokes = state.data.filter(joke => joke.id !== action.payload);
      updateAndSaveJokes(state, updatedJokes);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initialLoadJokes.pending, state => {
        state.requestStatus = RequestStatus.loading;
        state.error = null;
      })
      .addCase(initialLoadJokes.fulfilled, (state, action: PayloadAction<Joke[]>) => {
        state.requestStatus = RequestStatus.succeeded;
        updateAndSaveJokes(state, action.payload);
        state.error = null;
      })
      .addCase(initialLoadJokes.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
        state.error = action.error.message || 'Failed to load initial jokes.';
      })
      .addCase(loadMoreJokes.pending, state => {
        state.requestStatus = RequestStatus.loading;
        state.error = null;
      })
      .addCase(loadMoreJokes.fulfilled, (state, action: PayloadAction<Joke[]>) => {
        state.requestStatus = RequestStatus.succeeded;
        const currentIds = new Set(state.data.map(j => j.id));
        const uniqueNewJokes = action.payload.filter(newJoke => !currentIds.has(newJoke.id));
        if (uniqueNewJokes.length > 0) {
          updateAndSaveJokes(state, [...state.data, ...uniqueNewJokes]);
        }
        state.error = null;
      })
      .addCase(loadMoreJokes.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
        state.error = action.payload || action.error.message || 'Failed to load more jokes.';
      })
      .addCase(refreshJoke.pending, state => {
        state.error = null;
      })
      .addCase(refreshJoke.fulfilled, (state, action) => {
        if (action.payload) {
          const { oldJokeId, newJoke } = action.payload;
          const index = state.data.findIndex(joke => joke.id === oldJokeId);
          if (index !== -1) {
            const isDuplicateElsewhere = state.data.some(
              (j, i) => i !== index && j.id === newJoke.id,
            );
            if (!isDuplicateElsewhere || newJoke.id === oldJokeId) {
              const updatedJokes = [...state.data];
              updatedJokes[index] = newJoke;
              updateAndSaveJokes(state, updatedJokes);
            } else {
              console.warn(
                `Attempted to refresh joke ID ${oldJokeId} with a new joke (ID: ${newJoke.id}) that duplicates another existing joke. Refresh aborted, original joke kept for now.`,
              );
            }
          }
        }
        state.error =
          state.error === `New joke (ID: ${action.payload?.newJoke.id}) is a duplicate.`
            ? state.error
            : null;
      })
      .addCase(refreshJoke.rejected, (state, action) => {
        state.error = action.payload || action.error.message || 'Failed to refresh joke.';
      })
      .addCase(addRandomJoke.pending, state => {
        state.error = null;
      })
      .addCase(addRandomJoke.fulfilled, (state, action: PayloadAction<Joke>) => {
        const newJoke = action.payload;
        if (newJoke && newJoke.id && !state.data.some(j => j.id === newJoke.id)) {
          updateAndSaveJokes(state, [...state.data, newJoke]);
        } else if (newJoke && newJoke.id) {
          console.warn(`Tried to add joke with ID ${newJoke.id} but it already exists.`);
        }
        state.error = null;
      })
      .addCase(addRandomJoke.rejected, (state, action) => {
        state.error = action.payload || action.error.message || 'Failed to add random joke.';
      });
  },
});

export const { deleteJoke } = jokeSlice.actions;

export default jokeSlice.reducer;
export const selectJokesData = (state: RootState): Joke[] => state.joke.data;
export const selectRequestStatus = (state: RootState): RequestStatus => state.joke.requestStatus;
export const selectError = (state: RootState): string | null => state.joke.error;
