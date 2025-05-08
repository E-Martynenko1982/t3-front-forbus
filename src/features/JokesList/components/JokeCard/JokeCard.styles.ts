import type { SxProps, Theme } from '@mui/material/styles';

export const cardStyles: SxProps<Theme> = {
  minWidth: 275,
  mb: 2, // Додаємо відступ знизу для карток
  boxShadow: 3, // Додаємо тінь
  borderRadius: 2, // Закруглені кути
};

export const cardHeaderStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 1.5,
};

export const idChipStyles: SxProps<Theme> = {
  // Стилі для чіпа ID
};

export const typeChipStyles: SxProps<Theme> = {
  // Стилі для чіпа Type
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
