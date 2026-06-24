import { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, Button, Grid, MenuItem, Alert,
  CircularProgress, Paper, Divider, FormControlLabel, Switch,
  Autocomplete, Chip
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useNavigate, useParams } from 'react-router-dom'
import { booksApi } from '../../api'

const emptyForm = {
  title: '', description: '', isbn: '', price: '', discountPrice: '',
  publishedYear: '', language: '', publisher: '', pageCount: '',
  paperColor: '', height: '', width: '', depth: '',
  categoryId: '', authorIds: [], collectionId: '', collectionOrder: '',
  isAvailable: true,
  stockQuantity: 0,
}

export default function AdminBookForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState({ front: null, back: null, spine: null })
  const [savedBookId, setSavedBookId] = useState(null)

  useEffect(() => {
    Promise.all([
      booksApi.getCategories(),
      booksApi.getAuthors(),
      booksApi.getCollections(),
    ]).then(([cats, auths, cols]) => {
      setCategories(cats.data)
      setAuthors(auths.data)
      setCollections(cols.data)
    })

    if (isEdit) {
      booksApi.getById(id).then(res => {
        const b = res.data
        setForm({
          title: b.title || '',
          description: b.description || '',
          isbn: b.isbn || '',
          price: b.price || '',
          discountPrice: b.discountPrice || '',
          publishedYear: b.publishedYear || '',
          language: b.language || '',
          publisher: b.publisher || '',
          pageCount: b.pageCount || '',
          paperColor: b.paperColor || '',
          height: b.height || '',
          width: b.width || '',
          depth: b.depth || '',
          categoryId: b.categoryId || '',
          authorIds: b.authors?.map(a => a.id) || [],
          collectionId: b.collection?.id || '',
          collectionOrder: b.collectionOrder || '',
          isAvailable: b.isAvailable ?? true,
          stockQuantity: b.stockQuantity || 0,
        })
        setSavedBookId(b.id)
        setLoading(false)
      }).catch(() => {
        setError('Failed to load book.')
        setLoading(false)
      })
    }
  }, [id])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.authorIds.length === 0) {
      setError('Please select at least one author.')
      return
    }
    if (!form.categoryId) {
      setError('Please select a category.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        isbn: form.isbn,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
        language: form.language || null,
        publisher: form.publisher || null,
        pageCount: form.pageCount ? parseInt(form.pageCount) : null,
        paperColor: form.paperColor || null,
        height: form.height ? parseFloat(form.height) : null,
        width: form.width ? parseFloat(form.width) : null,
        depth: form.depth ? parseFloat(form.depth) : null,
        categoryId: parseInt(form.categoryId),
        authorIds: form.authorIds,
        collectionId: form.collectionId ? parseInt(form.collectionId) : null,
        collectionOrder: form.collectionOrder ? parseInt(form.collectionOrder) : null,
        isAvailable: form.isAvailable,
        stockQuantity: parseInt(form.stockQuantity) || 0,
      }

      let bookId = savedBookId
      if (isEdit) {
        await booksApi.update(id, payload)
        bookId = id
      } else {
        const res = await booksApi.create(payload)
        bookId = res.data.id
        setSavedBookId(bookId)
      }

      if (images.front) await booksApi.uploadFrontImage(bookId, images.front)
      if (images.back) await booksApi.uploadBackImage(bookId, images.back)
      if (images.spine) await booksApi.uploadSpineImage(bookId, images.spine)

      navigate('/admin/books')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save book.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/books')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>{isEdit ? 'Edit Book' : 'Add New Book'}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Basic Info</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Title" value={form.title} onChange={set('title')} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" value={form.description} onChange={set('description')} fullWidth multiline rows={4} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="ISBN" value={form.isbn} onChange={set('isbn')} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Published Year" value={form.publishedYear} onChange={set('publishedYear')} fullWidth type="number" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Language" value={form.language} onChange={set('language')} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Publisher" value={form.publisher} onChange={set('publisher')} fullWidth />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Pricing & Stock</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Price ($)" value={form.price} onChange={set('price')} fullWidth required type="number" inputProps={{ step: '0.01' }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Discount Price ($)" value={form.discountPrice} onChange={set('discountPrice')} fullWidth type="number" inputProps={{ step: '0.01' }} />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Stock Quantity"
                  value={form.stockQuantity}
                  onChange={set('stockQuantity')}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  helperText="Number of copies available"
                />
              </Grid>
            </Grid>
            <FormControlLabel
              control={<Switch checked={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.checked }))} />}
              label="Available for purchase"
              sx={{ mt: 1 }}
            />
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Physical Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField label="Page Count" value={form.pageCount} onChange={set('pageCount')} fullWidth type="number" />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Paper Color" value={form.paperColor} onChange={set('paperColor')} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Height (cm)" value={form.height} onChange={set('height')} fullWidth type="number" inputProps={{ step: '0.1' }} />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Width (cm)" value={form.width} onChange={set('width')} fullWidth type="number" inputProps={{ step: '0.1' }} />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Depth (cm)" value={form.depth} onChange={set('depth')} fullWidth type="number" inputProps={{ step: '0.1' }} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Organization</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField select label="Category" value={form.categoryId} onChange={set('categoryId')} fullWidth required>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>

              <Autocomplete
                multiple
                options={authors}
                getOptionLabel={a => `${a.firstName} ${a.lastName}`}
                value={authors.filter(a => form.authorIds.includes(a.id))}
                onChange={(_, val) => setForm(f => ({ ...f, authorIds: val.map(a => a.id) }))}
                renderTags={(val, getProps) =>
                  val.map((a, i) => <Chip key={a.id} label={`${a.firstName} ${a.lastName}`} size="small" {...getProps({ index: i })} />)
                }
                renderInput={params => <TextField {...params} label="Authors" />}
              />

              <TextField select label="Collection (optional)" value={form.collectionId} onChange={set('collectionId')} fullWidth>
                <MenuItem value="">— None —</MenuItem>
                {collections.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>

              {form.collectionId && (
                <TextField
                  label="Order in Collection"
                  value={form.collectionOrder}
                  onChange={set('collectionOrder')}
                  fullWidth type="number"
                  helperText="e.g. 1 for first book in series"
                />
              )}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Images</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['front', 'back', 'spine'].map(type => (
                <Box key={type}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {type} Cover
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size="small"
                    sx={{ mt: 0.5 }}
                  >
                    {images[type] ? images[type].name : `Upload ${type}`}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => setImages(img => ({ ...img, [type]: e.target.files[0] }))}
                    />
                  </Button>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/admin/books')}>Cancel</Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
          {saving ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Book'}
        </Button>
      </Box>
    </Box>
  )
}
