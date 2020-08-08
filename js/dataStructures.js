class nodeComp{
	constructor(){
		this.comp = (node1, node2) =>{
			return node1.key < node2.key;
		}
	}
}

class heapPQ{
	constructor(comparator){
		this.comparator = comparator;
		this.data = [];
	}
	push(elem){
		this.data.push(elem);
		this.heapifyUp(this.data.length - 1);
	}
	heapifyUp(index){
		let i = index;
		let p = this.parent(index);
		while (p >= 0 && this.comparator.comp(this.data[i], this.data[p]) ){
			let temp = this.data[i];
			this.data[i] = this.data[p];
			this.data[p] = temp;
			i = p;
			p = this.parent(i); 
		}
	}

	parent(index){
		return Math.floor((index-1)/2);
	}

	left(index){
		return 2*index + 1;
	}
	right(index){
		return 2*index + 2;
	}
	heapifyDown(index){
		let i = index;
		let l = this.left(index);
		let r = this.right(index);
		if (l < this.data.length && this.comparator.comp(this.data[l], this.data[i])) i = l;
		if (r < this.data.length && this.comparator.comp(this.data[r], this.data[i])) i = r;

		if (i !== index){
			let temp = this.data[i];
			this.data[i] = this.data[index];
			this.data[index] = temp;
			this.heapifyDown(i);
		}
	}

	pop(){
		if (this.data.length == 1){
			return this.data.pop();
		}
		let top = this.data[0];
		this.data[0] = this.data.pop();
		this.heapifyDown(0);
		return top;
	}
	decreaseKey(id, value){
		let index;
		this.data.forEach((elem, i) => {
			if (elem.value == id){
				index = i;
			}
		})
		console.log("value", value);
		this.data[index].key = value;
		this.heapifyUp(index);
	}
	empty(){
		return this.data.length === 0;
	}
}