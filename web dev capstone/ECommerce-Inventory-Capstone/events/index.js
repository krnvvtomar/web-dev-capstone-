const EventEmitter = require("events");
const appEvents = new EventEmitter();
function startEventListeners(io) {
  appEvents.on("order-placed", ({ order }) => {
    io.to(`user:${order.customer}`).emit("order:placed", { orderId: String(order._id), status: order.status });
    for (const sellerId of new Set(order.items.map(i => String(i.seller)))) {
      io.to(`user:${sellerId}`).emit("seller:new-order", { orderId: String(order._id) });
    }
  });
  appEvents.on("stock-low", ({ product }) => {
    io.to(`user:${product.seller}`).emit("inventory:low-stock", { productId: String(product._id), name: product.name, stock: product.stock });
  });
  appEvents.on("order-status-changed", ({ order }) => {
    io.to(`user:${order.customer}`).emit("order:status", { orderId: String(order._id), status: order.status });
  });
}
module.exports = { appEvents, startEventListeners };