'use client';

import Link from '@/components/link';
import { PAGES } from '@/config/pages.config';
import { useAuth } from '@/context/auth.context';
import MenuIcon from '@mui/icons-material/Menu';
import { Skeleton, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useState } from 'react';

export default function Header() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const settings = [
    {
      label: 'Profile',
      onClick: () => {
        router.push(PAGES.PROFILE);
      },
    },
    {
      label: 'Settings',
      onClick: () => {
        router.push(PAGES.SETTINGS);
      },
    },
    {
      label: 'Logout',
      onClick: () => {
        logout();
      },
    },
  ];

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {loading ? (
            <Skeleton variant='text' width='100%' height={60} />
          ) : (
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              justifyContent='space-between'
              width='100%'
            >
              <Typography
                variant='h6'
                noWrap
                onClick={() => router.push('/')}
                component='a'
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                TwiXter
              </Typography>

              <Box
                sx={{
                  flexGrow: 0,
                  display: { xs: 'flex', md: 'none' },
                }}
              >
                <IconButton
                  size='large'
                  aria-label='account of current user'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleOpenNavMenu}
                  color='inherit'
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              <Typography
                variant='h5'
                noWrap
                onClick={() => router.push('/')}
                component='a'
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  flexGrow: 0,
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                TwiXter
              </Typography>

              <Box sx={{ flexGrow: 0, marginLeft: 'auto' }}>
                {!user && <Link href={PAGES.LOGIN}>Sign In / Sign Up</Link>}
                {user && (
                  <Tooltip title='Open settings'>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={user?.firstName || ''}
                        src={user?.photoURL || ''}
                      />
                    </IconButton>
                  </Tooltip>
                )}
                {user && (
                  <Menu
                    sx={{ mt: '45px' }}
                    id='menu-appbar'
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {settings.map((setting) => (
                      <MenuItem
                        key={setting.label}
                        onClick={
                          setting.onClick
                            ? setting.onClick
                            : handleCloseUserMenu
                        }
                      >
                        {/* {setting.href ? (
                          <MaterialUILink
                            component={Link}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            href={setting.href}
                          >
                            {setting.label}
                          </MaterialUILink>
                        ) : (
                          <Typography onClick={setting.onClick}>
                            {setting.label}
                          </Typography>
                        )} */}
                        <Typography>{setting.label}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </Box>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
