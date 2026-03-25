.PHONY: dev down db-up migrate test lint fmt

dev:
	docker compose -f infra/docker-compose.yml up -d
	@echo "Waiting for services..."
	@timeout /t 3 >nul 2>&1 || sleep 3
	uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000

down:
	docker compose -f infra/docker-compose.yml down

db-up:
	docker compose -f infra/docker-compose.yml up -d postgres redis minio

migrate:
	alembic -c db/migrations/alembic.ini upgrade head

migrate-gen:
	alembic -c db/migrations/alembic.ini revision --autogenerate -m "$(msg)"

test:
	pytest tests/ -v --tb=short

lint:
	ruff check .

fmt:
	ruff format .
	ruff check --fix .

install:
	pip install -e ".[dev]"
