import React, { useEffect } from 'react';
import JokeCard from './components/JokeCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchJokes, selectJokesData } from '../../redux/jokeSlice';
import { RequestStatus } from '../../types';
import type { RootState } from '../../redux/store'; // Added for typing state

const JokeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const jokesData = useAppSelector(selectJokesData);
  const requestStatus = useAppSelector((state: RootState) => state.joke.requestStatus);

  useEffect(() => {
    // Fetch jokes only if they haven't been fetched or are currently loading
    if (jokesData.length === 0 && requestStatus !== RequestStatus.succeeded && requestStatus !== RequestStatus.failed) {
      dispatch(fetchJokes());
    }
  }, [dispatch, jokesData.length, requestStatus]);

  if (requestStatus === RequestStatus.loading && jokesData.length === 0) {
    return <div>Loading jokes...</div>;
  }

  if (requestStatus === RequestStatus.failed) {
    return <div>Failed to load jokes. Please try refreshing.</div>;
  }

  // Handle the case where fetching succeeded but no jokes were returned
  if (requestStatus === RequestStatus.succeeded && jokesData.length === 0) {
    return <div>No jokes found.</div>;
  }

  return (
    <div>
      {jokesData.map(joke => (
        <JokeCard key={joke.id} joke={joke} />
      ))}
    </div>
  );
};

export default JokeList;