
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
		let weight;
		if (i !== -1){
			weight = g.edges[from][i].weight;
			g.edges[from].splice(i,1);	
		}

		// ensures undirected edges are deleted completely (if the edge has the same weight both directions)
		if (g.edges[edge.to]){
			let e = g.edges[edge.to].filter(e=>{return e.to === from})[0];
			if (e && e.weight === weight){
				i = g.edges[edge.to].indexOf(e);
				g.edges[edge.to].splice(i, 1);
			}
		}

		return g;
	}
	isDirected(from, to){
		if (this.edges[to] === undefined)
			return true;
		let e = this.edges[to].filter(e=>{return e.to === from})[0];
		let weight = this.edges[from].filter(e=>{return e.to = to})[0].weight;
		return (!e || e.weight !== weight);
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
			this.dom.height = displayHeight ;
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

class AlgorithmSelect{
	constructor(state, {dispatch}){
		this.algorithms = ["Dijkstra's Algorithm"];
		this.dom = document.querySelector("#algoSelect");
		this.selected = this.algorithms[0];
		this.algorithms.forEach(algo=>{
			let algoOption = document.createElement("option");
			algoOption.textContent = algo;
			this.dom.appendChild(algoOption);
		})
		this.dom.onchange = ()=>{
			this.selected = this.dom.selected;
			dispatch({algorithm: this.selected});
		};
		this.graph = state.graph;

	}
	syncState(state){
		this.graph = state.graph;
	}
	tool(pos, dispatch){
		
		return;
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

	// edge weight drawing
	let midx, midy;
	midx = (graph.nodes[to].x+graph.nodes[from].x)/2;
	midy = (graph.nodes[to].y+graph.nodes[from].y)/2;
	let weight = graph.edges[from].filter(e=>{return e.to === to;})[0].weight;
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
		console.log(angle)
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

function arrowPos(graph, from, to){
	let m = (graph.nodes[to].y - graph.nodes[from].y)/(graph.nodes[to].x - graph.nodes[from].x);
	console.log(m)
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
		// console.log(graph.nodes[to].x, graph.nodes[to].y,"arrow pos",arrowx, m*arrowx+yIntercept);
		return {x: arrowx, y: m*arrowx + yIntercept};
	}
}

// -------------------------------------------------Constants-------------------------------------------------------------------------

const DEFAULTCONTROLS = [AlgorithmSelect, AddNode, AddEdge, MoveControl, DeleteControl];

const DEFAULTSTATE = {
	graph: new Graph(),
	control: MoveControl,
	algorithm: "Dijkstra's Algorithm"
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





