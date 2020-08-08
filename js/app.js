/*
*
* File Name: app.js
* Author: Ahmed Elshabrawy
* Date: August 2020
* 
* Summary of file:
*	This file contains the main body of the application responsible for the graph editor.
*	The application manages the various components written in other files as class definitions
*	Each class is responsible for a function (adding edges/nodes, drawing on canvas, etc.) of 
*	the application, and the App class ensures the classes are synced to the current state of
*	the application as a whole. Moreover, any global constants are declared here. 
*
*/


const NODERADIUS = 20;
const EDGEWIDTH = 5;



class App{
	constructor(state, config){
		// the config object is passed to the application to notify the application on how dispatching an action will take 
		// place as well as what classes of controls will be manages by the application
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

	// ensure every component of application is synced to the current state (in the case of a change)
	syncState(state){
		this.state = state;
		if (this.state.control !== AddEdge && this.state.tempEdge !== undefined){
			this.state.graph.nodes[this.state.tempEdge].color = "#008080";
			this.state.tempEdge = undefined;
		}
		this.canvas.syncState(state.graph);
		this.controls.forEach(control => control.syncState(state));
	}
}




const DEFAULTCONTROLS = [AlgorithmSelect, AddNode, AddEdge, MoveControl, DeleteControl, Animator];

const DEFAULTSTATE = {
	graph: new Graph(),
	control: MoveControl,
	algorithm: "Dijkstra's Algorithm",
}



let state = DEFAULTSTATE;
let app = new App(state, 
	{controls: DEFAULTCONTROLS,
		// the dispatch function to be used for the graph editor
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






