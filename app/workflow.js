module.exports.start = function start (){
  global.bpmns = [global.process];
  global.varDict = {};
  WF.doStep("start")
}

var $ = require("jquery"),
d3 = require("d3");

global.d3 =d3;

$("#js-execute-diagram").click(function (e){
  WF.start()
})

module.exports.doStep = function doStep(stepId) {
    setTimeout(function () {
      var step = bpmns[bpmns.length - 1][stepId];
      var name = step['$id'];
      d3.selectAll('[data-element-id='+name+']').select("polyline, rect, circle,g > path").attr({"stroke" : "#00BCD4","fill" : "#00BCD4 !important"}).style({"stroke-opacity":1,"stroke-weight":3})
      console.log(step);
      switch (step['$type']) {
          case "intermediateThrowEvent":
              return WF.doStep(step["signalEventDefinition"]["$signalRef"])
              break;
          case "sequenceFlow":
              return WF.doStep(step["$targetRef"]);
              break;
          case "exclusiveGateway":
              return WF.resolveXOR(step);
              break;
          case "scriptTask":
              console.log(step)
              WF.resolveScript(step)
              return WF.doStep(step['outgoing']["__text"]);
              break;
          case "endEvent":
              return;
              break;
          default:
              return WF.doStep(step["outgoing"]["__text"]);
              break;
      }
    }, 10);

}

module.exports.resolveScript = function resolveScript(step){
  var variable = step['$camunda:resultVariable']
  debugger
  var script = WF.parseExpression(step['script']["__cdata"]);
  varDict[variable] = eval(script)
}

module.exports.resolveXOR = function resolveXOR(xor){
  if (!Array.isArray( xor["outgoing"])){
    var signal = bpmns[bpmns.length - 1][xor["outgoing"]];
    var expr = signal["conditionExpression"]["__cdata"] || signal["conditionExpression"]["__text"];
    var result = WF.parseExpression(expr);
    debugger
    if (result){
      return WF.doStep(signal["$targetRef"])
    }
  }else{
    for(var i=0;i<xor["outgoing"].length;i++){
      var signal = bpmns[bpmns.length - 1][xor["outgoing"][i]];
      var expr = signal["conditionExpression"]["__cdata"] || signal["conditionExpression"]["__text"];
      var result = WF.parseExpression(expr);
      if (result){
        return WF.doStep(signal["$targetRef"])
      }
    }

  }
}

module.exports.parseExpression = function parseExpression(expr){
  try {
    var parsed = eval(expr);
    return parsed;
  } catch (err){
    // console.error(err.message);
    var varName = err.message.replace(" is not defined","");
    var value = varDict[varName] || "''";
    var re = new RegExp(varName);
    var expr = expr.replace(re,value);
    // return parseExpression(expr);
  }
}
