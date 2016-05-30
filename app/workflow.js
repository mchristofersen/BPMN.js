module.exports.start = function start (){
  global.bpmns = [global.process];
  global.varDict = {};
  WF.doStep("start")
}

module.exports.doStep = function doStep(stepId) {
  debugger;
    var step = bpmns[bpmns.length - 1][stepId];
    var name = step['$id'];
    canvas.addMarker(name, 'highlight');
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
            return WF.doStep(step['outgoing']["__text"])
        case "endEvent":
            return;
            break;
        default:
            return WF.doStep(step["outgoing"]["__text"]);
            break;
    }
}

module.exports.resolveScript = function resolveScript(step){
  var variable = step['$resultVariable']
  var script = WF.parseExpression(step['script']);
  varDict[variable] = eval(script)
}

module.exports.resolveXOR = function resolveXOR(xor){
  if (!Array.isArray( xor["outgoing"])){
    var signal = bpmns[bpmns.length - 1][xor["outgoing"]];
    var expr = signal["conditionExpression"]["__cdata"] || signal["conditionExpression"]["__cdata"];
    var result = WF.parseExpression(expr);
    debugger
    if (result){
      return WF.doStep(signal["$targetRef"])
    }
  }else{
    for(var i=0;i<xor["outgoing"].length;i++){
      var signal = bpmns[bpmns.length - 1][xor["outgoing"][i]];
      var expr = bpmns[bpmns.length - 1][xor["outgoing"][i]]["conditionExpression"]["#text"];
      var result = WF.parseExpression(expr);
      if (result){
        return WF.doStep(signal["@targetRef"])
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
