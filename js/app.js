
// AddNode, AddEdge, RemoveComponent, Move, ChooseAlgorithm, Run

// -------------------------------------------------Classes-------------------------------------------------------------------------

class Graph{
	constructor(nodes = [], edges = []){
		this.nodes = nodes;
		this.edges = edges;
	}


}

class CanvasGraph{
	constructor (graph){
		this.dom = document.querySelector("canvas");
		this.syncState(graph);
	}

	syncState(graph){
		if (this.graph == graph) return;
		this.graph = graph;
		this.refreshCanvas();
	}

	refreshCanvas() {
		let displayHeight = this.dom.clientHeight;
		let displayWidth = this.dom.clientWidth;

		if (displayHeight != this.dom.height ||
			displayWidth != this.dom.width){
			this.dom.height = displayHeight;
			this.dom.width = displayWidth;
		}
		drawGraph(this.graph, this.dom);
		}


}



class App{
	constructor(state, config){
		let {controls, dispatch} = config;
		this.state = state;
		this.canvas = new CanvasGraph(state.graph);
		this.canvas.dom.onmousedown = event => this.mouse(event);
		this.canvas.dom.ontouchstart = event => this.touch(event);
		this.controls = controls.map(
			control => new control(state, config)
			)
		this.syncState(this.state);
	}

	syncState(state){
		this.state = state;
		this.canvas.syncState(state.graph);
		this.controls.forEach(control => control.syncState(state));
	}

	mouse(event){
		let pos = {x: event.offsetX, y: event.offsetY};


	}

	touch(event){
		var rect = event.target.getBoundingClientRect();
		let pos = {x: event.touches[0].clientX-rect.left, y: event.touches[0].clientY-rect.top};
		event.preventDefault();

	}

}





// ---------------------------------------------Functions----------------------------------------------------------------



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

function stateUpdate(state, action){
	return Object.assign({}, state, action);
}



// -------------------------------------------------Constants-------------------------------------------------------------------------

const DEFAULTCONTROLS = [];

const DEFAULTSTATE = {
	graph: new Graph([{x:400,y:400}]),
	control: undefined
}

// -------------------------------------------------Body-------------------------------------------------------------------------



let app = new App(DEFAULTSTATE, 
	{controls: DEFAULTCONTROLS,
		dispatch: (action) =>{
			stateUpdate(this.state, action);
			syncState(this.state);
		}
	})



var timeout;

function refresh(){
	if (!timeout){
		timeout = setTimeout(()=>{
			timeout = null;
			app.canvas.refreshCanvas();
		}, 50);
	}
}





