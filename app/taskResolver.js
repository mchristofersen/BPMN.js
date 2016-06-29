var $ = require("jquery");

module.exports.exec = function(step) {
  if (!step["js"]){
    return
  }
    matches = step["js"].match(/\$[a-zA-Z0-9]+/g);
    $.each(matches, function(idx, elem) {
        if (varDict[elem] != undefined) {
            step["js"] = step["js"].replace(new RegExp("\\" + elem), `varDict.${elem}`);
        }
    })
    eval(step["js"])
}
