"""Data models for git_saohua SDK — matches actual REST API responses."""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Literal


@dataclass
class SaohuaData:
    """骚话生成结果。"""

    type: str
    style: str
    message: str
    full_message: str
    language: str

    @classmethod
    def from_dict(cls, data: dict) -> "SaohuaData":
        return cls(
            type=data.get("type", ""),
            style=data.get("style", ""),
            message=data.get("message", ""),
            full_message=data.get("fullMessage", ""),
            language=data.get("language", ""),
        )


@dataclass
class HealthData:
    """健康检查数据。"""

    status: str
    uptime: float
    version: str
    memory: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> "HealthData":
        return cls(
            status=data.get("status", ""),
            uptime=data.get("uptime", 0.0),
            version=data.get("version", ""),
            memory=data.get("memory", {}),
        )


@dataclass
class TypeInfo:
    """Commit 类型信息。"""

    value: str
    label: str
    emoji: str = ""
    description: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "TypeInfo":
        return cls(
            value=data.get("value", ""),
            label=data.get("label", ""),
            emoji=data.get("emoji", ""),
            description=data.get("description", ""),
        )


@dataclass
class TypesData:
    """类型列表数据。"""

    types: List[TypeInfo] = field(default_factory=list)
    count: int = 0

    @classmethod
    def from_dict(cls, data: dict) -> "TypesData":
        types = [TypeInfo.from_dict(t) for t in data.get("types", [])]
        return cls(types=types, count=data.get("count", len(types)))


@dataclass
class StyleInfo:
    """骚话风格信息。"""

    value: str
    label: str
    emoji: str = ""
    description: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "StyleInfo":
        return cls(
            value=data.get("value", ""),
            label=data.get("label", ""),
            emoji=data.get("emoji", ""),
            description=data.get("description", ""),
        )


@dataclass
class StylesData:
    """风格列表数据。"""

    styles: List[StyleInfo] = field(default_factory=list)
    count: int = 0

    @classmethod
    def from_dict(cls, data: dict) -> "StylesData":
        styles = [StyleInfo.from_dict(s) for s in data.get("styles", [])]
        return cls(styles=styles, count=data.get("count", len(styles)))


@dataclass
class StatsData:
    """统计数据。"""

    total_types: int = 0
    total_styles: int = 0
    total_messages: int = 0
    type_stats: Dict[str, Any] = field(default_factory=dict)
    language: str = ""
    supported_languages: List[str] = field(default_factory=list)
    default_language: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "StatsData":
        return cls(
            total_types=data.get("totalTypes", 0),
            total_styles=data.get("totalStyles", 0),
            total_messages=data.get("totalMessages", 0),
            type_stats=data.get("typeStats", {}),
            language=data.get("language", ""),
            supported_languages=data.get("supportedLanguages", []),
            default_language=data.get("defaultLanguage", ""),
        )


@dataclass
class PluginInfo:
    """插件信息。"""

    name: str
    version: str = ""
    description: str = ""
    author: str = ""
    messages: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> "PluginInfo":
        return cls(
            name=data.get("name", ""),
            version=data.get("version", ""),
            description=data.get("description", ""),
            author=data.get("author", ""),
            messages=data.get("messages", {}),
        )


@dataclass
class PluginsData:
    """插件列表数据。"""

    plugins: List[PluginInfo] = field(default_factory=list)
    count: int = 0

    @classmethod
    def from_dict(cls, data: dict) -> "PluginsData":
        plugins = [PluginInfo.from_dict(p) for p in data.get("plugins", [])]
        return cls(plugins=plugins, count=data.get("count", len(plugins)))


@dataclass
class PluginResult:
    """插件操作结果。"""

    name: str = ""
    path: str = ""
    reloaded: bool = False
    content: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> "PluginResult":
        return cls(
            name=data.get("name", ""),
            path=data.get("path", ""),
            reloaded=data.get("reloaded", False),
            content=data.get("content", {}),
        )


@dataclass
class BatchSaohuaItem:
    """批量生成请求项。"""

    mode: Literal["random", "typed", "typed_style", "ai"] = "random"
    type: str = ""
    style: str = ""
    lang: str = "zh-CN"
    diff: str = ""

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {"mode": self.mode}
        if self.type:
            result["type"] = self.type
        if self.style:
            result["style"] = self.style
        if self.lang and self.lang != "zh-CN":
            result["lang"] = self.lang
        if self.diff:
            result["diff"] = self.diff
        return result


@dataclass
class BatchSaohuaResultItem:
    """批量生成结果项。"""

    success: bool = False
    type: str = ""
    style: str = ""
    message: str = ""
    full_message: str = ""
    language: str = ""
    error: str = ""

    @classmethod
    def from_dict(cls, data: dict) -> "BatchSaohuaResultItem":
        return cls(
            success=data.get("success", False),
            type=data.get("type", ""),
            style=data.get("style", ""),
            message=data.get("message", ""),
            full_message=data.get("fullMessage", ""),
            language=data.get("language", ""),
            error=data.get("error", ""),
        )


@dataclass
class BatchSaohuaResult:
    """批量生成结果。"""

    items: List[BatchSaohuaResultItem] = field(default_factory=list)
    count: int = 0
    success_count: int = 0
    failed_count: int = 0

    @classmethod
    def from_dict(cls, data: dict) -> "BatchSaohuaResult":
        items = [
            BatchSaohuaResultItem.from_dict(item) for item in data.get("items", [])
        ]
        return cls(
            items=items,
            count=data.get("count", len(items)),
            success_count=data.get("successCount", 0),
            failed_count=data.get("failedCount", 0),
        )
