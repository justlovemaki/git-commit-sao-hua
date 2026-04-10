# git-saohua-go 🎉

> Go SDK for [Git Saohua API](https://github.com/justlovemaki/git-commit-sao-hua) — 让每一次 git commit 都带着灵魂

## 安装

```bash
go get github.com/justlovemaki/git-saohua-go
```

## 快速开始

```go
package main

import (
    "fmt"
    "github.com/justlovemaki/git-saohua-go/git_saohua"
)

func main() {
    // 连接 API 服务
    client := git_saohua.NewClient("http://localhost:3000")
    defer client.Close()

    // 随机骚话
    saohua, err := client.RandomSaohua()
    if err != nil {
        panic(err)
    }
    fmt.Println(saohua.FullMessage)
    // => fix: 修 bug 和撩你，我都在行

    // 指定类型 + 风格
    saohua, err = client.SaohuaByTypeAndStyle("feat", "love")
    if err != nil {
        panic(err)
    }
    fmt.Println(saohua.Message)
    // => 新功能上线，是送你的礼物 💕
}
```

## API 方法

### 骚话生成

| 方法 | 说明 |
|------|------|
| `RandomSaohua(lang?, style?)` | 随机生成骚话 |
| `SaohuaByType(type, lang?, style?)` | 按 commit 类型生成 |
| `SaohuaByTypeAndStyle(type, style, lang?)` | 按类型 + 风格生成 |
| `AiSaohua(diff, lang?, style?, commitType?)` | AI 智能生成（基于 git diff） |

### 类型与风格

| 方法 | 说明 |
|------|------|
| `ListTypes(lang?)` | 获取所有 commit 类型 |
| `ListStyles(lang?)` | 获取所有骚话风格 |
| `Stats(lang?)` | 获取统计数据 |

### 插件管理

| 方法 | 说明 |
|------|------|
| `ListPlugins()` | 获取已安装插件 |
| `InstallPlugin(data)` | 安装插件 |
| `RemovePlugin(name)` | 删除插件 |
| `CreatePluginTemplate(name, ...)` | 创建插件模板 |
| `ReloadPlugins()` | 重载插件数据 |

### 其他

| 方法 | 说明 |
|------|------|
| `Health()` | 健康检查 |

## AI 智能生成

```go
diff := `
diff --git a/app.py b/app.py
+func newFeature() string {
+    return "hello world"
+}
`

saohua, err := client.AiSaohua(diff)
if err != nil {
    panic(err)
}
fmt.Println(saohua.FullMessage)
```

## 插件管理

```go
// 安装自定义骚话包
pluginData := &git_saohua.PluginInstallRequest{
    Name:    "my-pack",
    Version: "1.0.0",
    Messages: map[string]map[string][]string{
        "fix": {
            "love": {"修完 bug，心也修好了 💕"},
        },
    },
}
result, err := client.InstallPlugin(pluginData)
if err != nil {
    panic(err)
}
fmt.Println(result.Message)

// 查看已安装插件
plugins, err := client.ListPlugins()
if err != nil {
    panic(err)
}
for _, p := range plugins.Plugins {
    fmt.Printf("%s v%s\n", p.Name, p.Version)
}
```

## 错误处理

```go
client := git_saohua.NewClient("http://localhost:3000")
client.SetTimeout(3 * time.Second)

saohua, err := client.SaohuaByType("invalid")
if err != nil {
    if apiErr, ok := err.(*git_saohua.APIError); ok {
        fmt.Printf("API 错误：%s (HTTP %d)\n", apiErr.Message, apiErr.StatusCode)
    } else if netErr, ok := err.(*git_saohua.NetworkError); ok {
        fmt.Printf("网络错误：%s\n", netErr.Message)
    } else {
        fmt.Printf("未知错误：%v\n", err)
    }
}
```

## 数据模型

所有返回值都是类型化的 struct：

- `SaohuaData` — 骚话数据（Type, Style, Message, FullMessage, Language）
- `HealthData` — 健康数据（Status, Uptime, Version, Memory）
- `TypesData` / `TypeInfo` — 类型列表
- `StylesData` / `StyleInfo` — 风格列表
- `StatsData` — 统计数据
- `PluginsData` / `PluginInfo` — 插件列表
- `PluginResult` — 插件操作结果

## 运行测试

```bash
cd sdk/go
go test ./tests/ -v
```

## 环境要求

- Go >= 1.21
- resty v2.11.0+

## License

MIT
