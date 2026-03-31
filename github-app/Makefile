# GitHub Saohua App - Makefile

.PHONY: help install dev start test build up down logs clean

help: ## 显示帮助信息
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	npm install

dev: ## 开发模式运行
	npm run dev

start: ## 生产模式运行
	npm start

test: ## 运行测试
	node test.js

build: ## 构建 Docker 镜像
	docker-compose build --no-cache

up: ## 启动 Docker 服务
	docker-compose up -d

down: ## 停止 Docker 服务
	docker-compose down

logs: ## 查看日志
	docker-compose logs -f

ps: ## 查看服务状态
	docker-compose ps

restart: ## 重启服务
	docker-compose restart

clean: ## 清理构建缓存
	docker-compose down -v
	docker system prune -f

setup: ## 初始化环境
	cp .env.example .env
	@echo "✅ 环境初始化完成！请编辑 .env 文件填入配置"

verify: ## 验证环境配置
	@echo "检查环境配置..."
	@test -f .env || (echo "❌ .env 文件不存在" && exit 1)
	@grep -q "APP_ID=" .env || (echo "❌ APP_ID 未配置" && exit 1)
	@grep -q "PRIVATE_KEY=" .env || (echo "❌ PRIVATE_KEY 未配置" && exit 1)
	@grep -q "WEBHOOK_SECRET=" .env || (echo "❌ WEBHOOK_SECRET 未配置" && exit 1)
	@echo "✅ 环境配置验证通过"
