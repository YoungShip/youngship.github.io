import datetime as dt
from pathlib import Path
import tempfile
import unittest
from check_notebook import HUB_NAMES, HTMLInfo, frontmatter, post_url, strip_fences, validate


class NotebookChecks(unittest.TestCase):
    def make_site(self, root):
        (root / '_posts').mkdir()
        nav = ' '.join('[hub](' + post_url(n) + ')' for n in HUB_NAMES)
        for name in HUB_NAMES:
            body = nav + '\n\n## Text\n'
            if 'research-status' in name:
                body += '<a id="A01"></a> A01\n'
            (root / '_posts' / name).write_text(
                '---\ntitle: "Test"\ndate: "' + name[:10] + '"\n'
                'description: "Test"\ncategory: 笔记\ntags: [MicroMani]\n---\n' + body,
                encoding='utf-8')

    def run_variant(self, mutate):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.make_site(root)
            mutate(root)
            return validate(root, today=dt.date(2026, 9, 29))

    def test_valid_minimal_site(self):
        self.assertTrue(self.run_variant(lambda _: None)['passed'])

    def test_missing_hub(self):
        self.assertFalse(self.run_variant(lambda r: (r/'_posts'/HUB_NAMES[2]).unlink())['passed'])

    def test_unindexed_new_post(self):
        def add(root):
            src = (root/'_posts'/HUB_NAMES[2]).read_text(encoding='utf-8')
            (root/'_posts'/'2026-09-29-micromani-new.md').write_text(src, encoding='utf-8')
        self.assertFalse(self.run_variant(add)['passed'])

    def test_duplicate_id(self):
        def add(root):
            path = root/'_posts'/HUB_NAMES[1]
            path.write_text(path.read_text(encoding='utf-8')+'\n<a id="A01"></a>', encoding='utf-8')
        self.assertFalse(self.run_variant(add)['passed'])

    def test_unknown_issue_link(self):
        def add(root):
            path = root/'_posts'/HUB_NAMES[0]
            path.write_text(path.read_text(encoding='utf-8')+'\n[x]('+post_url(HUB_NAMES[1])+'#A99)', encoding='utf-8')
        self.assertFalse(self.run_variant(add)['passed'])

    def test_missing_destination(self):
        def add(root):
            path = root/'_posts'/HUB_NAMES[0]
            path.write_text(path.read_text(encoding='utf-8')+'\n[x](/not-real/)', encoding='utf-8')
        self.assertFalse(self.run_variant(add)['passed'])

    def test_fenced_examples_not_links(self):
        cleaned, unclosed = strip_fences('text\n```md\n[x](/not-real/)\n```\nend')
        self.assertEqual(cleaned, 'text\nend')
        self.assertFalse(unclosed)

    def test_unclosed_fence(self):
        self.assertTrue(strip_fences('```text\nx')[1])

    def test_yaml_delimiter_required(self):
        with self.assertRaises(ValueError):
            frontmatter('title: no delimiters')

    def test_html_ids(self):
        info = HTMLInfo()
        info.feed('<h2 id="中文">x</h2><a href="#中文">go</a><p id="中文">y</p>')
        self.assertEqual(info.ids, {'中文'})
        self.assertEqual(info.duplicates, ['中文'])

    def test_bad_build_is_not_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.make_site(root)
            self.assertFalse(validate(root, root/'nonexistent', dt.date(2026,9,29))['passed'])

    def test_generated_anchor_checked(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.make_site(root)
            built = root/'_site'
            for name in HUB_NAMES:
                path = built/post_url(name).lstrip('/')/'index.html'
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('<h2 id="ok">x</h2><a href="#wrong">link</a>', encoding='utf-8')
            result = validate(root, built, dt.date(2026,9,29))
            self.assertTrue(any('missing generated anchor' in e for e in result['errors']))


if __name__ == '__main__':
    unittest.main()
