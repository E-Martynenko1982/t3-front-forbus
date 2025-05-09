import type { Joke } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchUniqueJokes(
  count: number,
  existingIds: Set<number> = new Set(),
): Promise<Joke[]> {
  const newJokes: Joke[] = [];
  let attemptsForBatch = 0;
  const maxAttemptsForBatch = 5;

  while (newJokes.length < count && attemptsForBatch < maxAttemptsForBatch) {
    try {
      const response = await fetch(`${API_BASE_URL}/jokes/ten`);
      if (!response.ok) {
        console.warn(`API /jokes/ten responded with status ${response.status}`);
        throw new Error(
          `Network response for /jokes/ten was not ok (attempt ${attemptsForBatch + 1})`,
        );
      }
      const batch = (await response.json()) as Joke[];
      for (const joke of batch) {
        if (joke && joke.id && !existingIds.has(joke.id) && !newJokes.some(j => j.id === joke.id)) {
          newJokes.push(joke);
          existingIds.add(joke.id);
          if (newJokes.length === count) break;
        }
      }
    } catch (error) {
      console.error('Error fetching batch of jokes:', error);
      attemptsForBatch++;
    }
    if (newJokes.length >= count) break;
    attemptsForBatch++;
  }

  let attemptsForSingle = 0;
  const maxAttemptsForSingle = (count - newJokes.length) * 3;

  while (newJokes.length < count && attemptsForSingle < maxAttemptsForSingle) {
    try {
      const randomJoke = await fetchSingleRandomJoke(existingIds);
      if (randomJoke) {
        newJokes.push(randomJoke);
        existingIds.add(randomJoke.id);
      }
    } catch (error) {
      console.error('Error fetching single random joke during fallback:', error);
    }
    attemptsForSingle++;
    if (newJokes.length >= count) break;
  }

  if (newJokes.length < count) {
    console.warn(`Could only fetch ${newJokes.length} unique jokes out of ${count} needed.`);
  }
  return newJokes;
}

export async function fetchSingleRandomJoke(
  existingIds: Set<number> = new Set(),
): Promise<Joke | null> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE_URL}/jokes/random`);
      if (!response.ok) {
        console.warn(`API /jokes/random responded with status ${response.status}`);

        const fallbackResponse = await fetch(`${API_BASE_URL}/jokes/ten`);
        if (!fallbackResponse.ok) {
          throw new Error('Both /jokes/random and /jokes/ten failed for single joke fetch.');
        }
        const fallbackJokes = (await fallbackResponse.json()) as Joke[];
        if (fallbackJokes.length > 0) {
          const firstJoke = fallbackJokes[0];
          if (firstJoke && firstJoke.id && !existingIds.has(firstJoke.id)) {
            return firstJoke;
          }
        }
        throw new Error('Fallback /jokes/ten did not yield a usable joke.');
      }
      const jokeData = await response.json();

      const joke = Array.isArray(jokeData) ? jokeData[0] : jokeData;

      if (joke && joke.id && !existingIds.has(joke.id)) {
        return joke;
      }
    } catch (error) {
      console.error('Error fetching single random joke:', error);
    }
    attempts++;
  }
  console.warn('Failed to fetch a unique random joke after multiple attempts.');
  return null;
}
