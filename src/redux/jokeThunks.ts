import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Joke } from '../types';
import type { RootState } from './store';
import { fetchUniqueJokes, fetchSingleRandomJoke } from '../services/jokeApi';

export const initialLoadJokes = createAsyncThunk<Joke[], void, { state: RootState }>(
  'jokes/initialLoad',
  async (_, { getState }) => {
    const {
      joke: { data: localJokes },
    } = getState();
    const existingIds = new Set(localJokes.map(j => j.id));

    if (localJokes.length >= 10) {
      return localJokes;
    }

    const needed = 10 - localJokes.length;
    const apiJokes = await fetchUniqueJokes(needed, existingIds);
    const combined = [...localJokes, ...apiJokes];
    const uniqueJokesMap = new Map<number, Joke>();
    combined.forEach(joke => uniqueJokesMap.set(joke.id, joke));
    return Array.from(uniqueJokesMap.values());
  },
);

export const loadMoreJokes = createAsyncThunk<
  Joke[],
  void,
  { state: RootState; rejectValue: string }
>('jokes/loadMore', async (_, { getState }) => {
  const {
    joke: { data: currentJokes },
  } = getState();
  const existingIds = new Set(currentJokes.map(j => j.id));

  const newJokes = await fetchUniqueJokes(10, existingIds);
  if (newJokes.length === 0) {
    console.warn('Load more fetched 0 new unique jokes.');
  }
  return newJokes;
});

export const refreshJoke = createAsyncThunk<
  { oldJokeId: number; newJoke: Joke } | null,
  number,
  { state: RootState; rejectValue: string }
>('jokes/refreshJoke', async (oldJokeId, { getState, rejectWithValue }) => {
  const {
    joke: { data: currentJokes },
  } = getState();

  const existingIds = new Set(currentJokes.filter(j => j.id !== oldJokeId).map(j => j.id));

  const newJoke = await fetchSingleRandomJoke(existingIds);
  if (newJoke) {
    return { oldJokeId, newJoke };
  }
  return rejectWithValue(`Failed to fetch a new joke to replace ID: ${oldJokeId}`);
});

export const addRandomJoke = createAsyncThunk<
  Joke,
  void,
  { state: RootState; rejectValue: string }
>('jokes/addRandomJoke', async (_, { getState, rejectWithValue }) => {
  const {
    joke: { data: currentJokes },
  } = getState();
  const existingIds = new Set(currentJokes.map(j => j.id));
  const newJoke = await fetchSingleRandomJoke(existingIds);
  if (newJoke) {
    return newJoke;
  }
  return rejectWithValue('Failed to fetch a new random joke to add.');
});
