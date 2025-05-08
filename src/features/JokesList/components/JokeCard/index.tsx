import React from 'react';
import type { Joke } from '../../../../types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // Імпортуємо Button
import Stack from '@mui/material/Stack'; // Імпортуємо Stack для розташування кнопок
import {
  cardStyles,
  cardHeaderStyles,
  idChipStyles,
  typeChipStyles,
  setupTextStyles,
  punchlineTextStyles,
} from './JokeCard.styles';

interface JokeCardProps {
  joke: Joke;
  onDelete: (id: number) => void; // Додаємо обробник видалення
  onAdd: () => void; // Додаємо обробник додавання
  onRefresh: (id: number) => void; // Додаємо обробник оновлення
}

const JokeCard: React.FC<JokeCardProps> = ({ joke, onDelete, onAdd, onRefresh }) => {
  return (
    <Card sx={cardStyles}>
      <CardContent>
        <Box sx={cardHeaderStyles}>
          <Chip label={`ID: ${joke.id}`} size="small" sx={idChipStyles} />
          <Chip label={joke.type} size="small" color="primary" sx={typeChipStyles} />
        </Box>
        <Typography variant="body1" sx={setupTextStyles} gutterBottom>
          {joke.setup}
        </Typography>
        <Typography variant="h6" sx={punchlineTextStyles}>
          {joke.punchline}
        </Typography>

        {/* Додаємо блок з кнопками */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onDelete(joke.id)} // Викликаємо обробник видалення
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="success"
            size="small"
            onClick={onAdd} // Викликаємо обробник додавання
          >
            Add
          </Button>
          <Button
            variant="outlined"
            color="info"
            size="small"
            onClick={() => onRefresh(joke.id)} // Викликаємо обробник оновлення
          >
            Refresh
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JokeCard;
