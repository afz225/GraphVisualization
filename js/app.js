
// AddNode, AddEdge, RemoveComponent, Move, ChooseAlgorithm, Run

// -------------------------------------------------Classes-------------------------------------------------------------------------
const NODERADIUS = 20;
const EDGEWIDTH = 5;


class Graph{
	constructor(nodes = {}, edges = {}, maxNodeID = 0){
		this.maxNodeID = maxNodeID;
		this.nodes = nodes;
		this.edges = edges;
	}
	translateGraph(vector){
		let edges = Object.assign({}, this.edges);
		let nodes = {};
		Object.keys(this.nodes).forEach(key => {
			nodes[key] = {x: this.nodes[key].x + vector.x, y: this.nodes[key].y + vector.y};
		});
		return new Graph(nodes, edges, this.maxNodeID);
	}
	translateNode(id, vector){
		let edges = Object.assign({}, this.edges);
		let nodes = Object.assign({}, this.nodes)
		nodes[id] = {x: this.nodes[id].x + vector.x, y: this.nodes[id].y + vector.y};
		return new Graph(nodes, edges, this.maxNodeId);
	}

	addNode(pos){
		let nodes = Object.assign({}, this.nodes);
		nodes[this.maxNodeID] = {x: pos.x, y: pos.y};
		return new Graph(nodes, Object.assign({}, this.edges), this.maxNodeID + 1);
	}

	addEdge(from, to, edgeWeight = 1, directed = true){
		let edges = Object.assign({}, this.edges);
		if (this.edges[from] == undefined)
			edges[from] = [];
		if (!directed && this.edges[to] == undefined)
			edges[to] = [];
		
		if (edges[from].some((edge)=>{return edge.to === to;})){
			return new Graph(Object.assign({}, this.nodes), Object.assign({}, this.edges, this.maxNodeID));
		}

		edges[from].push({to: to, weight: edgeWeight});
		if (!directed && !(edges[to].some((edge)=>{return edge.to === from;}))){
			edges[to].push({to: from, weight: edgeWeight});
		}
		
		return new Graph(Object.assign({}, this.nodes), edges, this.maxNodeID);
		}
	deleteNode(id){
		let g = new Graph(Object.assign({}, this.nodes), Object.assign({}, this.edges), this.maxNodeID);
		delete g.edges[id];
		Object.keys(g.edges).forEach(from => {
			g.edges[from] = g.edges[from].filter(edge => {return edge.to !== id;})
		});
		delete g.nodes[id];
		return g;
	}

	deleteEdge(from, edge){

		let g = new Graph(Object.assign({}, this.nodes), Object.assign({}, this.edges), this.maxNodeID);

		let i = g.edges[from].indexOf(edge);
		console.log(i);
		if (i !== -1)
			g.edges[from].splice(i,1);

		if (g.edges[edge.to].some((e)=>{return e.to === from;})){

		}

		return g;
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
			if (moveEvent.buttons == 0){
				this.dom.removeEventListener("mousemove", move);
			}
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

		var rect = event.target.getBoundingClientRect();
		let pos = {x: event.touches[0].clientX-rect.left, y: event.touches[0].clientY-rect.top};
		event.preventDefault();
		let moveHandler = inputHandler(pos);
		
		let move = (moveEvent)=>{
			event.preventDefault();
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
		if (moveHandler){
			this.dom.addEventListener("touchmove", move);
			this.dom.addEventListener("touchend", end);
			
		}
	}

}

class MoveControl {
	constructor(state, {dispatch}){
		this.dom = document.querySelector("#move");
		this.dom.onclick = ()=> {
			document.querySelector("#edgeProperties").style.display = "none";
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

class AddNode{
	constructor(state, {dispatch}){
		this.dom = document.querySelector("#addNode");
		this.dom.onclick = () =>{
			document.querySelector("#edgeProperties").style.display = "none";
			dispatch({control: AddNode});
		}
		this.graph = state.graph;
	}

	syncState(state){
		this.graph = state.graph;
	}

	tool(pos, dispatch){
		if (onNode(pos, this.graph) !== undefined)
			return;
		dispatch({graph: this.graph.addNode(pos)});

	}
}

class AddEdge{
	constructor(state, {dispatch}){
		this.dom = document.querySelector("#addEdge");
		this.dom.onclick = ()=>{
			document.querySelector("#edgeProperties").style.display = "block";
			dispatch({control: AddEdge});
		}
		this.graph = state.graph;
	}

	syncState(state){
		this.graph = state.graph;
	}

	tool(pos, dispatch){
		let fromNode = onNode(pos, this.graph);
		if (fromNode === undefined){
			console.log("Please select a node");
			return;
		}
		let gr = this.graph;
		function addEdge(npos){
			let toNode = onNode(npos, gr);
			if (toNode === fromNode || toNode === undefined){
				return;
			}
			if (gr.edges[fromNode] != undefined && gr.edges[fromNode].some((edge)=>{return edge.to === toNode;})){
				return;
			}
			let {directed, weight} = edgeInput();
			dispatch({graph: gr.addEdge(fromNode, toNode, weight, directed)});
			
		}
		addEdge(pos);
		return addEdge;
	}
}

class DeleteControl{
	constructor(state, {dispatch}){
		this.dom = document.querySelector("#delete");
		this.dom.onclick = ()=>{
			document.querySelector("#edgeProperties").style.display = "none";
			dispatch({control: DeleteControl});
		}
		this.graph = state.graph;
	}

	syncState(state){
		this.graph = state.graph;
	}

	tool(pos, dispatch){
		let nodeID = onNode(pos, this.graph);
		if (nodeID){
			dispatch({graph: this.graph.deleteNode(nodeID)});
		} else {
			// let edge;
			let edgeSearch = (graph)=>{
				for (let from of Object.keys(graph.edges)){
					for (let edge of graph.edges[from]){
						if (distanceToEdge(graph, pos, from, edge.to) <= EDGEWIDTH){
							dispatch({graph: this.graph.deleteEdge(from, edge)});
							this.graph.deleteEdge(from, edge);
							return;
						}
					}
				}
			}
			edgeSearch(this.graph);
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
			});
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
	for (let from of Object.keys(graph.edges)){
		graph.edges[from].forEach(edge => {drawEdge(graph, from, edge.to, canvas);
		});
	}
	
	for (let id of Object.keys(graph.nodes)){
		drawNode(graph.nodes[id], canvas);
	}

	
}

function drawEdge(graph, from, to, canvas){
	let cx = canvas.getContext("2d");
	cx.beginPath();
	cx.moveTo(graph.nodes[from].x, graph.nodes[from].y);
	cx.lineWidth = EDGEWIDTH;
	cx.lineTo(graph.nodes[to].x, graph.nodes[to].y); 
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
	let selectID;
	// graph.nodes.forEach((node, index)=> selectIndex = (distance(pos.x, pos.y, node.x, node.y) <= NODERADIUS)?index: selectIndex);
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

// -------------------------------------------------Constants-------------------------------------------------------------------------

const DEFAULTCONTROLS = [AddNode, AddEdge, MoveControl, DeleteControl];

const DEFAULTSTATE = {
	graph: new Graph(),
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





