/* global Handlebars */
"use strict";

var template = Handlebars.compile($(".result-template").html());

$(".compare").on("click", function() {
  var btn = $(this), result = $(".result");
  if (btn.hasClass("loading")) return;

  // parse and validate input
  var todo = [];
  var aValues = $("#a").val().trim().split(/\r?\n/)
    .map(function(e) {return e.trim();})
    .filter(function(e) { return Boolean(e); });
  var bValues = $("#b").val().trim().split(/\r?\n/)
    .map(function(e) {return e.trim();})
    .filter(function(e) { return Boolean(e); });
  if (!aValues.length || !bValues.length || aValues.length !== bValues.length) {
    return alert("Please only add a equal length list of domains or URLs to each box");
  }
  aValues.forEach(function(_, i) {
    todo.push({
      a: aValues[i],
      b: bValues[i],
      w: window.innerWidth,
      h: window.innerHeight,
    });
  });
  todo.reverse();

  // ui state
  result.fadeOut(200);
  setTimeout(function() {result.empty();}, 200);
  btn.addClass("loading");

  // get images and diff
  (function next(values) {
    var a = values.a, b = values.b;
    post("diff", values).then(function(res) {
      if (res.err) return alert(JSON.stringify(res.err));
      result.append(template({
        a: a, ai: res.a, au: /^https?:\/\//.test(a) ? a : "http://" + a,
        b: b, bi: res.b, bu: /^https?:\/\//.test(b) ? b : "http://" + b,
        perc: res.perc, diff: res.diff,
      }));
      result.fadeIn(200);
      if (!todo.length) {
        btn.removeClass("loading");
      } else next(todo.pop());
    });
  })(todo.pop());
});

function post(url, data) {
  return $.ajax({
    type: "POST", url: url, data: JSON.stringify(data),
    contentType: "application/json", dataType: "json"
  });
}
