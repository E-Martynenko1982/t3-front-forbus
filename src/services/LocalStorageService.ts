import type { Joke } from '../types';

const LOCAL_STORAGE_KEY = 'myJokes';

export const loadJokesFromLs = (): Joke[] => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState) as Joke[];
  } catch (err) {
    console.error('Could not load state from local storage', err);
    return [];
  }
};

export const saveJokesToLs = (state: Joke[]) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Could not save state to local storage', err);
  }
};
