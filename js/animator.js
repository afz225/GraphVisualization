var algorithms = {};
var animate = {};




algorithms["Dijkstra's Algorithm"] = function(startNode, graph){
	let steps = [];
	let discovered = [];
	let parent = {};
	let d = {};
	
	let g = new Graph(deepCopy(graph.nodes),deepCopy(graph.edges));
	let pq = new heapPQ(new nodeComp);
	Object.keys(g.nodes).forEach(id => {
		d[id] = Infinity;
		g.nodes[id].color = "grey"
		pq.push({key: d[id], value: id});
	})
	d[startNode] = 0;
	pq.decreaseKey(startNode, 0);
	steps.push({
		d: Object.assign({},d), 
		parent: Object.assign({}, parent),
		graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
		discovered: discovered.slice(),
		start: startNode
	})
	while(!pq.empty()){
		let n = pq.pop();
		discovered.push(n.value);
		g.nodes[n.value].color = "red";
		if (g.edges[n.value] != undefined){
		g.edges[n.value].forEach(edge=>{
			if ((Number(n.key) + Number(edge.weight)) < d[edge.to]){
				edge.color = "#FFCCCB"
				pq.decreaseKey(edge.to, Number(n.key) + Number(edge.weight));
				d[edge.to] = Number(n.key) + Number(edge.weight);
				parent[edge.to] = n.value;
			}
		})
		}
		steps.push({
			d: Object.assign({},d), 
			parent: Object.assign({}, parent),
			graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
			discovered: discovered.slice(),
		})
		Object.keys(g.edges).forEach(from => {
			g.edges[from].forEach(edge => edge.color = "black");
		})
		steps.push({
			d: Object.assign({},d), 
			parent: Object.assign({}, parent),
			graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
			discovered: discovered.slice()
		})

	}

	return steps;

}
var reference
animate["Dijkstra's Algorithm"] = (steps, canvas)=>{
	let i = 0;
	
	console.log("steps", steps);
	let animHelper = function(timestamp){
		setTimeout(()=>{
		if (i < steps.length){
		canvas.width = canvas.width;
		drawGraph(steps[i].graph, canvas);
		let cx = canvas.getContext("2d");
		cx.font = "20px Arial";
		cx.fillStyle = "white";
		let text = "start";
		let textWidth = cx.measureText(text).width;
		cx.fillText(text, steps[0].graph.nodes[steps[0].start].x - textWidth/2, steps[0].graph.nodes[steps[0].start].y + 5)
		Object.keys(steps[i].d).forEach(id => {
			cx.fillStyle = "green";
			text = steps[i].d[id];
			textWidth = cx.measureText(text).width;
			cx.fillText(text, steps[i].graph.nodes[id].x - textWidth/2, steps[i].graph.nodes[id].y - NODERADIUS - 20);
		})
		++i;
		reference = requestAnimationFrame(animHelper);
	}else{
		cancelAnimationFrame(reference);
	}
	}, 1000)
	}
	reference = requestAnimationFrame(animHelper);
}



class Animator{
	constructor(state, {dispatch}){
		this.dom = document.querySelector("canvas");
		this.graph = state.graph;
		document.querySelector("#run").onclick = ()=>{
			document.querySelector("#edgeProperties").style.display = "none";
			dispatch({control: Animator});
		}
		this.algorithm = state.algorithm;

	}
	syncState(state){
		this.graph = state.graph;
		this.algorithm = state.algorithm;
	}
	tool(pos, dispatch){
		let id = onNode(pos, this.graph);
		if (id !== undefined){
			this.start = id;
			this.runAlgorithm();
		}
	}

	runAlgorithm(){
		let steps = algorithms[this.algorithm](this.start, this.graph);
		console.log(steps);
		animate[this.algorithm](steps, this.dom);
	}
}