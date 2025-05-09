import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface JokeCardActionsProps {
  jokeId: number;
  isHovered: boolean;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onRefresh: (id: number) => void;
}

const JokeCardActions: React.FC<JokeCardActionsProps> = ({
  jokeId,
  isHovered,
  onDelete,
  onAdd,
  onRefresh,
}) => {
  return (
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
      <Button variant="outlined" color="error" size="small" onClick={() => onDelete(jokeId)}>
        Delete
      </Button>
      <Button variant="outlined" color="success" size="small" onClick={onAdd}>
        Add
      </Button>
      <Button variant="outlined" color="info" size="small" onClick={() => onRefresh(jokeId)}>
        Refresh
      </Button>
    </Stack>
  );
};

export default React.memo(JokeCardActions);