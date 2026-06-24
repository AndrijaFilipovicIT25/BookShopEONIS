import { Box, Typography, Grid, Card, CardContent, Button, Divider } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CategoryIcon from '@mui/icons-material/Category'
import PersonIcon from '@mui/icons-material/Person'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import { useNavigate } from 'react-router-dom'

const sections = [
  { label: 'Books', icon: <MenuBookIcon fontSize="large" />, path: '/admin/books', color: '#1a237e', desc: 'Add, edit and manage your book catalog' },
  { label: 'Categories', icon: <CategoryIcon fontSize="large" />, path: '/admin/categories', color: '#283593', desc: 'Organize books by genre or type' },
  { label: 'Authors', icon: <PersonIcon fontSize="large" />, path: '/admin/authors', color: '#303f9f', desc: 'Manage author profiles and bios' },
  { label: 'Collections', icon: <CollectionsBookmarkIcon fontSize="large" />, path: '/admin/collections', color: '#3949ab', desc: 'Group books into series or collections' },
  { label: 'Orders', icon: <ShoppingBagIcon fontSize="large" />, path: '/admin/orders', color: '#e53935', desc: 'View and manage customer orders' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your bookshop from here.
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={3}>
        {sections.map(s => (
          <Grid item xs={12} sm={6} md={4} key={s.label}>
            <Card
              elevation={2}
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}
              onClick={() => navigate(s.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ color: s.color, mb: 1.5 }}>{s.icon}</Box>
                <Typography variant="h6" fontWeight={700}>{s.label}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.desc}</Typography>
                <Button size="small" sx={{ mt: 2 }} onClick={() => navigate(s.path)}>
                  Manage →
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
