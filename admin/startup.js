// Never handles credentials. Authentication is provided by Sveltia CMS and GitHub.
const cmsScript = document.getElementById('cms-script');
const loading = document.getElementById('cms-loading');
cmsScript.addEventListener('load', () => loading.remove());
cmsScript.addEventListener('error', () => {
  document.getElementById('cms-status').textContent = '编辑器没有加载成功，请刷新重试，或打开下方的登录说明。';
});
