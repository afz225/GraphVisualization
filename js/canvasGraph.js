class CanvasGraph{
	constructor (graph, inputHandler){
		this.dom = document.querySelector("canvas");
		this.dom.onmousedown = event => this.mouse(event, inputHandler);
		this.dom.ontouchstart = event => this.touch(event, inputHandler);
		this.syncState(graph);
	}

	syncState(graph){
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
