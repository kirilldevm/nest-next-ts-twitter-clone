'use client';

import Link from '@/components/link';
import { useAuth } from '@/context/auth.context';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MaterialUILink from '@mui/material/Link';

export default function Home() {
  const { user, logout } = useAuth();
  console.log(user);
  return (
    <Container maxWidth='lg'>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {user && (
          <Box>
            <Typography variant='h6'>{user.email}</Typography>
          </Box>
        )}
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            logout();
          }}
        >
          Sign Out
        </Button>

        <MaterialUILink component={Link} href='/signin'>
          Sign In
        </MaterialUILink>

        <MaterialUILink component={Link} href='/signup'>
          Sign Up
        </MaterialUILink>
      </Box>
    </Container>
  );
}
