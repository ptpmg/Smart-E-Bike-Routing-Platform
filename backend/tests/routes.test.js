import request from "supertest";
import app from "../src/app.js";

async function tokenFor(email, pass="secret123") {
  await request(app).post("/auth/register").send({ email, password: pass });
  const login = await request(app).post("/auth/login").send({ email, password: pass });
  return login.body.token;
}

describe("Routes CRUD", () => {
  test("criar rota autenticado e listar públicas", async () => {
    const token = await tokenFor("rider@example.com");

    // cria rota
    const create = await request(app)
      .post("/api/routes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Rota teste",
        description: "desc",
        distance_m: 5000,
        elevation_gain_m: 50,
        difficulty: "moderate",
        visibility: "public",
        is_loop: true,
        points: [{ lat: 41.3, lon: -7.73 }]
      });
    expect(create.status).toBe(201);
    const routeId = create.body.id;

    // lista públicas sem token
    const list = await request(app).get("/api/routes");
    expect(list.status).toBe(200);
    expect(list.body.items.find(r => r.id === routeId)).toBeTruthy();

    // obter rota específica
    const get1 = await request(app).get(`/api/routes/${routeId}`);
    expect(get1.status).toBe(200);

    // substituir pontos
    const putPts = await request(app)
      .put(`/api/routes/${routeId}/points`)
      .set("Authorization", `Bearer ${token}`)
      .send({ points: [{ lat: 41.31, lon: -7.731 }, { lat: 41.32, lon: -7.732 }] });
    expect(putPts.status).toBe(204);

    const pts = await request(app).get(`/api/routes/${routeId}/points`);
    expect(pts.status).toBe(200);
    expect(pts.body.length).toBe(2);

    // apagar
    const del = await request(app)
      .delete(`/api/routes/${routeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });

  test("rota privada só owner/admin pode ver", async () => {
    const token = await tokenFor("owner@example.com");
    const create = await request(app)
      .post("/api/routes")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Privada", visibility: "private", points: [] });
    const routeId = create.body.id;

    // sem token → 403
    const r1 = await request(app).get(`/api/routes/${routeId}`);
    expect([401,403]).toContain(r1.status); // dependendo do caminho do código

    // outro user → 403
    const token2 = await tokenFor("other@example.com");
    const r2 = await request(app).get(`/api/routes/${routeId}`).set("Authorization", `Bearer ${token2}`);
    expect([401,403]).toContain(r2.status);

    // owner → 200
    const r3 = await request(app).get(`/api/routes/${routeId}`).set("Authorization", `Bearer ${token}`);
    expect(r3.status).toBe(200);
  });
});
