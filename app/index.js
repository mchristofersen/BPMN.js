  
   var fs = require('fs');

   var d3 = require("d3");
   var beautify = ace.require("ace/ext/beautify");


   WF = require('./workflow.js');
   var $ = require('jquery'),
       Modeler = require('bpmn-js/lib/Modeler');
   var parseString = require('xml2js').parseString;

   var propertiesPanelModule = require('bpmn-js-properties-panel'),
       propertiesProviderModule = require('bpmn-js-properties-panel/lib/provider/camunda'),
       camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda'),
       extModdleDescriptor = require('./descriptors/ext.json');

   var CmdHelper = require("bpmn-js-properties-panel/lib/helper/CmdHelper");

   var container = $('#js-drop-zone');

   var canvas = $('#js-canvas');

   // var MongoClient = require('mongodb').MongoClient
   //   , Server = require('mongodb').Server;
   //
   // var mongoClient = new MongoClient();
   // mongoClient.connect("mongodb://localhost:27017/test", function (err, mongoClient) {
   //   var db1 = mongoClient.db("mydb");
   //
   //   mongoClient.close();
   // });

   var bpmnModeler = new Modeler({
       container: canvas,
       propertiesPanel: {
           parent: '#js-properties-panel'
       },
       additionalModules: [
           propertiesPanelModule,
           propertiesProviderModule
       ],
       moddleExtensions: {
           camunda: camundaModdleDescriptor,
           ext: extModdleDescriptor

       }
   });
   bpmnModeler.get('keyboard').bind(document);
   bpmnJS = bpmnModeler,
       elementRegistry = bpmnModeler.get('elementRegistry');
   modeling = bpmnModeler.get('modeling');
   canvas = bpmnModeler.get("canvas");
   eventBus = bpmnModeler.get("eventBus");
   propertiesPanel = bpmnJS.get('propertiesPanel');
   // var newDiagramXML = fs.readFileSync('../../backend/newDiagram.bpmn', 'utf-8');

   function createNewDiagram() {
       var name = prompt("Enter Workflow Name:");
       flowName = name;
       bpmnModeler.createDiagram(function(xml) {
           // given
           var processElement = elementRegistry.get('Process_1');

           // when
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
                   done(err, svg);
               });

               done(err, xml);
           });
       })

       // PropertiesPanel.setInputValue($("camunda-id"),name)
   }

   function openDiagram(xml) {

       $("#js-properties-panel").show();
       bpmnModeler.importXML(xml, function(err) {
           if (err) {
               container
                   .removeClass('with-diagram')
                   .addClass('with-errorStartEvent_1');

               container.find('.error pre').text(err.message);

               console.error(err);
           } else {
               container
                   .removeClass('with-error')
                   .addClass('with-diagram');

           }


       });

   }

   function close() {
       getThumbnails()
   }

   function closeDiagram() {
       container
           .removeClass('with-diagram')
           .removeClass('with-error');
       $("#")
       $("#flowPreviews").show();
       //  var diagram = bpmnModeler.get("diagram");
       bpmnModeler.moddle.ids.clear()
           // bpmnModeler.clear()
       $("#js-properties-panel").hide();
       //  bpmnModeler._emit("diagram.destroy")
       //  del bpmnModeler.




   }

   function saveSVG(done) {
       bpmnModeler.saveSVG({
           format: true
       }, function(err, svg) {
           //  $.ajax({
           //      url: "http://localhost:3000/svg",
           //      method: "POST",
           //      data: {
           //          svg: svg,
           //          flowName: flowName
           //      }
           //  }).done(function(resp) {
           //      console.log(resp.message);
           //  })
           done(err, svg);
       });
   }

   function saveDiagram(done) {
       bpmnModeler.saveXML({
           format: true
       }, function(err, xml) {
           bpmnModeler.saveSVG({
               format: true
           }, function(err, svg) {
               $.ajax({
                   url: "http://localhost:3000/flow",
                   method: "PUT",
                   data: {
                       flowName: global.flowName,
                       xml: xml,
                       svg: svg
                   }
               }).done(function(resp) {
                   processXML([{xml:xml}])
               })
               done(err, svg);
           });

           done(err, xml);
       });
   }

   function registerFileDrop(container, callback) {

       function handleFileSelect(e) {
           e.stopPropagation();
           e.preventDefault();

           var files = e.dataTransfer.files;

           var file = files[0];

           var reader = new FileReader();

           reader.onload = function(e) {

               var xml = e.target.result;

               callback(xml);
           };

           reader.readAsText(file);
       }

       function handleDragOver(e) {
           e.stopPropagation();
           e.preventDefault();

           e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
       }

       container.get(0).addEventListener('dragover', handleDragOver, false);
       container.get(0).addEventListener('drop', handleFileSelect, false);
   }


   ////// file drag / drop ///////////////////////

   // check file api availability
   if (!window.FileList || !window.FileReader) {
       window.alert(
           'Looks like you use an older browser that does not support drag and drop. ' +
           'Try using Chrome, Firefox or the Internet Explorer > 10.');
   } else {
       registerFileDrop(container, openDiagram);
   }

   function deleteFlow() {
       $.ajax({
           url: "http://localhost:3000/flow",
           method: "delete",
           data: {
               flowName: global.flowName
           },
       }).done(function(resp) {
           console.log(resp);
           closeDiagram();
       })
   }

   // bootstrap diagram functions
   function processXML(resp) {

       var X2JS = require("x2js");
       var x2js = new X2JS({
           attributePrefix: "$"
       });
       var jsonObj = x2js.xml2js(resp[0].xml);
       var inverted = {};
       console.log(jsonObj);
       $.each(jsonObj.definitions.process, function(idx, elem) {
           if (Array.isArray(elem)) {
               $.each(elem, function(i, e) {
                   inverted[e.$id] = e;
                   inverted[e.$id]["$type"] = idx;
               })
           } else if (idx == "startEvent") {
               inverted["start"] = elem;
               inverted["start"]["$type"] = idx;
           } else if (idx == "intermediateCatchEvent") {
               inverted[elem["signalEventDefinition"]["$signalRef"]] = elem;
               inverted[elem["signalEventDefinition"]["$signalRef"]]["$type"] = idx;


           } else if (!typeof elem == "object") {
               inverted[elem.$id] = elem;
               inverted[elem.$id]["$type"] = idx;
           } else if (typeof elem == "object") {
               inverted[elem.$id] = elem;
               inverted[elem.$id]["$type"] = idx;
           }
       })
       global.process = inverted;
       // Access to attribute


   }


   global.getXML = function(flowName) {
       global.flowName = flowName;
       $.ajax({
           url: "http://localhost:3000/flow",
           method: "get",
           data: {
               flowName: global.flowName
           },
           success: function (resp){
             processXML(resp)
             $("#flowPreviews").hide();
             openDiagram(resp[0].xml);
           }
       });

   }




   function getThumbnails() {
       $("#flowPreviews").html("");
       $.ajax({
           url: "http://localhost:3000/getThumbnails",
           contentType: "text/json",
           method: "GET",
           success: function(json) {
               $(document).ready(function() {
                   $.each(json, function(idx, elem) {
                           d3.select("#flowPreviews").append("g")
                               .html(elem.svg)
                               .attr("id", elem.flowName)
                               .on("click", function(d) {
                                   global.flowName = elem.flowName;
                                   getXML(elem.flowName);
                               })
                               .on("mouseenter", function(d) {
                                   d3.select(this).attr("fill", "#fc6293")
                               })
                               .on("mouseleave", function(d) {
                                   d3.select(this).attr("fill", "#fff")
                               })
                               .append("text")
                               .text(elem.flowName)



                           // .attr({"height":500,"width":500})
                           // .attr("transform","scale(0.4)")
                           // .html(function (d){
                           //   var wrapping = d3.select(this).html();
                           //   return "<g>"+wrapping+"</g>";
                           // })
                           // .select("g")
                           // .append("text")
                           // .text(idx)

                       })
                       // $("#flowPreviews").append(elem);
               })
           }
       })
   }

   function l(mess) {
       console.log(mess);
   }

   function confirmEdit(elem, leftEditor, rightEditor, bottomEditor) {
       var bus = elem.businessObject;
       debugger;
       if (bus.$type == "bpmn:UserTask") {
           modeling.updateProperties(bus, {
               html: leftEditor.getValue() || "",
               js: rightEditor.getValue() || "",
               css: bottomEditor.getValue() || ""
           })
       } else {
           modeling.updateProperties(elem, {
               js: rightEditor.getValue()
           })
       }
       $("#js-canvas").show();
       $(".fiddle").hide();
   }

   function cancelEdit() {
       $("#js-canvas").show();
       $(".fiddle").hide();
   }




   $(document).on('ready', function() {
       getThumbnails();
       $(".fiddle").hide();


       $("#js-delete-diagram").click(function(e) {
           deleteFlow();
       });
       $("#hidePanel > svg").click(function(e) {
           e.stopPropagation();
           e.preventDefault();
           $("#js-properties-panel").animate({
               width: "0%"
           }, 1000)
       });
       $(document).on("keypress", function(e) {
           if (e.charCode == 112 && e.altKey) {
               $("#js-properties-panel").toggle();
           };
       })

       $('#js-create-diagram').click(function(e) {
           e.stopPropagation();
           e.preventDefault();
           $("#flowPreviews").hide();
           createNewDiagram();

       });

       var downloadLink = $('#js-download-diagram');
       var downloadSvgLink = $('#js-download-svg');

       $('.buttons a').click(function(e) {
           if (!$(this).is('.active')) {
               e.preventDefault();
               e.stopPropagation();
           }
       });

       $("#js-close-diagram").click(function(e) {
           closeDiagram();
           close();
       })
       $(".flowImage").click(function(e) {
           var name = $(e.sender).attr("id");
           global.flowName = name;
           $.ajax({
                   url: "http://localhost:3000/flow",
                   method: "GET",
                   data: {
                       flowName: name
                   },
                   success: function(xml) {
                       openDiagram(xml);
                   }
               })
               // closeDiagram();
       })

       function setEncoded(link, name, data) {
           var encodedData = encodeURIComponent(data);

           if (data) {
               link.addClass('active').attr({
                   'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
                   'download': name
               });
           } else {
               link.removeClass('active');
           }
       }

       var debounce = require('lodash/function/debounce');

       var exportArtifacts = debounce(function() {

           saveSVG(function(err, svg) {
               setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
           });

           saveDiagram(function(err, xml) {
               setEncoded(downloadLink, 'top.bpmn', err ? null : xml);
           });
       }, 500);

       $('.overlay').click(function(e) {
           $('.overlay').removeClass('expanded');
           $(this).addClass('expanded');
       });
       $('.overlay').on('mouseover', function(e) {

           $('.overlay > div').removeClass('focused');
           $(this).children().addClass('focused');
       });


       bpmnModeler.on('commandStack.changed', exportArtifacts);

       bpmnModeler.on("propertiesPanel.changed", function(e) {
           var currentElement = e.current.element;

           $("#camunda-html,#camunda-js,#camunda-css").on("click", function(e) {
                   $(".fiddle").show();
                   ace.require("ace/ext/language_tools");
                   var leftEditor = ace.edit("leftEditor");
                   leftEditor.setOptions({
                       enableBasicAutocompletion: true,
                       enableSnippets: true
                   });
                   if (currentElement.businessObject.html != undefined) {
                       leftEditor.setValue(currentElement.businessObject.html);
                   } else {
                       leftEditor.setValue("");
                   }
                   leftEditor.getSession().setUseWorker(true);
                   leftEditor.setTheme("ace/theme/sqlserver");
                   leftEditor.getSession().setMode("ace/mode/html");
                   leftEditor.getSession().setUseWrapMode(true);
                   leftEditor.getSession().setFoldStyle("markbeginend");
                   leftEditor.setShowFoldWidgets(true);
                   leftEditor.setFadeFoldWidgets(true);
                   leftEditor.setBehavioursEnabled(true);
                   leftEditor.commands.addCommands(beautify.commands);
                   document.getElementById('leftEditor').style.fontSize = '24px';
                   leftEditor.setOptions({
                       enableBasicAutocompletion: true,
                       enableSnippets: true,
                       enableLiveAutocompletion: true
                   });

                   var html = leftEditor.getValue();
                   $("#previewHTML").html(html);
                   $("#leftEditor").on("mouseenter", function() {
                       leftEditor.resize();
                   })
                   $("#leftEditor").on("mouseout", function() {
                       leftEditor.resize();
                   })



                   var bottomEditor = ace.edit("bottomEditor");
                   if (currentElement.businessObject.css != undefined) {
                       bottomEditor.setValue(currentElement.businessObject.css);
                   } else {
                       bottomEditor.setValue("");
                   }
                   bottomEditor.getSession().setUseWorker(true);
                   bottomEditor.setTheme("ace/theme/sqlserver");
                   bottomEditor.getSession().setMode("ace/mode/css");
                   bottomEditor.getSession().setUseWrapMode(true);
                   bottomEditor.getSession().setFoldStyle("markbeginend");
                   bottomEditor.setShowFoldWidgets(true);
                   bottomEditor.setFadeFoldWidgets(true);
                   document.getElementById('bottomEditor').style.fontSize = '20px';
                   var html = bottomEditor.getValue();
                   $("#previewCSS").html(html);
                   $("#bottomEditor").on("mouseenter", function() {
                       bottomEditor.resize();
                   })
                   $("#bottomEditor").on("mouseout", function() {
                       bottomEditor.resize();
                   })

                   bottomEditor.setOptions({
                       enableBasicAutocompletion: true,
                       enableSnippets: true,
                       enableLiveAutocompletion: false
                   });

                   var rightEditor = ace.edit("rightEditor");
                   if (currentElement.businessObject.js != undefined) {
                       rightEditor.setValue(currentElement.businessObject.js);
                   } else {
                       rightEditor.setValue("");
                   }
                   rightEditor.getSession().setUseWorker(true);
                   rightEditor.setTheme("ace/theme/sqlserver");
                   rightEditor.getSession().setMode("ace/mode/javascript");
                   rightEditor.getSession().setUseWrapMode(true);
                   rightEditor.getSession().setFoldStyle("markbeginend");
                   rightEditor.setShowFoldWidgets(true);
                   rightEditor.setFadeFoldWidgets(true);
                   document.getElementById('rightEditor').style.fontSize = '20px';
                   var html = rightEditor.getValue();
                   $("#previewJS").html(html);
                   $("#rightEditor").on("mouseenter", function() {
                       rightEditor.resize();
                   })
                   $("#rightEditor").on("mouseout", function() {
                       rightEditor.resize();
                   })
                   $("#runButton").on("click", function() {
                       setTimeout(function() {
                           var html = leftEditor.getValue();
                           $("#previewHTML").html(html);
                           var css = bottomEditor.getValue();
                           $("#previewCSS").html(css);
                           var js = rightEditor.getValue();
                           $("#previewJS").html("<script>" + js + "</script>");
                       }, 10)

                   })
                   rightEditor.setOptions({
                       enableBasicAutocompletion: true,
                       enableSnippets: true,
                       enableLiveAutocompletion: false
                   });
                   $("#confirmEdit").click(function(e) {
                       confirmEdit(currentElement, leftEditor, rightEditor, bottomEditor);
                   })

                   $("#js-canvas").hide();
               })
               //  $("#camunda-html").on("mouseout",function (e){
               //    $("#leftEditorOverlay").animate({
               //      opacity : "-=1",
               //      z-index: "-=1000000000"
               //    }, 1000)
               //  })
       })
   });
