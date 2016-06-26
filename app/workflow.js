module.exports.start = function() {
    WF.bpmns = [global.process];
    global.varDict = {};
    var suspendedStep = null;
    node_manager.init(global.process);
    WF.doStep("start")
    console.log("noice")
}



var $ = require("jquery"),
    d3 = require("d3"),
    userTaskResolver = require("./userTaskResolver");

$("#js-execute-diagram").click(function(e) {
    WF.context = {};
    WF.start()
})

module.exports.doStep = function(stepId) {
    setTimeout(function() {
        var step = WF.bpmns[WF.bpmns.length - 1][stepId];
        if (stepId == "start") {
            stepId = WF.bpmns[WF.bpmns.length - 1]["start"]["$id"];
        } else if (step["$type"] == "intermediateCatchEvent") {
            stepId = WF.bpmns[WF.bpmns.length - 1][stepId]["$id"];
        }
        var shape = d3.selectAll("[data-element-id=" + stepId + "] > .djs-visual").selectAll("rect,path,circle,polygon,polyline").attr("stroke", "green");
        var name = step['$id'];
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
                return userTaskResolver.renderPage(step)
                break;
            case "task":
                var expr = step["$ext:js"];
                expr = WF.parseExpression(expr)
                eval(expr);
                return WF.doStep(step["outgoing"]["__text"])
                break;
            default:
                return WF.doStep(step["outgoing"]["__text"]);
                break;
        }
    }, 10);

}

module.exports.interpolateJS = function(step, arr) {
    var re = /\$\{(\$[a-zA-Z0-9]*?)\}/g;
    var match;
    while (match = re.exec(step["$ext:js"])) {
        step["$ext:js"] = step["$ext:js"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
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
    matches = step["$ext:js"].match(/\$[a-zA-Z0-9]+/g);
    $.each(matches, function(idx, elem) {
        if (varDict[elem] != undefined) {
            step["$ext:js"] = step["$ext:js"].replace(new RegExp("\\" + elem), `varDict["${elem}"]`);
        }
    })
    return step
}

module.exports.parseHTML = function(step) {
  re = /\$\{(\$[a-zA-Z0-9]+)\}/g;
  var match;
  while (match = re.exec(step["$ext:html"])) {
      step["$ext:html"] = step["$ext:html"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
  }
  re = /\$\{(\%[a-zA-Z0-9]+)\}/g;
  var match;
  while (match = re.exec(step["$ext:html"])) {
      step["$ext:html"] = step["$ext:html"].replace(new RegExp("\\$\{\\" + match[1] + "\}", "g"), varDict[match[1]])
  }
  return step
}

module.exports.renderPage = function(step) {
    // var matches = step["$ext:html"].match(/\$[a-zA-Z0-9]+(?!['"])/g);
    // var html = '';
    // $.each(matches, function(idx, elem) {
    //     if (varDict[elem] != undefined) {
    //         step["$ext:html"] = step["$ext:html"].replace(new RegExp("\\" + elem, "g"), varDict[elem]);
    //     }
    // })
    step = WF.parseHTML(step)
    step = WF.prepareJSForEval(step)
    html = `${step["$ext:html"]}<style>${step["$ext:css"]}</style><script>${step["$ext:js"]}</script>`;
    $("#renderedPage").html(html).parent().show();

}

module.exports.handleForm = function(form) {
    var formName = suspendedStep['$name'];
    if (formName == "" || formName == undefined) {
        return
    } else {
        varDict["$" + formName] = {};
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
    var variable = step['$camunda:resultVariable']
    var script = step['script']["__cdata"] == undefined ? WF.parseExpression(step['script']["__text"]) : WF.parseExpression(step['script']["__cdata"]);
    varDict[variable] = eval(script)
}

module.exports.resolveXOR = function(xor) {
    if (!Array.isArray(xor["outgoing"])) {
        var signal = WF.bpmns[WF.bpmns.length - 1][xor["outgoing"]];
        var expr = signal["conditionExpression"]["__cdata"] || signal["conditionExpression"]["__text"];
        var parsed = WF.parseExpression(expr);
        var result = eval(parsed);
        if (result) {
            return WF.doStep(signal["$id"])
        }
    } else {
        for (var i = 0; i < xor["outgoing"].length; i++) {
            var signal = WF.bpmns[WF.bpmns.length - 1][xor["outgoing"][i]];
            var expr = signal["$ext:expression"];
            expr = WF.parseExpression(expr);
            var result = eval(expr);
            if (result) {
                return WF.doStep(signal["$id"])
            }
        }

    }
}

module.exports.parseExpression = function(expr) {
    var list = expr.match(/\{\$[$][a-zA-Z]+\}/g);
    var matches = [...new Set(list)];
    if (list) {
        $.each(matches, function(idx, elem) {
            expr = expr.replace(new RegExp("\\" + elem, "g"), 'varDict["' + elem + '"]"');

        })
    }
    list = expr.match(/[$][a-zA-Z]+\.?/g);
    matches = [...new Set(list)];
    if (list != null) {
        $.each(matches, function(idx, elem) {
            var nonLiteral = elem.match(/[$][a-zA-Z]+(?=\.)/g);
            if (nonLiteral) {
                expr = expr.replace(new RegExp("\\" + nonLiteral[0], "g"), `varDict["${nonLiteral[0]}"]`);
            } else {
                expr = expr.replace(new RegExp("\\" + elem, "g"), varDict[elem]);
            }


        })
    }

    return expr

}
