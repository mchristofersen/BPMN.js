module.exports.start = function start (){
  global.bpmns = [];
  global.varDict = {};
  doStep("Start")
}

module.exports.doStep = function doStep(stepId) {
    var step = bpmns[bpmns.length - 1][stepId];
    var name = step['@id'];
    console.log(step);
    switch (step['@type']) {
        case "intermediateThrowEvent":
            return doStep(step["signalEventDefinition"]["@signalRef"])
            break;
        case "sequenceFlow":
            return doStep(step["@targetRef"]);
            break;
        case "exclusiveGateway":
            return resolveXOR(step);
            break;
        case "scriptTask":
            console.log(step)
            resolveScript(step)
            return doStep(step['outgoing'])
        case "endEvent":
            return;
            break;
        default:
            return doStep(step["outgoing"]);
            break;
    }
}

module.exports.resolveScript = function resolveScript(step){
  var variable = step['@resultVariable']
  var script = parseExpression(step['script']);
  varDict[variable] = eval(script)
}

module.exports.resolveXOR = function resolveXOR(xor){
  if (!Array.isArray( xor["outgoing"])){
    var signal = bpmns[bpmns.length - 1][xor["outgoing"]];
    var expr = bpmns[bpmns.length - 1][xor["outgoing"]]["conditionExpression"]["#text"];
    var result = parseExpression(expr);
    if (result){
      return doStep(signal["@targetRef"])
    }
  }else{
    for(var i=0;i<xor["outgoing"].length;i++){
      var signal = bpmns[bpmns.length - 1][xor["outgoing"][i]];
      var expr = bpmns[bpmns.length - 1][xor["outgoing"][i]]["conditionExpression"]["#text"];
      var result = parseExpression(expr);
      if (result){
        return doStep(signal["@targetRef"])
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
module.exports = WF;
