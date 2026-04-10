package git_saohua

import "time"

// SaohuaData 骚话数据
type SaohuaData struct {
	Type        string `json:"type"`
	Style       string `json:"style"`
	Message     string `json:"message"`
	FullMessage string `json:"fullMessage"`
	Language    string `json:"language"`
}

// HealthData 健康检查数据
type HealthData struct {
	Status  string                 `json:"status"`
	Uptime  float64                `json:"uptime"`
	Memory  map[string]interface{} `json:"memory"`
	Version string                 `json:"version"`
}

// TypeInfo 类型信息
type TypeInfo struct {
	Value       string `json:"value"`
	Label       string `json:"label"`
	Emoji       string `json:"emoji"`
	Description string `json:"description"`
}

// TypesData 类型列表
type TypesData struct {
	Types []TypeInfo `json:"types"`
	Count int        `json:"count"`
}

// StyleInfo 风格信息
type StyleInfo struct {
	Value       string `json:"value"`
	Label       string `json:"label"`
	Emoji       string `json:"emoji"`
	Description string `json:"description"`
}

// StylesData 风格列表
type StylesData struct {
	Styles []StyleInfo `json:"styles"`
	Count  int         `json:"count"`
}

// StatsData 统计数据
type StatsData struct {
	TotalTypes  int `json:"totalTypes"`
	TotalStyles int `json:"totalStyles"`
	TotalLangs  int `json:"totalLangs"`
}

// PluginInfo 插件信息
type PluginInfo struct {
	Name        string    `json:"name"`
	Version     string    `json:"version"`
	Author      string    `json:"author"`
	Description string    `json:"description"`
	InstalledAt time.Time `json:"installedAt"`
}

// PluginsData 插件列表
type PluginsData struct {
	Plugins []PluginInfo `json:"plugins"`
	Count   int          `json:"count"`
}

// PluginInstallRequest 插件安装请求
type PluginInstallRequest struct {
	Name     string                       `json:"name"`
	Version  string                       `json:"version"`
	Author   string                       `json:"author,omitempty"`
	Messages map[string]map[string][]string `json:"messages"`
}

// PluginResult 插件操作结果
type PluginResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// PluginTemplate 插件模板
type PluginTemplate struct {
	Name        string                       `json:"name"`
	Version     string                       `json:"version"`
	Author      string                       `json:"author"`
	Description string                       `json:"description"`
	Messages    map[string]map[string][]string `json:"messages"`
	CreatedAt   string                       `json:"createdAt"`
}

// AIRequest AI 生成请求
type AIRequest struct {
	Diff       string `json:"diff"`
	Language   string `json:"lang,omitempty"`
	Style      string `json:"style,omitempty"`
	CommitType string `json:"type,omitempty"`
}

// APIError API 错误
type APIError struct {
	StatusCode int
	Message    string
}

func (e *APIError) Error() string {
	return e.Message
}

// NetworkError 网络错误
type NetworkError struct {
	Message string
	Err     error
}

func (e *NetworkError) Error() string {
	return e.Message
}

func (e *NetworkError) Unwrap() error {
	return e.Err
}

// TimeoutError 超时错误
type TimeoutError struct {
	Message string
}

func (e *TimeoutError) Error() string {
	return e.Message
}
