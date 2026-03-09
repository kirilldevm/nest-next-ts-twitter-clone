'use client';

import Link from '@/components/link';
import { auth } from '@/config/firebase.config';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MaterialUILink from '@mui/material/Link';
import { signOut } from 'firebase/auth';

export default function Home() {
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
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            signOut(auth)
              .then(() => {
                console.log('signed out');
              })
              .catch((error) => {
                console.error(error);
              });
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
