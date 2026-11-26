// Shadowrocket merged script v10-async TEST: capture Cookie, $done() immediately so page loads instantly, claims run in background after $done. If Shadowrocket kills the script on $done, no finish notification will arrive and this version fails - fall back to v9.
// Trigger: http-request on eventv3.reader.qq.com/activity/new_welfare/init
// Flow: open Welfare Centre -> init fires -> save Cookie -> claim 12 gifts
// (scan x3 + getGift each) -> fillCheck most recent missed day -> daily
// watch-video up to 4x -> notify result -> $done() lets init proceed.
// NOTE: v4 removes all artificial delays - requests run back-to-back,
// only network round-trip (~300-500ms via Cox1) spaces them. Expect ~10s.
// because $done() is only called at the end. That is the trade-off for
// "switch account -> auto claim" with no manual run.
// If the page times out, fall back to the separate cron script v2.
var INIT_URL = 'https://eventv3.reader.qq.com/activity/new_welfare/init?notify=1';
var SCAN_URL = 'https://ih5.reader.qq.com/api/comAds/scan?mark=0&scene=1';
var FILLCHECK_URL = 'https://eventv3.reader.qq.com/activity/new_welfare/fillCheck?date=';
var GET_CTN_URL = 'https://eventv3.reader.qq.com/activity/new_welfare/getCtnVideoTask';
var RECEIVE_CTN_URL = 'https://eventv3.reader.qq.com/activity/new_welfare/receiveCtnVideo';
var UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) QQReader';

var headers0 = ($request && $request.headers) || {};
var cookie = headers0['Cookie'] || headers0['cookie'] || '';
if (!cookie) {
  $notification.post('QQ阅读自动领奖', '没抓到 Cookie', 'init 请求里没有 Cookie 头');
  $done({});
} else {
  $persistentStore.write(cookie, 'qqreader_cookie');
  var lockKey = 'qqreader_lock_' + cookie.slice(-16);
  var lastRun = parseInt($persistentStore.read(lockKey) || '0', 10);
  var nowMs = Date.now();
  var deduped = (nowMs - lastRun < 60000);
  if (!deduped) $persistentStore.write('' + nowMs, lockKey);
  // ASYNC TEST: release the welfare page immediately; claims continue in background.
  $done({});
  var headers = {
    'Cookie': cookie,
    'User-Agent': UA,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
    'Referer': 'https://ih5.reader.qq.com/h5/taskCenter'
  };
  var ok = 0, fail = 0, receiveBefore = 0, fillMsg = '无漏签', ctnOk = 0;

  function get(url, cb) {
    $httpClient.get({ url: url, headers: headers }, function (error, response, data) {
      if (error) { cb(null); return; }
      try { cb(JSON.parse(data)); } catch (e) { cb(null); }
    });
  }
  function todayStr() {
    var d = new Date();
    var m = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return '' + d.getFullYear() + m + day;
  }
  // Unfillable fill dates: remembered per account per day, so a date that
  // returned code -2 (cannot fill) is never retried the same day.
  var acctKey = cookie.slice(-16);
  function nofillKey() { return 'qqreader_nofill_' + acctKey + '_' + todayStr(); }
  function isNofill(date) {
    var list = ($persistentStore.read(nofillKey()) || '').split(',');
    return list.indexOf(date) >= 0;
  }
  function markNofill(date) {
    var cur = $persistentStore.read(nofillKey()) || '';
    if (cur.indexOf(date) < 0) $persistentStore.write(cur ? cur + ',' + date : date, nofillKey());
  }
  function finish() {
    get(INIT_URL, function (init2) {
      var after = (init2 && init2.data) ? init2.data.receive : receiveBefore;
      $persistentStore.write('0', lockKey);
      var changed = (ok > 0) || (ctnOk > 0) || (fillMsg.indexOf('code=0') >= 0);
      if (changed) {
        $notification.post(
          'QQ阅读自动领奖',
          '完成: 领奖成功' + ok + '个, 失败' + fail + '个',
          '今日已获 ' + receiveBefore + ' -> ' + after + '; ' + fillMsg + '; 看视频+' + (ctnOk * 5)
        );
      }
    });
  }
  function doCtn(n) {
    if (n >= 4) { finish(); return; }
    get(GET_CTN_URL, function (ctn) {
      if (!ctn || ctn.code !== 0) { finish(); return; }
      var cd = ctn.data || {};
      var week = cd.week || [];
      var past = [];
      for (var p = 0; p < week.length; p++) {
        if (week[p].date <= (cd.curDate || '')) past.push(week[p]);
      }
      var allDone = past.length > 0;
      for (var q = 0; q < past.length; q++) { if (past[q].state !== 1) allDone = false; }
      if (allDone) { finish(); return; }
      get(RECEIVE_CTN_URL, function (rr) {
        if (!rr || rr.code !== 0) { finish(); return; }
        ctnOk++;
        doCtn(n + 1);
      });
    });
  }
  function doFillCheck(initData, next) {
    var today = todayStr();
    var missed = [];
    var weeks = initData.weekVos || [];
    for (var w = 0; w < weeks.length; w++) {
      var list = weeks[w].dateVoList || [];
      for (var d = 0; d < list.length; d++) {
        if (list[d].state === 0 && list[d].date < today) missed.push(list[d].date);
      }
    }
    missed = missed.filter(function (d) { return !isNofill(d); });
    if (!missed.length) { next(); return; }
    missed.sort();
    var target = missed[missed.length - 1];
    get(FILLCHECK_URL + target + '&signType=2', function (fr) {
      fillMsg = '补签' + target + ' code=' + (fr ? fr.code : 'null');
      if (!fr || fr.code !== 0) markNofill(target);
      next();
    });
  }
  function doGift(todo, idx) {
    if (idx >= todo.length) {
      get(INIT_URL, function (init) {
        if (init && init.code === 0) {
          doFillCheck(init.data || {}, function () { doCtn(0); });
        } else { doCtn(0); }
      });
      return;
    }
    var gid = todo[idx].giftId;
    var scans = 0;
    function scanOnce() {
      if (scans >= 3) {
        get('https://ih5.reader.qq.com/api/comAds/getGift?giftId=' + gid + '&scene=1', function (res) {
          if (res && (res.code === 0 || res.code === -5)) { ok++; } else { fail++; }
          doGift(todo, idx + 1);
        });
        return;
      }
      get(SCAN_URL, function () {
        scans++;
        scanOnce();
      });
    }
    scanOnce();
  }

  if (deduped) { /* $done already called, exit silently */ } else {
  get(INIT_URL, function (init) {
    if (!init || init.code !== 0) {
      $notification.post('QQ阅读自动领奖', 'init 失败', 'Cookie 可能过期了');
      return;
    }
    var data = init.data || {};
    receiveBefore = data.receive;
    var gifts = ((data.multiVideoRewardVo || {}).giftInfoList) || [];
    var todo = [];
    for (var i = 0; i < gifts.length; i++) {
      if (!gifts[i].received) todo.push(gifts[i]);
    }
    // Guard: if nothing to claim, check fill/ctn quickly and exit silently.
    var missed0 = [];
    var weeks0 = (data.weekVos || []);
    for (var w0 = 0; w0 < weeks0.length; w0++) {
      var list0 = weeks0[w0].dateVoList || [];
      for (var d0 = 0; d0 < list0.length; d0++) {
        if (list0[d0].state === 0 && list0[d0].date < todayStr() && !isNofill(list0[d0].date)) missed0.push(list0[d0].date);
      }
    }
    if (todo.length === 0 && missed0.length === 0) {
      get(GET_CTN_URL, function (ctn0) {
        var needCtn = false;
        if (ctn0 && ctn0.code === 0) {
          var cd0 = ctn0.data || {};
          var week0 = cd0.week || [];
          for (var q0 = 0; q0 < week0.length; q0++) {
            if (week0[q0].date <= (cd0.curDate || '') && week0[q0].state !== 1) needCtn = true;
          }
        }
        if (!needCtn) { $persistentStore.write('0', lockKey); return; }
        doGift(todo, 0);
      });
      return;
    }
    if (todo.length > 0) $notification.post('QQ阅读自动领奖', '开始领奖', '未领 ' + todo.length + ' 个，开始逐个领');
    doGift(todo, 0);
  });
}
  }
