package tests

import (
	"encoding/json"
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

func TestGenerateChatOpsPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/integrations/chatops/saohua" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"target":"slack","text":"Git Commit 骚话","payload":{"text":"feat: 新功能也想和你贴贴"},"meta":{"source":"saohua","type":"feat","style":"love","language":"zh-CN","supportedTargets":["plain","slack"]}}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.GenerateChatOpsPayload("zh-CN", "love", "feat", "slack")
	if err != nil {
		t.Fatalf("GenerateChatOpsPayload failed: %v", err)
	}
	if result.Target != "slack" || result.Payload["text"] != "feat: 新功能也想和你贴贴" {
		t.Fatalf("unexpected chatops payload: %+v", result)
	}
}

func TestGenerateChatOpsPayloadFromNaturalLanguage(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/integrations/chatops/natural" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"target":"github-comment","text":"Git Commit 骚话","payload":{"body":"fix: 这次修复比夜色还丝滑"},"meta":{"source":"natural-language","type":"fix","style":"sao","language":"zh-CN","supportedTargets":["plain","github-comment"]}}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.GenerateChatOpsPayloadFromNaturalLanguage("修复登录异常", "zh-CN", "", "", "github-comment")
	if err != nil {
		t.Fatalf("GenerateChatOpsPayloadFromNaturalLanguage failed: %v", err)
	}
	if result.Meta["source"] != "natural-language" {
		t.Fatalf("unexpected source: %+v", result.Meta)
	}
}

func TestDeliverChatOpsPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/integrations/chatops/saohua/deliver" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"envelope":{"target":"slack","text":"Git Commit 骚话","payload":{"text":"feat: 新功能也想和你贴贴"},"meta":{"source":"saohua","type":"feat","style":"love","language":"zh-CN","supportedTargets":["plain","slack"]}},"delivery":{"ok":true,"status":200,"statusText":"OK","target":"slack","url":"https://hooks.slack.test/abc","attemptedAt":"2026-04-29T02:20:00.000Z","durationMs":12,"responseBody":"ok","payload":{"text":"feat: 新功能也想和你贴贴"}}}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.DeliverChatOpsPayload("zh-CN", "love", "feat", "slack", "https://hooks.slack.test/abc", nil, 0, "", "X-Test-Signature")
	if err != nil {
		t.Fatalf("DeliverChatOpsPayload failed: %v", err)
	}
	if !result.Delivery.OK || result.Envelope.Target != "slack" {
		t.Fatalf("unexpected delivery result: %+v", result)
	}
}

func TestGenerateReleaseNotes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/release-notes/generate" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		var body map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("decode body failed: %v", err)
		}
		if body["tagName"] != "v1.1.0" || body["body"] != "Release body" || body["targetCommitish"] != "main" {
			t.Fatalf("unexpected release request body: %+v", body)
		}
		if body["draft"] != true || body["prerelease"] != true || body["enrich"] != false || body["enrichGitHub"] != true {
			t.Fatalf("unexpected release flags: %+v", body)
		}
		if body["githubToken"] != "ghs_demo" || body["repoPath"] != "fixtures/release-repo" {
			t.Fatalf("unexpected release github payload: %+v", body)
		}
		fmt.Fprint(w, `{"success":true,"data":{"markdown":"# v1.1.0","data":{"title":"v1.1.0"},"repo":"justlovemaki/git-commit-sao-hua","githubRelease":{"tag_name":"v1.1.0"},"totalCommits":2}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	draft := true
	prerelease := true
	enrich := false
	enrichGitHub := true
	result, err := client.GenerateReleaseNotes(git_saohua.ReleaseNotesOptions{
		Range:           "v1.0.0..HEAD",
		Title:           "v1.1.0",
		Repo:            "justlovemaki/git-commit-sao-hua",
		TagName:         "v1.1.0",
		Body:            "Release body",
		TargetCommitish: "main",
		Draft:           &draft,
		Prerelease:      &prerelease,
		Enrich:          &enrich,
		EnrichGitHub:    &enrichGitHub,
		GitHubToken:     "ghs_demo",
		GitHubMetadata: map[string]interface{}{
			"prs": map[string]interface{}{
				"12": map[string]interface{}{"labels": []string{"release"}},
			},
		},
		RepoPath: "fixtures/release-repo",
	})
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
		var body map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("decode body failed: %v", err)
		}
		assets, ok := body["assetPaths"].([]interface{})
		if !ok || len(assets) != 1 || assets[0] != "README.md" {
			t.Fatalf("unexpected asset paths: %+v", body)
		}
		if body["githubToken"] != "ghs_demo" || body["repoPath"] != "fixtures/release-repo" {
			t.Fatalf("unexpected manifest payload: %+v", body)
		}
		fmt.Fprint(w, `{"success":true,"data":{"success":true,"githubRelease":{"tag_name":"v1.1.0"},"assets":[{"name":"README.md","path":"/tmp/README.md","size":1,"sha256":"abc","contentType":"text/markdown"}]}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	draft := true
	prerelease := true
	enrich := false
	enrichGitHub := true
	result, err := client.GenerateReleaseManifest([]string{"README.md"}, git_saohua.ReleaseNotesOptions{
		TagName:         "v1.1.0",
		Body:            "Release body",
		TargetCommitish: "main",
		Draft:           &draft,
		Prerelease:      &prerelease,
		Enrich:          &enrich,
		EnrichGitHub:    &enrichGitHub,
		GitHubToken:     "ghs_demo",
		RepoPath:        "fixtures/release-repo",
	})
	if err != nil {
		t.Fatalf("GenerateReleaseManifest failed: %v", err)
	}
	if len(result.Assets) != 1 || result.Assets[0].Name != "README.md" {
		t.Fatalf("unexpected manifest result: %+v", result)
	}
}

func TestValidatePluginAuthorPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/plugin-author/validate" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"valid":true,"plugin":{"name":"romantic-pack"},"checksum":"abc","signingChecksum":"def","fileSize":120}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.ValidatePluginAuthorPayload(&git_saohua.PluginAuthorPayload{
		Plugin: map[string]interface{}{
			"name":    "romantic-pack",
			"version": "1.0.0",
			"data": map[string]interface{}{"zh-CN": map[string]interface{}{"feat": map[string]interface{}{"love": []string{"hi"}}}},
		},
	})
	if err != nil {
		t.Fatalf("ValidatePluginAuthorPayload failed: %v", err)
	}
	if !result.Valid || result.FileSize != 120 {
		t.Fatalf("unexpected validation result: %+v", result)
	}
}

func TestGeneratePluginReleaseKit(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/plugin-author/release-kit" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		fmt.Fprint(w, `{"success":true,"data":{"success":true,"plugin":{"name":"release-pack"},"summary":{"name":"release-pack"},"metadata":{"name":"release-pack"},"indexEntry":{"name":"release-pack"},"checklist":{"passed":true},"submissionMarkdown":"# Plugin Submission: release-pack"}}`)
	}))
	defer server.Close()

	client := git_saohua.NewClient(server.URL)
	defer client.Close()

	result, err := client.GeneratePluginReleaseKit(&git_saohua.PluginAuthorPayload{PluginJSON: `{"name":"release-pack","version":"1.0.0","data":{"zh-CN":{"feat":{"love":["x"]}}}}`})
	if err != nil {
		t.Fatalf("GeneratePluginReleaseKit failed: %v", err)
	}
	if !strings.Contains(result.SubmissionMarkdown, "release-pack") {
		t.Fatalf("unexpected submission markdown: %s", result.SubmissionMarkdown)
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
