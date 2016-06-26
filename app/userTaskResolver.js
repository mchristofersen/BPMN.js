var $ = require("jquery");

module.exports.renderPage = function(step) {
    step = userTaskResolver.parseHTML(step)
    step = userTaskResolver.prepareJSForEval(step)
    html = `${step["$ext:html"]}<style>${step["$ext:css"]}</style><script>${step["$ext:js"]}</script>`;
    $("#renderedPage").html(html).parent().show();

}

module.exports.prepareJSForEval = function(step) {
    matches = step["$ext:js"].match(/\$[a-zA-Z0-9]+/g);
    $.each(matches, function(idx, elem) {
        if (varDict[elem] != undefined) {
            step["$ext:js"] = step["$ext:js"].replace(new RegExp("\\" + elem), `varDict["${elem}"]`);
        }
    })
    return step
}

module.exports.parseHTML = function(step) {
  re = /(\$[a-zA-Z0-9]+)/g;
  var match;
  while (match = re.exec(step["$ext:html"])) {
      step["$ext:html"] = step["$ext:html"].replace(new RegExp("\\" + match[1] + "\}", "g"), `varDict["${match[0]}"]`)
  }
  // re = /varDict\[.+\]\..+/g;
  // var match;
  // while (match = re.exec(step["$ext:html"])) {
  //     step["$ext:html"] = step["$ext:html"].replace(new RegExp(`${match[0]}`), "g"), match[0])
  // }
  return step
}
