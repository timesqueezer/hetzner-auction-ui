default: setup

setup:
	@echo "Setting up environment..."
	npm ci

docker-build:
	docker build -t hetzner-auction-ui:1.0.0 .

docker-save:
	docker save hetzner-auction-ui:1.0.0 > hetzner-auction-ui.tar

deploy:
	@echo "Deploying..."
	make docker-build
	make docker-save
	ansible-playbook -i ansible/hosts ansible/deploy.yml
