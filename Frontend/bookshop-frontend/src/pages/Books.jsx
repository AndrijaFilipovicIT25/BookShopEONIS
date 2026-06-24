import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActionArea,
  Chip, CircularProgress, TextField, MenuItem, Slider, Button,
  Drawer, IconButton, Divider, Skeleton, Pagination, FormControl,
  InputLabel, Select, InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { booksApi } from '../api'

function BookCard({ book }) {
  const navigate = useNavigate()
  const price = book.discountPrice ?? book.price

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
      <CardActionArea onClick={() => navigate(`/books/${book.id}`)} sx={{ flex: 1 }}>
        <CardMedia
          component="div"
          sx={{ height: 200, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          {book.frontImagePath ? (
            <img src={`http://localhost:5003${book.frontImagePath}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'contain ' }} />
          ) : (
            <MenuBookIcon sx={{ fontSize: 60, color: 'white', opacity: 0.7 }} />
          )}
          {book.discountPrice && <Chip label="SALE" color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />}
          {book.stockQuantity === 0 && <Chip label="Out of Stock" color="default" size="small" sx={{ position: 'absolute', top: 8, left: 8 }} />}
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
          {book.category && <Chip label={book.category.name} size="small" variant="outlined" sx={{ mt: 1 }} />}
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

export default function Books() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
  const [sortBy, setSortBy] = useState('newest')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const PAGE_SIZE = 12

  useEffect(() => {
    booksApi.getCategories().then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [page, categoryId, sortBy, onlyAvailable])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const res = await booksApi.getAll(page, PAGE_SIZE)
      let data = res.data

      // Client-side filtering (until backend supports query params)
      if (search) {
        const q = search.toLowerCase()
        data = data.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.authors?.some(a => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q))
        )
      }

      if (categoryId) {
        data = data.filter(b => b.categoryId === parseInt(categoryId))
      }

      if (onlyAvailable) {
        data = data.filter(b => b.isAvailable && b.stockQuantity > 0)
      }

      if (sortBy === 'price-asc') data.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price))
      else if (sortBy === 'price-desc') data.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price))
      else if (sortBy === 'title') data.sort((a, b) => a.title.localeCompare(b.title))
      else if (sortBy === 'newest') data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      setBooks(data)
      setTotalPages(Math.ceil(data.length / PAGE_SIZE) || 1)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchBooks()
  }

  const handleClearFilters = () => {
    setSearch('')
    setCategoryId('')
    setSortBy('newest')
    setOnlyAvailable(false)
    setPage(1)
  }

  const FilterPanel = () => (
    <Box sx={{ p: 2, minWidth: 240 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
        <Button size="small" onClick={handleClearFilters}>Clear All</Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="caption" color="text.secondary">CATEGORY</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, mb: 2 }}>
        <Chip
          label="All Categories"
          onClick={() => setCategoryId('')}
          color={categoryId === '' ? 'primary' : 'default'}
          variant={categoryId === '' ? 'filled' : 'outlined'}
          size="small"
          sx={{ justifyContent: 'flex-start' }}
        />
        {categories.map(cat => (
          <Chip
            key={cat.id}
            label={cat.name}
            onClick={() => setCategoryId(String(cat.id))}
            color={categoryId === String(cat.id) ? 'primary' : 'default'}
            variant={categoryId === String(cat.id) ? 'filled' : 'outlined'}
            size="small"
            sx={{ justifyContent: 'flex-start' }}
          />
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />
      <Typography variant="caption" color="text.secondary">AVAILABILITY</Typography>
      <Box sx={{ mt: 1 }}>
        <Chip
          label="In Stock Only"
          onClick={() => setOnlyAvailable(!onlyAvailable)}
          color={onlyAvailable ? 'success' : 'default'}
          variant={onlyAvailable ? 'filled' : 'outlined'}
          size="small"
        />
      </Box>
    </Box>
  )

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Browse Books</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {books.length} book{books.length !== 1 ? 's' : ''} found
      </Typography>

      {/* Search + Sort bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="title">Title A-Z</MenuItem>
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>Search</Button>
        <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterOpen(true)}>
          Filters {categoryId || onlyAvailable ? '●' : ''}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Desktop Filter Sidebar */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 220 }}>
          <Card elevation={1}>
            <FilterPanel />
          </Card>
        </Box>

        {/* Books Grid */}
        <Box sx={{ flex: 1 }}>
          <Grid container spacing={3}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={4} lg={3} key={i}><BookSkeleton /></Grid>
                ))
              : books.length === 0
                ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <MenuBookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No books found</Typography>
                      <Button sx={{ mt: 2 }} onClick={handleClearFilters}>Clear Filters</Button>
                    </Box>
                  </Grid>
                )
                : books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(book => (
                  <Grid item xs={6} sm={4} md={4} lg={3} key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))
            }
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer anchor="left" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setFilterOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <FilterPanel />
      </Drawer>
    </Box>
  )
}
