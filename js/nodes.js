//append number of input fields depending on the value of input type number
var appendNodeValues = function(num) {
	//count # of old input fields
	var progress = d3.selectAll("tr.nodeValueRow")[0].length;

	var nodeInfo = d3.select("table.node-edit-tbl");

	if(progress < num) {
		//add new rows
		for(var i =progress+1; i<= num; i++) {
			var currRow = nodeInfo.append("tr")
								  .attr("class", "nodeValueRow");
			currRow.append("td")
				   .text("Value " + i);
			currRow.append("td")
				   .attr("class", "editable")
				   .append("input")
				   .classed("nodeValue", true)
				   .attr("type", "text");
		}		
	}
	else if(progress > num) {
		//remove rows
		while(progress > num) {
			d3.selectAll("tr.nodeValueRow")[0][progress-1].remove();
			progress--;
		}
	}

	d3.selectAll("input.nodeValue")
	  .on("blur", function() {
	  	//TODO
	  	//updateValue
	  })
	
}

var getNodeChildren = function(node) {
	var children = [];

	var targetEdges = edges.filter(function(e) {
		return e.source === node
	});

	targetEdges.forEach(function(edge) {
		console.log(edge.target)
		children.push(edge.target);
	});

	return children;
}

var checkNodeValuesDuplicates = function(values) {
	return _.uniq(values).length === values.length;	
}

//change the values that a particular node can take
var updateNodeValues = function(node){
	//remove error text
	control.selectAll(".alert-text")
		   .remove();

	var newValues = [];
	var isValid = true;
	var cells = d3.selectAll("input.nodeValue")
				  .each(function(d, i) {
				  	console.log(this.value);
				  	if(!isEmptyString(this.value)) {
				  		var fValue = this.value.toLowerCase();
				  		newValues.push(fValue);
					  	// newValues.push(this.value);
				  		d3.select(this)
				  		  .classed("invalid", false);
				  	}
				  	else {
				  		d3.select(this)
				  		  .classed("invalid", true);
				  		isValid = false;			  		
				  	}
				  })

	var isNotDuplicated = checkNodeValuesDuplicates(newValues);

	if (isValid) {
		if(isNotDuplicated) {
			node.values = newValues;
			//recreate cpts
			createCPT(node);
			//recreate cpts of this node children
			var children = getNodeChildren(node);
			children.forEach(function(child){
				createCPT(child);
			})

			//success message
			// var successDiv = control.insert("div", "#edit-div-tbl")
			var successDiv = d3.select("#edit-div-tbl").insert("div", ".node-edit-tbl")	
								   .attr("class", "alert-text alert alert-success");
			successDiv.append("span")
					.attr("class", "glyphicon glyphicon-ok")
					.attr("aria-hidden", "true");
			successDiv.append("span")
					.attr("class", "sr-only")
					.text("Success");
			var text = successDiv.html() + " Successfully updated.";
			successDiv.html(text);
		}
		else {
			//error message for duplicate values
			// var errorDiv = control.insert("div", "#edit-div-tbl")
			var errorDiv = d3.select("#edit-div-tbl").insert("div", ".node-edit-tbl")	
								   .attr("class", "alert-text alert alert-danger");
			errorDiv.append("span")
					.attr("class", "glyphicon glyphicon-exclamation-sign")
					.attr("aria-hidden", "true");
			errorDiv.append("span")
					.attr("class", "sr-only")
					.text("Error");
			var text = errorDiv.html() + " Enter non-duplicate values.";
			errorDiv.html(text);					
		}
	}
	else {
		//error message for empty values
		// var errorDiv = control.insert("div", "#edit-div-tbl")
		var errorDiv = d3.select("#edit-div-tbl").insert("div", ".node-edit-tbl")	
							   .attr("class", "alert-text alert alert-danger");
		errorDiv.append("span")
				.attr("class", "glyphicon glyphicon-exclamation-sign")
				.attr("aria-hidden", "true");
		errorDiv.append("span")
				.attr("class", "sr-only")
				.text("Error");
		var text = errorDiv.html() + " Enter a non-empty value.";
		errorDiv.html(text);						
	}

}

//update a single value on blur of the input field
var updateSingleValue = function(input, node) {
	//TODO
}

var displayNodeValues = function(d) {	
	d3.select("#div-update-btn").html("");
	
	var nodeInfo = d3.select("#div-update-btn")
					 .append("div")
					 .attr("class", "table-responsive div-table")
					 .attr("id", "edit-div-tbl")	
					 .append("table")
					 .attr("class", "table table-bayes node-edit-tbl");

	//add num of values
	var numOfValues = nodeInfo.append("tr");
	numOfValues.append("th").text("# values");
	numOfValues.append("th")
			   .attr("class", "editable")
			   .append("input")
			   .attr("type", "number")
			   .attr("id", "numValues")
			   .attr("min", 2)
			   .attr("max", 10)
			   .attr("value", d.values.length)
			   .on("input", function() {
			   	  appendNodeValues(this.value);
			   })
			   .on("keydown", function() {
			   	 d3.event.preventDefault();
			   });

	// append options
	for(var i =1; i<= d.values.length; i++) {
		var currRow = nodeInfo.append("tr")
							  .attr("class", "nodeValueRow");
		currRow.append("td")
			   .text("Value " + i);
		currRow.append("td")
			   .attr("class", "editable")
			   .append("input")
			   .classed("nodeValue", true)			   
			   .attr("type", "text")
			   .attr("value", d.values[i-1])
			   .on("blur", function() {
			   	 //TODO
			   	 //Update value
			   	 updateSingleValue(this, d);
			   });
	}

	d3.select("#div-update-btn")
	  .append("button")
	  .classed("btn btn-default btn-bayes", true)
	  .attr("id", "update-node-values")
	  .html("Update Values")
	  .on("click", function() {
	   	updateNodeValues(d);
	  });
}

var getNodeParents = function(d){
	var nodeParentsIds = [];
	var inConns = edges.filter(function(e) {
		return e.target === d;
	})

	for (c in inConns) {
		nodeParentsIds.push(inConns[c].source.id);
	}
	// console.log("parents " + nodeParentsIds);
	nodeParentsIds.sort();
	return nodeParentsIds;
}


var displayNodeOption = function(option, node) {
	if(option === "cpt") {
		displayCPT(node);
	}
	else if(option === "val") {
		displayNodeValues(node);
	}
}

var displayNodeInfo = function(node) {
	clearDisplayField();

	//append node title
	control.append("h3")
		   .text(node.title + ":")
		   .classed("node-label", true)
		   .attr("id", node.id);

	control.append("hr");

	//append select for different options
	//option 1 - cpt table - selected
	//option 2 - node values
	var form = control.append("div")
					  .attr("class", "form-group")

	form.append("label")
		.attr("for", "node-options")
		.attr("class", "label-text")
		.text("Select an option for this node: ")

	var select = form.append("select")
					 .attr("id", "node-options")
					 .attr("class", "form-control")
					 .on("change", function() {
					 	displayNodeOption(this.options[this.selectedIndex].value, node);
					 });

	select.append("option")
		  .attr("value", "cpt")
		  .attr("selected", true)		  
		  .text("CPT table");
	select.append("option")
		  .attr("value", "val")
		  .text("Node Values");

	control.append("hr");

	//display the relevant data
	var infoDiv = control.append("div")
						 .attr("id", "div-update-btn");
	
	var selOption = d3.select("#node-options").node().options[d3.select("#node-options").node().selectedIndex].value;
	displayNodeOption(selOption, node);
	control.append("hr");

	// delete button
	control.append("p")
		   // .attr("for", "delete-node-btn")
		   .attr("class", "label-text")
		   .text("Delete the node:" );

	control.append("button")
		   .attr("class", "btn btn-default btn-bayes")
		   .attr("id", "delete-node-btn")
		   .html("Delete Node")
		   .on("click", function() {
		   	//delete this node
		   	deleteNode(node);
		   })

}

var nodeMouseDown = function(d){
	mousedownNode = d;

	if(connMode) {
		//reposition the dragline to the center of the node
		dragline.classed("hidden", false)
				.attr("d", "M" + d.x + "," + d.y + "L" + d.x + "," + d.y);
	}
}

var nodeMouseUp = function(d, groupNode){

	// console.log(d3.select(d));
	// console.log(groupNode);
	//check if mousedownNode is set
	if(!mousedownNode)
		return;

	dragline.classed("hidden", true);

	//the node that the mouse is located on on mouseup
	var mouseupNode = d;
	//if the mouse has moved to a different node and connection mode is on
	//add a new edge between these 2 nodes
	if(mousedownNode !== mouseupNode) {
		if(connMode) {
			createNewEdge(mousedownNode, mouseupNode);
			dragged =false;
		}
	}
	//the node on mouse up and on mouse down is the same
	// 4 possible cases when this could happen
	// 1. node has been dragged
	// 2. node has been shift clicked to edit its text
	// 3. editNode mode is on and node has been selected for editing
	// 4. select node
	else {
		if(dragged) {
			dragged = false;
		}
		else {
			if(d3.event.shiftKey) {
				//deselect node/edge if any are selected
				selectedNode = null;
				selectedPath = null;
				refresh();
				//edit node title
				editNodeText(mouseupNode, groupNode);
			}
			else {				
				//select/deselect node
				if(selectedNode === mousedownNode) {
					selectedNode = null;
				}
				else {
					selectedNode = mousedownNode;
				}
				selectedPath = null;
				refresh();

				//display the node info if in editNodeMode && a node has been selected
				if(editNodeMode && selectedNode) {
					displayNodeInfo(selectedNode);
				}
				else {
					editNodeEnter();
				}
			}
		}
	}
	
	mousedownNode = null;
	mouseupNode = null;
}

//Added predefinedCircle for Jasmine tests
var addNewNode = function(predefinedCircle) {
	//add new node
	var circleCenter = predefinedCircle ? [100, 200] : d3.mouse(graph.node()),
		xPos = circleCenter[0],
		yPos = circleCenter[1],
		newNode = {id:++lastID, title:"New Node", x:xPos, y:yPos, values:['1', '0']};

	nodes.push(newNode);
	newNode.title = duplicateNodeTitles(newNode.title, newNode);
	//refresh to add the node
	refresh();
	selectedNode = newNode;	
	//refresh to select the node
	refresh();
};

var deleteNode = function(node) {	
	nodes.splice(nodes.indexOf(node),1);
	var incidentEgdes = removeIncidentEdges(node);
	//recalculate the cpts for all nodes that are target nodes for the selected node
	recalculateCPT(incidentEgdes, node);
	//if node info is displayed remove it
	if(editNodeMode) {
		editNodeEnter();
	}
}