var d3 = require("d3");

global.toggleDiff = function (){
	d3.selectAll(".newDiff")
		.each(function (d){
			console.log(this.nodeName)
			if (this.nodeName == "path"){
				d3.select(this)
					.attr({"stroke":"#B2DFDB"})
					.style("stroke-width",2)
			}else {
				d3.select(this)
					.attr({"fill":"#B2DFDB"})
					.style("stroke-width",2)
				if (this.nodeName == "rect" || this.nodeName == "polygon"){
					d3.select(this.parentNode).selectAll("path")
					.each(function (d,i){
						console.log(i)
						if (i == 1){
							d3.select(this).attr("fill","none")
						}else {
							d3.select(this).attr("fill","#ffffff")
						}
					})
				}
			}

		})
		d3.selectAll(".removedDiff")
			.each(function (d){
				console.log(this.nodeName)
				if (this.nodeName == "path"){
					d3.select(this)
						.attr({"stroke":"#FFCDD2"})
						.style("stroke-width",2)
				}else {
					d3.select(this)
						.attr({"fill":"#FFCDD2"})
						.style("stroke-width",2)
					if (this.nodeName == "rect" || this.nodeName == "polygon"){
						d3.select(this.parentNode).selectAll("path")
						.each(function (d,i){
							console.log(i)
							if (i == 1){
								d3.select(this).attr("fill","none")
							}else {
								d3.select(this).attr("fill","#ffffff")
							}
						})
					}
				}

			})
}
