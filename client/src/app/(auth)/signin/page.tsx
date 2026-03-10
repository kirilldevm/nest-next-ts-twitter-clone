import LoginForm from '@/components/forms/login-form';
import { Box, Container } from '@mui/material';

export default function Page() {
  return (
    <Container maxWidth='xs'>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <LoginForm />
      </Box>
    </Container>
  );
}
