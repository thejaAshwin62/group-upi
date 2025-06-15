import { Router } from "express";
import {
  generateUpiLink,
  processShopPayment
} from "../controllers/paymentController.js";
const router = Router();

router.post("/generate-upi", generateUpiLink);
router.post("/process-shop-payment", processShopPayment);
// router.patch("/update-amount", updateTotalAmount);

export default router;
