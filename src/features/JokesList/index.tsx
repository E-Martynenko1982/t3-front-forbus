import React, { useEffect, useCallback } from 'react';
import JokeCard from './components/JokeCard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  selectJokesData,
  selectRequestStatus,
  selectError,
  deleteJoke,
} from '../../redux/jokeSlice';
import {
  initialLoadJokes,
  loadMoreJokes,
  addRandomJoke,
  refreshJoke,
} from '../../redux/jokeThunks';
import { RequestStatus } from '../../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoadMoreButton from './components/LoadMoreButton';
import StatusDisplay from './components/StatusDisplay';
import { jokeCardItemSx, jokeListContainerSx } from './JokesList.styles';
import { Alert } from '@mui/material';

const JokeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const jokesData = useAppSelector(selectJokesData);
  const requestStatus = useAppSelector(selectRequestStatus);
  const error = useAppSelector(selectError);

  useEffect(() => {
    if (jokesData.length === 0 && requestStatus === RequestStatus.succeeded) {
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
    const resultAction = await dispatch(addRandomJoke());
    if (addRandomJoke.rejected.match(resultAction)) {
      console.error('Failed to add new joke (handled by slice):', resultAction.payload || resultAction.error.message);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(
    async (idToReplace: number) => {
      const resultAction = await dispatch(refreshJoke(idToReplace));
      if (refreshJoke.rejected.match(resultAction)) {
        console.error(`Failed to refresh joke ${idToReplace} (handled by slice):`, resultAction.payload || resultAction.error.message);
      }
    },
    [dispatch],
  );

  const handleLoadMore = useCallback(() => {
    if (requestStatus !== RequestStatus.loading) {
      dispatch(loadMoreJokes());
    }
  }, [dispatch, requestStatus]);

  const isInitialLoad = jokesData.length === 0 && (requestStatus === RequestStatus.loading || requestStatus === RequestStatus.succeeded);


  return (
    <Box sx={{ ...jokeListContainerSx, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Jokes List
      </Typography>

      <StatusDisplay
        requestStatus={requestStatus}
        error={error}
        jokesLength={jokesData.length}
        isInitialLoad={isInitialLoad}
      />

      {jokesData.length > 0 && (
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
      )}
      {jokesData.length > 0 && requestStatus !== RequestStatus.failed && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={requestStatus === RequestStatus.loading && !isInitialLoad}
        />
      )}
      {error && requestStatus !== RequestStatus.failed && requestStatus !== RequestStatus.loading && jokesData.length > 0 && !isInitialLoad && (
        <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default JokeList;