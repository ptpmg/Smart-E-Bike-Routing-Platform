import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db.js";
import bcrypt from "bcryptjs";

describe("Auth", () => {
  test("register cria user role=user e devolve token", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "user1@example.com",
      password: "secret123"
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("user1@example.com");
    expect(res.body.user.role).toBe("user");
    expect(typeof res.body.token).toBe("string");
  });

  test("login com credenciais válidas devolve token", async () => {
    await request(app).post("/auth/register").send({
      email: "user2@example.com",
      password: "secret123"
    });
    const res = await request(app).post("/auth/login").send({
      email: "user2@example.com",
      password: "secret123"
    });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("user2@example.com");
    expect(res.body.token).toBeTruthy();
  });

  test("create-admin primeiro admin com setup_token", async () => {
    process.env.ADMIN_SETUP_TOKEN = "setup123";
    const res = await request(app).post("/auth/create-admin").send({
      email: "admin@example.com",
      password: "admin123",
      setup_token: "setup123"
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("admin");
    expect(res.body.token).toBeTruthy();
  });

  test("create-admin adicional requer JWT admin", async () => {
    process.env.ADMIN_SETUP_TOKEN = "setup123";
    // cria o primeiro admin (bootstrap)
    let r1 = await request(app).post("/auth/create-admin").send({
      email: "admin@example.com",
      password: "admin123",
      setup_token: "setup123"
    });
    const adminToken = r1.body.token;

    // tenta criar outro admin SEM token → 401/403
    let r2 = await request(app).post("/auth/create-admin").send({
      email: "admin2@example.com",
      password: "admin123"
    });
    expect([401,403]).toContain(r2.status);

    // com token admin → 201
    let r3 = await request(app)
      .post("/auth/create-admin")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "admin2@example.com", password: "admin123" });
    expect(r3.status).toBe(201);
    expect(r3.body.user.role).toBe("admin");
  });
});
