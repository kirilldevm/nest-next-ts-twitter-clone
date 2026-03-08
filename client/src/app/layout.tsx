import theme from '@/components/theme';
import ModeSwitch from '@/components/ui/mode-switch';
import { AuthProvider } from '@/context/auth.context';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TwiXter',
  description: 'A Twitter clone built with Firebase',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ModeSwitch />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
