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
            // var newElement = elementRegistry.get(temp)

            newNodes[e.resourceId]=temp;
            newToOldConnections[temp] = e.outgoing;
            try{
              cli.setLabel(temp, e.properties.name)
              var element = elementRegistry.get(temp)
              var script = e.properties.text
              element.businessObject.di.bounds.height = 40
              element.businessObject.di.bounds.y += 20
              element.businessObject.resultVariable = e.properties.var
              element.businessObject.scriptFormat = e.properties.lang
              element.businessObject.script = script;
              console.log(element.businessObject);
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
          break;
        case "motv-wizard-wait":
          var ns = "bpmn:ReceiveTask"
          break;
        case "motv-so":
          var ns = "bpmn:SendTask";
          break;
        case "subflow":
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
      if (ns != "" && ns!= "bpmn:ScriptTask"){
        try{
          var temp = cli.create(ns,e.bounds.lowerRight.x+","+e.bounds.lowerRight.y,flowName);
          // var newElement = elementRegistry.get(temp)

          newNodes[e.resourceId]=temp;
          newToOldConnections[temp] = e.outgoing;
          try{
            cli.setLabel(temp, e.properties.name)
          }catch (err){

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
