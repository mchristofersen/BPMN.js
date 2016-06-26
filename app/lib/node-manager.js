  var $ = require("jquery");
module.exports.items = {};

module.exports.init = function (process){
  $.each(process, function (idx, elem){
    node_manager.items[idx] = elem
  })
}

module.exports.getNode = function (id){
  return node_manager.items[id];
}
