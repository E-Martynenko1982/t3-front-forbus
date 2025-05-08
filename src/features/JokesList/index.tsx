import React, { useEffect, useCallback } from 'react';
import JokeCard from './components/JokeCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  initialLoadJokes,
  loadMoreJokes,
  deleteJoke,
  fetchRandomJoke,
  selectJokesData,
  selectRequestStatus,
  selectError,
  addSingleJoke,
} from '../../redux/jokeSlice';
import { RequestStatus } from '../../types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { jokeCardItemSx, jokeListContainerSx } from './JokesList.styles';

const JokeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const jokesData = useAppSelector(selectJokesData);
  const requestStatus = useAppSelector(selectRequestStatus);
  const error = useAppSelector(selectError);

  useEffect(() => {
    if (jokesData.length === 0 && requestStatus !== RequestStatus.loading) {
      dispatch(initialLoadJokes());
    }
  }, [dispatch, jokesData.length, requestStatus]);

  const handleDelete = useCallback(
    (id: number) => {
      dispatch(deleteJoke(id));
    },
    [dispatch],
  );

  const handleAdd = useCallback(async () => {
    const result = await dispatch(fetchRandomJoke());
    if (fetchRandomJoke.fulfilled.match(result) && result.payload) {
      if (result.payload.id) {
        dispatch(addSingleJoke(result.payload));
      } else {
        console.error('Received invalid joke format from API');
      }
    }
  }, [dispatch]);

  const handleRefresh = useCallback(
    async (id: number) => {
      dispatch(deleteJoke(id));
      const result = await dispatch(fetchRandomJoke());
      if (fetchRandomJoke.fulfilled.match(result)) {
        dispatch(addSingleJoke(result.payload));
      }
    },
    [dispatch],
  );

  const handleLoadMore = useCallback(() => {
    dispatch(loadMoreJokes());
  }, [dispatch]);

  if (requestStatus === RequestStatus.loading && jokesData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (requestStatus === RequestStatus.failed && jokesData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Alert severity="error">Load error: {error}</Alert>
      </Box>
    );
  }

  if (jokesData.length === 0 && requestStatus !== RequestStatus.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography variant="h6">Jokes are not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...jokeListContainerSx, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Jokes List
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {jokesData.map(joke => (
          <Box key={joke.id} sx={jokeCardItemSx}>
            <JokeCard
              joke={joke}
              onDelete={handleDelete}
              onAdd={handleAdd}
              onRefresh={handleRefresh}
            />
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={handleLoadMore}
        disabled={requestStatus === RequestStatus.loading}
        sx={{ mt: 4, mb: 4 }}
      >
        {requestStatus === RequestStatus.loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Load More'
        )}
      </Button>

      {error && requestStatus !== RequestStatus.failed && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default JokeList;
