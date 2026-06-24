import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Menu, MenuItem } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { isLoggedIn, isAdmin, logout, user } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState(null)

  const handleLogout = () => {
    logout()
    setAnchor(null)
    navigate('/')
  }

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        {/* Logo */}
        <MenuBookIcon color="primary" />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, flexGrow: 1 }}
        >
          Bookshop
        </Typography>

        {/* Nav links */}
        <Button component={Link} to="/books" color="inherit">Browse</Button>

        {isAdmin && (
          <Button component={Link} to="/admin" color="inherit">Admin</Button>
        )}

        {/* Cart */}
        {isLoggedIn && (
          <IconButton component={Link} to="/cart" color="inherit">
            <Badge badgeContent={cartCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}

        {/* User menu */}
        {isLoggedIn ? (
          <>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.firstName} {user?.lastName}
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => { navigate('/profile'); setAnchor(null) }}>Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/orders'); setAnchor(null) }}>My Orders</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined" size="small">Login</Button>
            <Button component={Link} to="/register" variant="contained" size="small">Register</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
