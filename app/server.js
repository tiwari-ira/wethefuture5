// Utilities we need
const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  logger: true,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// We use a module for handling database operations
const db = require("./src/db");

// Add endpoints for the typing game
fastify.get("/api/leaderboard/:mode", async (request, reply) => {
  const mode = request.params.mode;
  const leaderboard = await db.getLeaderboard(mode);
  return reply.send(leaderboard);
});

fastify.post("/api/leaderboard", async (request, reply) => {
  const { mode, name, wpm, accuracy, time } = request.body;
  const result = await db.addToLeaderboard(mode, name, wpm, accuracy, time);
  return reply.send(result);
});

// Add endpoints for the quiz game
fastify.get("/api/quiz/leaderboard", async (request, reply) => {
  const leaderboard = await db.getQuizLeaderboard();
  return reply.send(leaderboard);
});

fastify.post("/api/quiz/score", async (request, reply) => {
  const { name, score, totalQuestions, timeTaken } = request.body;
  await db.saveQuizScore(name, score, totalQuestions, timeTaken);
  return reply.send({ success: true });
});

// Run the server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 