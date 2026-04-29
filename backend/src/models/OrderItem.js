import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseTitleSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);
export default OrderItem;
