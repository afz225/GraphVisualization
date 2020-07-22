// class App{
// 	constructor(state, )
// }

// function stateUpdate(state, action){
// 	return Object.assign({}, state, action);
// }
class Graph{
	constructor(nodes = [], edges = []){
		this.nodes = nodes;
		this.edges = edges;
	}
	
	node(n){
		return this.nodes[n];
	}


}

class canvasGraph{
	constructor (graph){
		this.dom = document.querySelector("canvas");
		this.syncState(graph);
	}

	syncState(graph){
		if (this.graph === graph) return;
		this.graph = graph;
		drawGraph(this.graph, this.dom);
	}


}

var draw = function() {
	let g = new Graph( [{x:100, y:100}, {x: 300, y: 200}] , [{from: {x:100, y:100}, to: {x: 300, y: 200}}]);
	let cg = new canvasGraph(g);
}

let resizeCanvas = function(){
	var canvas = document.querySelector("canvas");
	fitCanvas(canvas);
	draw();
	function fitCanvas(canvas){
		canvas.style.height = "100%";
		canvas.style.width = "100%";
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
	}
	}
resizeCanvas();

function drawGraph(graph, canvas){
	for (let edge of graph.edges){
		drawEdge(edge, canvas);
	}
	for (let node of graph.nodes){
		drawNode(node, canvas);
	}
}

function drawEdge(edge, canvas){
	let cx = canvas.getContext("2d");

	cx.beginPath();
	cx.moveTo(edge.from.x, edge.from.y);
	cx.lineWidth = 5;
	cx.lineTo(edge.to.x, edge.to.y);
	cx.closePath();
	cx.stroke();
}

function drawNode(node, canvas){
	let cx = canvas.getContext("2d");

	cx.beginPath();
	cx.arc(node.x, node.y, 20, 0, 7);
	cx.closePath();
	cx.lineWidth = 10;
	cx.stroke();
	cx.fillStyle = "#008080";
	cx.fill();
}