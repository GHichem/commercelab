import express from 'express';
import cors from 'cors';
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
app.listen(PORT, () => {
    console.log(`CommerceLab API running on http://localhost:${PORT}`);
});
