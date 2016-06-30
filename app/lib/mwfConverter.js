module.exports = function (){
  var newNodes = {};
  var sequences = {};
  var reverseMap = {};
  var start = null;
  var newToOldConnections = {};
  var modeling = bpmnModeler.get("modeling");
  flow.workflow_contents.childShapes.forEach( function (e){
    reverseMap[e.resourceId] = e;
    try{
      if (/motv-so.*$/.test(e.stencil.id)){
        var formatted = "motv-so";
        console.log(e);
      }else{
        var formatted = e.stencil.id;
      }
    }catch (error){
      console.log(e);

      var formatted = "SequenceFlow";
    }
    try{
      switch (formatted){
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
          try{
            var temp = cli.create(ns,e.bounds.lowerRight.x+","+e.bounds.lowerRight.y,flowName);
            elementRegistry.updateId(temp,e.resourceId)
            // var newElement = elementRegistry.get(temp)
            var modeling = bpmnModeler.get("modeling")
            newNodes[e.resourceId]=e.resourceId;
            newToOldConnections[e.resourceId] = e.outgoing;
            try{
              cli.setLabel(e.resourceId, e.properties.name)
              var element = elementRegistry.get(e.resourceId)
              var script = e.properties.text
              element.height = 40
              element.businessObject.resultVariable = e.properties.var
              element.businessObject.scriptFormat = e.properties.lang
              element.businessObject.script = script;
              // modeling.updateProperties(element,{
              //   id:e.resourceId
              // })
              // console.log(element.businessObject);
              // modeling.updateProperties(element,{
              //   script:script
              // })
            }catch (err){
              console.log(err)
            }

          }catch (err){
              console.log(ns);
              console.error(err);
          }
          break;
        case "Exclusive (XOR) Gateway":
        case "Exclusive_Databased_Gateway":
          var ns = "bpmn:ExclusiveGateway";
          break;
        case "goto-reference":
          var ns = "bpmn:IntermediateThrowEvent";
          try{
            var temp = cli.create(ns,e.bounds.lowerRight.x+","+e.bounds.lowerRight.y,flowName);
            // var newElement = elementRegistry.get(temp)
            // console.log(e)
            elementRegistry.updateId(temp,e.resourceId)
            newNodes[e.resourceId]=e.resourceId;
            newToOldConnections[e.resourceId] = e.outgoing;
            try{
              // cli.setLabel(temp, e.name)
              var element = elementRegistry.get(e.resourceId)
              var modeling = bpmnModeler.get("modeling")
              // element.eventDefinitionType = "bpmn:LinkEventDefinition"
              var moddle = bpmnModeler.get("moddle")
              var link = moddle.create("bpmn:LinkEventDefinition",{
                source:temp,
                name:e.properties.target
              })
              // link.$parent = elementRegistry.get(flowName)

              modeling.updateProperties(element, {
                eventDefinitions: [link]
              })
              // bpmnModeler._emit("shape.changed",temp)
              // modeling.updateProperties(element, {
              //   eventDefinitionType: "bpmn:LinkEventDefinition"
              // })
              console.log(element);
              // modeling.updateProperties(element,{
              //   script:script
              // })
            }catch (err){
              console.log(err)
            }

          }catch (err){
              console.log(ns);
              console.error(err);
          }
          break;
        case "reference":
        case "subproc-transfer":
        case "Process Transfer":
          var ns = "bpmn:IntermediateCatchEvent";
          break;
        case "motv-wizard-form":
        case "motv-wizard-question":
        case "motv-wizard-information":
        case "motv-wizard-selector":
          var ns = "bpmn:UserTask";
          try{
            var temp = cli.create(ns,e.bounds.lowerRight.x+","+e.bounds.lowerRight.y,flowName);
            // var newElement = elementRegistry.get(temp)
            elementRegistry.updateId(temp,e.resourceId)
            newNodes[e.resourceId]=e.resourceId;
            newToOldConnections[e.resourceId] = e.outgoing;
            try{
              cli.setLabel(e.resourceId, e.properties.name)
              var modeling = bpmnModeler.get("modeling")
              var element = elementRegistry.get(e.resourceId)
              var text = e.properties.header + e.properties.text + e.properties.footer
              // modeling.updateProperties(element,{
              //   id:e.resourceId
              // })
              // console.log(element.businessObject);
              element.businessObject.html = text;
            }catch (err){
              console.log(err)
            }

          }catch (err){
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
          console.log(e)
          var ns = "bpmn:SubProcess";
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
      if (ns != "" && ns!= "bpmn:ScriptTask" && ns!= "bpmn:UserTask"){
        try{
          var temp = cli.create(ns,e.bounds.lowerRight.x+","+e.bounds.lowerRight.y,flowName);
          elementRegistry.updateId(temp,e.resourceId)
          var newElement = elementRegistry.get(e.resourceId)
          var modeling = bpmnModeler.get("modeling")
          var element = elementRegistry.get(e.resourceId)
          // modeling.updateProperties(element,{
          //   id:e.resourceId
          // })
          newNodes[e.resourceId]=e.resourceId;
          newToOldConnections[e.resourceId] = e.outgoing;
          if (ns != "bpmn:ExclusiveGateway"){
            try{
              cli.setLabel(e.resourceId, e.properties.name)
            }catch (err){

            }
          }


        }catch (err){
            console.log(ns);
            console.error(err);
        }
      }

    }catch (err){
    }


  })
  for (var old in newNodes) {
  var newNode = newNodes[old];
    var neededConnections = newToOldConnections[newNode];
    neededConnections.forEach(function (oldId){
      try{
        var temp = cli.connect(newNode,newNodes[sequences[oldId.resourceId].target.resourceId],"bpmn:SequenceFlow")
        try{
          cli.setLabel(temp, sequences[oldId.resourceId].properties.conditionexpression)
        }catch (err){

        }
      }catch (err){
        console.log(err);
      }
    })

  }
  var elemId = cli.create("bpmn:TextAnnotation","10,10",flowName);
  var element = elementRegistry.get(elemId);
  element.width = 300;
  console.log(element);
  modeling.updateProperties(element, {
    text: flowName,
    name: "Flow"
  })

}
