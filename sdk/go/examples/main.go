package main

import (
	"fmt"
	"github.com/justlovemaki/git-saohua-go/git_saohua"
)

func main() {
	// 创建客户端
	client := git_saohua.NewClient("http://localhost:3000")
	defer client.Close()

	fmt.Println("=== Git Saohua Go SDK 示例 ===\n")

	// 1. 健康检查
	fmt.Println("1. 健康检查")
	health, err := client.Health()
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   状态：%s | 版本：%s | 运行时间：%.2fs\n\n", health.Status, health.Version, health.Uptime)
	}

	// 2. 随机骚话
	fmt.Println("2. 随机骚话")
	saohua, err := client.RandomSaohua("", "")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   %s\n\n", saohua.FullMessage)
	}

	// 3. 指定类型
	fmt.Println("3. 指定类型 (feat)")
	saohua, err = client.SaohuaByType("feat", "zh-CN", "")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   %s\n\n", saohua.FullMessage)
	}

	// 4. 类型 + 风格
	fmt.Println("4. 类型 + 风格 (fix + love)")
	saohua, err = client.SaohuaByTypeAndStyle("fix", "love", "zh-CN")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   %s\n\n", saohua.FullMessage)
	}

	// 5. 获取所有类型
	fmt.Println("5. 所有 Commit 类型")
	types, err := client.ListTypes("zh-CN")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   共 %d 种类型:\n", types.Count)
		for _, t := range types.Types {
			fmt.Printf("   - %s %s: %s\n", t.Emoji, t.Value, t.Description)
		}
		fmt.Println()
	}

	// 6. 获取所有风格
	fmt.Println("6. 所有骚话风格")
	styles, err := client.ListStyles("zh-CN")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   共 %d 种风格:\n", styles.Count)
		for _, s := range styles.Styles {
			fmt.Printf("   - %s %s: %s\n", s.Emoji, s.Value, s.Description)
		}
		fmt.Println()
	}

	// 7. 统计数据
	fmt.Println("7. 统计数据")
	stats, err := client.Stats("zh-CN")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   类型：%d | 风格：%d | 语言：%d\n\n", stats.TotalTypes, stats.TotalStyles, stats.TotalLangs)
	}

	// 8. AI 生成
	fmt.Println("8. AI 智能生成")
	diff := `
diff --git a/main.go b/main.go
+func main() {
+    fmt.Println("Hello, World!")
+}
`
	saohua, err = client.AiSaohua(diff, "zh-CN", "", "")
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   %s\n\n", saohua.FullMessage)
	}

	// 9. 插件管理
	fmt.Println("9. 插件管理")
	plugins, err := client.ListPlugins()
	if err != nil {
		fmt.Printf("   错误：%v\n", err)
	} else {
		fmt.Printf("   已安装 %d 个插件:\n", plugins.Count)
		for _, p := range plugins.Plugins {
			fmt.Printf("   - %s v%s (作者：%s)\n", p.Name, p.Version, p.Author)
		}
		fmt.Println()
	}

	fmt.Println("=== 示例结束 ===")
}
