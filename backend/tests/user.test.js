import request from "supertest";
import app from "../src/app.js";

async function createAdminAndToken() {
  process.env.ADMIN_SETUP_TOKEN = "setup123";
  const r = await request(app).post("/auth/create-admin").send({
    email: "admin@example.com",
    password: "admin123",
    setup_token: "setup123"
  });
  return r.body.token;
}
async function registerUser(email="u@example.com") {
  return request(app).post("/auth/register").send({ email, password: "secret123" });
}

describe("Users protetidos", () => {
  test("GET /api/users requer admin", async () => {
    await registerUser("u1@example.com");
    const r1 = await request(app).get("/api/users");
    expect([401,403]).toContain(r1.status);

    const adminToken = await createAdminAndToken();
    const r2 = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(r2.status).toBe(200);
    expect(Array.isArray(r2.body)).toBe(true);
  });

  test("Self OR Admin em /api/users/:id", async () => {
    const adminToken = await createAdminAndToken();
    const reg = await registerUser("me@example.com");
    const login = await request(app).post("/auth/login").send({ email:"me@example.com", password:"secret123" });
    const meToken = login.body.token;
    const meId = login.body.user.id;

    // o próprio pode ver
    const r1 = await request(app).get(`/api/users/${meId}`).set("Authorization", `Bearer ${meToken}`);
    expect(r1.status).toBe(200);

    // outro user sem admin → 403
    const other = await registerUser("other@example.com");
    const r2 = await request(app).get(`/api/users/${other.body.user?.id || meId}`).set("Authorization", `Bearer ${meToken}`);
    expect([403,404]).toContain(r2.status);

    // admin pode ver qualquer um
    const r3 = await request(app).get(`/api/users/${meId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(r3.status).toBe(200);
  });

  test("PATCH: self pode mudar password/email; admin pode alterar is_active", async () => {
    const adminToken = await createAdminAndToken();
    await registerUser("editme@example.com");
    const login = await request(app).post("/auth/login").send({ email:"editme@example.com", password:"secret123" });
    const meToken = login.body.token;
    const meId = login.body.user.id;

    // self altera email
    let r1 = await request(app)
      .patch(`/api/users/${meId}`)
      .set("Authorization", `Bearer ${meToken}`)
      .send({ email: "new@example.com" });
    expect(r1.status).toBe(200);
    expect(r1.body.email).toBe("new@example.com");

    // self tenta alterar is_active → 403
    let r2 = await request(app)
      .patch(`/api/users/${meId}`)
      .set("Authorization", `Bearer ${meToken}`)
      .send({ is_active: false });
    expect(r2.status).toBe(403);

    // admin altera is_active
    let r3 = await request(app)
      .patch(`/api/users/${meId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_active: false });
    expect(r3.status).toBe(200);
    expect(r3.body.is_active).toBe(false);
  });
});
