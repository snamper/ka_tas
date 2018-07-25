require('../../public.js');
require('./css/rechargeOrder.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		userInfo:{},
		off:{
			showNoMore:false,//暂无更多
			showPullLoad:false,//上拉加载
		},
		orderList:[],
		page:1,
		pageSize:15,
		total:0,
		boxHt:'height:400px',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			Jsborya.getUserInfo(function(userInfo){
				vm.set('userInfo',userInfo);

				vm.callMethod('setPage');
				vm.callMethod('getList');
			});
		}
	},
	methods:{
		setPage:function(){
			setTimeout(function(){
	    		let window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight;
	
		    	vm.set('boxHt',`height:${ window_h }px`);
			},0);
	    	
		},
		getList:function(page,closeLoad){//获取数据
			const json={
	  			params:{
	  				page:page||1,
	  				pageSize:vm.get('pageSize'),
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
	  		if(!page){
	  			document.getElementById("cardBox").scrollTop=0;
	  		}

	  		vm.set('off.showNoMore',false);
			vm.AJAX('/tms/w/phone/orderList',json,function(data){
				vm.set('page',json.params.page);

				if(closeLoad){//上拉
					vm.set('off.showPullLoad',false);
					vm.set('orderList',vm.get('orderList').list.concat(data.data.list));
				}else{
					vm.set('orderList',data.data.list);
				}
				if(data.data.list.length==0)vm.set('off.showNoMore',true);
			},closeLoad);
		},
		pullLoad:function(e){//上拉执行
			var vm=this;
			e.preventDefault();
	    	let page=vm.get('page'),obj=document.getElementById('cardBox');
	    	if(!vm.get('off').showPullLoad&&!vm.get('off').showNoMore&&obj.scrollHeight<=(obj.scrollTop+obj.offsetHeight)){
	    		page++;
	    		vm.set('off.showPullLoad',true);
	    		vm.callMethod('getCardList',[page,true]);
	    	}
		},
		mathCentToYuan:function(value){
	      return this.mathCentToYuan(value);
	    },
	    getDateTime:function(value){
	      return this.getDateTime(value);
	    },
	  	phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	}
});
});