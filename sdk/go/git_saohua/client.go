package git_saohua

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/gorilla/websocket"
)

// Client Git Saohua API 客户端
type Client struct {
	httpClient *resty.Client
	baseURL    string
	apiKey     string
	bearerToken string
	headers     http.Header
}

// ClientOption 客户端配置选项
type ClientOption func(*Client)

// WithAPIKey 设置 API Key 认证
func WithAPIKey(apiKey string) ClientOption {
	return func(c *Client) {
		c.apiKey = apiKey
	}
}

// WithBearerToken 设置 Bearer Token 认证
func WithBearerToken(token string) ClientOption {
	return func(c *Client) {
		c.bearerToken = token
	}
}

// WithTimeout 设置请求超时
func WithTimeout(timeout time.Duration) ClientOption {
	return func(c *Client) {
		c.httpClient.SetTimeout(timeout)
	}
}

// NewClient 创建新的 API 客户端
func NewClient(baseURL string, options ...ClientOption) *Client {
	client := &Client{
		baseURL:    baseURL,
		httpClient: resty.New(),
		headers:     http.Header{},
	}

	// 应用配置选项
	for _, opt := range options {
		opt(client)
	}

	// 设置基础配置
	client.httpClient.SetBaseURL(baseURL)
	client.httpClient.SetHeader("Content-Type", "application/json")
	client.headers.Set("Content-Type", "application/json")

	// 设置认证
	if client.apiKey != "" {
		client.httpClient.SetHeader("X-API-Key", client.apiKey)
		client.headers.Set("X-API-Key", client.apiKey)
	}
	if client.bearerToken != "" {
		client.httpClient.SetHeader("Authorization", "Bearer "+client.bearerToken)
		client.headers.Set("Authorization", "Bearer "+client.bearerToken)
	}

	return client
}

// SetAPIKey 设置 API Key
func (c *Client) SetAPIKey(apiKey string) {
	c.apiKey = apiKey
	c.httpClient.SetHeader("X-API-Key", apiKey)
	c.headers.Set("X-API-Key", apiKey)
}

// SetBearerToken 设置 Bearer Token
func (c *Client) SetBearerToken(token string) {
	c.bearerToken = token
	c.httpClient.SetHeader("Authorization", "Bearer "+token)
	c.headers.Set("Authorization", "Bearer "+token)
}

// SetTimeout 设置超时时间
func (c *Client) SetTimeout(timeout time.Duration) {
	c.httpClient.SetTimeout(timeout)
}

// Close 关闭客户端（清理资源）
func (c *Client) Close() {
	c.httpClient.SetCloseClient(true)
}

func (c *Client) streamQuery(options StreamOptions) string {
	values := url.Values{}
	if options.Type != "" {
		values.Set("type", options.Type)
	}
	if options.Style != "" {
		values.Set("style", options.Style)
	}
	if options.Lang != "" {
		values.Set("lang", options.Lang)
	}
	if options.Count > 0 {
		values.Set("count", fmt.Sprintf("%d", options.Count))
	}
	if options.IntervalMs > 0 {
		values.Set("intervalMs", fmt.Sprintf("%d", options.IntervalMs))
	}
	return values.Encode()
}

func (c *Client) wsURL(path string, options StreamOptions) (string, error) {
	parsed, err := url.Parse(c.baseURL)
	if err != nil {
		return "", err
	}
	if parsed.Scheme == "https" {
		parsed.Scheme = "wss"
	} else {
		parsed.Scheme = "ws"
	}
	parsed.Path = path
	parsed.RawQuery = c.streamQuery(options)
	return parsed.String(), nil
}

func parseStreamEvent(eventType string, payload []byte) (*StreamEvent, error) {
	switch eventType {
	case "meta":
		var meta StreamSaohuaMeta
		if err := json.Unmarshal(payload, &meta); err != nil {
			return nil, err
		}
		return &StreamEvent{Type: "meta", Meta: &meta}, nil
	case "item":
		var item StreamSaohuaItem
		if err := json.Unmarshal(payload, &item); err != nil {
			return nil, err
		}
		return &StreamEvent{Type: "item", Item: &item}, nil
	case "done":
		var done StreamSaohuaDone
		if err := json.Unmarshal(payload, &done); err != nil {
			return nil, err
		}
		return &StreamEvent{Type: "done", Done: &done}, nil
	case "error":
		var streamErr StreamSaohuaError
		if err := json.Unmarshal(payload, &streamErr); err != nil {
			return nil, err
		}
		return &StreamEvent{Type: "error", Error: &streamErr}, nil
	default:
		return nil, nil
	}
}

// 通用响应结构
type APIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Error   string          `json:"error,omitempty"`
	Meta    ResponseMeta    `json:"meta,omitempty"`
}

type ResponseMeta struct {
	Timestamp string `json:"timestamp,omitempty"`
	Message   string `json:"message,omitempty"`
}

// 发送请求并解析响应
func (c *Client) doRequest(method, path string, body interface{}, result interface{}) error {
	req := c.httpClient.R()

	if body != nil {
		req.SetBody(body)
	}

	var resp *resty.Response
	var err error

	switch method {
	case "GET":
		resp, err = req.Get(path)
	case "POST":
		resp, err = req.Post(path)
	case "PUT":
		resp, err = req.Put(path)
	case "DELETE":
		resp, err = req.Delete(path)
	default:
		return fmt.Errorf("不支持的 HTTP 方法：%s", method)
	}

	if err != nil {
		return &NetworkError{
			Message: fmt.Sprintf("请求失败：%v", err),
			Err:     err,
		}
	}

	if resp.StatusCode() >= 400 {
		return &APIError{
			StatusCode: resp.StatusCode(),
			Message:    fmt.Sprintf("HTTP %d: %s", resp.StatusCode(), resp.String()),
		}
	}

	var apiResp APIResponse
	if err := json.Unmarshal(resp.Body(), &apiResp); err != nil {
		return fmt.Errorf("解析响应失败：%v", err)
	}

	if !apiResp.Success {
		return &APIError{
			StatusCode: resp.StatusCode(),
			Message:    apiResp.Error,
		}
	}

	if result != nil && len(apiResp.Data) > 0 {
		if err := json.Unmarshal(apiResp.Data, result); err != nil {
			return fmt.Errorf("解析数据失败：%v", err)
		}
	}

	return nil
}

// Health 健康检查
func (c *Client) Health() (*HealthData, error) {
	var result HealthData
	err := c.doRequest("GET", "/api/health", nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// RandomSaohua 随机生成骚话
func (c *Client) RandomSaohua(lang, style string) (*SaohuaData, error) {
	path := "/api/saohua"
	if style != "" {
		path += "?style=" + style
	}
	if lang != "" {
		if style != "" {
			path += "&lang=" + lang
		} else {
			path += "?lang=" + lang
		}
	}

	var result SaohuaData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// SaohuaByType 按类型生成骚话
func (c *Client) SaohuaByType(commitType, lang, style string) (*SaohuaData, error) {
	path := fmt.Sprintf("/api/saohua/%s", commitType)
	params := []string{}
	if style != "" {
		params = append(params, "style="+style)
	}
	if lang != "" {
		params = append(params, "lang="+lang)
	}
	if len(params) > 0 {
		path += "?" + joinStrings(params, "&")
	}

	var result SaohuaData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// SaohuaByTypeAndStyle 按类型 + 风格生成骚话
func (c *Client) SaohuaByTypeAndStyle(commitType, style, lang string) (*SaohuaData, error) {
	path := fmt.Sprintf("/api/saohua/%s/%s", commitType, style)
	if lang != "" {
		path += "?lang=" + lang
	}

	var result SaohuaData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// AiSaohua AI 智能生成骚话
func (c *Client) AiSaohua(diff, lang, style, commitType string) (*SaohuaData, error) {
	body := map[string]interface{}{
		"diff": diff,
	}
	if lang != "" {
		body["lang"] = lang
	}
	if style != "" {
		body["style"] = style
	}
	if commitType != "" {
		body["type"] = commitType
	}

	var result SaohuaData
	err := c.doRequest("POST", "/api/saohua/ai", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// BatchSaohua 批量生成骚话
func (c *Client) BatchSaohua(items []BatchSaohuaItem) (*BatchSaohuaResult, error) {
	body := map[string]interface{}{
		"items": items,
	}

	var result BatchSaohuaResult
	err := c.doRequest("POST", "/api/saohua/batch", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// StreamSaohua 通过 SSE 流式消费骚话事件
func (c *Client) StreamSaohua(options StreamOptions, handler func(StreamEvent) error) error {
	path := "/api/saohua/stream"
	if query := c.streamQuery(options); query != "" {
		path += "?" + query
	}

	resp, err := c.httpClient.R().
		SetDoNotParseResponse(true).
		SetHeader("Accept", "text/event-stream").
		Get(path)
	if err != nil {
		return &NetworkError{Message: fmt.Sprintf("SSE 请求失败：%v", err), Err: err}
	}
	defer resp.RawBody().Close()

	if resp.StatusCode() >= 400 {
		return &APIError{StatusCode: resp.StatusCode(), Message: fmt.Sprintf("HTTP %d: %s", resp.StatusCode(), resp.String())}
	}

	scanner := bufio.NewScanner(resp.RawBody())
	var eventType string
	var dataLines []string

	dispatch := func() error {
		if eventType == "" || len(dataLines) == 0 {
			return nil
		}
		event, err := parseStreamEvent(eventType, []byte(strings.Join(dataLines, "\n")))
		if err != nil {
			return err
		}
		if event != nil {
			if err := handler(*event); err != nil {
				return err
			}
		}
		eventType = ""
		dataLines = nil
		return nil
	}

	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			if err := dispatch(); err != nil {
				return err
			}
			continue
		}
		if strings.HasPrefix(line, "event:") {
			eventType = strings.TrimSpace(strings.TrimPrefix(line, "event:"))
		} else if strings.HasPrefix(line, "data:") {
			dataLines = append(dataLines, strings.TrimSpace(strings.TrimPrefix(line, "data:")))
		}
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	return dispatch()
}

// StreamSaohuaChan 通过 channel 返回 SSE 流式事件
func (c *Client) StreamSaohuaChan(options StreamOptions) (<-chan StreamEvent, <-chan error) {
	events := make(chan StreamEvent)
	errs := make(chan error, 1)
	go func() {
		defer close(events)
		defer close(errs)
		err := c.StreamSaohua(options, func(event StreamEvent) error {
			events <- event
			return nil
		})
		if err != nil {
			errs <- err
		}
	}()
	return events, errs
}

// StreamSaohuaWs 通过 WebSocket 流式消费骚话事件
func (c *Client) StreamSaohuaWs(options StreamOptions, handler func(StreamEvent) error) error {
	wsURL, err := c.wsURL("/api/saohua/ws", options)
	if err != nil {
		return err
	}
	headers := http.Header{}
	for key, values := range c.headers {
		for _, value := range values {
			headers.Add(key, value)
		}
	}

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, headers)
	if err != nil {
		return &NetworkError{Message: fmt.Sprintf("WebSocket 连接失败：%v", err), Err: err}
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				return nil
			}
			return &NetworkError{Message: fmt.Sprintf("WebSocket 读取失败：%v", err), Err: err}
		}

		var packet struct {
			Event string          `json:"event"`
			Data  json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(message, &packet); err != nil {
			return err
		}

		event, err := parseStreamEvent(packet.Event, packet.Data)
		if err != nil {
			return err
		}
		if event == nil {
			continue
		}
		if err := handler(*event); err != nil {
			return err
		}
		if event.Type == "done" {
			return nil
		}
	}
}

// StreamSaohuaWsChan 通过 channel 返回 WebSocket 流式事件
func (c *Client) StreamSaohuaWsChan(options StreamOptions) (<-chan StreamEvent, <-chan error) {
	events := make(chan StreamEvent)
	errs := make(chan error, 1)
	go func() {
		defer close(events)
		defer close(errs)
		err := c.StreamSaohuaWs(options, func(event StreamEvent) error {
			events <- event
			return nil
		})
		if err != nil {
			errs <- err
		}
	}()
	return events, errs
}

// AnalyzeNaturalLanguage 分析自然语言提交描述
func (c *Client) AnalyzeNaturalLanguage(text, lang string) (*NaturalLanguageAnalysisData, error) {
	body := map[string]interface{}{
		"text": text,
	}
	if lang != "" {
		body["lang"] = lang
	}

	var result NaturalLanguageAnalysisData
	err := c.doRequest("POST", "/api/saohua/natural/analyze", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// GenerateFromNaturalLanguage 从自然语言描述生成 commit 骚话
func (c *Client) GenerateFromNaturalLanguage(text, lang, style, commitType string) (*NaturalLanguageGenerateData, error) {
	body := map[string]interface{}{
		"text": text,
	}
	if lang != "" {
		body["lang"] = lang
	}
	if style != "" {
		body["style"] = style
	}
	if commitType != "" {
		body["type"] = commitType
	}

	var result NaturalLanguageGenerateData
	err := c.doRequest("POST", "/api/saohua/natural/generate", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// GenerateReleaseNotes 生成 release notes
func (c *Client) GenerateReleaseNotes(rangeValue, title, repo, tagName string) (*ReleaseNotesResult, error) {
	body := map[string]interface{}{}
	if rangeValue != "" {
		body["range"] = rangeValue
	}
	if title != "" {
		body["title"] = title
	}
	if repo != "" {
		body["repo"] = repo
	}
	if tagName != "" {
		body["tagName"] = tagName
	}

	var result ReleaseNotesResult
	err := c.doRequest("POST", "/api/release-notes/generate", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// GenerateReleaseManifest 生成 GitHub release manifest
func (c *Client) GenerateReleaseManifest(assetPaths []string, rangeValue, title, repo, tagName string) (*ReleaseManifestResult, error) {
	body := map[string]interface{}{
		"assetPaths": assetPaths,
	}
	if rangeValue != "" {
		body["range"] = rangeValue
	}
	if title != "" {
		body["title"] = title
	}
	if repo != "" {
		body["repo"] = repo
	}
	if tagName != "" {
		body["tagName"] = tagName
	}

	var result ReleaseManifestResult
	err := c.doRequest("POST", "/api/release-notes/manifest", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ListTypes 获取所有 commit 类型
func (c *Client) ListTypes(lang string) (*TypesData, error) {
	path := "/api/types"
	if lang != "" {
		path += "?lang=" + lang
	}

	var result TypesData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ListStyles 获取所有骚话风格
func (c *Client) ListStyles(lang string) (*StylesData, error) {
	path := "/api/styles"
	if lang != "" {
		path += "?lang=" + lang
	}

	var result StylesData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// Stats 获取统计数据
func (c *Client) Stats(lang string) (*StatsData, error) {
	path := "/api/stats"
	if lang != "" {
		path += "?lang=" + lang
	}

	var result StatsData
	err := c.doRequest("GET", path, nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ListPlugins 获取已安装插件
func (c *Client) ListPlugins() (*PluginsData, error) {
	var result PluginsData
	err := c.doRequest("GET", "/api/plugins", nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// InstallPlugin 安装插件
func (c *Client) InstallPlugin(data *PluginInstallRequest) (*PluginResult, error) {
	var result PluginResult
	err := c.doRequest("POST", "/api/plugins/install", data, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// RemovePlugin 删除插件
func (c *Client) RemovePlugin(name string) (*PluginResult, error) {
	body := map[string]string{"name": name}
	var result PluginResult
	err := c.doRequest("DELETE", "/api/plugins/remove", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// CreatePluginTemplate 创建插件模板
func (c *Client) CreatePluginTemplate(name, version, author, description string) (*PluginTemplate, error) {
	body := map[string]string{
		"name":        name,
		"version":     version,
		"author":      author,
		"description": description,
	}
	var result PluginTemplate
	err := c.doRequest("POST", "/api/plugins/create", body, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ReloadPlugins 重载插件数据
func (c *Client) ReloadPlugins() (*PluginResult, error) {
	var result PluginResult
	err := c.doRequest("POST", "/api/plugins/reload", nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// 辅助函数：连接字符串
func joinStrings(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	result := strs[0]
	for i := 1; i < len(strs); i++ {
		result += sep + strs[i]
	}
	return result
}

// Context 支持的方法（带上下文）

// HealthWithContext 健康检查（带上下文）
func (c *Client) HealthWithContext(ctx context.Context) (*HealthData, error) {
	var result HealthData
	resp, err := c.httpClient.R().SetContext(ctx).Get("/api/health")
	if err != nil {
		return nil, &NetworkError{Message: fmt.Sprintf("请求失败：%v", err), Err: err}
	}
	if resp.StatusCode() >= 400 {
		return nil, &APIError{StatusCode: resp.StatusCode(), Message: resp.String()}
	}
	var apiResp APIResponse
	if err := json.Unmarshal(resp.Body(), &apiResp); err != nil {
		return nil, err
	}
	if !apiResp.Success {
		return nil, &APIError{StatusCode: resp.StatusCode(), Message: apiResp.Error}
	}
	if err := json.Unmarshal(apiResp.Data, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
