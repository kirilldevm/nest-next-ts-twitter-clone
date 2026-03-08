import RegisterForm from '@/components/forms/register-form';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function SignUpPage() {
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
        <RegisterForm />
      </Box>
    </Container>
  );
}
