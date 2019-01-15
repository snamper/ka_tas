require('../../public.js');
require('./css/city.css');
const _cityData = require('../../assets/cityData.json');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		searchQuery:'',//地址搜索key
		isShowCitySearch:true,//城市搜索开关
		isShowNoCity:false,//搜索无结果
		location:{
			'cityName':'北京',
			'cityCode':'110',
		},
		hotCity:[
			{"cityName":"北京","cityCode":"110"},
			{"cityName":"广州","cityCode":"510"},
			{"cityName":"上海","cityCode":"310"},
			{"cityName":"徐州","cityCode":"350"},
			{"cityName":"济南","cityCode":"170"},
			{"cityName":"长春","cityCode":"901"}
		],
		letterList:_cityData
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'选择城市',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let selectCity = vm.getStore('selectCity');
			if(selectCity){
				vm.set('location.cityName',selectCity.cityName);
				vm.set('location.cityCode',selectCity.cityCode);
			}

			let userInfo = vm.getStore("USER_INFO");
			if(userInfo){
				vm.callMethod('getCityList', [userInfo]);
			}
		},
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage');
	    	},300);
	    }
	},
	methods:{
		getCityList(userInfo){
			const vm = this;

			let json={
	  			'params':{
	  				'phoneType':1,
	  				'misgive':'1'
	  			},
	  			'userInfo':userInfo
	  		};
			vm.AJAX('/tas/w/searchcard/getPhoneCitys',json,function(data){
				let letterList = data.data.list,
					keys = Object.keys(data.data.list);
				
				keys.sort(function(a,b){
					var order = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
					return order.indexOf(a) - order.indexOf(b);
				});
				
				var result = keys.map(function(a){
					return a;
				});

				let temp = {};
				result.forEach((item)=>{
					temp[item] = letterList[item];
				})

				vm.set('letterList',temp);
			});
		},
		setPage:function(){
			const window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
			document.getElementById('cityScroll').style.height=window_h-60+'px';
		},
		selectCity:function(code,name){//选择城市
			vm.setStore('selectCity',{"cityCode":code,"cityName":name});

			Jsborya.pageBack({
				url:`${vm.getUrlParam('back')}.html?type=${vm.getUrlParam('type') || ''}`,
				isLoad:true,
			});
		},
		clearInput:function(){
			vm.set('searchQuery','');
			vm.set('isShowCitySearch',true);
		},
		filteredData:function () {
	      var filterKey = vm.get('searchQuery') && vm.get('searchQuery').toLowerCase();
	      var data =  vm.get('letterList'),ret=[];
	      if (filterKey) {
	      	vm.set('isShowCitySearch',false);

	      	Object.entries(data).forEach(
	      		(row,index)=>{
	      			if(row[0].toLowerCase().indexOf(filterKey)>-1){//首字母匹配
  						ret=row[1];
  						return;
  					}else{
  						let todo = row[1].filter((value)=>
							Object.keys(value).some((key)=>
								String(value[key]).indexOf(filterKey) > -1
							)
						);
						if(todo.length)ret=ret.concat(todo);
  					}
	      		}
			  );

			vm.set('isShowNoCity', !ret.length);
	        return ret;
	      }else{
	      	vm.set('isShowCitySearch',true);
	      }
	    },
	    letterClick:function(id){
			let top=vm.callMethod('getElementTop',[document.getElementById(id)]);
			document.getElementById('cityScroll').scrollTop=top-60;
	    },
	    letterTouchStart:function(e){
			e = e.changedTouches ? e.changedTouches[0] : e;
			vm.set('point',{"y":e.pageY});
		},
		letterTouchMove:function(e){//滑动字母导航，自动滚动到相应位置
			let vm=this;
			e.preventDefault();
			e = e.changedTouches ? e.changedTouches[0] : e;
			let _y=e.pageY;//当前位置
			let distance=_y-vm.get('point').y;//滑动距离
			let direction = distance > 0 ? 1 : 0;//1,向下；0,向上
			distance=Math.abs(distance);
			if(distance>25){
				let index=Math.floor((_y-70)/22);
				if(index==0){
					if(vm.get('point').key!='hot'){
						vm.set('point.key','hot');
						vm.callMethod('letterClick',['hot']);
					}
				}else if(0<index<19){
					Object.entries(vm.get('letterList')).forEach(
						(row,_index)=>{
							if(_index==(index-1)&&vm.get('point').key!=row[0]){
								vm.set('point.key',row[0]);
								vm.callMethod('letterClick',[row[0]]);
							}
						}
					);
				}
			}
		},
		letterTouchEnd:function(e){
			e = e.changedTouches ? e.changedTouches[0] : e;
		},
	    getElementTop:function(element){//获取元素的位置
			var actualTop = element.offsetTop;
			var current = element.offsetParent;

			while (current !== null){
				actualTop += current.offsetTop;
				current = current.offsetParent;
			}

			return actualTop;
		}
	}
});


});