require('../../public.js');
require('../../assets/css/city.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		searchQuery:'',//地址搜索key
		isShowCitySearch:true,//城市搜索开关
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
		letterList:{
			B:[{"cityName":"北京","cityCode":"110"}],
			C:[
				{cityName: "长春", cityCode: "901"},
				{cityName: "长沙", cityCode: "741"},
				{cityName: "沧州", cityCode: "180"},
				{cityName: "常州", cityCode: "440"},
				{cityName: "成都", cityCode: "810"},
				{cityName: "重庆", cityCode: "831"}
			],
			D:[
				{cityName: "大连", cityCode: "940"},
				{cityName: "大庆", cityCode: "981"},
				{cityName: "东莞", cityCode: "580"},
			],
			F:[
				{cityName: "佛山", cityCode: "530"},
				{cityName: "福州", cityCode: "380"}
			],
			G:[
				{cityName: "广州", cityCode: "510"},
				{cityName: "贵阳", cityCode: "850"}
			],
			H:[
				{cityName: "哈尔滨", cityCode: "971"},
				{cityName: "海口", cityCode: "501"},
				{cityName: "杭州", cityCode: "360"},
				{cityName: "合肥", cityCode: "305"},
				{cityName: "呼和浩特", cityCode: "101"},
				{cityName: "湖州", cityCode: "362"},
				{cityName: "惠州", cityCode: "570"}
			],
			J:[
				{cityName: "济南", cityCode: "170"},
				{cityName: "嘉兴", cityCode: "363"},
				{cityName: "江门", cityCode: "550"},
				{cityName: "金华", cityCode: "367"}
			],
			k:[
				{cityName: "开封", cityCode: "762"},
				{cityName: "昆明", cityCode: "860"}
			],
			L:[
				{cityName: "丽水", cityCode: "469"}
			],
			N:[
				{cityName: "南昌", cityCode: "750"},
				{cityName: "南京", cityCode: "340"},
				{cityName: "南宁", cityCode: "591"},
				{cityName: "南通", cityCode: "358"},
				{cityName: "宁波", cityCode: "370"}
			],
			P:[
				{cityName: "平顶山", cityCode: "769"},
				{cityName: "青岛", cityCode: "166"}
			],
			Q:[
				{cityName: "衢州", cityCode: "468"},
				{cityName: "泉州", cityCode: "480"}
			],
			S:[
				{cityName: "汕头", cityCode: "560"},
				{cityName: "上海", cityCode: "310"},
				{cityName: "绍兴", cityCode: "365"},
				{cityName: "深圳", cityCode: "540"},
				{cityName: "沈阳", cityCode: "910"},
				{cityName: "石家庄", cityCode: "188"},
				{cityName: "苏州", cityCode: "450"}
			],
			T:[
				{cityName: "台州", cityCode: "476"},
				{cityName: "泰州", cityCode: "445"},
				{cityName: "天津", cityCode: "130"}
			],
			W:[
				{cityName: "潍坊", cityCode: "155"},
				{cityName: "温州", cityCode: "470"},
				{cityName: "乌鲁木齐", cityCode: "890"},
				{cityName: "无锡", cityCode: "330"},
				{cityName: "芜湖", cityCode: "303"},
				{cityName: "武汉", cityCode: "710"}
			],
			X:[
				{cityName: "西安", cityCode: "841"},
				{cityName: "厦门", cityCode: "390"},
				{cityName: "徐州", cityCode: "350"}
			],
			Y:[
				{cityName: "烟台", cityCode: "161"},
				{cityName: "盐城", cityCode: "348"},
				{cityName: "银川", cityCode: "880"}
			],
			Z:[
				{cityName: "珠海", cityCode: "620"},
				{cityName: "镇江", cityCode: "343"},
				{cityName: "中山", cityCode: "556"},
				{cityName: "舟山", cityCode: "364"},
				{cityName: "郑州", cityCode: "760"}
			]
		}
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'选择城市',
				left:{
					icon:'back_white',
					value:'',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			var selectCity=vm.getStore('selectCity');
			if(selectCity){
				vm.set('location.cityName',selectCity.cityName);
				vm.set('location.cityCode',selectCity.cityCode);
			}
		},
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage');
	    	},300);
	    }
	},
	methods:{
		setPage:function(){
			const window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
			document.getElementById('cityScroll').style.height=window_h-60+'px';
		},
		selectCity:function(code,name){//选择城市
			vm.setStore('selectCity',{"cityCode":code,"cityName":name});
			Jsborya.pageBack({
				url:'index.html',
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