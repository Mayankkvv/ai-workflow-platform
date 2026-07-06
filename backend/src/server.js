import express from "express";

const app = express();

const PORT = 5000;

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});