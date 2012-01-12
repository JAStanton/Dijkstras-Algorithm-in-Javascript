/* Author: Jonathan Stanton

*/

var dj = function() {
	
	//private functions
	
	function random_color(){
		var rint = Math.round(0xffffff * Math.random());
		return 'rgba(' + (rint >> 16) + ',' + (rint >> 8 & 255) + ',' + (rint & 255) + ',.4)';	  
	}

	return {
		init : function() {
			var canvas = document.getElementById('field');  
			
			this.ul_path_display = document.getElementById("path_display");

			this.width = canvas.getAttribute("width");
			this.height = canvas.getAttribute("height");
			this.ctx = canvas.getContext('2d');

			this.wall = new Array();
			this.start = new Array();
			this.finish = new Array();
			this.open = new Array();
			this.closed = new Array();
			this.completed_paths = new Array();

			this.draw_map();
		},
		begin : function(){
			var x = this.width / 2;
		    var y = this.height / 2;
		 
		    this.ctx.font = "30pt Calibri";
		    this.ctx.textAlign = "center";
		    this.ctx.fillStyle = "blue";
		    this.ctx.fillText("working...", x, y);	
			
			setTimeout(function(){
		    	dj.find_shortest_path();
		    	dj.output();
			},1);			
		},
		working : function(callback){



		},
		draw_map : function(){
			this.block_size_x = this.width / map[0].length;
			this.block_size_y = this.height / map.length;
			//map[row][col] aka map[y][x]
			for (var col = 0; col < map.length ; col++) {
				for (var row = 0; row < map[col].length ; row++) {
				
					switch(map[row][col]){
						case 0:
							var color = "rgb(255,255,255)";
							this.open.push([col,row]);
							break;
						case 1:
							var color = "rgb(238,238,238)";
							this.wall.push([col,row]);
							break;
						case 2:
							var color = "rgb(0,255,0)";    
							this.start = [col,row];
							break;
						case 3:
							var color = "rgb(0,0,0)";      
							this.finish = [col,row];
							break;
					}

					this.ctx.fillStyle = color;
					this.ctx.fillRect(col * this.block_size_y,row * this.block_size_x,this.block_size_x,this.block_size_y);	

				};
			};
		},
		draw_block : function(coord,color){
			var row = coord[0],
				col = coord[1];
			
			this.ctx.fillStyle = color;
			this.ctx.fillRect(row * this.block_size_x,col * this.block_size_y,this.block_size_x,this.block_size_y);	

		},
		removeA : function(haystack,needle){
			for(i in haystack){
				if(haystack[i][0] == needle[0] && haystack[i][1] == needle[1]){
					haystack.splice(i,1);
					return haystack;
				};
			}
		},
		open_close : function(coord){
			var row = coord[0],
				col = coord[1];

			for(i in this.open){
				if(this.open[i][0] == row && this.open[i][1] == col) return "open";
			}
			for(i in this.closed){

				if(this.closed[i][0] == row && this.closed[i][1] == col) return "closed";	
			}
			return false;
		},
		test_collision : function(coord){
			var col = coord[0],
				row = coord[1];

			try{
				switch(map[row][col]){
					case 0: 
						switch(this.open_close(coord)){
							case "closed":
								return "blank-closed";
								break;
							case "open":
								return "blank";
								break;
						}
					break;
					case 1: return "wall";   break;
					case 2: return "start";  break; //this will never happen
					case 3: return "finish"; break;
				}
			}catch(e){
				return false;	
			}
		},
		find_shortest_path : function(){
			var paths = new Array();
			var directions = Array("up","down","left","right"); //const
			
			//kick things off
			paths.push([this.start]); //first path has only one branch that branch has only coord, the origin

			var temp_paths = new Array();

			for (var i = 0; i < paths.length; i++) {

				var trail_head = paths[i][paths[i].length - 1]; 

				for(d in directions){ //potentially up to 4 more branches

					var branches = new Array(); //new branch

					switch(directions[d]){
						case "up":
							var test_coord = [trail_head[0],(trail_head[1]  - 1)];
							break;
						case "down":
							var test_coord = [trail_head[0], (trail_head[1] + 1)];
							break;
						case "left":
							var test_coord = [(trail_head[0] - 1), trail_head[1]];
							break;
						case "right":
							var test_coord = [(trail_head[0] + 1), trail_head[1]];
							break;
					}

					
					//if the next block is blank then this branch is good, push this branch on the temp_paths and do this again.
					switch(this.test_collision(test_coord)){
						case "blank":
							//direction is good, push this branch on the temp_paths
							var temp_path = paths[i];
							temp_paths.push(  temp_path.concat([test_coord])   );
							this.removeA(this.open,test_coord) //test_coord is no longer available
							this.closed.push([test_coord]);	//test_coord is no longer available
						break;

						case "wall":
							//branch is dead, do nothing
						break;

						case "finish":


							this.completed_paths.push(paths[i]);

							//complete path, push this to directions
							// console.log("finish");
						break;
					}
					

				} //end for earch direction

				// console.log(temp_paths);

				paths = temp_paths

			};
		},
		output : function(){

			if(!this.completed_paths.length > 0){

				alert("no path!");
				this.draw_map();

			}else{
				this.draw_path(0);

				var ul_path_display = document.getElementById("path_display");
				ul_path_display.innerHTML = "";

				for (var i = 0; i < this.completed_paths.length; i++) {
				
					var liTag = document.createElement('li');
					liTag.setAttribute('id', "path-" + i);
					liTag.innerHTML = "<a href='#' onmouseout='dj.draw_map()' onmouseover='dj.draw_path("+i+");'>Path " + (i + 1) + ".</a> Distance: " + this.completed_paths[i].length + " units.";
					ul_path_display.appendChild(liTag);
					
				};
			
			}

		},
		draw_path : function(path){
			var color = random_color();
			this.draw_map();
			for (var i = 1; i < this.completed_paths[path].length; i++) {
				this.draw_block(this.completed_paths[path][i],color);
			};

		}
	};
		
}();

dj.init();