import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FitBro Backend',
  });
});

export default router;
