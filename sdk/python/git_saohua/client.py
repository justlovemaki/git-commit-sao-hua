"""Git Saohua Python SDK — 骚话 API 客户端。"""

from typing import Optional, Dict, Any, List

import requests

from .exceptions import APIError, TimeoutError, NetworkError
from .models import (
    SaohuaData,
    HealthData,
    TypesData,
    StylesData,
    StatsData,
    PluginsData,
    PluginResult,
    BatchSaohuaItem,
    BatchSaohuaResult,
    NaturalLanguageAnalysisData,
    NaturalLanguageGenerateData,
)

__all__ = ["SaohuaClient"]


class SaohuaClient:
    """Git Saohua REST API 客户端。

    用法::

        # 基础用法
        client = SaohuaClient("http://localhost:3000")
        saohua = client.random_saohua()
        print(saohua.full_message)

        # context manager
        with SaohuaClient("http://localhost:3000") as client:
            saohua = client.saohua_by_type("fix", style="sao")
            print(saohua.message)
    """

    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        timeout: int = 10,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({"Accept": "application/json"})
        if headers:
            self._session.headers.update(headers)

    # ── context manager ─────────────────────────────────

    def __enter__(self) -> "SaohuaClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    def close(self) -> None:
        """关闭底层 HTTP 会话。"""
        self._session.close()

    # ── 内部方法 ─────────────────────────────────────────

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, str]] = None,
        json_body: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """发送 HTTP 请求并解析统一响应格式。"""
        try:
            resp = self._session.request(
                method,
                self._url(path),
                params=params,
                json=json_body,
                timeout=self.timeout,
            )
        except requests.exceptions.Timeout:
            raise TimeoutError(f"请求超时 ({self.timeout}s): {method} {path}")
        except requests.exceptions.ConnectionError as exc:
            raise NetworkError(f"网络连接失败: {exc}")
        except requests.exceptions.RequestException as exc:
            raise NetworkError(f"请求异常: {exc}")

        try:
            data = resp.json()
        except ValueError:
            raise APIError(
                f"无法解析响应 JSON",
                status_code=resp.status_code,
                response_data={"raw": resp.text},
            )

        if not data.get("success", False):
            raise APIError(
                data.get("error", "未知错误"),
                status_code=resp.status_code,
                response_data=data,
            )

        return data.get("data", {})

    def _get(
        self, path: str, params: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        return self._request("GET", path, params=params)

    def _post(
        self, path: str, json_body: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return self._request("POST", path, json_body=json_body)

    def _delete(self, path: str) -> Dict[str, Any]:
        return self._request("DELETE", path)

    @staticmethod
    def _lang_params(
        lang: Optional[str] = None,
        style: Optional[str] = None,
    ) -> Dict[str, str]:
        params: Dict[str, str] = {}
        if lang:
            params["lang"] = lang
        if style:
            params["style"] = style
        return params

    # ── 健康检查 ─────────────────────────────────────────

    def health(self) -> HealthData:
        """获取服务器健康状态。"""
        data = self._get("/api/health")
        return HealthData.from_dict(data)

    # ── 骚话生成 ─────────────────────────────────────────

    def random_saohua(
        self, lang: Optional[str] = None, style: Optional[str] = None
    ) -> SaohuaData:
        """随机生成骚话。

        Args:
            lang: 语言代码，如 ``"zh-CN"``、``"en"``。
            style: 风格，如 ``"love"``、``"sao"``、``"zha"``、``"chu"``、``"fo"``。
        """
        params = self._lang_params(lang, style)
        data = self._get("/api/saohua", params=params)
        return SaohuaData.from_dict(data)

    def saohua_by_type(
        self,
        commit_type: str,
        lang: Optional[str] = None,
        style: Optional[str] = None,
    ) -> SaohuaData:
        """按 commit 类型生成骚话。

        Args:
            commit_type: 如 ``"fix"``、``"feat"``、``"chore"`` 等。
            lang: 语言代码。
            style: 风格。
        """
        params = self._lang_params(lang, style)
        data = self._get(f"/api/saohua/{commit_type}", params=params)
        return SaohuaData.from_dict(data)

    def saohua_by_type_and_style(
        self,
        commit_type: str,
        style: str,
        lang: Optional[str] = None,
    ) -> SaohuaData:
        """按 commit 类型 + 风格生成骚话。

        Args:
            commit_type: 如 ``"fix"``。
            style: 如 ``"love"``。
            lang: 语言代码。
        """
        params: Dict[str, str] = {}
        if lang:
            params["lang"] = lang
        data = self._get(f"/api/saohua/{commit_type}/{style}", params=params)
        return SaohuaData.from_dict(data)

    def ai_saohua(
        self,
        diff: str,
        lang: Optional[str] = None,
        style: Optional[str] = None,
        commit_type: Optional[str] = None,
    ) -> SaohuaData:
        """基于 Git diff 智能生成骚话。

        Args:
            diff: Git diff 内容。
            lang: 语言代码。
            style: 风格。
            commit_type: Commit 类型（可选，自动检测）。
        """
        body: Dict[str, Any] = {"diff": diff}
        if lang:
            body["lang"] = lang
        if style:
            body["style"] = style
        if commit_type:
            body["type"] = commit_type
        data = self._post("/api/saohua/ai", json_body=body)
        return SaohuaData.from_dict(data)

    def batch_saohua(
        self,
        items: List[BatchSaohuaItem],
    ) -> BatchSaohuaResult:
        """批量生成多条骚话。

        Args:
            items: 批量生成请求列表，每项支持 mode/type/style/lang/diff。
        """
        body: Dict[str, Any] = {"items": [item.to_dict() for item in items]}
        data = self._post("/api/saohua/batch", json_body=body)
        return BatchSaohuaResult.from_dict(data)

    def analyze_natural_language(
        self,
        text: str,
        lang: Optional[str] = None,
    ) -> NaturalLanguageAnalysisData:
        """分析自然语言提交描述。"""
        body: Dict[str, Any] = {"text": text}
        if lang:
            body["lang"] = lang
        data = self._post("/api/saohua/natural/analyze", json_body=body)
        return NaturalLanguageAnalysisData.from_dict(data)

    def generate_from_natural_language(
        self,
        text: str,
        lang: Optional[str] = None,
        style: Optional[str] = None,
        commit_type: Optional[str] = None,
    ) -> NaturalLanguageGenerateData:
        """从自然语言描述直接生成 commit 骚话。"""
        body: Dict[str, Any] = {"text": text}
        if lang:
            body["lang"] = lang
        if style:
            body["style"] = style
        if commit_type:
            body["type"] = commit_type
        data = self._post("/api/saohua/natural/generate", json_body=body)
        return NaturalLanguageGenerateData.from_dict(data)

    # ── 类型与风格 ───────────────────────────────────────

    def list_types(self, lang: Optional[str] = None) -> TypesData:
        """获取所有 commit 类型列表。"""
        params = self._lang_params(lang)
        data = self._get("/api/types", params=params)
        return TypesData.from_dict(data)

    def list_styles(self, lang: Optional[str] = None) -> StylesData:
        """获取所有骚话风格列表。"""
        params = self._lang_params(lang)
        data = self._get("/api/styles", params=params)
        return StylesData.from_dict(data)

    # ── 统计 ─────────────────────────────────────────────

    def stats(self, lang: Optional[str] = None) -> StatsData:
        """获取骚话统计数据。"""
        params = self._lang_params(lang)
        data = self._get("/api/stats", params=params)
        return StatsData.from_dict(data)

    # ── 插件管理 ─────────────────────────────────────────

    def list_plugins(self) -> PluginsData:
        """获取已安装插件列表。"""
        data = self._get("/api/plugins")
        return PluginsData.from_dict(data)

    def install_plugin(self, plugin_data: Dict[str, Any]) -> PluginResult:
        """安装插件。

        Args:
            plugin_data: 插件完整数据（含 name、messages 等）。
        """
        data = self._post("/api/plugins/install", json_body=plugin_data)
        return PluginResult.from_dict(data)

    def remove_plugin(self, name: str) -> PluginResult:
        """删除插件。

        Args:
            name: 插件名称。
        """
        data = self._delete(f"/api/plugins/{name}")
        return PluginResult.from_dict(data)

    def create_plugin_template(
        self,
        name: str,
        version: Optional[str] = None,
        description: Optional[str] = None,
        author: Optional[str] = None,
    ) -> PluginResult:
        """创建插件模板。

        Args:
            name: 插件名称。
            version: 版本号。
            description: 描述。
            author: 作者。
        """
        body: Dict[str, Any] = {"name": name}
        if version:
            body["version"] = version
        if description:
            body["description"] = description
        if author:
            body["author"] = author
        data = self._post("/api/plugins/create", json_body=body)
        return PluginResult.from_dict(data)

    def reload_plugins(self) -> PluginResult:
        """重新加载所有插件数据。"""
        data = self._post("/api/plugins/reload")
        return PluginResult.from_dict(data)
