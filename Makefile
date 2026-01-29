.PHONY: dev build test lint migrate seed up down clean

dev:
	docker compose -f docker-compose.dev.yml up -d
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

migrate:
	docker compose -f docker-compose.prod.yml exec api pnpm migrate

seed:
	docker compose -f docker-compose.dev.yml exec api pnpm seed

up:
	docker compose -f docker-compose.prod.yml up -d --build

down:
	docker compose -f docker-compose.prod.yml down

clean:
	find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
	find . -name 'dist' -type d -prune -exec rm -rf '{}' +
