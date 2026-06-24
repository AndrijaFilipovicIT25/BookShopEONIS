import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, Grid, Card, CardContent, CardMedia,
  CardActionArea, Chip, CircularProgress, Container, Skeleton
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import { useNavigate } from 'react-router-dom'
import { booksApi } from '../api'

function BookCard({ book }) {
  const navigate = useNavigate()
  const price = book.discountPrice ?? book.price

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
      <CardActionArea onClick={() => navigate(`/books/${book.id}`)} sx={{ flex: 1 }}>
        <CardMedia
          component="div"
          sx={{ height: 200, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          {book.frontImagePath ? (
            <img
              src={`http://localhost:5003${book.frontImagePath}`}
              alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <MenuBookIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
          )}
          {book.discountPrice && (
            <Chip label="SALE" color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
          )}
        </CardMedia>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} noWrap>{book.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={700} color="primary">${price.toFixed(2)}</Typography>
            {book.discountPrice && (
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${book.price.toFixed(2)}</Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function BookSkeleton() {
  return (
    <Card elevation={2}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton width="80%" />
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </CardContent>
    </Card>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      booksApi.getAll(1, 8),
      booksApi.getCollections(),
      booksApi.getCategories(),
    ]).then(([booksRes, collectionsRes, categoriesRes]) => {
      setBooks(booksRes.data)
      setCollections(collectionsRes.data)
      setCategories(categoriesRes.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        bgcolor: 'primary.main', color: 'white', borderRadius: 3,
        p: { xs: 4, md: 8 }, mb: 6, textAlign: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
      }}>
        <MenuBookIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Your Next Great Read Awaits
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, maxWidth: 500, mx: 'auto' }}>
          Discover thousands of books across every genre. From bestsellers to hidden gems.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/books')}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            endIcon={<ArrowForwardIcon />}
          >
            Browse Books
          </Button>
        </Box>
      </Box>

      {/* Categories */}
      {categories.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Browse by Category</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => navigate(`/books?categoryId=${cat.id}`)}
                color="primary"
                variant="outlined"
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Featured Books */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Featured Books</Typography>
          <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/books')}>View All</Button>
        </Box>
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={3} key={i}><BookSkeleton /></Grid>
              ))
            : books.map(book => (
                <Grid item xs={6} sm={4} md={3} key={book.id}>
                  <BookCard book={book} />
                </Grid>
              ))
          }
        </Grid>
      </Box>

      {/* Collections */}
      {collections.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Collections & Series</Typography>
          <Grid container spacing={3}>
            {collections.map(col => (
              <Grid item xs={12} sm={6} md={4} key={col.id}>
                <Card
                  elevation={2}
                  sx={{ cursor: 'pointer', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
                  onClick={() => navigate(`/collections/${col.id}`)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: 'secondary.main', borderRadius: 2, p: 1.5, color: 'white' }}>
                      <CollectionsBookmarkIcon />
                    </Box>
                    <Box>
                      <Typography fontWeight={700}>{col.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{col.description || 'Book series'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  )
}
