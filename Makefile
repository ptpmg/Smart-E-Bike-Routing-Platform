.PHONY: up down logs rebuild

up:
	cd infra && cp -n .env.example .env || true && docker compose up -d

down:
	cd infra && docker compose down -v

logs:
	cd infra && docker compose logs -f --tail=100

rebuild:
	cd infra && docker compose build --no-cache && docker compose up -d
