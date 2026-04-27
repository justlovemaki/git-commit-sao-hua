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

// BatchSaohuaItem 批量生成请求项
type BatchSaohuaItem struct {
	Mode       string `json:"mode,omitempty"`
	Type      string `json:"type,omitempty"`
	Style     string `json:"style,omitempty"`
	Lang      string `json:"lang,omitempty"`
	Diff      string `json:"diff,omitempty"`
}

// BatchSaohuaResultItem 批量生成结果项
type BatchSaohuaResultItem struct {
	Success    bool   `json:"success"`
	Type      string `json:"type,omitempty"`
	Style     string `json:"style,omitempty"`
	Message   string `json:"message,omitempty"`
	FullMessage string `json:"fullMessage,omitempty"`
	Language  string `json:"language,omitempty"`
	Error     string `json:"error,omitempty"`
}

// BatchSaohuaResult 批量生成结果
type BatchSaohuaResult struct {
	Items        []BatchSaohuaResultItem `json:"items"`
	Count        int                 `json:"count"`
	SuccessCount int                 `json:"successCount"`
	FailedCount int                 `json:"failedCount"`
}

// NaturalLanguageAnalysisData 自然语言分析结果
type NaturalLanguageAnalysisData struct {
	NaturalText   string `json:"naturalText"`
	DetectedType  string `json:"detectedType"`
	DetectedStyle string `json:"detectedStyle"`
	Topic         string `json:"topic"`
	Confidence    string `json:"confidence"`
	Reason        string `json:"reason"`
	Language      string `json:"language"`
}

// NaturalLanguageGenerateData 自然语言生成结果
type NaturalLanguageGenerateData struct {
	NaturalLanguageAnalysisData
	Type        string `json:"type"`
	Style       string `json:"style"`
	Message     string `json:"message"`
	FullMessage string `json:"fullMessage"`
}

// ReleaseNotesResult release notes 生成结果
type ReleaseNotesResult struct {
	Markdown      string                 `json:"markdown"`
	Data          map[string]interface{} `json:"data"`
	Repo          string                 `json:"repo"`
	GitHubRelease map[string]interface{} `json:"githubRelease"`
	TotalCommits  int                    `json:"totalCommits"`
}

// ReleaseAsset release 资产元数据
type ReleaseAsset struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	Size        int64  `json:"size"`
	SHA256      string `json:"sha256"`
	ContentType string `json:"contentType"`
}

// ReleaseManifestResult GitHub release manifest 结果
type ReleaseManifestResult struct {
	Success       bool                   `json:"success"`
	GitHubRelease map[string]interface{} `json:"githubRelease"`
	Assets        []ReleaseAsset         `json:"assets"`
}

// StreamOptions 流式骚话请求参数
type StreamOptions struct {
	Type       string
	Style      string
	Lang       string
	Count      int
	IntervalMs int
}

// StreamSaohuaMeta SSE/WS meta 事件
type StreamSaohuaMeta struct {
	Count    int    `json:"count"`
	Interval int    `json:"interval"`
	Language string `json:"language"`
	Type     string `json:"type,omitempty"`
	Style    string `json:"style,omitempty"`
}

// StreamSaohuaItem SSE/WS item 事件
type StreamSaohuaItem struct {
	SaohuaData
	Index int `json:"index"`
}

// StreamSaohuaDone SSE/WS done 事件
type StreamSaohuaDone struct {
	Total int `json:"total"`
}

// StreamSaohuaError SSE/WS error 事件
type StreamSaohuaError struct {
	Message string `json:"message"`
	Index   int    `json:"index"`
}

// StreamEvent 统一流式事件
type StreamEvent struct {
	Type  string
	Meta  *StreamSaohuaMeta
	Item  *StreamSaohuaItem
	Done  *StreamSaohuaDone
	Error *StreamSaohuaError
}
