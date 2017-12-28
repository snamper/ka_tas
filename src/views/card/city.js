require('../../public.js');
require('../../assets/css/city.css');

Jsborya.ready(function(){


var app=new Moon({
	el:'#app',
	data:{
		title:'',
		searchQuery:'',//地址搜索key
		isShowCitySearch:true,//城市搜索开关
		location:{
			'cityName':'北京',
			'cityCode':'110',
		},
		cityData:{"city":[{"cityName":"北京","cityCode":"110"},{"cityName":"长春","cityCode":"901"},{"cityName":"长沙","cityCode":"741"},{"cityName":"沧州","cityCode":"180"},{"cityName":"常州","cityCode":"440"},{"cityName":"成都","cityCode":"810"},{"cityName":"重庆","cityCode":"831"},{"cityName":"大连","cityCode":"940"},{"cityName":"大庆","cityCode":"981"},{"cityName":"东莞","cityCode":"580"},{"cityName":"佛山","cityCode":"530"},{"cityName":"福州","cityCode":"380"},{"cityName":"广州","cityCode":"510"},{"cityName":"贵阳","cityCode":"850"},{"cityName":"哈尔滨","cityCode":"971"},{"cityName":"海口","cityCode":"501"},{"cityName":"杭州","cityCode":"360"},{"cityName":"合肥","cityCode":"305"},{"cityName":"呼和浩特","cityCode":"101"},{"cityName":"湖州","cityCode":"362"},{"cityName":"惠州","cityCode":"570"},{"cityName":"济南","cityCode":"170"},{"cityName":"嘉兴","cityCode":"363"},{"cityName":"江门","cityCode":"550"},{"cityName":"金华","cityCode":"367"},{"cityName":"开封","cityCode":"762"},{"cityName":"昆明","cityCode":"860"},{"cityName":"丽水","cityCode":"469"},{"cityName":"南昌","cityCode":"750"},{"cityName":"南京","cityCode":"340"},{"cityName":"南宁","cityCode":"591"},{"cityName":"南通","cityCode":"358"},{"cityName":"宁波","cityCode":"370"},{"cityName":"平顶山","cityCode":"769"},{"cityName":"青岛","cityCode":"166"},{"cityName":"衢州","cityCode":"468"},{"cityName":"泉州","cityCode":"480"},{"cityName":"汕头","cityCode":"560"},{"cityName":"上海","cityCode":"310"},{"cityName":"绍兴","cityCode":"365"},{"cityName":"深圳","cityCode":"540"},{"cityName":"沈阳","cityCode":"910"},{"cityName":"石家庄","cityCode":"188"},{"cityName":"苏州","cityCode":"450"},{"cityName":"台州","cityCode":"476"},{"cityName":"泰州","cityCode":"445"},{"cityName":"天津","cityCode":"130"},{"cityName":"潍坊","cityCode":"155"},{"cityName":"温州","cityCode":"470"},{"cityName":"乌鲁木齐","cityCode":"890"},{"cityName":"无锡","cityCode":"330"},{"cityName":"芜湖","cityCode":"303"},{"cityName":"武汉","cityCode":"710"},{"cityName":"西安","cityCode":"841"},{"cityName":"厦门","cityCode":"390"},{"cityName":"徐州","cityCode":"350"},{"cityName":"烟台","cityCode":"161"},{"cityName":"盐城","cityCode":"348"},{"cityName":"银川","cityCode":"880"},{"cityName":"珠海","cityCode":"620"},{"cityName":"镇江","cityCode":"343"},{"cityName":"中山","cityCode":"556"},{"cityName":"舟山","cityCode":"364"},{"cityName":"郑州","cityCode":"760"}],"hotCity":[{"cityName":"北京","cityCode":"110"},{"cityName":"广州","cityCode":"510"},{"cityName":"上海","cityCode":"310"},{"cityName":"深圳","cityCode":"540"}]},	
	},
	hooks:{
		init:function(){
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			var data=this.getUrlParam('data');
			if(data){
				data=JSON.parse(BASE64.decode(data));
				this.set('location.cityName',data.cityName);
				this.set('location.cityCode',data.cityCode);
				this.set('title',data.title);
			}
		}
	},
	methods:{
		selectCity:function(code,name){//选择城市
			
			var vm=this,back=vm.getUrlParam('back'),url;
			var data={"cityCode":code,"cityName":name};
			data=BASE64.encode(JSON.stringify(data));
			back=='more' ? url=back+".html?data="+data+"&type=city&more="+vm.getUrlParam('more')+"" : url=back+".html?data="+data+"&type=city";
			Jsborya.pageBack({
				url:url,
				isLoad:true,
				cityCode:code,
				cityName:name,
				depiction:vm.get('title'),
			});
		},
		filteredData:function () {
	      var filterKey = this.get('searchQuery') && this.get('searchQuery').toLowerCase();
	      var data = this.get('cityData'),ret=[];
	      if (filterKey) {
	      	this.set('isShowCitySearch',false);

			ret = data.city.filter((row)=>
				Object.keys(row).some((key)=>
					String(row[key]).indexOf(filterKey) > -1
				)
			);
	        return ret;
	      }else{
	      	this.set('isShowCitySearch',true);
	      	return data;
	      }
	    }
	}
});


});