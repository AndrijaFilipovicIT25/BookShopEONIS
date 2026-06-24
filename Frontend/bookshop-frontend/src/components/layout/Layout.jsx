import { Box, Container } from '@mui/material'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}
