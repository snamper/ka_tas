/*
	Created By thinkmix 2016-11-23
	a template of slider
 */
require('../css/slider.css');
! function() {
	var _private={
		w:document.documentElement.clientWidth,
		p:{'x':0,'y':0,'time':0,'off':!0,'index':0},
		target:document.getElementsByClassName('m-slider-wrapper')[0],
		set:function(val){
			this.target.style.transitionDuration=val[1];
			this.target.style.transform='translate3d('+val[0]+'px,0px,0px)';
		},
		pagination:function(){
			var foo=document.getElementsByClassName('m-slider-pagination')[0],str='';
			for(var i = 0;i<this.maxIndex+1;i++){
				if(this.p.index==i){
					str+='<span class="active">';
				}else{
					str+='<span>';
				}
				str+='</span>';
			}
			foo.innerHTML=str;
		},
		start:function(e){
			e = e.changedTouches ? e.changedTouches[0] : e;
			//if(!this.p.off)return false;
			this.p.x=e.pageX;
			this.p.y=e.pageY;
			this.p.time=new Date().getTime();
		},
		move:function(e){
			var event=e;
			e = e.changedTouches ? e.changedTouches[0] : e;
			var x=e.pageX-this.p.x,y=e.pageY-this.p.y;
			var isSlider=Math.abs(x) < Math.abs(y) ? 0:1;
			
			if(isSlider==1&&this.p.off){
				event.preventDefault();
				this.set([(x-this.w*this.p.index),'0ms']);
				// if(Math.abs(x)>30&&(this.p.index==0&&x>0||x<0&&this.p.index==this.maxIndex)){
				// 	this.p.off=false;
				// }
				//this.p.off=false;
			}
		},
		end:function(e){
			e = e.changedTouches ? e.changedTouches[0] : e;
			var x=e.pageX-this.p.x;
			//if(Math.abs(x)>30){
				if(this.p.index<this.maxIndex&&x<0){
					this.p.index+=1;
				}else if(x>0&&this.p.index>0){
					this.p.index-=1;
				}
			//}
			
			this.set([(-this.w*this.p.index),'300ms']);
			this.pagination();
			var vm=this;
			setTimeout(function(){
				vm.target.style.transitionDuration='0ms';
				//vm.p.off=true;
			},300);
		}
	};
	var Slider={
		init:function(arg){
			_private.maxIndex=arg.index-1;
			_private.pagination();
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

	window.Slider = Slider;
}(),"undefined" != typeof module ?
	module.exports = window.Slider :
		"function" == typeof define && define.amd && define([], function() {
			"use strict";
			return window.Slider;
		});
