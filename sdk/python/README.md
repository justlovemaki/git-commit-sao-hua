# git-saohua 🎉

> Python SDK for [Git Saohua API](https://github.com/justlovemaki/git-commit-sao-hua) — 让每一次 git commit 都带着灵魂

## 安装

```bash
pip install git-saohua
```

或从源码安装：

```bash
cd sdk/python
pip install -e .
```

## 快速开始

```python
from git_saohua import SaohuaClient

# 连接 API 服务
client = SaohuaClient("http://localhost:3000")

# 随机骚话
saohua = client.random_saohua()
print(saohua.full_message)
# => fix: 修 bug 和撩你，我都在行

# 指定类型 + 风格
saohua = client.saohua_by_type_and_style("feat", "love")
print(saohua.message)
# => 新功能上线，是送你的礼物 💕

client.close()
```

## Context Manager

```python
with SaohuaClient("http://localhost:3000") as client:
    saohua = client.random_saohua(lang="zh-CN", style="sao")
    print(saohua.full_message)
```

## API 方法

### 骚话生成

| 方法 | 说明 |
|------|------|
| `random_saohua(lang?, style?)` | 随机生成骚话 |
| `saohua_by_type(type, lang?, style?)` | 按 commit 类型生成 |
| `saohua_by_type_and_style(type, style, lang?)` | 按类型 + 风格生成 |
| `ai_saohua(diff, lang?, style?, commit_type?)` | AI 智能生成（基于 git diff） |

### 类型与风格

| 方法 | 说明 |
|------|------|
| `list_types(lang?)` | 获取所有 commit 类型 |
| `list_styles(lang?)` | 获取所有骚话风格 |
| `stats(lang?)` | 获取统计数据 |

### 插件管理

| 方法 | 说明 |
|------|------|
| `list_plugins()` | 获取已安装插件 |
| `install_plugin(data)` | 安装插件 |
| `remove_plugin(name)` | 删除插件 |
| `create_plugin_template(name, ...)` | 创建插件模板 |
| `reload_plugins()` | 重载插件数据 |

### 其他

| 方法 | 说明 |
|------|------|
| `health()` | 健康检查 |

## AI 智能生成

```python
with SaohuaClient("http://localhost:3000") as client:
    diff = """
    diff --git a/app.py b/app.py
    +def new_feature():
    +    return "hello world"
    """
    saohua = client.ai_saohua(diff)
    print(saohua.full_message)
```

## 插件管理

```python
with SaohuaClient("http://localhost:3000") as client:
    # 安装自定义骚话包
    client.install_plugin({
        "name": "my-pack",
        "version": "1.0.0",
        "messages": {
            "fix": {"love": ["修完 bug，心也修好了 💕"]}
        }
    })

    # 查看已安装插件
    plugins = client.list_plugins()
    for p in plugins.plugins:
        print(f"{p.name} v{p.version}")
```

## 错误处理

```python
from git_saohua import SaohuaClient, APIError, TimeoutError, NetworkError

try:
    client = SaohuaClient("http://localhost:3000", timeout=3)
    saohua = client.saohua_by_type("invalid")
except APIError as e:
    print(f"API 错误: {e.message} (HTTP {e.status_code})")
except TimeoutError:
    print("请求超时")
except NetworkError:
    print("网络连接失败")
```

## 数据模型

所有返回值都是类型化的 `dataclass` 对象：

- `SaohuaData` — 骚话数据（type, style, message, full_message, language）
- `HealthData` — 健康数据（status, uptime, version, memory）
- `TypesData` / `TypeInfo` — 类型列表
- `StylesData` / `StyleInfo` — 风格列表
- `StatsData` — 统计数据
- `PluginsData` / `PluginInfo` — 插件列表
- `PluginResult` — 插件操作结果

## 运行测试

```bash
cd sdk/python
python -m pytest tests/ -v
# 或
python -m unittest tests.test_client -v
```

## 环境要求

- Python >= 3.8
- requests >= 2.25.0

## License

MIT
