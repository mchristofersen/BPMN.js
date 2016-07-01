global.varDict = {
    $log: []
};
var fs = require('fs');
var d3 = require("d3");
var origin = require("diagram-js-origin");
console.log(origin);
var beautify = ace.require("ace/ext/beautify");
global.flows = {};
global.branches = {};
var Navbus = require("./lib/navBus/navBus");
var mwfConverter = require("./lib/mwfConverter");


WF = require('./workflow.js');
var db = require("./lib/database");
userTaskResolver = require('./userTaskResolver.js');
node_manager = require("./lib/node-manager")
global.isBranch = false;
var $ = require('jquery'),
    cookie = require('js-cookie'),
    Modeler = require('bpmn-js/lib/Modeler');
global.$ = $;
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



global.subflowViewer = new Modeler({
    container: subflowCanvas,
    propertiesPanel: {
        parent: '#subflow-properties-panel'
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
    overlays = bpmnModeler.get('overlays'),
    elementRegistry = bpmnModeler.get('elementRegistry');
var BpmnModdle = require("bpmn-moddle");
var modeling = bpmnModeler.get('modeling');
var canvas = bpmnModeler.get("canvas");
var eventBus = bpmnModeler.get("eventBus");
global.eventBus = eventBus;
global.modeling = modeling;
var propertiesPanel = bpmnJS.get('propertiesPanel');
bpmnModeler.propertiesPanel = propertiesPanel;
bpmnModeler.modeling = modeling;
// var newDiagramXML = fs.readFileSync('../../backend/newDiagram.bpmn', 'utf-8');

global.bus = new Navbus();
bus.init({
    modeler: bpmnModeler,
    previews: $("#flowPreviews"),
    branchPreviews: $("#flowBranches")
});

bus.initListener("editor.confirm", function() {
    $("#confirmEdit").unbind("click");
    // $("#js-canvas").show();
    $(".fiddle").hide();
    $(".djs-palette").show();
    $("#differ").hide();
    $("#mainPage").show();
    $("#leftDiff").html("");
    $("#rightDiff").html("");
})

bus.initListener("close.diagram", function(args) {
  var sub = d3.select(".content").classed("subflow")
  if (sub){
    return bus.fire("close.subflow",[])
  }
    $('.buttons a').hide()
    $("#flows").show()
    container
        .removeClass('with-diagram')
        .removeClass("main")
        .removeClass('with-error');
    getThumbnails()
    getBranches();
    if (Object.keys(branches).length > 0) {
        bus.bp.show()
        bus.fp.hide()
    } else {
        bus.fp.show()
        bus.bp.hide()
    }
})

$("#js-close-diagram").click(function(e) {
    bus.fire("close.diagram", [])
});

bus.initListener("close.subflow", function(args) {
    $('.content').removeClass("subflow").addClass("main")

})

bus.initListener("open.diagram", function(args) {
        $("#flows").hide()
        $('.buttons a').show()
        $("#js-properties-panel").show();
        container
            .addClass('with-diagram')
            .removeClass('with-error');
        bus.fp.hide()
        bus.bp.hide();
        addDropShadows();
    })
    // console.log(bus)

bus.initListener("subflow.view", function(flowId) {
  if (!flowId){
    var flowId = bpmnModeler.get("propertiesPanel")._current.element.businessObject.flowId
  }
    var subflowCanvas = $("#subflowCanvas")
        var xml = yieldXML(flowId, subflowViewer)


})

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
        bpmnModeler.saveXML({
            format: true
        }, function(err, xml) {
            bpmnModeler.saveSVG({
                format: true
            }, function(err, svg) {
                $.ajax({
                        url: "/flow",
                        method: "POST",
                        data: {
                            flowName: name,
                            xml: xml,
                            svg: svg
                        }
                    }).done(function(resp) {
                        console.log(resp);
                        container.addClass("main")
                    })
                    //  done(err, svg);
            });

            //  done(err, xml);
        });
    })

    // PropertiesPanel.setInputValue($("camunda-id"),name)
}

function addDropShadows() {
  return
  // var svgs = d3.selectAll("svg");
  // svgs.each(function (d,i){
  //   var svg = d3.select(this);
  //   var defs = svg.select("defs")
  //
  //   var filter = defs.append("filter")
  //       .attr("id", "drop-shadow")
  //       .attr("height", "130%");
  //
  //   filter.append("feGaussianBlur")
  //       .attr("in", "SourceAlpha")
  //       .attr("stdDeviation", 5)
  //       .attr("result", "blur");
  //
  //   // translate output of Gaussian blur to the right and downwards with 2px
  //   // store result in offsetBlur
  //   filter.append("feOffset")
  //       .attr("in", "blur")
  //       .attr("dx", 5)
  //       .attr("dy", 5)
  //       .attr("color", "orange")
  //       .attr("result", "offsetBlur");
  //
  //
  //
  //   // overlay original SourceGraphic over translated blurred opacity by using
  //   // feMerge filter. Order of specifying inputs is important!
  //   var feMerge = filter.append("feMerge");
  //   feMerge.append("feMergeNode")
  //       .attr("in", "offsetBlur")
  //   feMerge.append("feMergeNode")
  //       .attr("in", "SourceGraphic");
  //   var item = d3.selectAll(".djs-element")
  //       .each(function(d, i) {
  //           d3.select(this)
  //               .style("filter", "url(#drop-shadow)")
  //       })
  //           })

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
                    .addClass('with-error');

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
                bus.fire("open.diagram",[])
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


            $(".content").addClass("main").removeClass("subflow")

        });
    }



}

function close() {
    bus.fire("close.diagram",[])

}

function saveSVG(done) {
    bpmnModeler.saveSVG({
        format: true
    }, function(err, svg) {

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
                console.log(flow.repr_title);
                global.flowName = flow.repr_title
                $("#flowPreviews").hide();
                // bpmnModeler.on("diagram.init",mwfConverter)
                callback()
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

function importMWF(){
  db.createNewDiagram(mwfConverter);

}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
    window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  console.log(db.createNewDiagram)
    registerFileDrop(container, importMWF);
}

function deleteFlow() {
    $.ajax({
        url: "/flow",
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
    var conn = isBranch ? "/branch" : "/flow";
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

getBranch = function(flowName) {
    flowName = flowName;
    var conn = "/branch";
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
        url: "/branch",
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
    var id = branches[flowName]["id"]
    $.ajax({
        url: "/branch",
        method: "delete",
        data: {
            flowName: flowName,
            user: user,
            id: id
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
        url: "/getThumbnails",
        contentType: "text/json",
        method: "GET",
        success: function(json) {
            $("#flowPreviews").html("");

            $.each(json, function(idx, elem) {
                // flows[elem.flowName] = elem
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
                    }).call(zoom)
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
        } else {
            new BpmnModdle().fromXML(b, function(err, bdefs) {
                if (err) {
                    return done(err);
                } else {
                    return done(err, adefs, bdefs);
                }
            });
        }
    });

}

function yieldXML(flowName, viewer){
  $.getJSON("/flow",{flowName:flowName},function (resp){
    var xml =  resp[0].xml
    $(".content").addClass("subflow").removeClass("main")
    viewer.importXML(xml, function(err) {
        if (err) {
            l(err)
        }
    })
  })
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
    var oldXML = yieldXML(flowName)
    leftModeler.importXML(oldXML, function(err) {
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
                        if (err) {
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
                        addDropShadows();
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
        url: "/getBranches",
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
                                getBranch(elem.flowName);
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

global.openEditor = function(e) {
    var currentElement = bpmnModeler.get("propertiesPanel")._current.element;
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

    // $("#js-canvas").hide();
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
    cancelEdit()
}

function cancelEdit() {
  $("#confirmEdit").unbind("click");
  $(".fiddle").hide();
  $(".djs-palette").show();
  $("#differ").hide();
  $("#mainPage").show();
  $("#leftDiff").html("");
  $("#rightDiff").html("");
}




$(document).on('ready', function() {
    bus.fire("close.diagram",[])


    $("#continue").click(function(e) {
        var f = $("form").serializeArray();
        WF.handleForm(f);
        $("#renderedPage").parent().hide();
        WF.doStep(suspendedStep["outgoing"][0]["id"])
    })

    $("#flowsTab").click(function(e) {
        $("#flowBranches").hide();
        $("#flowPreviews").show();
        isBranch = false;
    })
    $("#branchesTab").click(function(e) {
        $("#flowBranches").show();
        $("#flowPreviews").hide();
        isBranch=true;
    })

    $("#js-delete-diagram").click(function(e) {
        bus.fire("close.diagram",[])
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

    // $("#js-close-diagram").click(function(e) {
    //
    //     close();
    //
    // })

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
    }, 500);

    $('.overlay').click(function(e) {
        $('.overlay').removeClass('expanded');
        $(this).addClass('expanded');
    });
    $('.overlay').on('mouseover', function(e) {

        $('.overlay > div').removeClass('focused');
        $(this).children().addClass('focused');
    });

    bpmnModeler.on('diagram.init', addDropShadows)
    bpmnModeler.on('commandStack.changed', exportArtifacts);
    bpmnModeler.on("propertiesPanel.changed", function(e) {
        $(".djs-properties-header").on("drag", function (e){
          $("#js-properties-panel").css("top",e.pageY+"px")
        })
        $(".djs-properties-header").on("dragended", function (e){
          $("#js-properties-panel").css("top",e.pageY+"px")
        })

        var currentElement = e.current.element;
        $("#camunda-flowId").autocomplete({
            source: Object.keys(flows)
        })
        $("#camunda-content").on("click", openEditor)
            //  $("#camunda-html").on("mouseout",function (e){
            //    $("#leftEditorOverlay").animate({
            //      opacity : "-=1",
            //      z-index: "-=1000000000"
            //    }, 1000)
            //  })
    })
});
WF.processXML = db.processXML;
