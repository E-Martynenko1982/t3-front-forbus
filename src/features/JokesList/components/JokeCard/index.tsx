import React, { useState } from 'react';
import type { Joke } from '../../../../types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
  cardStyles,
  cardHeaderStyles,
  setupTextStyles,
  punchlineTextStyles,
  cardContentStyles,
} from './JokeCard.styles';

interface JokeCardProps {
  joke: Joke;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onRefresh: (id: number) => void;
}

const JokeCard: React.FC<JokeCardProps> = ({ joke, onDelete, onAdd, onRefresh }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      sx={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={cardContentStyles}>
        <Box sx={cardHeaderStyles}>
          <Chip label={`ID: ${joke.id}`} size="small" />
          <Chip label={joke.type} size="small" color="primary" />
        </Box>
        <Typography variant="body1" sx={setupTextStyles} gutterBottom>
          {joke.setup}
        </Typography>
        <Typography variant="h6" sx={punchlineTextStyles}>
          {joke.punchline}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            visibility: isHovered ? 'visible' : 'hidden',
            height: isHovered ? 'auto' : 0,
            overflow: 'hidden',
          }}
        >
          <Button variant="outlined" color="error" size="small" onClick={() => onDelete(joke.id)}>
            Delete
          </Button>
          <Button variant="outlined" color="success" size="small" onClick={onAdd}>
            Add
          </Button>
          <Button variant="outlined" color="info" size="small" onClick={() => onRefresh(joke.id)}>
            Refresh
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JokeCard;
