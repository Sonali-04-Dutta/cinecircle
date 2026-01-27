import express from "express";
import { getStreamingProviders } from "../controllers/streaming.controller.js";

const router = express.Router();

// example: /api/streaming/299534?region=IN
router.get("/:id", getStreamingProviders);

export default router;
