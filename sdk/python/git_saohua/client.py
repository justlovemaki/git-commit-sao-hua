"""Git Saohua Python SDK — 骚话 API 客户端。"""

import json
from typing import Optional, Dict, Any, List, Iterator, Callable
from urllib.parse import urlencode

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
    ReleaseNotesResult,
    ReleaseManifestResult,
    StreamSaohuaMeta,
    StreamSaohuaItem,
    StreamSaohuaDone,
    StreamSaohuaError,
    StreamEvent,
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

    def _stream_params(
        self,
        commit_type: Optional[str] = None,
        style: Optional[str] = None,
        lang: Optional[str] = None,
        count: Optional[int] = None,
        interval_ms: Optional[int] = None,
    ) -> Dict[str, str]:
        params: Dict[str, str] = {}
        if commit_type:
            params["type"] = commit_type
        if style:
            params["style"] = style
        if lang:
            params["lang"] = lang
        if count is not None:
            params["count"] = str(count)
        if interval_ms is not None:
            params["intervalMs"] = str(interval_ms)
        return params

    @staticmethod
    def _parse_stream_event(event_type: str, payload: Dict[str, Any]) -> Optional[StreamEvent]:
        if event_type == "meta":
            return StreamEvent(type="meta", data=StreamSaohuaMeta.from_dict(payload))
        if event_type == "item":
            return StreamEvent(type="item", data=StreamSaohuaItem.from_dict(payload))
        if event_type == "done":
            return StreamEvent(type="done", data=StreamSaohuaDone.from_dict(payload))
        if event_type == "error":
            return StreamEvent(type="error", data=StreamSaohuaError.from_dict(payload))
        return None

    @staticmethod
    def _dispatch_stream_event(
        event: StreamEvent,
        on_meta: Optional[Callable[[StreamSaohuaMeta], None]] = None,
        on_item: Optional[Callable[[StreamSaohuaItem], None]] = None,
        on_done: Optional[Callable[[StreamSaohuaDone], None]] = None,
        on_error: Optional[Callable[[StreamSaohuaError], None]] = None,
    ) -> None:
        if event.type == "meta" and on_meta:
            on_meta(event.data)
        elif event.type == "item" and on_item:
            on_item(event.data)
        elif event.type == "done" and on_done:
            on_done(event.data)
        elif event.type == "error" and on_error:
            on_error(event.data)

    def _build_ws_url(self, path: str, params: Optional[Dict[str, str]] = None) -> str:
        base = self.base_url
        if base.startswith("https://"):
            ws_base = "wss://" + base[len("https://"):]
        elif base.startswith("http://"):
            ws_base = "ws://" + base[len("http://"):]
        else:
            ws_base = base
        url = f"{ws_base}{path}"
        if params:
            url += f"?{urlencode(params)}"
        return url

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

    def iter_stream_saohua(
        self,
        commit_type: Optional[str] = None,
        style: Optional[str] = None,
        lang: Optional[str] = None,
        count: Optional[int] = None,
        interval_ms: Optional[int] = None,
    ) -> Iterator[StreamEvent]:
        """通过 SSE 迭代消费流式骚话事件。"""
        params = self._stream_params(commit_type, style, lang, count, interval_ms)
        headers = {"Accept": "text/event-stream", **self._session.headers}

        try:
            resp = self._session.request(
                "GET",
                self._url("/api/saohua/stream"),
                params=params,
                headers=headers,
                timeout=self.timeout,
                stream=True,
            )
        except requests.exceptions.Timeout:
            raise TimeoutError(f"SSE 请求超时 ({self.timeout}s): GET /api/saohua/stream")
        except requests.exceptions.ConnectionError as exc:
            raise NetworkError(f"SSE 网络连接失败: {exc}")
        except requests.exceptions.RequestException as exc:
            raise NetworkError(f"SSE 请求异常: {exc}")

        if resp.status_code >= 400:
            raise APIError(
                f"SSE 连接失败: HTTP {resp.status_code}",
                status_code=resp.status_code,
                response_data={"raw": getattr(resp, "text", "")},
            )

        event_type: Optional[str] = None
        data_lines: List[str] = []

        try:
            for raw_line in resp.iter_lines(decode_unicode=True):
                line = raw_line or ""
                if line == "":
                    if event_type and data_lines:
                        payload = json.loads("\n".join(data_lines))
                        event = self._parse_stream_event(event_type, payload)
                        if event:
                            yield event
                    event_type = None
                    data_lines = []
                    continue

                if line.startswith("event:"):
                    event_type = line[6:].strip()
                elif line.startswith("data:"):
                    data_lines.append(line[5:].strip())

            if event_type and data_lines:
                payload = json.loads("\n".join(data_lines))
                event = self._parse_stream_event(event_type, payload)
                if event:
                    yield event
        finally:
            resp.close()

    def stream_saohua(
        self,
        commit_type: Optional[str] = None,
        style: Optional[str] = None,
        lang: Optional[str] = None,
        count: Optional[int] = None,
        interval_ms: Optional[int] = None,
        on_meta: Optional[Callable[[StreamSaohuaMeta], None]] = None,
        on_item: Optional[Callable[[StreamSaohuaItem], None]] = None,
        on_done: Optional[Callable[[StreamSaohuaDone], None]] = None,
        on_error: Optional[Callable[[StreamSaohuaError], None]] = None,
    ) -> None:
        """通过 SSE 消费流式骚话事件，并分发到回调。"""
        for event in self.iter_stream_saohua(
            commit_type=commit_type,
            style=style,
            lang=lang,
            count=count,
            interval_ms=interval_ms,
        ):
            self._dispatch_stream_event(event, on_meta, on_item, on_done, on_error)

    def iter_stream_saohua_ws(
        self,
        commit_type: Optional[str] = None,
        style: Optional[str] = None,
        lang: Optional[str] = None,
        count: Optional[int] = None,
        interval_ms: Optional[int] = None,
    ) -> Iterator[StreamEvent]:
        """通过 WebSocket 迭代消费流式骚话事件。"""
        try:
            import websocket
        except ImportError as exc:
            raise NetworkError("缺少 websocket-client 依赖，请先安装 websocket-client>=1.8.0") from exc

        params = self._stream_params(commit_type, style, lang, count, interval_ms)
        headers = []
        for key, value in self._session.headers.items():
            if value:
                headers.append(f"{key}: {value}")

        try:
            ws = websocket.create_connection(
                self._build_ws_url("/api/saohua/ws", params),
                timeout=self.timeout,
                header=headers,
            )
        except websocket.WebSocketTimeoutException:
            raise TimeoutError(f"WebSocket 请求超时 ({self.timeout}s): GET /api/saohua/ws")
        except Exception as exc:
            raise NetworkError(f"WebSocket 连接失败: {exc}")

        try:
            while True:
                try:
                    raw_message = ws.recv()
                except websocket.WebSocketTimeoutException:
                    raise TimeoutError(f"WebSocket 读取超时 ({self.timeout}s)")
                except websocket.WebSocketConnectionClosedException:
                    break

                if not raw_message:
                    continue

                packet = json.loads(raw_message)
                event = self._parse_stream_event(packet.get("event", ""), packet.get("data", {}))
                if event:
                    yield event
                    if event.type == "done":
                        break
        finally:
            ws.close()

    def stream_saohua_ws(
        self,
        commit_type: Optional[str] = None,
        style: Optional[str] = None,
        lang: Optional[str] = None,
        count: Optional[int] = None,
        interval_ms: Optional[int] = None,
        on_meta: Optional[Callable[[StreamSaohuaMeta], None]] = None,
        on_item: Optional[Callable[[StreamSaohuaItem], None]] = None,
        on_done: Optional[Callable[[StreamSaohuaDone], None]] = None,
        on_error: Optional[Callable[[StreamSaohuaError], None]] = None,
    ) -> None:
        """通过 WebSocket 消费流式骚话事件，并分发到回调。"""
        for event in self.iter_stream_saohua_ws(
            commit_type=commit_type,
            style=style,
            lang=lang,
            count=count,
            interval_ms=interval_ms,
        ):
            self._dispatch_stream_event(event, on_meta, on_item, on_done, on_error)

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

    def generate_release_notes(
        self,
        range: Optional[str] = None,
        title: Optional[str] = None,
        repo: Optional[str] = None,
        tag_name: Optional[str] = None,
    ) -> ReleaseNotesResult:
        """生成 release notes。"""
        body: Dict[str, Any] = {}
        if range:
            body["range"] = range
        if title:
            body["title"] = title
        if repo:
            body["repo"] = repo
        if tag_name:
            body["tagName"] = tag_name
        data = self._post("/api/release-notes/generate", json_body=body)
        return ReleaseNotesResult.from_dict(data)

    def generate_release_manifest(
        self,
        asset_paths: List[str],
        range: Optional[str] = None,
        title: Optional[str] = None,
        repo: Optional[str] = None,
        tag_name: Optional[str] = None,
    ) -> ReleaseManifestResult:
        """生成 GitHub release manifest。"""
        body: Dict[str, Any] = {"assetPaths": asset_paths}
        if range:
            body["range"] = range
        if title:
            body["title"] = title
        if repo:
            body["repo"] = repo
        if tag_name:
            body["tagName"] = tag_name
        data = self._post("/api/release-notes/manifest", json_body=body)
        return ReleaseManifestResult.from_dict(data)

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
