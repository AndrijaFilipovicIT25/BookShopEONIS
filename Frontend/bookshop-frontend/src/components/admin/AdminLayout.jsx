import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography, Divider } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CategoryIcon from '@mui/icons-material/Category'
import PersonIcon from '@mui/icons-material/Person'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { label: 'Books', icon: <MenuBookIcon />, path: '/admin/books' },
  { label: 'Categories', icon: <CategoryIcon />, path: '/admin/categories' },
  { label: 'Authors', icon: <PersonIcon />, path: '/admin/authors' },
  { label: 'Collections', icon: <CollectionsBookmarkIcon />, path: '/admin/collections' },
  { label: 'Orders', icon: <ShoppingBagIcon />, path: '/admin/orders' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <Paper elevation={2} sx={{ minWidth: 220, p: 1, position: 'sticky', top: 80 }}>
        <Typography variant="overline" sx={{ px: 2, color: 'text.secondary' }}>Admin Panel</Typography>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {navItems.map(item => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  )
}
