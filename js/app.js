
// AddNode, AddEdge, RemoveComponent, Move, ChooseAlgorithm, Run

// -------------------------------------------------Classes-------------------------------------------------------------------------
const NODERADIUS = 20;


class Graph{
	constructor(nodes = [], edges = []){
		this.nodes = nodes;
		this.edges = edges;
	}
	translateGraph(vector){
		let edges = this.edges.slice();
		let nodes = this.nodes.map(node => {
			return {x: node.x + vector.x, y: node.y + vector.y};
		})
		return new Graph(nodes, edges);
	}
	translateNode(index, vector){
		let edges = this.edges.slice();
		let nodes = this.nodes.slice();
		nodes[index] = {x: nodes[index].x + vector.x, y: nodes[index].y + vector.y};
		return new Graph(nodes, edges);
	}
}

class CanvasGraph{
	constructor (graph, inputHandler){
		this.dom = document.querySelector("canvas");
		this.dom.onmousedown = event => this.mouse(event, inputHandler);
		this.dom.ontouchstart = event => this.touch(event, inputHandler);
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
		}else{
			this.dom.getContext("2d").clearRect(0,0,this.dom.clientWidth, this.dom.clientHeight);
		}
		drawGraph(this.graph, this.dom);
		}

	mouse(event, inputHandler){
		let pos = {x: event.offsetX, y: event.offsetY};
		let moveHandler = inputHandler(pos);
		let move = (moveEvent)=>{
			if (moveEvent.buttons == 0)
				this.dom.removeEventListener("mousemove", move);
			else {
				if (moveEvent.offsetX == pos.x &&
					moveEvent.offsetY == pos.y)
					return;
				pos = {x: moveEvent.offsetX, y: moveEvent.offsetY};
				moveHandler(pos);
			}
		}
		if (moveHandler){
			this.dom.addEventListener("mousemove", move);
		}
		

	}

	touch(event, inputHandler){
		console.log("been");
		var rect = event.target.getBoundingClientRect();
		let pos = {x: event.touches[0].clientX-rect.left, y: event.touches[0].clientY-rect.top};
		event.preventDefault();
		let moveHandler = inputHandler(pos);
		let move = (moveEvent)=>{
			let npos = {x: moveEvent.touches[0].clientX-rect.left, y: moveEvent.touches[0].clientY-rect.top};
			if (npos.x == pos.x && 
				npos.y == pos.y)
				return;
			pos = npos;
			moveHandler(pos);
		}
		let end = ()=>{
			this.dom.removeEventListener("touchmove", move);
			this.dom.removeEventListener("touchend", end);
		}
		this.dom.addEventListener("touchmove", move);
		this.dom.addEventListener("touchend", end);
	}

}

class MoveControl {
	constructor(state, {dispatch}){
		this.dom = document.querySelector("#move");
		this.dom.onclick = ()=> {
			dispatch({control: MoveControl});
		}
		this.graph = state.graph;

	}
	syncState(state){
		this.graph = state.graph;
	}
	tool(pos, dispatch){

		let index = onNode(pos, this.graph);
		let gr = this.graph;
		if (index !== undefined){
			moveNode(pos);
			return moveNode;
		}else{
			moveCanvas(pos);
			return moveCanvas
		}
		
		function moveCanvas(npos){
			let translate = {x: (npos.x - pos.x), y: (npos.y-pos.y)};
			dispatch({graph: gr.translateGraph(translate)});
		}
		function moveNode(npos){
			let translate = {x: (npos.x - pos.x), y: (npos.y-pos.y)};
			dispatch({graph: gr.translateNode(index, translate)});
		}

	}
}

class App{
	constructor(state, config){
		let {controls, dispatch} = config;
		this.state = state;
		
		this.canvas = new CanvasGraph(state.graph, 
			pos =>{
				let ctrl = this.controls.filter(control => (control instanceof this.state.control))[0];
				let moveHandler = ctrl.tool(pos, dispatch);
				if (moveHandler)
					return pos => moveHandler(pos);
			}
			);
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
}





// ---------------------------------------------Functions----------------------------------------------------------------



function drawGraph(graph, canvas){
	for (let edge of graph.edges){
		drawEdge(graph, edge, canvas);
	}
	for (let node of graph.nodes){
		drawNode(node, canvas);
	}
}

function drawEdge(graph, edge, canvas){
	let cx = canvas.getContext("2d");

	cx.beginPath();
	cx.moveTo(graph.nodes[edge.from].x, graph.nodes[edge.from].y);
	cx.lineWidth = 5;
	cx.lineTo(graph.nodes[edge.to].x, graph.nodes[edge.to].y);
	cx.closePath();
	cx.stroke();
}

function drawNode(node, canvas){
	let cx = canvas.getContext("2d");

	cx.beginPath();
	cx.arc(node.x, node.y, NODERADIUS, 0, 7);
	cx.closePath();
	cx.lineWidth = 10;
	cx.stroke();
	cx.fillStyle = "#008080";
	cx.fill();
}

function stateUpdate(state, action){
	return Object.assign({}, state, action);
}

function distance(x1, y1, x2, y2){
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
}

function onNode(pos, graph){
	let selectIndex;
	graph.nodes.forEach((node, index)=> selectIndex = (distance(pos.x, pos.y, node.x, node.y) <= NODERADIUS)?index: selectIndex);
	return selectIndex;
}

// -------------------------------------------------Constants-------------------------------------------------------------------------

const DEFAULTCONTROLS = [MoveControl];

const DEFAULTSTATE = {
	graph: new Graph([{x:400,y:400}, {x:500, y:500}], [{from: 0, to: 1}]),
	control: MoveControl
}

// -------------------------------------------------Body-------------------------------------------------------------------------


let state = DEFAULTSTATE;
let app = new App(state, 
	{controls: DEFAULTCONTROLS,
		dispatch: (action) =>{
			state = stateUpdate(state, action);
			app.syncState(state);
		}
	})


// refresh function acts as a throttle for the refreshCanvas function for better performance when resizing window
var timeout;
function refresh(){
	if (!timeout){
		timeout = setTimeout(()=>{
			timeout = null;
			app.canvas.refreshCanvas();
		}, 50);
	}
}





