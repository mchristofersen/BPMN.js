
module.exports = function() {
    $.getJSON("/processMap", {}, function(resp) {
        console.log(resp)
        var processMap = resp
        var newNodes = {};
        var sequences = {};
        var reverseMap = {};
        var start = null;
        var newToOldConnections = {};
        var modeling = bpmnModeler.get("modeling");
        var backwards = {}
        flow.workflow_contents.childShapes.forEach(function(elem) {
            backwards[elem.resourceId] = elem
        })
        flow.workflow_contents.childShapes.forEach(function(e) {
            reverseMap[e.resourceId] = e;
            try {
                if (/motv-so.*$/.test(e.stencil.id)) {
                    var formatted = "motv-so";
                    console.log(e);
                } else {
                    var formatted = e.stencil.id;
                }
            } catch (error) {
                console.log(e);

                var formatted = "SequenceFlow";
            }
            try {
                switch (formatted) {
                    case "StartEvent":
                        start = e;
                        var ns = "bpmn:StartEvent";
                        break;
                    case "EndEvent":
                        start = e;
                        var ns = "bpmn:EndEvent";
                        break;
                    case "script":
                        var ns = "bpmn:ScriptTask";
                        try {
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                            elementRegistry.updateId(temp, e.resourceId)
                                // var newElement = elementRegistry.get(temp)
                            var modeling = bpmnModeler.get("modeling")
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var script = e.properties.text
                                element.height = 40
                                element.businessObject.resultVariable = e.properties.var
                                element.businessObject.scriptFormat = e.properties.lang
                                element.businessObject.script = script;
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Exclusive (XOR) Gateway":
                    case "Exclusive_Databased_Gateway":
                        var ns = "bpmn:ExclusiveGateway";
                        console.log(e.properties);
                        break;
                    case "goto-reference":
                        var ns = "bpmn:IntermediateThrowEvent";
                        console.log(e)
                        try {
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            // console.log(e)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, backwards[e.properties.target].properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var link = moddle.create("bpmn:LinkEventDefinition", {
                                        // source:temp,
                                        name: backwards[e.properties.target].properties.name
                                    })
                                    // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [link]
                                })
                                ns = ""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "reference":
                        var ns = "bpmn:IntermediateCatchEvent";
                        console.log(e)
                        try {
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);

                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var link = moddle.create("bpmn:LinkEventDefinition", {
                                        name: e.properties.name
                                    })
                                    // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [link]
                                })
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Process Transfer":
                    case "subproc-transfer":
                        var ns = "bpmn:IntermediateThrowEvent";
                        console.log(e)
                        try {
                          var elementFactory = bpmnModeler.get('elementFactory'),
                          bpmnFactory = bpmnModeler.get('bpmnFactory');
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            // console.log(e)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, processMap[e.properties.processid])
                                var element = elementRegistry.get(e.resourceId)
                                var modeling = bpmnModeler.get("modeling")
                                    // element.eventDefinitionType = "bpmn:LinkEventDefinition"
                                var moddle = bpmnModeler.get("moddle")
                                var signal = bpmnFactory.create('bpmn:Signal',{
                                  name:processMap[e.properties.processid]
                                })
                                var signalEventDefinition = bpmnFactory.create('bpmn:SignalEventDefinition',{
                                rootElements:[signal]
                                });

                                // var rootElement = bpmnModeler.get('canvas').getRootElement().businessObject.$parent.rootElements;
                                // rootElement.push(signalElement);
                                // link.$parent = elementRegistry.get(flowName)

                                modeling.updateProperties(element, {
                                    eventDefinitions: [signalEventDefinition]
                                })
                                ns = ""
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "motv-wizard-form":
                    case "motv-wizard-question":
                    case "motv-wizard-information":
                    case "motv-wizard-selector":
                        var ns = "bpmn:UserTask";
                        try {
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var modeling = bpmnModeler.get("modeling")
                                var element = elementRegistry.get(e.resourceId)
                                var text = e.properties.header + e.properties.text + e.properties.footer
                                    // modeling.updateProperties(element,{
                                    //   id:e.resourceId
                                    // })
                                    // console.log(element.businessObject);
                                element.businessObject.html = text;
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "motv-wizard-wait":
                        var ns = "bpmn:ReceiveTask"
                        break;
                    case "motv-so":
                        var ns = "bpmn:SendTask";
                        break;
                    case "subflow":
                        var ns = "bpmn:SubProcess";
                        try {
                            var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                            // var newElement = elementRegistry.get(temp)
                            elementRegistry.updateId(temp, e.resourceId)
                            newNodes[e.resourceId] = e.resourceId;
                            newToOldConnections[e.resourceId] = e.outgoing;
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                                var modeling = bpmnModeler.get("modeling")
                                var element = elementRegistry.get(e.resourceId)
                                element.businessObject.flowId = processMap[e.properties.processid]
                            } catch (err) {
                                console.log(err)
                            }

                        } catch (err) {
                            console.log(ns);
                            console.error(err);
                        }
                        break;
                    case "Association_Undirected":
                        var ns = "";
                        break;
                    case "SequenceFlow":
                        sequences[e.resourceId] = e;
                        var ns = "";
                        break;
                    default:
                        var ns = "";
                        break;

                }
                if (ns != "" && ns != "bpmn:ScriptTask" && ns != "bpmn:UserTask" && ns != "bpmn:SubProcess" && ns != "bpmn:IntermediateCatchEvent") {
                    try {
                        var temp = cli.create(ns, e.bounds.lowerRight.x + "," + e.bounds.lowerRight.y, flowName);
                        elementRegistry.updateId(temp, e.resourceId)
                        var newElement = elementRegistry.get(e.resourceId)
                        var modeling = bpmnModeler.get("modeling")
                        var element = elementRegistry.get(e.resourceId)
                            // modeling.updateProperties(element,{
                            //   id:e.resourceId
                            // })
                        newNodes[e.resourceId] = e.resourceId;
                        newToOldConnections[e.resourceId] = e.outgoing;
                        if (ns != "bpmn:ExclusiveGateway") {
                            try {
                                cli.setLabel(e.resourceId, e.properties.name)
                            } catch (err) {

                            }
                        }


                    } catch (err) {
                        console.log(ns);
                        console.error(err);
                    }
                }

            } catch (err) {}


        })
        for (var old in newNodes) {
            var newNode = newNodes[old];
            var neededConnections = newToOldConnections[newNode];
            neededConnections.forEach(function(oldId, idx) {
                // console.log(sequences[oldId.resourceId])
                try {
                    var temp = cli.connect(newNode, newNodes[sequences[oldId.resourceId].target.resourceId], "bpmn:SequenceFlow")
                    try {
                        cli.setLabel(temp, sequences[oldId.resourceId].properties.conditionexpression)
                    } catch (e) {
                        console.log(e)
                    }
                    try {
                        elementRegistry.updateId(temp, oldId.resourceId)
                        var waypointCount = sequences[oldId.resourceId].dockers.length;
                        // if (waypointCount > 2){
                        //   console.log(sequences[oldId.resourceId].dockers)
                        //   var element = elementRegistry.get(oldId.resourceId)
                        //   var waypoints = element.waypoints
                        //   var old = sequences[oldId.resourceId].dockers
                        //   old[0] = waypoints[0]
                        //   old[old.length-1] = waypoints[waypoints.length -1]
                        //   // for (var j = 1;j<old.length-1;j++){
                        //   //   old[j] = {original:{x:old[j-1].x,y:old[j-1].y},
                        //   //             x:old[j].x,
                        //   //             y:old[j].y
                        //   //           }
                        //   // }
                        //
                        //   console.log(old)
                        //   var modeling = bpmnModeler.get("modeling")
                        //   modeling.updateWaypoints(element,old)
                        // }
                    } catch (err) {
                        console.log(err)
                    }
                } catch (err) {
                    console.log(err);
                }

            })

        }
        var elemId = cli.create("bpmn:TextAnnotation", "10,10", flowName);
        var element = elementRegistry.get(elemId);
        element.width = 300;
        console.log(element);
        modeling.updateProperties(element, {
            text: flowName
        })
    })


}
