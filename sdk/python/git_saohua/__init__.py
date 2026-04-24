"""git_saohua — Python SDK for Git Saohua API.

让每一次 git commit 都带着灵魂 ✨

Usage::

    from git_saohua import SaohuaClient

    client = SaohuaClient("http://localhost:3000")
    saohua = client.random_saohua()
    print(saohua.full_message)
"""

__version__ = "0.1.0"

from .client import SaohuaClient
from .exceptions import SaohuaError, APIError, TimeoutError, NetworkError
from .models import (
    SaohuaData,
    HealthData,
    TypeInfo,
    TypesData,
    StyleInfo,
    StylesData,
    StatsData,
    PluginInfo,
    PluginsData,
    PluginResult,
    BatchSaohuaItem,
    BatchSaohuaResultItem,
    BatchSaohuaResult,
    NaturalLanguageAnalysisData,
    NaturalLanguageGenerateData,
    StreamSaohuaMeta,
    StreamSaohuaItem,
    StreamSaohuaDone,
    StreamSaohuaError,
    StreamEvent,
)

__all__ = [
    "SaohuaClient",
    "SaohuaError",
    "APIError",
    "TimeoutError",
    "NetworkError",
    "SaohuaData",
    "HealthData",
    "TypeInfo",
    "TypesData",
    "StyleInfo",
    "StylesData",
    "StatsData",
    "PluginInfo",
    "PluginsData",
    "PluginResult",
    "BatchSaohuaItem",
    "BatchSaohuaResultItem",
    "BatchSaohuaResult",
    "NaturalLanguageAnalysisData",
    "NaturalLanguageGenerateData",
    "StreamSaohuaMeta",
    "StreamSaohuaItem",
    "StreamSaohuaDone",
    "StreamSaohuaError",
    "StreamEvent",
]
