var $ = require("jquery");
var less = require('../node_modules/less/index.js');
console.log(less);

module.exports.compileCSS = function (step){
  var css;
  if (step["css"]==undefined){
    return ""
  }
  less.render(step["css"],{async:false}, function (e, output) {
    console.log(output.css);
    css = output.css;
});
return css;
}

module.exports.renderPage = function(step) {
    step = userTaskResolver.parseHTML(step)
    step = userTaskResolver.prepareJSForEval(step)
    css = userTaskResolver.compileCSS(step);
    html = `<form>${step["html"]}</form><style>${css}</style><script>${step["js"]}</script>`;
    $("#renderedPage").html(html).parent().show();
    var inputs = $("form").serializeArray();
    $.each(inputs, function (idx,elem){
      if (varDict.hasOwnProperty(elem.name)){
        $(`[name="${elem.name}"]`).val(varDict[elem.name]);
      }
    })
    if (varDict.hasOwnProperty("$"+step["$name"])){
      $.each(varDict["$"+step["$name"]], function (idx, elem){
        $(`[name="${idx}"]`).val(varDict["$"+step["$name"]][idx]);
      })
    }

}

module.exports.prepareJSForEval = function(step) {
  if (step["js"]==undefined){
    return step
  }
    matches = step["js"].match(/\$[a-zA-Z0-9]+/g);
    $.each(matches, function(idx, elem) {
        if (varDict[elem] != undefined) {
            step["js"] = step["js"].replace(new RegExp("\\" + elem), `varDict.${elem}`);
        }
    })
    return step
}

module.exports.parseHTML = function(step) {
  re = />.*(\$[a-zA-Z0-9]+).*/g;
  var match;
  while (match = re.exec(step["html"])) {
      step["html"] = step["html"].replace(new RegExp("\\" + match[1], "g"), varDict[match[1]])
  }
  return step
}
