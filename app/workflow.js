
module.exports.start = function() {
  // if (true){
  //   WF.bpmns.push(process);
  // }
  WF.bpmns = [WF.rootFlow];
    var suspendedStep = null;
    node_manager.init(process);
    WF.doStep("start")
}



var $ = require("jquery"),
    d3 = require("d3"),
    userTaskResolver = require("./userTaskResolver"),
    taskResolver = require("./taskResolver");

$("#js-execute-diagram").click(function(e) {
  if (isBranch){
    $.getJSON("http://127.0.0.1/branch",{flowName:bpmnModeler.get("canvas").getRootElement().id,user:user},function (resp){
      var xml = resp[0]["xml"];
      varDict = {$log:[]}
      var process = WF.processXML(resp)
      WF.bpmns = [process]
      WF.doStep("start")
    })
  }else{
    $.getJSON("http://127.0.0.1/flow",{flowName:bpmnModeler.get("canvas").getRootElement().id},function (resp){
      var xml = resp[0]["xml"];
      varDict = {$log:[]}
      var process = WF.processXML(resp)
      WF.bpmns = [process]
      WF.doStep("start")
    })
  }

})

module.exports.doStep = function(stepId) {
    setTimeout(function() {
        var step = WF.bpmns[WF.bpmns.length - 1][stepId];
        varDict.$log.push(`${WF.bpmns[WF.bpmns.length - 1]["$flowName"]}__${stepId}`);
        if (stepId == "start") {
            stepId = WF.bpmns[WF.bpmns.length - 1]["start"]["id"];
        } else if (step["$type"] == "bpmns:IntermediateCatchEvent") {
            stepId = WF.bpmns[WF.bpmns.length - 1][stepId]["id"];
            l(stepId)
        }
        var shape = d3.selectAll("[data-element-id=" + stepId + "] > .djs-visual").selectAll("rect,path,circle,polygon,polyline").attr("stroke", "#B2DFDB");
        var name = step['id'];
        switch (step['$type']) {
            case "bpmn:IntermediateThrowEvent":
                return WF.doStep(step.eventDefinitions[0]["signalRef"]["id"])
                break;
            case "bpmn:SequenceFlow":
                return WF.doStep(step["targetRef"]["id"]);
                break;
            case "bpmn:ExclusiveGateway":
                return WF.resolveXOR(step);
                break;
            case "bpmn:ScriptTask":
                WF.resolveScript(step)
                return WF.doStep(step['outgoing'][0]["id"]);
                break;
            case "bpmn:EndEvent":
              var ele = WF.bpmns[WF.bpmns.length-1][step["id"]].flowId;
                if (ele){
                      $.getJSON("http://127.0.0.1/flow",{flowName:ele},function (resp){
                        var xml = resp[0]["xml"];
                        var process = WF.processXML(resp)
                        WF.bpmns = [process]
                        WF.doStep("start")
                      })
                      return



                }
                else if (WF.bpmns.length == 1){
                  suspendedStep = null;
                    return alert("The workflow has ended");
                }else {
                  var popped = WF.bpmns.pop();
                  if (Array.isArray(WF.bpmns[WF.bpmns.length - 1]["suspendedStep"]["outgoing"]) && step["name"] != null){
                    var rescue;
                    $.each(WF.bpmns[WF.bpmns.length - 1]["suspendedStep"]["outgoing"],function (idx,elem){
                      if (elem["name"] == step["name"]){
                          rescue = elem["id"]

                      }

                    })
                    return WF.doStep(rescue);
                    // return alert("signal not found!");
                  }

                }

                break;
            case "bpmn:UserTask":
                suspendedStep = step;
                return userTaskResolver.renderPage(step)
                break;
            case "bpmn:Task":
                taskResolver.exec(step);
                return WF.doStep(step["outgoing"][0]["id"])
                break;
            case "bpmn:ServiceTask":
                suspendedStep = step;
                eval(step["js"]);
                return;
                break
            case "bpmn:SubProcess":
                var flowName = step['flowId']
                bus.fire("subflow.view",flowName)
                $.getJSON("http://127.0.0.1/flow",{flowName:step["flowId"]},function (resp){
                  // var xml = resp[0]["xml"];
                  debugger
                  WF.bpmns[WF.bpmns.length - 1].suspendedStep = step
                  var process = WF.processXML(resp)
                  WF.bpmns.push(process)
                  WF.doStep("start")
                })
                return;
            default:
                return WF.doStep(step["outgoing"][0]["id"]);
                break;
        }
    }, 10);

}

module.exports.interpolateJS = function(step, arr) {
    var re = /\$\{(\$[a-zA-Z0-9]*?)\}/g;
    var match;
    while (match = re.exec(step["js"])) {
        step["js"] = step["js"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
    }
    $.each(arr, function(idx, type) {
        re = /\$\{(\$[a-zA-Z0-9]*?)\}/g;
        match;
        while (match = re.exec(step[type])) {
            step[type] = step[type].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
        }
    })

    return step
}

module.exports.prepareJSForEval = function(step) {
    matches = step["js"].match(/\$[a-zA-Z0-9]+/g);
    $.each(matches, function(idx, elem) {
        if (varDict[elem] != undefined) {
            step["js"] = step["js"].replace(new RegExp("\\" + elem), `varDict["${elem}"]`);
        }
    })
    return step
}

module.exports.parseHTML = function(step) {
    re = /\$\{(\$[a-zA-Z0-9]+)\}/g;
    var match;
    while (match = re.exec(step["html"])) {
        step["html"] = step["html"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
    }
    re = /\$\{(\%[a-zA-Z0-9]+)\}/g;
    var match;
    while (match = re.exec(step["html"])) {
        step["html"] = step["html"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
    }
    return step
}

module.exports.renderPage = function(step) {
    // var matches = step["html"].match(/\$[a-zA-Z0-9]+(?!['"])/g);
    // var html = '';
    // $.each(matches, function(idx, elem) {
    //     if (varDict[elem] != undefined) {
    //         step["html"] = step["html"].replace(new RegExp("\\" + elem, "g"), varDict[elem]);
    //     }
    // })
    step = WF.parseHTML(step)
    step = WF.prepareJSForEval(step)
    html = `${step["html"]}<style>${step["css"]}</style><script>${step["js"]}</script>`;
    $("#renderedPage").html(html).parent().show();

}

module.exports.handleForm = function(form) {
    var formName = suspendedStep['name'];
    if (formName == "" || formName == undefined) {
        return
    } else {
        varDict["$" + formName] = varDict["$" + formName] || {};
    }
    $.each(form, function(idx, elem) {
        if (/\$[a-zA-Z0-9]+/.test(elem.name)) {
            varDict[elem.name] = elem.value
        } else {
            varDict["$" + formName][elem.name] = elem.value;
        }
    })
}

module.exports.resolveScript = function(step) {
    var variable = step['resultVariable']
    var script = step['script']
    varDict[variable] = eval(script)
}

module.exports.resolveXOR = function(xor) {
    if (!Array.isArray(xor["outgoing"])) {
        var signal = WF.bpmns[WF.bpmns.length - 1][xor["outgoing"][0]["id"]];
        var expr = signal["expression"];
        var parsed = WF.parseExpression(expr);
        var result = eval(parsed);
        if (result) {
            return WF.doStep(signal["id"])
        }
    } else {
        for (var i = 0; i < xor["outgoing"].length; i++) {
            var signal = WF.bpmns[WF.bpmns.length - 1][xor["outgoing"][i]["id"]];
            var expr = signal["expression"];
            expr = WF.parseExpression(expr);
            var result = eval(expr);
            if (result) {
                return WF.doStep(signal["id"])
            }
        }

    }
    try{
      return WF.doStep(xor.default.id)
    }catch (e){
      console.log(e)
    }
}

module.exports.parseExpression = function(expr) {
  if (!expr){
    return ""
  }
    var list = expr.match(/\{\$[$][a-zA-Z]+\}/g);
    var matches = [...new Set(list)];
    if (list) {
        $.each(matches, function(idx, elem) {
            expr = expr.replace(new RegExp("\\" + elem, "g"), 'varDict["' + elem + '"]"');

        })
    }
    list = expr.match(/[$][a-zA-Z]+/g);
    matches = [...new Set(list)];
    if (list != null) {
        $.each(matches, function(idx, elem) {
            // var nonLiteral = elem.match(/[$][a-zA-Z]+(?=\.)/g);
            expr = expr.replace(new RegExp("\\" + elem,"g"), `varDict["${elem}"]`);
        })
    }

    return expr

}
