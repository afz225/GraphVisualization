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
		this.tempEdge = state.tempEdge;
	}

	syncState(state){
		this.graph = state.graph;
		this.tempEdge = state.tempEdge;
	}

	tool(pos, dispatch){
		let node = onNode(pos, this.graph);
		console.log("id", node);
		if (node === undefined){
			console.log("Please select a node");
			return;
		}
		if (this.tempEdge === undefined){
			let g = new Graph(Object.assign({},this.graph.nodes),Object.assign({},this.graph.edges));
			g.nodes[node].color = "#F0E68C";
			dispatch({tempEdge: node, graph: g});
		} else {
			if (node === this.tempEdge){
				return;
			}
			console.log("-------------------------------------");
			let {directed, weight} = edgeInput();
			console.log("pre-dispatch graph", this.graph);
			let g = this.graph.addEdge(this.tempEdge, node, weight, directed);
			g.nodes[this.tempEdge].color = "#008080";
			dispatch({graph: g, tempEdge: undefined});
		}
		

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
		console.log("synced graph", state.graph);
		this.graph = state.graph;
	}

	tool(pos, dispatch){
		let nodeID = onNode(pos, this.graph);
		if (nodeID !== undefined){
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
