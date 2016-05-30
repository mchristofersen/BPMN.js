   'use strict';
   var fs = require('fs');

   var d3 = require("d3");

   var WF = require('./workflow.jsd');
   console.log(WF);
   global.flowName;
   // var sequenceFlowElement = elementRegistry.get('SequenceFlow_1'),
   //     sequenceFlow = sequenceFlowElement.businessObject;
   var PropertiesPanel = require('bpmn-js-properties-panel/lib/PropertiesPanel');

   var $ = require('jquery'),
       Modeler = require('bpmn-js/lib/Modeler');

   var parseString = require('xml2js').parseString;

   var propertiesPanelModule = require('bpmn-js-properties-panel'),
       propertiesProviderModule = require('bpmn-js-properties-panel/lib/provider/camunda'),
       camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda');
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
           camunda: camundaModdleDescriptor
       }
   });
   // var bpmnJS = bpmnModeler.get("bpmn-js/lib/Viewer"),
   var elementRegistry = bpmnModeler.get('elementRegistry');
   var modeling = bpmnModeler.get('modeling');
   // var newDiagramXML = fs.readFileSync('../../backend/newDiagram.bpmn', 'utf-8');

   function createNewDiagram() {
       var name = prompt("Enter Workflow Name:");
       global.flowName = name;
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
       console.log(elementRegistry);
       $("#js-properties-panel").show();
       bpmnModeler.importXML(xml, function(err) {
           if (err) {
               container
                   .removeClass('with-diagram')
                   .addClass('with-error');

               container.find('.error pre').text(err.message);

               console.error(err);
           } else {
               container
                   .removeClass('with-error')
                   .addClass('with-diagram');
           }


       });
   }

   function close(){
     getThumbnails()
   }

   function closeDiagram() {
       container
           .removeClass('with-diagram')
           .removeClass('with-error');
       $("#flowPreviews").show();
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
                   console.log(resp);
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

   // bootstrap diagram functions

   function getXML(flowName) {
       global.flowName = flowName;
       $.ajax({
           url: "http://localhost:3000/flow",
           method: "get",
           data: {
               flowName: global.flowName
           },
           success: function(resp) {
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

   $(document).on('ready', function() {
       getThumbnails();
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

       bpmnModeler.on('commandStack.changed', exportArtifacts);
   });
