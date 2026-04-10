package tests

import (
	"os"
	"testing"
	"time"

	"github.com/justlovemaki/git-saohua-go/git_saohua"
)

func getTestBaseURL() string {
	baseURL := os.Getenv("SAOHUA_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000"
	}
	return baseURL
}

func TestHealth(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	health, err := client.Health()
	if err != nil {
		t.Fatalf("Health check failed: %v", err)
	}

	if health.Status != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", health.Status)
	}

	if health.Version == "" {
		t.Error("Expected version to be set")
	}

	t.Logf("Health: %s (uptime: %.2fs, version: %s)", health.Status, health.Uptime, health.Version)
}

func TestRandomSaohua(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	saohua, err := client.RandomSaohua("", "")
	if err != nil {
		t.Fatalf("RandomSaohua failed: %v", err)
	}

	if saohua.Message == "" {
		t.Error("Expected message to be non-empty")
	}

	if saohua.FullMessage == "" {
		t.Error("Expected fullMessage to be non-empty")
	}

	t.Logf("Random: %s", saohua.FullMessage)
}

func TestRandomSaohuaWithStyle(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	saohua, err := client.RandomSaohua("zh-CN", "love")
	if err != nil {
		t.Fatalf("RandomSaohua with style failed: %v", err)
	}

	if saohua.Style != "love" {
		t.Errorf("Expected style 'love', got '%s'", saohua.Style)
	}

	t.Logf("Love style: %s", saohua.FullMessage)
}

func TestSaohuaByType(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	saohua, err := client.SaohuaByType("fix", "zh-CN", "")
	if err != nil {
		t.Fatalf("SaohuaByType failed: %v", err)
	}

	if saohua.Type != "fix" {
		t.Errorf("Expected type 'fix', got '%s'", saohua.Type)
	}

	t.Logf("Fix type: %s", saohua.FullMessage)
}

func TestSaohuaByTypeAndStyle(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	saohua, err := client.SaohuaByTypeAndStyle("feat", "love", "zh-CN")
	if err != nil {
		t.Fatalf("SaohuaByTypeAndStyle failed: %v", err)
	}

	if saohua.Type != "feat" {
		t.Errorf("Expected type 'feat', got '%s'", saohua.Type)
	}

	if saohua.Style != "love" {
		t.Errorf("Expected style 'love', got '%s'", saohua.Style)
	}

	t.Logf("Feat + Love: %s", saohua.FullMessage)
}

func TestListTypes(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	types, err := client.ListTypes("zh-CN")
	if err != nil {
		t.Fatalf("ListTypes failed: %v", err)
	}

	if types.Count == 0 {
		t.Error("Expected types count > 0")
	}

	t.Logf("Types: %d total", types.Count)
	for i, typ := range types.Types {
		if i < 3 {
			t.Logf("  - %s: %s (%s)", typ.Value, typ.Label, typ.Emoji)
		}
	}
}

func TestListStyles(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	styles, err := client.ListStyles("zh-CN")
	if err != nil {
		t.Fatalf("ListStyles failed: %v", err)
	}

	if styles.Count == 0 {
		t.Error("Expected styles count > 0")
	}

	t.Logf("Styles: %d total", styles.Count)
	for _, style := range styles.Styles {
		t.Logf("  - %s: %s (%s)", style.Value, style.Label, style.Emoji)
	}
}

func TestStats(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	stats, err := client.Stats("zh-CN")
	if err != nil {
		t.Fatalf("Stats failed: %v", err)
	}

	if stats.TotalTypes == 0 {
		t.Error("Expected totalTypes > 0")
	}

	if stats.TotalStyles == 0 {
		t.Error("Expected totalStyles > 0")
	}

	t.Logf("Stats: %d types, %d styles, %d langs", stats.TotalTypes, stats.TotalStyles, stats.TotalLangs)
}

func TestAiSaohua(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	diff := `
diff --git a/app.py b/app.py
+def new_feature():
+    return "hello world"
`

	saohua, err := client.AiSaohua(diff, "zh-CN", "", "")
	if err != nil {
		t.Fatalf("AiSaohua failed: %v", err)
	}

	if saohua.Message == "" {
		t.Error("Expected AI message to be non-empty")
	}

	t.Logf("AI generated: %s", saohua.FullMessage)
}

func TestListPlugins(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	plugins, err := client.ListPlugins()
	if err != nil {
		t.Fatalf("ListPlugins failed: %v", err)
	}

	t.Logf("Plugins: %d installed", plugins.Count)
}

func TestPluginLifecycle(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	// Install plugin
	pluginData := &git_saohua.PluginInstallRequest{
		Name:    "test-pack",
		Version: "1.0.0",
		Messages: map[string]map[string][]string{
			"fix": {
				"love": {"测试骚话 💕"},
			},
		},
	}

	installResult, err := client.InstallPlugin(pluginData)
	if err != nil {
		t.Fatalf("InstallPlugin failed: %v", err)
	}
	t.Logf("Install: %s", installResult.Message)

	// List plugins
	plugins, err := client.ListPlugins()
	if err != nil {
		t.Fatalf("ListPlugins failed: %v", err)
	}

	found := false
	for _, p := range plugins.Plugins {
		if p.Name == "test-pack" {
			found = true
			break
		}
	}
	if !found {
		t.Error("Expected to find installed plugin")
	}

	// Remove plugin
	removeResult, err := client.RemovePlugin("test-pack")
	if err != nil {
		t.Fatalf("RemovePlugin failed: %v", err)
	}
	t.Logf("Remove: %s", removeResult.Message)
}

func TestCreatePluginTemplate(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	template, err := client.CreatePluginTemplate(
		"my-plugin",
		"1.0.0",
		"Test Author",
		"Test Description",
	)
	if err != nil {
		t.Fatalf("CreatePluginTemplate failed: %v", err)
	}

	if template.Name != "my-plugin" {
		t.Errorf("Expected name 'my-plugin', got '%s'", template.Name)
	}

	t.Logf("Template created: %s v%s", template.Name, template.Version)
}

func TestReloadPlugins(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	result, err := client.ReloadPlugins()
	if err != nil {
		t.Fatalf("ReloadPlugins failed: %v", err)
	}

	t.Logf("Reload: %s", result.Message)
}

func TestTimeout(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL(), git_saohua.WithTimeout(1*time.Millisecond))
	defer client.Close()

	_, err := client.Health()
	if err == nil {
		t.Error("Expected timeout error")
	} else {
		t.Logf("Timeout error (expected): %v", err)
	}
}

func TestInvalidEndpoint(t *testing.T) {
	client := git_saohua.NewClient("http://invalid-host-12345:9999")
	defer client.Close()

	_, err := client.Health()
	if err == nil {
		t.Error("Expected network error")
	} else {
		t.Logf("Network error (expected): %v", err)
	}
}

func TestWithContext(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	health, err := client.HealthWithContext(nil)
	if err != nil {
		t.Fatalf("HealthWithContext failed: %v", err)
	}

	if health.Status != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", health.Status)
	}

	t.Logf("Context health: %s", health.Status)
}
