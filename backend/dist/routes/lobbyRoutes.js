"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lobbyController_1 = require("../controllers/lobbyController");
const router = (0, express_1.Router)();
router.post('/create', lobbyController_1.createLobby);
router.post('/join', lobbyController_1.joinLobby);
exports.default = router;
