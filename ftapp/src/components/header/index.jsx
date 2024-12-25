import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const buttonStyles = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '6px 12px',
    margin: '0 5px',
    backgroundColor: '#1976D2',
    color: 'white',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#1565C0',
    },
  };
// #2d75bd
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#233e7a' }}>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img src="missedShot.gif" alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <Typography
            variant="h6"
            noWrap
            sx={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }} // Adjusted text size for title
          >
            <Link
              to={userLoggedIn ? '/home' : '/'}
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {userLoggedIn ? 'Home' : 'Free Throw Tracker'}
            </Link>
          </Typography>
        </div>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuClick}
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'menu-button',
              }}
            >
              {userLoggedIn ? (
                <>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/addFTSession" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1rem' }}>
                      Add
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/FTLog" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1rem' }}>
                      Log
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/leaderboard" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1rem' }}>
                      Leaderboard
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/FTSummary" style={{ textDecoration: 'none', color: 'inherit', fontSize: '1rem' }}>
                      Statistics
                    </Link>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      doSignOut().then(() => {
                        navigate('/login');
                      });
                    }}
                    style={{ ...buttonStyles }}
                  >
                    Logout
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/login" style={{ textDecoration: 'none', ...buttonStyles }}>
                      Log In
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/register" style={{ textDecoration: 'none', ...buttonStyles }}>
                      Register
                    </Link>
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <div style={{ display: 'flex' }}>
            {userLoggedIn ? (
              <>
                <Button color="inherit" component={Link} to="/addFTSession" sx={{ fontSize: '1rem' }}>
                  Add
                </Button>
                <Button color="inherit" component={Link} to="/FTLog" sx={{ fontSize: '1rem' }}>
                  Log
                </Button>
                <Button color="inherit" component={Link} to="/leaderboard" sx={{ fontSize: '1rem' }}>
                  Leaderboard
                </Button>
                <Button color="inherit" component={Link} to="/FTSummary" sx={{ fontSize: '1rem' }}>
                  Statistics
                </Button>
                <Button
                  onClick={() => {
                    doSignOut().then(() => {
                      navigate('/login');
                    });
                  }}
                  sx={buttonStyles}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" sx={buttonStyles}>
                  Log In
                </Button>
                <Button component={Link} to="/register" sx={buttonStyles}>
                  Register
                </Button>
              </>
            )}
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
