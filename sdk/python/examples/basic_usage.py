"""基础使用示例 — Git Saohua Python SDK."""

from git_saohua import SaohuaClient

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  1. 基础用法
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

client = SaohuaClient("http://localhost:3000")

# 随机骚话
saohua = client.random_saohua()
print(f"随机骚话: {saohua.full_message}")

# 指定类型
saohua = client.saohua_by_type("fix")
print(f"fix 骚话: {saohua.full_message}")

# 指定类型 + 风格
saohua = client.saohua_by_type_and_style("feat", "love")
print(f"feat+love: {saohua.full_message}")

# 英文骚话
saohua = client.random_saohua(lang="en")
print(f"English:   {saohua.full_message}")

client.close()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  2. Context Manager
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

with SaohuaClient("http://localhost:3000") as client:
    # AI 智能生成
    diff = """
    diff --git a/app.py b/app.py
    +def new_feature():
    +    return "hello world"
    """
    saohua = client.ai_saohua(diff)
    print(f"AI 骚话:   {saohua.full_message}")

    # 查看所有类型
    types = client.list_types()
    print(f"\n支持 {types.count} 种 commit 类型:")
    for t in types.types:
        print(f"  {t.emoji} {t.value}: {t.label} — {t.description}")

    # 查看所有风格
    styles = client.list_styles()
    print(f"\n支持 {styles.count} 种骚话风格:")
    for s in styles.styles:
        print(f"  {s.emoji} {s.value}: {s.label} — {s.description}")

    # 统计数据
    stats = client.stats()
    print(f"\n骚话总数: {stats.total_messages}")
    print(f"支持语言: {', '.join(stats.supported_languages)}")

    # 健康检查
    health = client.health()
    print(f"\n服务状态: {health.status} (运行 {health.uptime:.0f}s)")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  3. 插件管理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

with SaohuaClient("http://localhost:3000") as client:
    # 查看已安装插件
    plugins = client.list_plugins()
    print(f"\n已安装 {plugins.count} 个插件")

    # 安装自定义插件
    my_plugin = {
        "name": "my-saohua-pack",
        "version": "1.0.0",
        "description": "我的骚话包",
        "author": "me",
        "messages": {
            "fix": {
                "love": ["修完 bug，心也修好了 💕"],
                "sao": ["bug 已修，帅气依旧 😎"],
            }
        },
    }
    result = client.install_plugin(my_plugin)
    print(f"安装插件: {result.name}")

    # 重载插件
    client.reload_plugins()
    print("插件已重载 ✅")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  4. 错误处理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from git_saohua import APIError, TimeoutError, NetworkError

try:
    client = SaohuaClient("http://localhost:3000", timeout=3)
    saohua = client.saohua_by_type("invalid_type")
except APIError as e:
    print(f"\nAPI 错误: {e.message} (HTTP {e.status_code})")
except TimeoutError:
    print("\n请求超时")
except NetworkError:
    print("\n网络连接失败")
finally:
    client.close()
