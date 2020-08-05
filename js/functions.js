function drawGraph(graph, canvas){
	for (let from of Object.keys(graph.edges)){
		graph.edges[from].forEach(edge => {drawEdge(graph, from, edge, canvas);
		});
	}
	
	for (let id of Object.keys(graph.nodes)){
		drawNode(graph.nodes[id], canvas);
	}



	
}

function drawEdge(graph, from, edge, canvas){
	let cx = canvas.getContext("2d");
	let to = edge.to;
	cx.beginPath();
	cx.moveTo(graph.nodes[from].x, graph.nodes[from].y);
	cx.lineWidth = EDGEWIDTH;
	cx.strokeStyle = edge.color
	cx.lineTo(graph.nodes[to].x, graph.nodes[to].y); 
	cx.closePath();
	cx.stroke();

	// edge weight drawing
	let midx, midy;
	midx = (graph.nodes[to].x+graph.nodes[from].x)/2;
	midy = (graph.nodes[to].y+graph.nodes[from].y)/2;
	let weight = edge.weight;
	cx.font = "20px Arial";
	let textWidth = cx.measureText(weight).width;
	cx.fillStyle = "white";
	cx.fillRect(midx - textWidth,midy-15, textWidth*2, 30);
	cx.strokeRect(midx - textWidth,midy-15, textWidth*2, 30);
	cx.lineWidth = 1;
	cx.fillStyle ="white";
	cx.fill()

	cx.fillStyle="black";
	cx.fillText(weight, midx - textWidth/2, midy + 7.5);

	// arrow head drawing for directed edges
	if (graph.isDirected(from, to)){
		let angle = Math.atan((graph.nodes[to].y - graph.nodes[from].y)/(graph.nodes[to].x - graph.nodes[from].x));
		cx.translate(...Object.values(arrowPos(graph, from, to)));
		if (angle === NaN){
			if (graph.nodes[to].y > graph.nodes[from].y)
				cx.rotate(1/2 * Math.pi);
			else
				cx.rotate(-1/2 * Math.pi);
		}else{
			cx.rotate(angle);
		}
		cx.beginPath();
		cx.moveTo(((graph.nodes[to].x> graph.nodes[from].x)?-1:1) * 10, -10);
		cx.lineTo(0,0);
		cx.lineTo(((graph.nodes[to].x> graph.nodes[from].x)?-1:1) * 10, 10);
		cx.lineWidth = EDGEWIDTH;
		cx.stroke();
		cx.resetTransform();
	}
}

function drawNode(node, canvas){
	let cx = canvas.getContext("2d");

	cx.beginPath();
	cx.arc(node.x, node.y, NODERADIUS, 0, 7);
	cx.closePath();
	cx.lineWidth = 10;
	cx.strokeStyle = "black";
	cx.stroke();
	cx.fillStyle = node.color;
	console.log(node.color);
	cx.fill();

}


function stateUpdate(state, action){
	let tempState = Object.assign({}, state, action);
	if (action.hasOwnProperty("graph")){
		tempState.graph = new Graph(Object.assign({}, action.graph.nodes), Object.assign({}, action.graph.edges));
	}
	return tempState;
}

function distance(x1, y1, x2, y2){
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
}

function onNode(pos, graph){
	let selectID = undefined;
	Object.keys(graph.nodes).forEach(id => {
		selectID = (distance(pos.x, pos.y, graph.nodes[id].x, graph.nodes[id].y) <= NODERADIUS)?id: selectID;
	})
	return selectID;
}

function edgeInput(){
	let isdirected, edgeweight;
	function getInput(){
		let tempdirected, tempweight;
		tempdirected = document.querySelector("#directed").checked;
		tempweight = document.querySelector("#edgeWeight").value;
		isdirected = tempdirected;
		edgeweight = tempweight;
	}
	getInput();
	return {directed:isdirected, weight: edgeweight};
}

function distanceToEdge(graph, pos, from, to){
	let a = -1*(graph.nodes[to].y-graph.nodes[from].y)/(graph.nodes[to].x-graph.nodes[from].x);
	let b = 1;
	let c = -1*(a*(graph.nodes[from].x) + b*(graph.nodes[from].y));
	return (Math.abs(a*pos.x + b*pos.y + c))/(Math.sqrt(a*a + b*b));
}

function arrowPos(graph, from, to){
	let m = (graph.nodes[to].y - graph.nodes[from].y)/(graph.nodes[to].x - graph.nodes[from].x);
	if (m == Infinity || m == -Infinity){

		return (graph.nodes[to].y > graph.nodes[from].y)?{x:graph.nodes[to].x, y: graph.nodes[to].y - NODERADIUS} : {x: graph.nodes[to].x, y: graph.nodes[to].y + NODERADIUS};
	} else if (m == 0){
		return (graph.nodes[to].x > graph.nodes[from].x)?{x: graph.nodes[to].x - NODERADIUS, y: graph.nodes[to].y} : {x: graph.nodes[to].x + NODERADIUS, y: graph.nodes[to].y};
	} else {
		let a = (m*m + 1);
		let yIntercept = graph.nodes[to].y - m*(graph.nodes[to].x);
		let b = (2*yIntercept*m -2*m*graph.nodes[to].y -2*graph.nodes[to].x);
		let c = (yIntercept*yIntercept - 2*yIntercept*graph.nodes[to].y - NODERADIUS*NODERADIUS + graph.nodes[to].x*graph.nodes[to].x + graph.nodes[to].y*graph.nodes[to].y);

		let root1 = (-b+Math.sqrt(b*b - 4*a*c))/(2*a);
		let root2 = (-b-Math.sqrt(b*b - 4*a*c))/(2*a);


		let arrowx;
		if (graph.nodes[to].x > graph.nodes[from].x){
			arrowx = (root1 < root2)? root1:root2;
		} else {
			arrowx = (root1 < root2)? root2:root1;
		}
		return {x: arrowx, y: m*arrowx + yIntercept};
	}
}