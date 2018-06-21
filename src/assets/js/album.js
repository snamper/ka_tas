/*
	Created By thinkmix 2018-06-21
	移动端相册功能
	待完善：双击、旋转
 */
! function() {
	var _private={
		w:document.documentElement.clientWidth||window.innerWidth||document.body.clientWidth,
		p:{x:0,y:0,off:false},//单点记录
		p_two:{
			start:[],//开始的点坐标集
			scale:1,
			off:false
		},//双点记录
		transformStyle:{x:0,y:0,scale:1,rotate:0},//移动记录
		target:document.getElementById("albumBox"),
		getDistance:function(p1, p2) {//获取两点间距离
		    let x = p2.pageX - p1.pageX,
		        y = p2.pageY - p1.pageY;

		    return Math.sqrt((x * x) + (y * y));
		},
		getAngle:function(p1, p2) {//获取角度
		    let x = p1.pageX - p2.pageX,
		        y = p1.pageY- p2.pageY;

		    return Math.atan2(y, x) * 180 / Math.PI;
		},
		set:function(){
			let transformStyle = this.transformStyle;

			// console.log(transformStyle)
			this.target.style.transform=`translate3d(${ transformStyle.x }px,${ transformStyle.y }px,0px) scale(${ transformStyle.scale }) rotate(${ transformStyle.rotate }deg)`;
			this.target.style.webkitTransform=`translate3d(${ transformStyle.x }px,${ transformStyle.y }px,0px) scale(${ transformStyle.scale }) rotate(${ transformStyle.rotate }deg)`;
		},
		start:function(e){
			if(e.touches.length>=2){//双指
				this.p_two.off = true;
				this.p_two.start = e.touches;
			}else{
				this.p.off = true;
				this.p.x = e.touches[0].clientX;
				this.p.y = e.touches[0].clientY;
			}
			
			this.set();
		},
		move:function(e){
			e.preventDefault();

			if(e.touches.length>=2 && this.p_two.off){//双指
	            let newScale=this.getDistance(e.touches[0], e.touches[1]) / this.getDistance(this.p_two.start[0], this.p_two.start[1]),
	            	newRotate=this.getAngle(e.touches[0], e.touches[1]) - this.getAngle(this.p_two.start[0], this.p_two.start[1]);

	            let scale = (newScale * this.p_two.scale).toFixed(2);
	            if(10>scale && scale>0.7)this.transformStyle.scale = scale;
	            // document.getElementById("scale").innerText = scale;

	            // this.transformStyle.rotate = rotate.toFixed(2);

	            this.set();
	        }else if(this.p.off){
				let x = e.touches[0].clientX - this.p.x, y = e.touches[0].clientY - this.p.y,
				direction=Math.abs(x) < Math.abs(y) ? 0 : 1;//0,竖向;1,横向;

				this.transformStyle.x += x;
				this.transformStyle.y += y;
				this.p.x = e.touches[0].clientX;
				this.p.y = e.touches[0].clientY;
				
				this.set();
			}
		},
		end:function(e){

			this.p.off = false;
			this.p_two.off = false;
			this.p_two.scale = this.transformStyle.scale;
		}
	};
	var Album={
		init:function(arg){
			_private.target.addEventListener('touchstart',function(e){
				_private.start(e);
			});
			_private.target.addEventListener('touchmove',function(e){
				_private.move(e);
			});
			_private.target.addEventListener('touchend',function(e){
				_private.end(e);
			});
		}
	};

	window.Album = Album;
}(),"undefined" != typeof module ?
	module.exports = window.Album :
		"function" == typeof define && define.amd && define([], function() {
			"use strict";
			return window.Album;
		});
