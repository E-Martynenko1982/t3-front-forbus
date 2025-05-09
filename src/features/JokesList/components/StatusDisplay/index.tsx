import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { RequestStatus } from '../../../../types';

interface StatusDisplayProps {
  requestStatus: RequestStatus;
  error: string | null;
  jokesLength: number;
  isInitialLoad: boolean;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  requestStatus,
  error,
  jokesLength,
  isInitialLoad,
}) => {
  if (isInitialLoad && requestStatus === RequestStatus.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (isInitialLoad && requestStatus === RequestStatus.failed && jokesLength === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Alert severity="error">Load error: {error || 'Failed to load jokes.'}</Alert>
      </Box>
    );
  }

  if (
    jokesLength === 0 &&
    requestStatus !== RequestStatus.loading &&
    requestStatus !== RequestStatus.succeeded
  ) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography variant="h6">Jokes are not found</Typography>
      </Box>
    );
  }
  if (error && (!isInitialLoad || jokesLength > 0) && requestStatus === RequestStatus.failed) {
    return (
      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="warning">{error}</Alert>
      </Box>
    );
  }
  if (error && requestStatus !== RequestStatus.failed && requestStatus !== RequestStatus.loading) {
    return (
      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="warning">{error}</Alert>
      </Box>
    );
  }

  return null;
};

export default StatusDisplay;
