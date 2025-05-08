import type { SxProps, Theme } from '@mui/material/styles';

export const cardStyles: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 3,
  borderRadius: 2,
  overflow: 'hidden',
};

export const cardHeaderStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 1.5,
};

export const cardContentStyles: SxProps<Theme> = {
  flexGrow: 1,
  overflow: 'auto',
};

export const cardActionsStyles: SxProps<Theme> = {
  justifyContent: 'center',
  padding: 2,
};

export const setupTextStyles: SxProps<Theme> = {
  fontSize: 16,
  color: 'text.secondary',
};

export const punchlineTextStyles: SxProps<Theme> = {
  fontSize: 20,
  fontWeight: 'bold',
  mt: 1,
};
