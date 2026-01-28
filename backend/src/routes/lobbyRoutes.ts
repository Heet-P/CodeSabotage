import { Router } from 'express';
import { createLobby, joinLobby } from '../controllers/lobbyController';

const router = Router();

router.post('/create', createLobby);
router.post('/join', joinLobby);

export default router;
