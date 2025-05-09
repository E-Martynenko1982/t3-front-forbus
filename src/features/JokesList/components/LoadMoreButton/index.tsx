import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, isLoading }) => {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={isLoading}
      sx={{ mt: 4, mb: 4 }}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Load More'}
    </Button>
  );
};

export default LoadMoreButton;
