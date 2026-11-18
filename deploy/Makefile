# Portfolio deploy. Run from the repo root as `make -C deploy <target>`
# (or `make <target>` inside deploy/).
#
#   deploy-local  build the current checkout and start or replace the container
#   deploy        git pull, build while the old version keeps serving, then swap
#   rollback      go back to the image that was live before the last deploy
#   logs          follow the app logs
#   status        container state plus the /api/health response

SHELL   := /bin/bash
DIR     := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
REPO    := $(abspath $(DIR)..)
COMPOSE := docker compose --project-directory $(DIR) -f $(DIR)docker-compose.yml --env-file $(DIR)portfolio.env
IMAGE   := portfolio-app
HEALTH  := http://127.0.0.1:3200/api/health
VERSION  = $$(git -C $(REPO) rev-parse --short HEAD 2>/dev/null || echo dev)
WAIT    := --wait --wait-timeout 120

.DEFAULT_GOAL := help
.PHONY: help deploy-local deploy rollback logs status down check-env

help:
	@grep -E '^#   ' $(firstword $(MAKEFILE_LIST)) | sed 's/^#   /  /'

check-env:
	@test -f $(DIR)portfolio.env || { \
	  echo "deploy/portfolio.env is missing. Create it with:"; \
	  echo "  cp deploy/portfolio.env.example deploy/portfolio.env"; exit 1; }

deploy-local: check-env
	APP_VERSION=$(VERSION) $(COMPOSE) up -d --build $(WAIT)
	@$(MAKE) --no-print-directory status

deploy: check-env
	git -C $(REPO) pull --ff-only
	@# Keep the live image as :previous so `make rollback` can return to it.
	-docker image tag $(IMAGE):latest $(IMAGE):previous 2>/dev/null
	@# Build first: the running container keeps serving during the build.
	APP_VERSION=$(VERSION) $(COMPOSE) build --pull
	@# Swap: recreate the container from the new image, wait until it's healthy.
	APP_VERSION=$(VERSION) $(COMPOSE) up -d --no-build $(WAIT)
	docker image prune -f > /dev/null
	@$(MAKE) --no-print-directory status

rollback: check-env
	docker image tag $(IMAGE):previous $(IMAGE):latest
	$(COMPOSE) up -d --no-build --force-recreate $(WAIT)
	@$(MAKE) --no-print-directory status

logs: check-env
	$(COMPOSE) logs -f --tail=200 app

status: check-env
	@$(COMPOSE) ps
	@echo
	@curl -fsS --max-time 5 $(HEALTH) && echo || { echo "Health check FAILED ($(HEALTH))"; exit 1; }

down: check-env
	$(COMPOSE) down
