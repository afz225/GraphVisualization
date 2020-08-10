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
			if (!discovered.includes(edge.to) && ((Number(n.key) + Number(edge.weight)) < d[edge.to])){
				edge.color = "blue"//"#FFCCCB"
				console.log("decrease key args", edge.to, Number(n.key) + Number(edge.weight))
				pq.decreaseKey(edge.to, Number(n.key) + Number(edge.weight));
				d[edge.to] = Number(n.key) + Number(edge.weight);
				parent[edge.to] = n.value;
				steps.push({
					d: Object.assign({},d), 
					parent: Object.assign({}, parent),
					graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
					discovered: discovered.slice(),
				})
			}
		})
		}
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

algorithms["Bellman-Ford Algorithm"] = function(startNode, graph){
	let steps = [];
	let M = {};
	let updated = [];
	let parent = {};
	let i;

	let g = new Graph(deepCopy(graph.nodes),deepCopy(graph.edges));

	Object.keys(graph.nodes).forEach(id =>{
		M[id] = Infinity;
		g.nodes[id].color = "grey";
	});
	M[startNode] = 0;
	updated.push(startNode);


	steps.push({
		M: Object.assign({},M), 
		parent: Object.assign({}, parent),
		graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
		updated: updated.slice(),
		start : startNode
	})

	count = 0;
	for (i = 0; i < Object.keys(g.nodes).length; ++i){
		Object.keys(g.edges).forEach(from => {
			g.nodes[from].color = "#F0E68C";
			steps.push({
				M: Object.assign({},M), 
				parent: Object.assign({}, parent),
				graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
				updated: updated.slice()
			})
			if (updated.includes(from)){
				g.edges[from].forEach(edge =>{
					if (M[edge.to] > M[from] + Number(edge.weight)){
						edge.color = "blue";
						M[edge.to] = M[from] + Number(edge.weight);
						parent[edge.to] = from;
						updated.push(edge.to);
						g.nodes[edge.to].color = "blue";
						++count;
					}

				})
				steps.push({
					M: Object.assign({},M), 
					parent: Object.assign({}, parent),
					graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
					updated: updated.slice()
				})
				Object.keys(g.edges).forEach(from => {
					g.edges[from].forEach(edge => edge.color = "black");
				})
				
				updated = updated.filter(node => {return node !== from});
			}
			g.nodes[from].color = "grey";
			steps.push({
				M: Object.assign({},M), 
				parent: Object.assign({}, parent),
				graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
				updated: updated.slice()
			})
		})
		steps.push({
			M: Object.assign({},M), 
			parent: Object.assign({}, parent),
			graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
			updated: updated.slice()
		}) 
		if (count !== 0){
			count = 0;
		} else {
			break;
		}

	}
	Object.keys(graph.nodes).forEach(id =>{
		g.nodes[id].color = "grey";
	});
	steps.push({
		M: Object.assign({},M), 
		parent: Object.assign({}, parent),
		graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)),
		updated: updated.slice()
	}) 
	return steps;
}
var reference
animate["Dijkstra's Algorithm"] = (steps, end,canvas)=>{
	let i = 0;
	
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
			if (steps[i-1] !== undefined && steps[i-1].d[id] !== steps[i].d[id])
				cx.fillStyle = "blue"
			else
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
	let p = steps[steps.length - 1].parent[end];
	let c = end;
	let g = new Graph(deepCopy(steps[steps.length - 1].graph.nodes), deepCopy(steps[steps.length - 1].graph.edges));
	while(p !== undefined){
		console.log(p, c);
		g.edges[p].forEach(edge=>edge.color = (edge.to === c)?"#FFDF00":edge.color);
		c = p;
		p = steps[steps.length - 1].parent[p];
	}
	steps.push({graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)), d:deepCopy(steps[steps.length-1].d)});
	reference = requestAnimationFrame(animHelper);
	
}


animate["Bellman-Ford Algorithm"] = (steps, end,canvas)=>{
	let i = 0;
	
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
		Object.keys(steps[i].M).forEach(id => {
			if (steps[i-1] !== undefined && steps[i-1].M[id] !== steps[i].M[id])
				cx.fillStyle = "blue"
			else
				cx.fillStyle = "green";
			text = steps[i].M[id];
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
	let p = steps[steps.length - 1].parent[end];
	let c = end;
	let g = new Graph(deepCopy(steps[steps.length - 1].graph.nodes), deepCopy(steps[steps.length - 1].graph.edges));
	while(p !== undefined){
		console.log(p, c);
		g.edges[p].forEach(edge=>edge.color = (edge.to === c)?"#FFDF00":edge.color);
		c = p;
		p = steps[steps.length - 1].parent[p];
	}
	steps.push({graph: new Graph(deepCopy(g.nodes), deepCopy(g.edges)), M:deepCopy(steps[steps.length-1].M)});
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
		this.start = state.start;

	}
	syncState(state){
		this.graph = state.graph;
		this.algorithm = state.algorithm;
		this.start = state.start;
	}
	tool(pos, dispatch){
		let id = onNode(pos, this.graph);
		if (id === undefined)
			console.log("Please select a valid node");
		else if (this.start === undefined){
			dispatch({start: id});
		} else {
			this.end = id;
			this.runAlgorithm();
			dispatch({start: undefined});
			this.end = undefined;
		}
	}

	runAlgorithm(){
		let steps = algorithms[this.algorithm](this.start,this.graph);
		console.log(steps);
		animate[this.algorithm](steps, this.end, this.dom);
	}
}