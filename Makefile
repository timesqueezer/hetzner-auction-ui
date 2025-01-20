default: setup

setup:
	@echo "Setting up environment..."
	npm ci

docker-build:
	docker build -t react-app:1.0.0 .

docker-save:
	docker save react-app:1.0.0 > react-app.tar
