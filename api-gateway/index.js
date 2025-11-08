const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());


// 🧠 FIX: Add pathRewrite to remove the prefix before forwarding

app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/auth": "" },
  })
);

app.use(
  "/expenses",
  createProxyMiddleware({
    target: process.env.EXPENSES_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/expenses": "" },
  })
);

app.use(
  "/ai",
  createProxyMiddleware({
    target: process.env.AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/ai": "" },
  })
);

app.use(
  "/budget",
  createProxyMiddleware({
    target: process.env.BUDGET_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/budget": "" },
  })
);

app.use(
  "/message",
  createProxyMiddleware({
    target: process.env.MESSAGE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/message": "" },
  })
);

// app.use(
//   "/otp",
//   createProxyMiddleware({
//     target: process.env.OTP_SERVICE_URL,
//     changeOrigin: true,
//     pathRewrite: { "^/otp": "" },
//   })
// );
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API Gateway is running 🚀");
});

const PORT = process.env.API_GATEWAY_PORT || 5000;
app.listen(PORT, () => console.log(`✅ API Gateway running on port ${PORT}`));
