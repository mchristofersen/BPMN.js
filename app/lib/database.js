'use strict';

var $ = require("jquery");
var flowName = null;
var bo = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

function Database(bpmnModeler) {
    this.bpmnModeler = bpmnModeler;
    this.elementRegistry = bpmnModeler.elementRegistry;
    this.canvas = bpmnModeler.canvas;
    this.modeling = bpmnModeler.modeling;
    this.moddle = bpmnModeler.moddle;
}

module.exports.createNewDiagram = function() {
    var name = prompt("Enter Workflow Name:");
    var flowName = name;
    $("#flows").hide();
    var container = $('#js-drop-zone');

    var modeling = bpmnModeler.get("modeling");
    var processElement = elementRegistry.get("Process_1");

    bpmnModeler.createDiagram(function(done) {
        // when
        var processElement = elementRegistry.get("Process_1");
        modeling.updateProperties(processElement, {
            id: name
        });
        container
            .removeClass('with-error')
            .addClass('with-diagram');
        bpmnModeler.saveXML({
            format: true
        }, function(err, xml) {
            bpmnModeler.saveSVG({
                format: true
            }, function(err, svg) {
                $.ajax({
                    url: "http://localhost:3000/flow",
                    method: "POST",
                    data: {
                        flowName: name,
                        xml: xml,
                        svg: svg
                    }
                }).done(function(resp) {
                    console.log(resp);
                })
            });
        })



    });

}



// bootstrap diagram functions
var processXML = function(resp) {
    var moddle;
		var inverted = {}
    bpmnModeler.moddle.fromXML(resp[0].xml, function done(err, resp) {
        WF.moddle = resp
        $.each(WF.moddle.rootElements[0].flowElements, function(idx, elem) {
            if (Array.isArray(elem)) {
                $.each(elem, function(i, e) {
                    if (elem.$type == "bpmn:IntermediateCatchEvent") {
                        inverted[e["eventDefinitions"][0]["signalRef"]["id"]] = e;


                    } else {
                        inverted[e.id] = e;

                    }
                })


            } else if (elem.$type == "bpmn:StartEvent") {
                inverted["start"] = elem;
            } else if (elem.$type == "bpmn:IntermediateCatchEvent") {
							inverted[elem["eventDefinitions"][0]["signalRef"]["id"]] = elem;

            } else {
                inverted[elem.id] = elem;
            }
        })
    })
		//
    // var X2JS = require("x2js");
    // var x2js = new X2JS({
    //     attributePrefix: "$"
    // });
    // var jsonObj = x2js.xml2js(resp[0].xml);
    // var inverted = {};
    // $.each(jsonObj.definitions.process, function(idx, elem) {
    //     if (Array.isArray(elem)) {
    //         $.each(elem, function(i, e) {
    //             if (idx == "intermediateCatchEvent") {
    //                 inverted[e["signalEventDefinition"]["$signalRef"]] = e;
    //                 inverted[e["signalEventDefinition"]["$signalRef"]]["$type"] = idx;
		//
		//
    //             } else {
    //                 inverted[e.$id] = e;
    //                 inverted[e.$id]["$type"] = idx;
		//
    //             }
    //         })
		//
		//
    //     } else if (idx == "startEvent") {
    //         inverted["start"] = elem;
    //         inverted["start"]["$type"] = idx;
    //     } else if (idx == "intermediateCatchEvent") {
    //         inverted[elem["signalEventDefinition"]["$signalRef"]] = elem;
    //         inverted[elem["signalEventDefinition"]["$signalRef"]]["$type"] = idx;
		//
		//
    //     } else if (!typeof elem == "object") {
    //         inverted[elem.$id] = bo(elem);
    //         inverted[elem.$id]["type"] = idx;
    //     }
    // })
    inverted.$flowName = resp[0].flowName;
    if (WF.rootFlow == undefined) {
        WF.rootFlow = inverted
    }
    return inverted
        // Access to attribute


}
module.exports.processXML = processXML;

module.exports.finalizeMerge = function(xml, flowName, user, diff, rightModeler) {
    rightModeler.saveSVG({
        format: true
    }, function(err, svg) {
        $.ajax({
            url: "http://localhost:3000/merge",
            method: "post",
            data: {
                flowName: flowName,
                xml: xml,
                user: user,
                svg: svg,
                changes: JSON.stringify(diff)
            }
        }).done(function(resp) {
            isBranch = false;
            bus.fire("editor.confirm",[])
        })
    });

}

module.exports.saveDiagram = function(done) {
    var conn = isBranch ? "http://localhost:3000/branch/update" : "http://localhost:3000/flow/update";
    var elementRegistry = bpmnModeler.get("elementRegistry")
    bpmnModeler.saveXML({
        format: true
    }, function(err, xml) {
        bpmnModeler.saveSVG({
            format: true
        }, function(err, svg) {
            $.ajax({
                    url: conn,
                    method: "post",
                    data: {
                        flowName: bpmnModeler.get("canvas").getRootElement().id,
                        xml: xml,
                        svg: svg,
                        user: user
                    }
                }).done(function(resp) {
                    console.log(resp)
                    processXML([{
                        xml: xml
                    }])
                })
                //  done(err, svg);
        });

        done(err, xml);
    });
}
