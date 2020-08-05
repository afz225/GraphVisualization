
const NODERADIUS = 20;
const EDGEWIDTH = 5;


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
		if (this.state.control !== AddEdge && this.state.tempEdge !== undefined){
			this.state.graph.nodes[this.state.tempEdge].color = "#008080";
			this.state.tempEdge = undefined;
		}
		this.canvas.syncState(state.graph);
		this.controls.forEach(control => control.syncState(state));
		console.log("-------------------------------------");
	}
}




const DEFAULTCONTROLS = [AlgorithmSelect, AddNode, AddEdge, MoveControl, DeleteControl];

const DEFAULTSTATE = {
	graph: new Graph(),
	control: MoveControl,
	algorithm: "Dijkstra's Algorithm",
}



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





