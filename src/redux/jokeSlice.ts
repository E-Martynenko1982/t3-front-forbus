import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Joke, type JokeState, RequestStatus } from '../types';
import type { RootState } from './store';
import { loadJokesFromLs, saveJokesToLs } from '../services/LocalStorageService';

const initialState: JokeState = {
  data: loadJokesFromLs(),
  requestStatus: RequestStatus.loading,
  error: null,
};

export const fetchTenJokes = createAsyncThunk<Joke[]>('jokes/fetchTen', async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
});

export const fetchRandomJoke = createAsyncThunk<Joke[]>('jokes/fetchRandom', async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/random`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
});

export const initialLoadJokes = createAsyncThunk<Joke[], void>(
  'jokes/initialLoad',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const localJokes = state.joke.data; // Жарти вже завантажені в початковому стані slice

    if (localJokes.length >= 10) {
      // Якщо в Local Storage вже є 10 або більше жартів, не завантажуємо з API
      dispatch(jokeSlice.actions.setRequestStatus(RequestStatus.succeeded));
      return localJokes;
    } else {
      // Якщо менше 10, завантажуємо решту з API
      const needed = 10 - localJokes.length;
      let apiJokes: Joke[] = [];
      let attempts = 0;
      const maxAttempts = 5; // Обмеження спроб для уникнення нескінченного циклу

      while (apiJokes.length < needed && attempts < maxAttempts) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
        if (!response.ok) {
          // Якщо перший запит на 10 жартів не вдався, спробуємо отримати по одному
          let singleJokeAttempts = 0;
          const maxSingleJokeAttempts = needed * 2; // Спроби отримати по одному
          while (apiJokes.length < needed && singleJokeAttempts < maxSingleJokeAttempts) {
            const singleResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/random`);
            if (singleResponse.ok) {
              const newJoke = await singleResponse.json();
              if (
                !localJokes.some(joke => joke.id === newJoke.id) &&
                !apiJokes.some(joke => joke.id === newJoke.id)
              ) {
                apiJokes.push(newJoke);
              }
            }
            singleJokeAttempts++;
          }
          if (apiJokes.length < needed) {
            // Якщо навіть по одному не вдалося отримати достатньо, викидаємо помилку
            throw new Error('Failed to fetch enough unique jokes from API');
          } else {
            break; // Достатньо жартів отримано по одному
          }
        }

        const newJokes: Joke[] = await response.json();
        // Фільтруємо дубляжі
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
      // Перестрахуємося і ще раз перевіримо унікальність після об'єднання
      const uniqueCombinedJokes = combinedJokes.filter(
        (joke, index, self) => index === self.findIndex(t => t.id === joke.id),
      );

      dispatch(jokeSlice.actions.setJokes(uniqueCombinedJokes)); // Оновлюємо стан
      saveJokesToLs(uniqueCombinedJokes); // Зберігаємо в Local Storage
      return uniqueCombinedJokes;
    }
  },
);

// Асинхронний thunk для завантаження ще 10 унікальних жартів (для кнопки "Load More")
export const loadMoreJokes = createAsyncThunk<Joke[], void>(
  'jokes/loadMore',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentJokes = state.joke.data;

    let newUniqueJokes: Joke[] = [];
    let attempts = 0;
    const maxAttempts = 10; // Обмеження спроб для уникнення нескінченного циклу

    while (newUniqueJokes.length < 10 && attempts < maxAttempts) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jokes/ten`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fetchedJokes: Joke[] = await response.json();

        // Фільтруємо дубляжі
        const uniqueBatch = fetchedJokes.filter(
          fetchedJoke =>
            !currentJokes.some(existingJoke => existingJoke.id === fetchedJoke.id) &&
            !newUniqueJokes.some(addedJoke => addedJoke.id === fetchedJoke.id),
        );
        newUniqueJokes = newUniqueJokes.concat(uniqueBatch);
        attempts++;
      } catch (error: any) {
        console.error('Error fetching batch of jokes:', error);
        // Якщо сталася помилка, спробуємо отримати по одному
        let singleJokeAttempts = 0;
        const maxSingleJokeAttempts = 10 * 2; // Спроби отримати по одному
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
          break; // Достатньо жартів отримано по одному
        }
      }
    }

    if (newUniqueJokes.length > 0) {
      dispatch(jokeSlice.actions.addJokes(newUniqueJokes)); // Додаємо нові унікальні жарти
      saveJokesToLs(getState().joke.data); // Зберігаємо оновлений стан
    }

    return newUniqueJokes; // Повертаємо тільки нові додані жарти (для extraReducers, якщо потрібно)
  },
);

const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    // Редуктор для встановлення жартів (використовується при початковому завантаженні)
    setJokes: (state, action: PayloadAction<Joke[]>) => {
      state.data.push(...action.payload);
    },
    // Редуктор для додавання жартів (використовується при "Load More")
    addJokes: (state, action: PayloadAction<Joke[]>) => {
      // Додаємо нові жарти, фільтруючи дубляжі на всякий випадок
      const uniqueNewJokes = action.payload.filter(
        newJoke => !state.data.some(existingJoke => existingJoke.id === newJoke.id),
      );
      state.data.push(...uniqueNewJokes);
    },
    // Редуктор для видалення жарту за ID
    deleteJoke: (state, action: PayloadAction<number>) => {
      state.data = state.data.filter(joke => joke.id !== action.payload);
      saveJokesToLs(state.data); // Зберігаємо після видалення
    },
    // Редуктор для додавання одного жарту (використовується кнопкою "Add" на картці)
    addSingleJoke: (state, action: PayloadAction<Joke>) => {
      // Перевіряємо на дубляж перед додаванням
      if (!state.data.some(joke => joke.id === action.payload.id)) {
        state.data.push(action.payload);
        saveJokesToLs(state.data); // Зберігаємо після додавання
      } else {
        console.warn(`Joke with ID ${action.payload.id} already exists.`);
      }
    },
    // Редуктор для заміни жарту за ID (використовується кнопкою "Refresh")
    replaceJoke: (state, action: PayloadAction<{ id: number; newJoke: Joke }>) => {
      const index = state.data.findIndex(joke => joke.id === action.payload.id);
      if (index !== -1) {
        // Перевіряємо, чи новий жарт не є дубляжем існуючих (окрім того, що замінюємо)
        const isDuplicate = state.data.some(
          (joke, i) => i !== index && joke.id === action.payload.newJoke.id,
        );
        if (!isDuplicate) {
          state.data[index] = action.payload.newJoke;
          saveJokesToLs(state.data); // Зберігаємо після заміни
        } else {
          console.warn(
            `New joke with ID ${action.payload.newJoke.id} is a duplicate of an existing joke.`,
          );
          // Можна додати логіку для повторного запиту або повідомлення користувачу
        }
      }
    },
    // Редуктор для встановлення статусу запиту
    setRequestStatus: (state, action: PayloadAction<RequestStatus>) => {
      state.requestStatus = action.payload;
    },
    // Редуктор для встановлення помилки
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Обробка початкового завантаження
      .addCase(initialLoadJokes.pending, state => {
        state.requestStatus = RequestStatus.loading;
        state.error = null;
      })
      .addCase(initialLoadJokes.fulfilled, state => {
        state.requestStatus = RequestStatus.succeeded;
        state.error = null;
        // Жарти вже додано в thunk за допомогою setJokes
      })
      .addCase(initialLoadJokes.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
        state.error = (action.payload as string) || 'Failed to load initial jokes.';
        // Якщо початкове завантаження не вдалося, але є щось в Local Storage, показуємо це
        if (state.data.length > 0) {
          state.requestStatus = RequestStatus.succeeded; // Показуємо те, що є
        }
      })
      // Обробка завантаження ще 10 жартів
      .addCase(loadMoreJokes.pending, state => {
        // Можна використовувати окремий статус для завантаження ще
        // state.requestStatus = RequestStatus.loading; // Або інший статус
        state.error = null;
      })
      .addCase(loadMoreJokes.fulfilled, state => {
        // Жарти вже додано в thunk за допомогою addJokes
        // state.requestStatus = RequestStatus.succeeded; // Або інший статус
        state.error = null;
      })
      .addCase(loadMoreJokes.rejected, (state, action) => {
        // state.requestStatus = RequestStatus.failed; // Або інший статус
        state.error = (action.payload as string) || 'Failed to load more jokes.';
      })
      // Обробка отримання одного випадкового жарту (для кнопки "Add")
      .addCase(fetchRandomJoke.fulfilled, (state, action) => {
        // Жарти додаються в редукторі addSingleJoke, який викликається в компоненті
        // Це просто для обробки статусу, якщо потрібно
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

// Селектор для отримання даних жартів
export const selectJokesData = (state: RootState): Joke[] => state.joke.data;
// Селектор для отримання статусу запиту
export const selectRequestStatus = (state: RootState): RequestStatus => state.joke.requestStatus;
// Селектор для отримання помилки
export const selectError = (state: RootState): string | null => state.joke.error;
