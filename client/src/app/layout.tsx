import { QueryProvider } from '@/components/providers/query-provider';
import theme from '@/components/theme';
import Header from '@/components/ui/header';
import { AuthProvider } from '@/context/auth.context';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

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
          <Toaster position='bottom-right' richColors />
          <CssBaseline />
          <QueryProvider>
            <AuthProvider>
              <Header />
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
