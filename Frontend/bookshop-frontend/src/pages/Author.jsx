import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActionArea,
  CircularProgress, Alert, Chip, Button, Avatar, Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PersonIcon from '@mui/icons-material/Person'
import { useParams, useNavigate } from 'react-router-dom'
import { booksApi } from '../api'

export default function Author() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [author, setAuthor] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      booksApi.getAuthorById(id),
      booksApi.getAll(1, 100),
    ]).then(([authorRes, booksRes]) => {
      setAuthor(authorRes.data)
      // Filter books by this author
      const authorBooks = booksRes.data.filter(b =>
        b.authors?.some(a => a.id === parseInt(id))
      )
      setBooks(authorBooks)
    }).catch(() => setError('Author not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!author) return null

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>Back</Button>

      {/* Author header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
          <PersonIcon sx={{ fontSize: 48 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {author.firstName} {author.lastName}
          </Typography>
          <Chip label={`${books.length} book${books.length !== 1 ? 's' : ''}`} size="small" sx={{ mt: 0.5 }} />
        </Box>
      </Box>

      {author.bio && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>About the Author</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 700 }}>
            {author.bio}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Books by {author.firstName} {author.lastName}</Typography>

      <Grid container spacing={3}>
        {books.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No books found for this author.</Typography>
            </Box>
          </Grid>
        ) : (
          books.map(book => {
            const price = book.discountPrice ?? book.price
            return (
              <Grid item xs={6} sm={4} md={3} key={book.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                  <CardActionArea onClick={() => navigate(`/books/${book.id}`)} sx={{ flex: 1 }}>
                    <CardMedia
                      component="div"
                      sx={{ height: 200, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {book.frontImagePath ? (
                        <img src={`http://localhost:5003${book.frontImagePath}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <MenuBookIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>{book.title}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="primary">${price.toFixed(2)}</Typography>
                        {book.discountPrice && (
                          <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${book.price.toFixed(2)}</Typography>
                        )}
                      </Box>
                      {book.category && <Chip label={book.category.name} size="small" variant="outlined" sx={{ mt: 1 }} />}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>
    </Box>
  )
}
