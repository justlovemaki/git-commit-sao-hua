package tests

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/justlovemaki/git-saohua-go/git_saohua"
	"github.com/gorilla/websocket"
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

func TestAnalyzeNaturalLanguage(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	result, err := client.AnalyzeNaturalLanguage("修复登录按钮点击无效", "zh-CN")
	if err != nil {
		t.Fatalf("AnalyzeNaturalLanguage failed: %v", err)
	}

	if result.DetectedType == "" {
		t.Error("Expected detectedType to be non-empty")
	}

	if result.Topic == "" {
		t.Error("Expected topic to be non-empty")
	}

	t.Logf("Natural analysis: %s -> %s", result.DetectedType, result.Topic)
}

func TestGenerateFromNaturalLanguage(t *testing.T) {
	client := git_saohua.NewClient(getTestBaseURL())
	defer client.Close()

	result, err := client.GenerateFromNaturalLanguage("新增分享海报下载功能", "zh-CN", "love", "feat")
	if err != nil {
		t.Fatalf("GenerateFromNaturalLanguage failed: %v", err)
	}

	if result.Type != "feat" {
		t.Errorf("Expected type 'feat', got '%s'", result.Type)
	}

	if result.Style != "love" {
		t.Errorf("Expected style 'love', got '%s'", result.Style)
	}

	if result.FullMessage == "" {
		t.Error("Expected fullMessage to be non-empty")
	}

	t.Logf("Natural generated: %s", result.FullMessage)
}

func TestGenerateReleaseNotes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/release-notes/generate" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"markdown":"# v1.1.0","data":{"title":"v1.1.0"},"repo":"justlovemaki/git-commit-sao-hua","githubRelease":{"tag_name":"v1.1.0"},"totalCommits":2}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.GenerateReleaseNotes("v1.0.0..HEAD", "v1.1.0", "justlovemaki/git-commit-sao-hua", "v1.1.0")
	if err != nil {
		t.Fatalf("GenerateReleaseNotes failed: %v", err)
	}
	if result.TotalCommits != 2 {
		t.Fatalf("expected total commits 2, got %d", result.TotalCommits)
	}
}

func TestGenerateReleaseManifest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/release-notes/manifest" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"success":true,"githubRelease":{"tag_name":"v1.1.0"},"assets":[{"name":"README.md","path":"/tmp/README.md","size":1,"sha256":"abc","contentType":"text/markdown"}]}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.GenerateReleaseManifest([]string{"README.md"}, "", "v1.1.0", "", "v1.1.0")
	if err != nil {
		t.Fatalf("GenerateReleaseManifest failed: %v", err)
	}
	if len(result.Assets) != 1 || result.Assets[0].Name != "README.md" {
		t.Fatalf("unexpected assets: %+v", result.Assets)
	}
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

func TestStreamSaohua(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/saohua/stream" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if r.URL.Query().Get("type") != "fix" {
			t.Fatalf("expected type=fix, got %s", r.URL.Query().Get("type"))
		}
		w.Header().Set("Content-Type", "text/event-stream")
		fmt.Fprint(w, "event: meta\n")
		fmt.Fprint(w, "data: {\"count\":2,\"interval\":100,\"language\":\"zh-CN\"}\n\n")
		fmt.Fprint(w, "event: item\n")
		fmt.Fprint(w, "data: {\"type\":\"fix\",\"style\":\"sao\",\"message\":\"修好了\",\"fullMessage\":\"fix: 修好了\",\"language\":\"zh-CN\",\"index\":1}\n\n")
		fmt.Fprint(w, "event: done\n")
		fmt.Fprint(w, "data: {\"total\":1}\n\n")
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	seen := []string{}
	err := client.StreamSaohua(git_saohua.StreamOptions{Type: "fix", Count: 2, IntervalMs: 100}, func(event git_saohua.StreamEvent) error {
		seen = append(seen, event.Type)
		return nil
	})
	if err != nil {
		t.Fatalf("StreamSaohua failed: %v", err)
	}
	if strings.Join(seen, ",") != "meta,item,done" {
		t.Fatalf("unexpected event order: %v", seen)
	}
}

func TestStreamSaohuaChan(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		fmt.Fprint(w, "event: meta\n")
		fmt.Fprint(w, "data: {\"count\":1,\"interval\":50,\"language\":\"zh-CN\"}\n\n")
		fmt.Fprint(w, "event: done\n")
		fmt.Fprint(w, "data: {\"total\":0}\n\n")
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	events, errs := client.StreamSaohuaChan(git_saohua.StreamOptions{})
	seen := []string{}
	for event := range events {
		seen = append(seen, event.Type)
	}
	if err := <-errs; err != nil {
		t.Fatalf("StreamSaohuaChan failed: %v", err)
	}
	if strings.Join(seen, ",") != "meta,done" {
		t.Fatalf("unexpected channel events: %v", seen)
	}
}

func TestStreamSaohuaWs(t *testing.T) {
	upgrader := websocket.Upgrader{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/saohua/ws" {
			http.NotFound(w, r)
			return
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("upgrade failed: %v", err)
		}
		defer conn.Close()
		_ = conn.WriteJSON(map[string]interface{}{"event": "meta", "data": map[string]interface{}{"count": 2, "interval": 100, "language": "zh-CN"}})
		_ = conn.WriteJSON(map[string]interface{}{"event": "item", "data": map[string]interface{}{"type": "fix", "style": "sao", "message": "修复完成", "fullMessage": "fix: 修复完成", "language": "zh-CN", "index": 1}})
		_ = conn.WriteJSON(map[string]interface{}{"event": "done", "data": map[string]interface{}{"total": 1}})
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	seen := []string{}
	err := client.StreamSaohuaWs(git_saohua.StreamOptions{Type: "fix", Count: 2}, func(event git_saohua.StreamEvent) error {
		seen = append(seen, event.Type)
		return nil
	})
	if err != nil {
		t.Fatalf("StreamSaohuaWs failed: %v", err)
	}
	if strings.Join(seen, ",") != "meta,item,done" {
		t.Fatalf("unexpected websocket events: %v", seen)
	}
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
