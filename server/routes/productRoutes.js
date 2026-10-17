import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadImage, addReview } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const r = Router();
r.get('/', listProducts);
r.post('/upload', protect, authorize('admin'), upload.single('image'), uploadImage);
r.post('/', protect, authorize('admin'), createProduct);
r.get('/:idOrSlug', getProduct);
r.put('/:id', protect, authorize('admin'), updateProduct);
r.delete('/:id', protect, authorize('admin'), deleteProduct);
r.post('/:id/reviews', protect, addReview);
export default r;
