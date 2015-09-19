var m = require('mithril');

var partial = require('chessground').util.partial;

module.exports = function(cfg, saveUrl) {

  var forecasts = cfg.steps || [];
  var loading = m.prop(false);

  var keyOf = function(fc) {
    return fc.map(function(step) {
      return step.ply + ':' + step.uci;
    }).join(',');
  };

  var contains = function(fc1, fc2) {
    return fc1.length >= fc2.length && keyOf(fc1).indexOf(keyOf(fc2)) === 0;
  };

  var collides = function(fc1, fc2) {
    for (var i = 0, max = Math.min(fc1.length, fc2.length); i < max; i++) {
      if (fc1[i].uci !== fc2[i].uci) return i % 2 === 1;
    }
    return true;
  };

  var truncate = function(fc) {
    // must end with player move
    return (fc.length % 2 !== 0 ? fc.slice(0, -1) : fc).slice(0, 30);
  };

  var fixAll = function() {
    // remove contained forecasts
    forecasts = forecasts.filter(function(fc, i) {
      return forecasts.filter(function(f, j) {
        return i !== j && contains(f, fc)
      }).length === 0;
    });
    // remove colliding forecasts
    forecasts = forecasts.filter(function(fc, i) {
      return forecasts.filter(function(f, j) {
        return i < j && collides(f, fc)
      }).length === 0;
    });
  };
  fixAll();

  var isCandidate = function(fc) {
    fc = truncate(fc);
    if (fc.length < 2) return false;
    var collisions = forecasts.filter(function(f) {
      return contains(f, fc);
    });
    if (collisions.length) return false;
    return true;
  };

  var save = function() {
    loading(true);
    m.request({
      method: 'POST',
      url: saveUrl,
      data: forecasts
    }).then(function(data) {
      if (data.reload) location.reload();
      else {
        loading(false);
        forecasts = data.steps || [];
      }
    });
  };

  return {
    addSteps: function(fc) {
      fc = truncate(fc);
      if (!isCandidate(fc)) return;
      fc.forEach(function(step) {
        delete step.variations;
      });
      forecasts.push(fc);
      fixAll();
      save();
    },
    isCandidate: isCandidate,
    removeIndex: function(index) {
      forecasts = forecasts.filter(function(fc, i) {
        return i !== index;
      });
      save();
    },
    list: function() {
      return forecasts;
    },
    truncate: truncate,
    loading: loading
  };
};
