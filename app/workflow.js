module.exports.start = function (){
  global.bpmns = [global.process];
  global.varDict = {};
  global.suspendedStep = null;
  WF.doStep("start")
}

var $ = require("jquery"),
d3 = require("d3");

global.d3 =d3;

$("#js-execute-diagram").click(function (e){
  WF.context = {};
  WF.start()
})

module.exports.doStep = function (stepId) {
  console.log(stepId);
    setTimeout(function () {
      var step = bpmns[bpmns.length - 1][stepId];
      var name = step['$id'];
      d3.selectAll('[data-element-id='+name+']').select("polyline, rect, circle,g > path").attr({"stroke" : "#00BCD4","fill" : "#00BCD4 !important"}).style({"stroke-opacity":0.5,"stroke-weight":3})
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
              WF.resolveScript(step)
              return WF.doStep(step['outgoing']["__text"]);
              break;
          case "endEvent":
              return;
              break;
          case "userTask":
              suspendedStep = step;
              WF.renderPage(step["$ext:html"])
          default:
              return WF.doStep(step["outgoing"]["__text"]);
              break;
      }
    }, 10);

}

module.exports.renderPage = function (html){
  $("#renderedPage").html(html).parent().show();
  $("#continue").click(function (e){
    var f = $("form").serializeArray();
    console.log(f);
    WF.handleForm(f);
    $("#renderedPage").parent().hide();
  })
}

module.exports.handleForm = function (form){
  var formName = suspendedStep['$name'];
  if (formName == "" || formName == undefined){
    return
  }else{
    varDict["$"+formName]={};
  }
  $.each(form, function (idx, elem){
    if (/\$[a-zA-Z0-9]+/.test(elem.name)){
      varDict[elem.name] = elem.value
    }else {
      varDict["$"+formName][elem.name]= elem.value;
    }
  })
}

module.exports.resolveScript = function (step){
  var variable = step['$camunda:resultVariable']
  var script = step['script']["__cdata"]==undefined ? WF.parseExpression(step['script']["__text"]) : WF.parseExpression(step['script']["__cdata"]);
  varDict[variable] = eval(script)
}

module.exports.resolveXOR = function (xor){
  if (!Array.isArray( xor["outgoing"])){
    var signal = bpmns[bpmns.length - 1][xor["outgoing"]];
    var expr = signal["conditionExpression"]["__cdata"] || signal["conditionExpression"]["__text"];
    var parsed = WF.parseExpression(expr);
    var result = eval(parsed);
    if (result){
      return WF.doStep(signal["$targetRef"])
    }
  }else{
    for(var i=0;i<xor["outgoing"].length;i++){
      var signal = bpmns[bpmns.length - 1][xor["outgoing"][i]];
      var expr = signal["$ext:expression"];
      var result = eval(WF.parseExpression(expr));
      if (result){
        return WF.doStep(signal["$targetRef"])
      }
    }

  }
}

module.exports.parseExpression = function (expr){
  var matches = expr.match(/[$][a-zA-Z]+/);
  $.each(matches, function (idx, elem){
    if (typeof varDict[elem]=="string"){
      expr = expr.replace(new RegExp(elem,"g"), '"'+varDict[elem]+'"');
    }else{
      expr = expr.replace(new RegExp("\\"+elem,"g"), 'varDict["'+elem+'"]');
    }
  })
  return expr

}
