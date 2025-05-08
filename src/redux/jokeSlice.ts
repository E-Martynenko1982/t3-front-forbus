import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { type Joke, RequestStatus } from '../types';
import type { RootState } from './store';

type JokeState = {
  data: Joke[];
  requestStatus: RequestStatus;
};

const initialState: JokeState = {
  data: [],
  requestStatus: RequestStatus.loading,
};

export const fetchJokes = createAsyncThunk<Joke[]>('jokes/ten', async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/random_ten`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
});

const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchJokes.pending, state => {
        state.requestStatus = RequestStatus.loading;
      })
      .addCase(fetchJokes.fulfilled, (state, action) => {
        state.data = action.payload;
        state.requestStatus = RequestStatus.succeeded;
      })
      .addCase(fetchJokes.rejected, state => {
        state.requestStatus = RequestStatus.failed;
      });
  },
});

export default jokeSlice.reducer;
export const selectJokesData = (state: RootState): Joke[] => state.joke.data;
