import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Joke, type JokeState, RequestStatus } from '../types';
import type { RootState } from './store';
import { loadJokesFromLs, saveJokesToLs } from '../services/LocalStorageService';

const initialState: JokeState = {
  data: loadJokesFromLs(),
  requestStatus: RequestStatus.succeeded,
  error: null,
};

export const fetchTenJokes = createAsyncThunk<Joke[]>('jokes/fetchTen', async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
});

export const fetchRandomJoke = createAsyncThunk<Joke>('jokes/fetchRandom', async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/random`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
});

export const initialLoadJokes = createAsyncThunk<Joke[], void, { state: RootState }>(
  'jokes/initialLoad',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const localJokes = state.joke.data;

    if (localJokes.length >= 10) {
      dispatch(jokeSlice.actions.setRequestStatus(RequestStatus.succeeded));
      return localJokes;
    } else {
      const needed = 10 - localJokes.length;
      let apiJokes: Joke[] = [];
      let attempts = 0;
      const maxAttempts = 5;

      while (apiJokes.length < needed && attempts < maxAttempts) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
        if (!response.ok) {
          let singleJokeAttempts = 0;
          const maxSingleJokeAttempts = needed * 2;
          while (apiJokes.length < needed && singleJokeAttempts < maxSingleJokeAttempts) {
            const singleResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/random`);
            if (singleResponse.ok) {
              const newJoke = await singleResponse.json();
              const jokeToAdd = Array.isArray(newJoke) ? newJoke[0] : newJoke;
              if (
                jokeToAdd &&
                jokeToAdd.id &&
                !localJokes.some(joke => joke.id === jokeToAdd.id) &&
                !apiJokes.some(joke => joke.id === jokeToAdd.id)
              ) {
                apiJokes.push(jokeToAdd);
              }
            }
            singleJokeAttempts++;
          }
          if (apiJokes.length < needed) {
            throw new Error('Failed to fetch enough unique jokes from API');
          } else {
            break;
          }
        }

        const newJokes: Joke[] = await response.json();

        const uniqueNewJokes = newJokes.filter(
          newJoke =>
            !localJokes.some(localJoke => localJoke.id === newJoke.id) &&
            !apiJokes.some(existingApiJoke => existingApiJoke.id === newJoke.id),
        );
        apiJokes = apiJokes.concat(uniqueNewJokes);
        attempts++;
      }

      if (apiJokes.length < needed) {
        console.warn(`Could only fetch ${apiJokes.length} unique jokes out of ${needed} needed.`);
      }

      const combinedJokes = [...localJokes, ...apiJokes];

      const uniqueCombinedJokes = combinedJokes.filter(
        (joke, index, self) => index === self.findIndex(t => t.id === joke.id),
      );

      dispatch(jokeSlice.actions.setJokes(uniqueCombinedJokes));
      saveJokesToLs(uniqueCombinedJokes);
      return uniqueCombinedJokes;
    }
  },
);

export const loadMoreJokes = createAsyncThunk<Joke[], void, { state: RootState }>(
  'jokes/loadMore',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentJokes = state.joke.data;

    let newUniqueJokes: Joke[] = [];
    let attempts = 0;
    const maxAttempts = 10;

    while (newUniqueJokes.length < 10 && attempts < maxAttempts) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fetchedJokes: Joke[] = await response.json();

        const uniqueBatch = fetchedJokes.filter(
          fetchedJoke =>
            !currentJokes.some(existingJoke => existingJoke.id === fetchedJoke.id) &&
            !newUniqueJokes.some(addedJoke => addedJoke.id === fetchedJoke.id),
        );
        newUniqueJokes = newUniqueJokes.concat(uniqueBatch);
        attempts++;
      } catch (error) {
        console.error('Error fetching batch of jokes:', error);

        let singleJokeAttempts = 0;
        const maxSingleJokeAttempts = 10 * 2;
        while (newUniqueJokes.length < 10 && singleJokeAttempts < maxSingleJokeAttempts) {
          try {
            const singleResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/random`);
            if (singleResponse.ok) {
              const newJoke = await singleResponse.json();
              if (
                !currentJokes.some(joke => joke.id === newJoke.id) &&
                !newUniqueJokes.some(joke => joke.id === newJoke.id)
              ) {
                newUniqueJokes.push(newJoke);
              }
            }
            singleJokeAttempts++;
          } catch (singleError) {
            console.error('Error fetching single joke:', singleError);
            singleJokeAttempts++;
          }
        }
        if (newUniqueJokes.length < 10) {
          return rejectWithValue('Failed to fetch enough unique jokes after multiple attempts.');
        } else {
          break;
        }
      }
    }

    if (newUniqueJokes.length > 0) {
      dispatch(jokeSlice.actions.addJokes(newUniqueJokes));
      saveJokesToLs(getState().joke.data);
    }

    return newUniqueJokes;
  },
);

const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    setJokes: (state, action: PayloadAction<Joke[]>) => {
      state.data = action.payload;
    },

    addJokes: (state, action: PayloadAction<Joke[]>) => {
      const uniqueNewJokes = action.payload.filter(
        newJoke => !state.data.some(existingJoke => existingJoke.id === newJoke.id),
      );
      state.data.push(...uniqueNewJokes);
    },

    deleteJoke: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(joke => joke.id !== action.payload);
      saveJokesToLs(state.data);
    },

    addSingleJoke: (state, action: PayloadAction<Joke>) => {
      if (!state.data.some(joke => joke.id === action.payload.id)) {
        state.data.push(action.payload);
        saveJokesToLs(state.data);
      } else {
        console.warn(`Joke with ID ${action.payload.id} already exists.`);
      }
    },

    replaceJoke: (state, action: PayloadAction<{ id: number; newJoke: Joke }>) => {
      const index = state.data.findIndex(joke => joke.id === action.payload.id);
      if (index !== -1) {
        const isDuplicate = state.data.some(
          (joke, i) => i !== index && joke.id === action.payload.newJoke.id,
        );
        if (!isDuplicate) {
          state.data[index] = action.payload.newJoke;
          saveJokesToLs(state.data);
        } else {
          console.warn(
            `New joke with ID ${action.payload.newJoke.id} is a duplicate of an existing joke.`,
          );
        }
      }
    },

    setRequestStatus: (state, action: PayloadAction<RequestStatus>) => {
      state.requestStatus = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initialLoadJokes.pending, state => {
        state.requestStatus = RequestStatus.loading;
        state.error = null;
      })
      .addCase(initialLoadJokes.fulfilled, state => {
        state.requestStatus = RequestStatus.succeeded;
        state.error = null;
      })
      .addCase(initialLoadJokes.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
        state.error = (action.payload as string) || 'Failed to load initial jokes.';

        if (state.data.length > 0) {
          state.requestStatus = RequestStatus.succeeded;
        }
      })
      .addCase(loadMoreJokes.pending, state => {
        state.error = null;
      })
      .addCase(loadMoreJokes.fulfilled, state => {
        state.error = null;
      })
      .addCase(loadMoreJokes.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to load more jokes.';
      })
      .addCase(fetchRandomJoke.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to fetch random joke.';
      });
  },
});

export const {
  deleteJoke,
  addSingleJoke,
  replaceJoke,
  setJokes,
  addJokes,
  setRequestStatus,
  setError,
} = jokeSlice.actions;

export default jokeSlice.reducer;
export const selectJokesData = (state: RootState): Joke[] => state.joke.data;
export const selectRequestStatus = (state: RootState): RequestStatus => state.joke.requestStatus;
export const selectError = (state: RootState): string | null => state.joke.error;
