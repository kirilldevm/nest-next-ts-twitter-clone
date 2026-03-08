'use client';

import GoogleIcon from '@mui/icons-material/Google';
import Button from '@mui/material/Button';

type ContinueWithGoogleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export default function ContinueWithGoogleButton({
  onClick,
  disabled = false,
  fullWidth = true,
}: ContinueWithGoogleButtonProps) {
  return (
    <Button
      variant='outlined'
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      startIcon={<GoogleIcon />}
      sx={{
        textTransform: 'none',
        py: 1.25,
        borderColor: 'divider',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'text.secondary',
          backgroundColor: 'action.hover',
        },
      }}
    >
      Continue with Google
    </Button>
  );
}
