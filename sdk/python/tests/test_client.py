"""Unit tests for git_saohua SDK — uses mock, no real API needed."""

import unittest
from unittest.mock import patch, MagicMock
import json
import types

from git_saohua import SaohuaClient, APIError, TimeoutError, NetworkError
from git_saohua.models import SaohuaData, HealthData, TypesData, StylesData, StatsData, PluginsData, PluginResult
from git_saohua.models import NaturalLanguageAnalysisData, NaturalLanguageGenerateData


def _mock_response(json_data, status_code=200):
    """创建 mock Response 对象。"""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data
    resp.text = str(json_data)
    return resp


def _ok(data, message="ok"):
    return {"success": True, "data": data, "meta": {"timestamp": "2026-01-01T00:00:00Z", "message": message}}


def _err(error, status_code=400):
    return {"success": False, "error": error, "meta": {"timestamp": "2026-01-01T00:00:00Z"}}


class TestSaohuaClient(unittest.TestCase):
    """SaohuaClient 测试套件。"""

    def setUp(self):
        self.client = SaohuaClient("http://test:3000", timeout=5)

    def tearDown(self):
        self.client.close()

    # ── context manager ──────────────────────────────

    def test_context_manager(self):
        with SaohuaClient("http://test:3000") as client:
            self.assertIsInstance(client, SaohuaClient)

    # ── health ───────────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_health(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "status": "ok", "uptime": 3600.5, "version": "1.0.0", "memory": {}
        }))
        result = self.client.health()
        self.assertIsInstance(result, HealthData)
        self.assertEqual(result.status, "ok")
        self.assertEqual(result.version, "1.0.0")

    # ── random_saohua ────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_random_saohua(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "fix", "style": "sao",
            "message": "修 bug 和撩你", "fullMessage": "fix: 修 bug 和撩你",
            "language": "zh-CN"
        }))
        result = self.client.random_saohua()
        self.assertIsInstance(result, SaohuaData)
        self.assertEqual(result.type, "fix")
        self.assertEqual(result.message, "修 bug 和撩你")
        self.assertEqual(result.full_message, "fix: 修 bug 和撩你")

    @patch("git_saohua.client.requests.Session.request")
    def test_random_saohua_with_params(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "feat", "style": "love",
            "message": "新功能上线", "fullMessage": "feat: 新功能上线",
            "language": "zh-CN"
        }))
        result = self.client.random_saohua(lang="zh-CN", style="love")
        self.assertIsInstance(result, SaohuaData)
        call_args = mock_req.call_args
        self.assertIn("params", call_args.kwargs)

    # ── saohua_by_type ───────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_saohua_by_type(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "feat", "style": "sao",
            "message": "新功能骚话", "fullMessage": "feat: 新功能骚话",
            "language": "zh-CN"
        }))
        result = self.client.saohua_by_type("feat")
        self.assertIsInstance(result, SaohuaData)
        self.assertEqual(result.type, "feat")

    # ── saohua_by_type_and_style ─────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_saohua_by_type_and_style(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "fix", "style": "love",
            "message": "修复也是爱", "fullMessage": "fix: 修复也是爱",
            "language": "zh-CN"
        }))
        result = self.client.saohua_by_type_and_style("fix", "love")
        self.assertIsInstance(result, SaohuaData)
        self.assertEqual(result.style, "love")

    # ── ai_saohua ────────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_ai_saohua(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "feat", "style": "sao",
            "message": "AI 骚话", "fullMessage": "feat: AI 骚话",
            "language": "zh-CN"
        }))
        result = self.client.ai_saohua("diff --git a/test.js")
        self.assertIsInstance(result, SaohuaData)
        call_args = mock_req.call_args
        self.assertEqual(call_args.kwargs.get("json", {}).get("diff"), "diff --git a/test.js")

    @patch("git_saohua.client.requests.Session.request")
    def test_ai_saohua_with_all_params(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "type": "fix", "style": "love",
            "message": "AI 修复骚话", "fullMessage": "fix: AI 修复骚话",
            "language": "en"
        }))
        result = self.client.ai_saohua(
            "diff content", lang="en", style="love", commit_type="fix"
        )
        self.assertIsInstance(result, SaohuaData)

    @patch("git_saohua.client.requests.Session.request")
    def test_analyze_natural_language(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "naturalText": "修复登录表单提交异常",
            "detectedType": "fix",
            "detectedStyle": "sao",
            "topic": "登录表单提交异常",
            "confidence": "medium",
            "reason": "检测到类型关键词: fix",
            "language": "zh-CN"
        }))
        result = self.client.analyze_natural_language("修复登录表单提交异常", lang="zh-CN")
        self.assertIsInstance(result, NaturalLanguageAnalysisData)
        self.assertEqual(result.detected_type, "fix")
        self.assertEqual(result.topic, "登录表单提交异常")

    @patch("git_saohua.client.requests.Session.request")
    def test_generate_from_natural_language(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "naturalText": "新增分享海报功能",
            "detectedType": "feat",
            "detectedStyle": "sao",
            "topic": "分享海报功能",
            "confidence": "medium",
            "reason": "检测到类型关键词: feat",
            "language": "zh-CN",
            "type": "feat",
            "style": "love",
            "message": "新功能也想和你贴贴",
            "fullMessage": "feat: 新功能也想和你贴贴"
        }))
        result = self.client.generate_from_natural_language(
            "新增分享海报功能", style="love", commit_type="feat"
        )
        self.assertIsInstance(result, NaturalLanguageGenerateData)
        self.assertEqual(result.style, "love")
        self.assertEqual(result.full_message, "feat: 新功能也想和你贴贴")

    @patch("git_saohua.client.requests.Session.request")
    def test_iter_stream_saohua(self, mock_req):
        response = _mock_response({})
        response.iter_lines.return_value = iter([
            'event: meta',
            'data: {"count":2,"interval":100,"language":"zh-CN","type":"fix"}',
            '',
            'event: item',
            'data: {"type":"fix","style":"sao","message":"修好了","fullMessage":"fix: 修好了","language":"zh-CN","index":1}',
            '',
            'event: done',
            'data: {"total":1}',
            '',
        ])
        mock_req.return_value = response

        events = list(self.client.iter_stream_saohua(commit_type="fix", count=2, interval_ms=100))
        self.assertEqual([event.type for event in events], ["meta", "item", "done"])
        self.assertEqual(events[0].data.count, 2)
        self.assertEqual(events[1].data.full_message, "fix: 修好了")
        self.assertEqual(events[2].data.total, 1)

        call_args = mock_req.call_args
        self.assertTrue(call_args.kwargs.get("stream"))
        self.assertEqual(call_args.kwargs.get("params", {}).get("type"), "fix")

    @patch("git_saohua.client.requests.Session.request")
    def test_stream_saohua_callbacks(self, mock_req):
        response = _mock_response({})
        response.iter_lines.return_value = iter([
            'event: meta',
            'data: {"count":1,"interval":50,"language":"zh-CN"}',
            '',
            'event: item',
            'data: {"type":"feat","style":"love","message":"新功能","fullMessage":"feat: 新功能","language":"zh-CN","index":1}',
            '',
            'event: done',
            'data: {"total":1}',
            '',
        ])
        mock_req.return_value = response

        seen = []
        self.client.stream_saohua(
            on_meta=lambda data: seen.append(("meta", data.count)),
            on_item=lambda data: seen.append(("item", data.index)),
            on_done=lambda data: seen.append(("done", data.total)),
        )
        self.assertEqual(seen, [("meta", 1), ("item", 1), ("done", 1)])

    def test_iter_stream_saohua_ws(self):
        ws = MagicMock()
        ws.recv.side_effect = [
            json.dumps({"event": "meta", "data": {"count": 2, "interval": 100, "language": "zh-CN"}}),
            json.dumps({"event": "item", "data": {"type": "fix", "style": "sao", "message": "修复完成", "fullMessage": "fix: 修复完成", "language": "zh-CN", "index": 1}}),
            json.dumps({"event": "done", "data": {"total": 1}}),
        ]
        fake_module = types.SimpleNamespace(
            create_connection=MagicMock(return_value=ws),
            WebSocketTimeoutException=type("WebSocketTimeoutException", (Exception,), {}),
            WebSocketConnectionClosedException=type("WebSocketConnectionClosedException", (Exception,), {}),
        )

        with patch.dict("sys.modules", {"websocket": fake_module}):
            events = list(self.client.iter_stream_saohua_ws(commit_type="fix", count=2))

        self.assertEqual([event.type for event in events], ["meta", "item", "done"])
        self.assertEqual(events[1].data.message, "修复完成")
        self.assertEqual(fake_module.create_connection.call_args.args[0], "ws://test:3000/api/saohua/ws?type=fix&count=2")

    def test_stream_saohua_ws_callbacks(self):
        ws = MagicMock()
        ws.recv.side_effect = [
            json.dumps({"event": "meta", "data": {"count": 1, "interval": 50, "language": "zh-CN"}}),
            json.dumps({"event": "error", "data": {"message": "bad", "index": 0}}),
            json.dumps({"event": "done", "data": {"total": 0}}),
        ]
        fake_module = types.SimpleNamespace(
            create_connection=MagicMock(return_value=ws),
            WebSocketTimeoutException=type("WebSocketTimeoutException", (Exception,), {}),
            WebSocketConnectionClosedException=type("WebSocketConnectionClosedException", (Exception,), {}),
        )

        seen = []
        with patch.dict("sys.modules", {"websocket": fake_module}):
            self.client.stream_saohua_ws(
                on_meta=lambda data: seen.append(("meta", data.count)),
                on_error=lambda data: seen.append(("error", data.message)),
                on_done=lambda data: seen.append(("done", data.total)),
            )
        self.assertEqual(seen, [("meta", 1), ("error", "bad"), ("done", 0)])

    # ── list_types ───────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_list_types(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "types": [
                {"value": "fix", "label": "修复", "emoji": "🔧", "description": "修复 Bug"},
                {"value": "feat", "label": "新功能", "emoji": "✨", "description": "新功能"},
            ],
            "count": 2
        }))
        result = self.client.list_types()
        self.assertIsInstance(result, TypesData)
        self.assertEqual(result.count, 2)
        self.assertEqual(result.types[0].value, "fix")

    # ── list_styles ──────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_list_styles(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "styles": [
                {"value": "love", "label": "情话", "emoji": "💕", "description": "甜甜的"},
            ],
            "count": 1
        }))
        result = self.client.list_styles()
        self.assertIsInstance(result, StylesData)
        self.assertEqual(result.count, 1)

    # ── stats ────────────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_stats(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "totalTypes": 12, "totalStyles": 5, "totalMessages": 600,
            "typeStats": {}, "language": "zh-CN",
            "supportedLanguages": ["zh-CN", "en"], "defaultLanguage": "zh-CN"
        }))
        result = self.client.stats()
        self.assertIsInstance(result, StatsData)
        self.assertEqual(result.total_types, 12)
        self.assertEqual(result.total_messages, 600)

    # ── list_plugins ─────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_list_plugins(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "plugins": [{"name": "test-plugin", "version": "1.0.0"}],
            "count": 1
        }))
        result = self.client.list_plugins()
        self.assertIsInstance(result, PluginsData)
        self.assertEqual(result.count, 1)
        self.assertEqual(result.plugins[0].name, "test-plugin")

    # ── install_plugin ───────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_install_plugin(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "name": "new-plugin", "path": "/plugins/new-plugin.json"
        }))
        result = self.client.install_plugin({"name": "new-plugin", "messages": {}})
        self.assertIsInstance(result, PluginResult)
        self.assertEqual(result.name, "new-plugin")

    # ── remove_plugin ────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_remove_plugin(self, mock_req):
        mock_req.return_value = _mock_response(_ok({"name": "old-plugin"}))
        result = self.client.remove_plugin("old-plugin")
        self.assertIsInstance(result, PluginResult)
        self.assertEqual(result.name, "old-plugin")

    # ── create_plugin_template ───────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_create_plugin_template(self, mock_req):
        mock_req.return_value = _mock_response(_ok({
            "path": "/plugins/my-tpl.json", "content": {"name": "my-tpl"}
        }))
        result = self.client.create_plugin_template("my-tpl", version="1.0.0")
        self.assertIsInstance(result, PluginResult)

    # ── reload_plugins ───────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_reload_plugins(self, mock_req):
        mock_req.return_value = _mock_response(_ok({"reloaded": True}))
        result = self.client.reload_plugins()
        self.assertIsInstance(result, PluginResult)
        self.assertTrue(result.reloaded)

    # ── 错误处理 ─────────────────────────────────────

    @patch("git_saohua.client.requests.Session.request")
    def test_api_error(self, mock_req):
        mock_req.return_value = _mock_response(_err("无效的类型"), 400)
        with self.assertRaises(APIError) as ctx:
            self.client.saohua_by_type("invalid")
        self.assertEqual(ctx.exception.message, "无效的类型")
        self.assertEqual(ctx.exception.status_code, 400)

    @patch("git_saohua.client.requests.Session.request")
    def test_timeout_error(self, mock_req):
        import requests as req_lib
        mock_req.side_effect = req_lib.exceptions.Timeout("timeout")
        with self.assertRaises(TimeoutError):
            self.client.health()

    @patch("git_saohua.client.requests.Session.request")
    def test_network_error(self, mock_req):
        import requests as req_lib
        mock_req.side_effect = req_lib.exceptions.ConnectionError("refused")
        with self.assertRaises(NetworkError):
            self.client.health()

    @patch("git_saohua.client.requests.Session.request")
    def test_invalid_json(self, mock_req):
        resp = MagicMock()
        resp.status_code = 200
        resp.json.side_effect = ValueError("bad json")
        resp.text = "not json"
        mock_req.return_value = resp
        with self.assertRaises(APIError):
            self.client.health()

    # ── URL 构建 ─────────────────────────────────────

    def test_base_url_trailing_slash(self):
        client = SaohuaClient("http://test:3000/")
        self.assertEqual(client.base_url, "http://test:3000")
        client.close()


if __name__ == "__main__":
    unittest.main()
