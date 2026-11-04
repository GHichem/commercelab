import express from 'express';
import cors from 'cors';
import { productsRouter } from './routes/products.js';
import { adminImagesRouter } from './routes/admin-images.js';
import { adminProductsRouter } from './routes/admin-products.js';
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'commercelab-api',
    });
});
app.use('/products', productsRouter);
// Admin routes
app.use('/admin', adminImagesRouter);
app.use('/admin', adminProductsRouter);
app.listen(PORT, () => {
    console.log(`CommerceLab API running on http://localhost:${PORT}`);
});
