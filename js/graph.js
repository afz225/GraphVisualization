/*
*
* File Name: graph.js
* Author: Ahmed Elshabrawy
* Date: August 2020
* 
* Summary of file:
*	This file contians the definition of the main graph object which uses objects to represnt nodes and edges.
*	Nodes are identified by an id in the nodes object, each node holds its cooridnates on canvas and its color.
*	The edges object uses an adjacency list representation to actually model the graph. The graph has various
*	methods that allow modification of the graph both visually and in terms the actual relationship between nodes.
*	No modifications are actually carried out on a graph object, but a new graph is generated with the desired 
*	modifications.
*
*/

class Graph{

	constructor(nodes = {}, edges = {}){
		this.nodes = nodes;
		this.edges = edges;
	}
	translateGraph(vector){
		let edges = Object.assign({}, this.edges);
		let nodes = {};
		Object.keys(this.nodes).forEach(key => {
			nodes[key] = {x: this.nodes[key].x + vector.x, y: this.nodes[key].y + vector.y, color: this.nodes[key].color};
		});
		return new Graph(nodes, edges);
	}
	translateNode(id, vector){
		let edges = Object.assign({}, this.edges);
		let nodes = Object.assign({}, this.nodes)
		nodes[id] = {x: this.nodes[id].x + vector.x, y: this.nodes[id].y + vector.y, color: this.nodes[id].color};
		return new Graph(nodes, edges);
	}

	addNode(pos){
		let nodes = Object.assign({}, this.nodes);
		nodes[Graph.maxNodeID] = {x: pos.x, y: pos.y, color: "#008080"};
		Graph.maxNodeID += 1;

		return new Graph(nodes, Object.assign({}, this.edges));
	}

	addEdge(edgeFrom, edgeTo, edgeWeight = 1, directed = true){
		let g = new Graph (Object.assign({}, this.nodes), Object.assign({}, this.edges));
		
		if (!directed && (g.edges[edgeTo]=== undefined || !({to: edgeFrom, weight: edgeWeight} in g.edges[edgeTo]))){
			g.edges[edgeTo] = g.edges[edgeTo] || [];
			g.edges[edgeTo].push({to: edgeFrom, weight: edgeWeight, color: "#black"});
		}

		if (g.edges[edgeFrom]=== undefined || !({to: edgeTo, weight: edgeWeight} in g.edges[edgeFrom])){
			g.edges[edgeFrom] = g.edges[edgeFrom] || [];
			g.edges[edgeFrom].push({to: edgeTo, weight: edgeWeight, color: "#black"});
		}
		return g;
	}
	deleteNode(id){
		let g = new Graph(Object.assign({}, this.nodes), Object.assign({}, this.edges));
		delete g.edges[id];
		Object.keys(g.edges).forEach(from => {
			g.edges[from] = g.edges[from].filter(edge => {return edge.to !== id;})
		});
		delete g.nodes[id];
		return g;
	}

	deleteEdge(from, edge){

		let g = new Graph(Object.assign({}, this.nodes), Object.assign({}, this.edges));

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
		let e = this.edges[to].filter(e=>{return e.to == from})[0];
		let weight = this.edges[from].filter(e=>{return e.to == to})[0].weight;
		return (!e || e.weight !== weight);
	}

}
Graph.maxNodeID = 0;



