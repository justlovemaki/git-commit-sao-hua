package git_saohua

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-resty/resty/v2"
)

// Client Git Saohua API 客户端
type Client struct {
	httpClient *resty.Client
	baseURL    string
	apiKey     string
	bearerToken string
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
	}

	// 应用配置选项
	for _, opt := range options {
		opt(client)
	}

	// 设置基础配置
	client.httpClient.SetBaseURL(baseURL)
	client.httpClient.SetHeader("Content-Type", "application/json")

	// 设置认证
	if client.apiKey != "" {
		client.httpClient.SetHeader("X-API-Key", client.apiKey)
	}
	if client.bearerToken != "" {
		client.httpClient.SetHeader("Authorization", "Bearer "+client.bearerToken)
	}

	return client
}

// SetAPIKey 设置 API Key
func (c *Client) SetAPIKey(apiKey string) {
	c.apiKey = apiKey
	c.httpClient.SetHeader("X-API-Key", apiKey)
}

// SetBearerToken 设置 Bearer Token
func (c *Client) SetBearerToken(token string) {
	c.bearerToken = token
	c.httpClient.SetHeader("Authorization", "Bearer "+token)
}

// SetTimeout 设置超时时间
func (c *Client) SetTimeout(timeout time.Duration) {
	c.httpClient.SetTimeout(timeout)
}

// Close 关闭客户端（清理资源）
func (c *Client) Close() {
	c.httpClient.SetCloseClient(true)
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
