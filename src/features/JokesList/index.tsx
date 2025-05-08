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
  addSingleJoke // Імпортуємо новий редуктор
} from '../../redux/jokeSlice';
import { RequestStatus } from '../../types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // Імпортуємо Button
import Typography from '@mui/material/Typography'; // Імпортуємо Typography для повідомлень
import CircularProgress from '@mui/material/CircularProgress'; // Імпортуємо індикатор завантаження
import Alert from '@mui/material/Alert'; // Імпортуємо Alert для повідомлень про помилки

import { jokeCardItemSx, jokeListContainerSx } from './JokesList.styles';

const JokeList: React.FC = () => {
  const dispatch = useAppDispatch();
  const jokesData = useAppSelector(selectJokesData);
  const requestStatus = useAppSelector(selectRequestStatus);
  const error = useAppSelector(selectError);

  // Ефект для початкового завантаження жартів
  useEffect(() => {
    // Завантажуємо жарти тільки якщо дані порожні і не відбувається завантаження
    if (jokesData.length === 0 && requestStatus === RequestStatus.loading) {
      dispatch(initialLoadJokes());
    }
  }, [dispatch, jokesData.length, requestStatus]);


  // Обробник видалення жарту
  const handleDelete = useCallback((id: number) => {
    dispatch(deleteJoke(id));
  }, [dispatch]);

  // Обробник додавання жарту
  const handleAdd = useCallback(async () => {
    // Отримуємо випадковий жарт і додаємо його
    const result = await dispatch(fetchRandomJoke());
    if (fetchRandomJoke.fulfilled.match(result)) {
      dispatch(addSingleJoke(result.payload));
    }
  }, [dispatch]);

  // Обробник оновлення жарту
  const handleRefresh = useCallback(async (id: number) => {
    // Видаляємо старий жарт і отримуємо новий
    dispatch(deleteJoke(id)); // Видаляємо старий жарт
    const result = await dispatch(fetchRandomJoke()); // Отримуємо новий
    if (fetchRandomJoke.fulfilled.match(result)) {
      // Додаємо новий жарт на місце видаленого (або в кінець, якщо індекс не зберігали)
      // Для простоти додаємо в кінець, якщо потрібна вставка на місце, потрібно передавати індекс
      dispatch(addSingleJoke(result.payload));
      // Якщо потрібна заміна на місці, логіка буде складнішою і потребуватиме індексу
      // dispatch(replaceJoke({ id, newJoke: result.payload })); // Якщо реалізували replaceJoke з індексом
    }
  }, [dispatch, deleteJoke, fetchRandomJoke, addSingleJoke]); // Додаємо залежності

  // Обробник завантаження ще 10 жартів
  const handleLoadMore = useCallback(() => {
    dispatch(loadMoreJokes());
  }, [dispatch]);

  // Відображення стану завантаження
  if (requestStatus === RequestStatus.loading && jokesData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Завантаження жартів...</Typography>
      </Box>
    );
  }

  // Відображення помилки
  if (requestStatus === RequestStatus.failed && jokesData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Alert severity="error">Помилка завантаження жартів: {error}</Alert>
      </Box>
    );
  }

  // Відображення, якщо жартів немає
  if (jokesData.length === 0 && requestStatus !== RequestStatus.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography variant="h6">Жарти не знайдено.</Typography>
      </Box>
    );
  }


  // Відображення списку жартів та кнопки "Load More"
  return (
    <Box sx={{ ...jokeListContainerSx, textAlign: 'center' }}> {/* Центруємо вміст */}
      <Typography variant="h4" gutterBottom>
        Список жартів
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}> {/* Центруємо картки */}
        {jokesData.map(joke => (
          <Box key={joke.id} sx={jokeCardItemSx}>
            <JokeCard
              joke={joke}
              onDelete={handleDelete} // Передаємо обробник видалення
              onAdd={handleAdd} // Передаємо обробник додавання
              onRefresh={handleRefresh} // Передаємо обробник оновлення
            />
          </Box>
        ))}
      </Box>

      {/* Кнопка "Load More" */}
      <Button
        variant="contained"
        size="large"
        onClick={handleLoadMore}
        disabled={requestStatus === RequestStatus.loading} // Вимикаємо кнопку під час завантаження
        sx={{ mt: 4, mb: 4 }} // Додаємо відступи
      >
        {requestStatus === RequestStatus.loading ? <CircularProgress size={24} color="inherit" /> : 'Завантажити ще 10 жартів'}
      </Button>

      {/* Відображення помилки для Load More */}
      {error && requestStatus !== RequestStatus.failed && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

    </Box>
  );
};

export default JokeList;
