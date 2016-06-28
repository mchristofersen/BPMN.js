    global.varDict = {
        $log: []
    };
    var fs = require('fs');
    var d3 = require("d3");
    var beautify = ace.require("ace/ext/beautify");
    global.flows = {};
    global.branches = {};
    var Navbus = require("./lib/navBus/navBus");


    WF = require('./workflow.js');
    var db = require("./lib/database");
    userTaskResolver = require('./userTaskResolver.js');
    node_manager = require("./lib/node-manager")
    global.isBranch = false;
    var $ = require('jquery'),
        cookie = require('js-cookie'),
        Modeler = require('bpmn-js/lib/Modeler');
    require("jquery-ui");
    var parseString = require('xml2js').parseString;
    global.user = cookie.get("user");
    if (user == undefined) {
        global.user = prompt("Enter username:");
        cookie.set("user", user);
    }
    var differ = require('bpmn-js-differ');
    var propertiesPanelModule = require('../bpmn-js-properties-panel'),
        propertiesProviderModule = require('../bpmn-js-properties-panel/lib/provider/camunda'),
        camundaModdleDescriptor = require('../camunda-bpmn-moddle/resources/camunda'),
        extModdleDescriptor = require('./descriptors/ext.json');

    var CmdHelper = require("../bpmn-js-properties-panel/lib/helper/CmdHelper");

    var container = $('#js-drop-zone');

    var canvas = $('#js-canvas');
    var CliModule = require('bpmn-js-cli');
    var utils = require('./lib/bpmn-differ');

    global.bpmnModeler = new Modeler({
        container: canvas,
        propertiesPanel: {
            parent: '#js-properties-panel'
        },
        additionalModules: [
            propertiesPanelModule,
            propertiesProviderModule,
            CliModule
        ],
        cli: {
            bindTo: 'cli'
        },
        moddleExtensions: {
            camunda: camundaModdleDescriptor,
            ext: extModdleDescriptor

        }
    });
    bpmnModeler.get('keyboard').bind(document);
    bpmnJS = bpmnModeler,
        overlays = bpmnModeler.get('overlays'),
        elementRegistry = bpmnModeler.get('elementRegistry');
    var BpmnModdle = require("bpmn-moddle");
    var modeling = bpmnModeler.get('modeling');
    var canvas = bpmnModeler.get("canvas");
    var eventBus = bpmnModeler.get("eventBus");
    var propertiesPanel = bpmnJS.get('propertiesPanel');
    bpmnModeler.propertiesPanel = propertiesPanel;
    bpmnModeler.modeling = modeling;
    // var newDiagramXML = fs.readFileSync('../../backend/newDiagram.bpmn', 'utf-8');

    global.bus = new Navbus();
    bus.init({modeler:bpmnModeler,previews:$("#flowPreviews"),branchPreviews:$("#flowBranches")});
    bus.initListener("close.diagram",function (){
      $('.buttons a').hide()
      $("#flows").show()
      container
          .removeClass('with-diagram')
          .removeClass('with-error');
      $("#js-properties-panel").hide();
  getThumbnails()
  getBranches();
      if ( Object.keys(branches).length > 0 ){
        bus.bp.show()
        bus.fp.hide()
      }else {
        bus.fp.show()
        bus.bp.hide()
      }
    })


    bus.initListener("open.diagram",function (){
      $("#flows").hide()
      $('.buttons a').show()
      $("#js-properties-panel").show();
      container
          .addClass('with-diagram')
          .removeClass('with-error');
      bus.fp.hide()
      bus.bp.hide();
    })
    // console.log(bus)
    function addOverlay(id, modeler, klass) {
        if (modeler) {
            var registry = modeler.get("elementRegistry");
        } else {
            var registry = elementRegistry;
        }
        if (klass == undefined) {
            var klass = "newDiff"
        }
        var shape = registry.get(id);
        if (shape.type == "bpmn:SequenceFlow") {
            d3.select(`[data-element-id="${id}"]`)
                .select(".djs-visual > path")
                .classed(klass, true)
        } else {
            d3.select(`[data-element-id="${id}"]`)
                .select(".djs-visual > rect,circle,polygon")
                .classed(klass, true)
        }




    }




    function createNewDiagram() {
        var name = prompt("Enter Workflow Name:");
        flowName = name;
        bpmnModeler.createDiagram(function(xml) {
            // given
            var processElement = elementRegistry.get("Process_1");

            // when
            modeling.updateProperties(processElement, {
                id: name
            });
            bus.fire("open.diagram")
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
                        //  done(err, svg);
                });

                //  done(err, xml);
            });
        })

        // PropertiesPanel.setInputValue($("camunda-id"),name)
    }

    function openDiagram(xml) {

        if (!xml) {
            global.flowName = prompt("Enter Workflow Name");
            bpmnModeler.createDiagram(function(err) {
                var processElement = elementRegistry.get("Process_1");

                // when
                modeling.updateProperties(processElement, {
                    id: flowName
                });
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
        } else {


            bpmnModeler.importXML(xml, function(err) {
                if (err) {
                    container
                        .removeClass('with-diagram')
                        .addClass('with-errorStartEvent_1');

                    container.find('.error pre').text(err.message);

                    console.error(err);
                } else {
                    bus.fire("open.diagram")
                    if (isBranch) {
                        loadModels(xml, flows[flowName].xml, function(err, a, b) {

                            var diff = differ.diff(b, a);
                            $.each(diff._added, function(idx, elem) {
                                addOverlay(idx)
                            })
                            $.each(diff._removed, function(idx, elem) {})
                        });
                    }

                }


            });
        }



    }

    function close() {
        bus.fire("close.diagram")

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



    function registerFileDrop(container, callback) {

        function handleFileSelect(e) {
            e.stopPropagation();
            e.preventDefault();

            var files = e.dataTransfer.files;

            var file = files[0];

            var reader = new FileReader();

            reader.onload = function(e) {

                var json = e.target.result;
                try {
                    flow = JSON.parse(json);
                    $("#flowPreviews").hide();
                    callback(false)
                } catch (err) {
                    console.log(err)
                    callback(xml);
                }

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
                flowName: flowName
            },
        }).done(function(resp) {
            close();
        })
    }

    getXML = function(flowName) {
        flowName = flowName;
        var conn = isBranch ? "http://localhost:3000/branch" : "http://localhost:3000/flow";
        $.ajax({
            url: conn,
            method: "get",
            data: {
                flowName: flowName,
                user: user
            },
            success: function(resp) {
                db.processXML(resp)
                openDiagram(resp[0].xml);
            }
        });

    }

    branch = function(flowName) {
        var user = cookie.get("user");
        $.ajax({
            url: "http://localhost:3000/branch",
            method: "post",
            data: {
                flowName: flowName,
                user: user
            },
            success: function(resp) {
              isBranch = true;
                db.processXML(resp)
                openDiagram(resp[0].xml);
            }
        });

    }

    deleteBranch = function(flowName) {
        var user = cookie.get("user");
        $.ajax({
            url: "http://localhost:3000/branch",
            method: "delete",
            data: {
                flowName: flowName,
                user: user
            },
            success: function(resp) {
                isBranch = false;
                $(`#${flowName}Branch`).hide();
            }
        });

    }

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.5, 0.5])
        .on("zoom", zoomed);

    var drag = d3.behavior.drag()
        .origin(function(d) {
            return d;
        })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    function zoomed() {
        d3.select(this).select(".flowFrame").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).select(".flowFrame").classed("dragging", true);
    }

    function dragged(d) {
        d3.select(this).select(".flowFrame").attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).select(".flowFrame").classed("dragging", false);
    }

    global.getThumbnails = function() {
        $.ajax({
            url: "http://localhost:3000/getThumbnails",
            contentType: "text/json",
            method: "GET",
            success: function(json) {
                $("#flowPreviews").html("");

                $.each(json, function(idx, elem) {
                        flows[elem.flowName] = elem
                        d3.select("#flowPreviews").append("div")
                            .classed("preview", true)
                            .attr("id", elem.flowName + "Preview")
                            .append("div")
                            .classed("flowHeader", true)
                            .html(`<h1>${elem.flowName}</h1><div class="btn-group btn-group-justified btn-group-raised">
                                      <a href="javascript:void(0)" class="btn btn-raised openButton">Open</a>
                                      <a href="javascript:void(0)" class="btn btn-raised branchButton">Branch</a>
                                    </div>`)
                            .each(function(d) {
                                d3.select(this).select(".openButton")
                                    .on("click", function(d) {
                                        isBranch = false;
                                        flowName = elem.flowName;
                                        getXML(elem.flowName);
                                    });
                                d3.select(this).select('.branchButton')
                                    .on("click", function(d) {
                                        flowName = elem.flowName;
                                        isBranch = true;
                                        branch(elem.flowName);
                                    })
                            })
                        if (elem.flowName != "") {
                            d3.select(`#${elem.flowName}Preview`)
                                .append("svg")
                                .html(elem.svg)
                                // .attr({"height": "40%","width":"40%"})
                                .each(function(d) {
                                    var html = d3.select(this).html()
                                    var newhtml = `<g class="flowFrame">${html}</g>`
                                    d3.select(this).html(newhtml);
                                    d3.select(this).attr({
                                        "height": "40%",
                                        "width": "40%"
                                    })
                                })

                        }
                        return json.length

                    })
            }
        })

    }

    function loadModels(a, b, done) {
        new BpmnModdle().fromXML(a, function(err, adefs) {
          if (err) {
                return done(err);
            }else{
              new BpmnModdle().fromXML(b, function(err, bdefs) {
                if (err) {
                      return done(err);
                  }else{
                    return done(err,adefs,bdefs);
                  }
              });
            }
        });

    }

    function mergeBranch(flowName, xml) {
        var left = $("#leftDiff"),
            right = $("#rightDiff");
        var leftModeler = new Modeler({
            container: left,
            moddleExtensions: {
                camunda: camundaModdleDescriptor,
                ext: extModdleDescriptor
            }
        });
        var rightModeler = new Modeler({
            container: right,
            moddleExtensions: {
                camunda: camundaModdleDescriptor,
                ext: extModdleDescriptor
            }
        });
        leftModeler.importXML(flows[flowName].xml, function(err) {
            if (err) {
                console.log(err)
            } else {
                rightModeler.importXML(xml, function(err) {
                    if (err) {
                        console.log(err)
                    } else {
                        $("#differ").show();
                        $("#mainPage").hide();
                        $(".djs-palette").hide();
                        var diff;
                        loadModels(xml, flows[flowName].xml, function loading(err, a, b) {
                            if (err){
                              console.log(err);
                            }
                            diff = differ.diff(b, a);
                            $.each(diff._added, function(idx, elem) {
                                addOverlay(idx, rightModeler)
                            })
                            $.each(diff._removed, function(idx, elem) {
                                addOverlay(idx, leftModeler, "removedDiff")
                            })

                            toggleDiff();

                        });
                        $("#finalizeMerge").click(function(e) {
                            db.finalizeMerge(xml, flowName, user, diff, rightModeler)
                        })
                    }
                })
            }
        })
      }

    global.getBranches = function() {
        $("#flowBranches").html("");
        $.ajax({
            url: "http://localhost:3000/getBranches",
            contentType: "text/json",
            method: "GET",
            data: {
                user: user
            },
            success: function(json) {

                $.each(json, function(idx, elem) {
                    branches[elem.flowName] = elem;

                    d3.select("#flowBranches").append("div")
                        .classed("preview", true)
                        .attr("id", elem.flowName + "Branch")
                        .append("div")
                        .classed("flowHeader", true)

                    .html(`<h1>${elem.flowName}</h1>
                              <div class="btn-group btn-group-justified btn-group-raised">
                                    <a href="javascript:void(0)" class="btn btn-raised openButton">Open</a>
                                      <a href="javascript:void(0)" class="btn btn-primary btn-raised mergeButton">Merge</a>
                                    <a href="javascript:void(0)" class="btn btn-danger btn-raised deleteButton">Delete</a>
                                  </div>`)
                        .each(function(d) {
                            d3.select(this).select(".openButton")
                                .on("click", function(d) {
                                    isBranch = true;
                                    flowName = elem.flowName;
                                    getXML(elem.flowName);
                                });
                            d3.select(this).select('.deleteButton')
                                .on("click", function(d) {
                                    flowName = elem.flowName;
                                    isBranch = false;
                                    deleteBranch(elem.flowName);
                                })
                            d3.select(this).select('.mergeButton')
                                .on("click", function(d) {
                                    flowName = elem.flowName;
                                    isBranch = true;
                                    mergeBranch(elem.flowName, elem.xml);
                                })
                        })



                    d3.select(`#${elem.flowName}Branch`)
                        .append("svg")
                        .html(elem.svg)
                        .each(function(d) {
                            var html = d3.select(this).html()
                            var newhtml = `<g class="flowFrame">${html}</g>`
                            d3.select(this).html(newhtml);
                            d3.select(this).attr({
                                "height": "100%",
                                "width": "100%"
                            })
                        })
                        .call(zoom)



                          return json.length

                })
            }

        })
    }

    function l(mess) {
        console.log(mess);
    }

    function confirmEdit(elem, leftEditor, rightEditor, bottomEditor) {
        var bus = elem.businessObject;
        if (bus.$type == "bpmn:UserTask") {
            modeling.updateProperties(elem, {
                html: leftEditor.getValue() || "",
                js: rightEditor.getValue() || "",
                css: bottomEditor.getValue() || ""
            })
        } else {
            modeling.updateProperties(elem, {
                js: rightEditor.getValue()
            })
        }
      bus.fire("editor.confirm",[])
    }

    function cancelEdit() {
        bus.fire("editor.confirm",[])
    }




    $(document).on('ready', function() {

      bus.initListener("editor.confirm",function (){
        $("#confirmEdit").unbind("click");
        // $("#js-canvas").show();
        $(".fiddle").hide();
        $(".djs-palette").show();
        $("#differ").hide();
        $("#mainPage").show();
        $("#leftDiff").html("");
        $("#rightDiff").html("");
      })

        $("#continue").click(function(e) {
            var f = $("form").serializeArray();
            WF.handleForm(f);
            $("#renderedPage").parent().hide();
            WF.doStep(suspendedStep["outgoing"][0]["id"])
        })
        bus.fire("close.diagram")
        $(".fiddle").hide();

        $("#flowsTab").click(function(e) {
            $("#flowBranches").hide();
            $("#flowPreviews").show();
        })
        $("#branchesTab").click(function(e) {
            $("#flowBranches").show();
            $("#flowPreviews").hide();
        })

        $("#js-delete-diagram").click(function(e) {
          bus.fire("close.diagram")

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
            if (e.charCode == 10 && e.ctrlKey) {
                $("#continue").click();
            };
        })

        $('#js-create-diagram').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            bus.fire("open.diagram")
            db.createNewDiagram();

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

            close();

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

            db.saveDiagram(function(err, xml) {
                setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
            });
        }, 3000);

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
            $("#camunda-flowId").autocomplete({
                source: Object.keys(flows)
            })
            $("#camunda-content").on("click", function(e) {
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
                    bottomEditor.getSession().setMode("ace/mode/less");
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
                            var less = require('../node_modules/less/index.js');
                            var css = bottomEditor.getValue();
                            less.render(css, {
                                async: false
                            }, function(e, output) {
                                $("#previewCSS").html(output.css);
                            })
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
    WF.processXML = db.processXML;
