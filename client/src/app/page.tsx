import Link from '@/components/link';
import Copyright from '@/components/ui/copyright';
import ProTip from '@/components/ui/pro-tip';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MaterialUILink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

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
        <Typography variant='h4' component='h1' sx={{ mb: 2 }}>
          Material UI - Next.js example in TypeScript
        </Typography>
        <MaterialUILink component={Link} href='/about' color='secondary'>
          Go to the about page
        </MaterialUILink>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
