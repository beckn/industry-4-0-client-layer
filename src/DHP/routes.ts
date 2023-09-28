import express, { Router } from "express";
import {
  search,
  select,
  init,
  confirm,
  status,
  track,
  support
} from "./controller";
const router: Router = express.Router();

export const DHProutes = () => {
  router.post("/search", search);
  router.post("/select", select);
  router.post("/init", init);
  router.post("/confirm", confirm);
  router.post("/status", status);
  router.post("/track", track);
  router.post("/support", support);

  return router;
};
