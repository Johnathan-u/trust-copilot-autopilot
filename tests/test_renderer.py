"""SIE-103: Playwright renderer tests (unit-level, no browser required)."""

import pytest

from workers.discovery.renderer import needs_js_render, RenderResult


class TestNeedsJsRender:
    def test_none_html_needs_render(self):
        assert needs_js_render(None) is True

    def test_short_html_needs_render(self):
        assert needs_js_render("<html>tiny</html>") is True

    def test_long_text_html_no_render(self):
        html = "<html><body>" + "This is real content. " * 200 + "</body></html>"
        assert needs_js_render(html) is False

    def test_js_heavy_page_type_needs_render(self):
        html = "<html><body>" + "This is real content. " * 200 + "</body></html>"
        assert needs_js_render(html, page_type_hint="trust_page") is True

    def test_generic_page_type_no_render(self):
        html = "<html><body>" + "Lots of content here. " * 200 + "</body></html>"
        assert needs_js_render(html, page_type_hint="generic") is False

    def test_react_app_shell_needs_render(self):
        html = '<html><body><div id="react-root"></div><script>window.__INITIAL_STATE__={}</script></body></html>'
        assert needs_js_render(html) is True


class TestRenderResult:
    def test_error_result(self):
        r = RenderResult(url="https://example.com", error="timeout")
        assert r.html is None
        assert r.error == "timeout"
        assert r.render_method == "playwright"
