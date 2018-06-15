require('../../public.js');
require('../../assets/css/realTimeCharge.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		userInfo:{phone:'00000000000'},
		responseData:{
	        "restFee": "0",//可用余额，以分为单位
	        "curTotalFee": "0",// 当月话费
			"creditFee": "0",//信用度
	    },
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			Jsborya.getUserInfo(function(userInfo){
				vm.set('userInfo',userInfo);

				const json={
		  			params:{
		  				feeDate:vm.getDateTime()[0]+vm.getDateTime()[1]
		  			},
		  			userInfo:userInfo
		  		};
				vm.AJAX('/tms/c/user/monthFee',json,function(data){
					if(data.data)data.data&&vm.set('responseData',data.data);
				});
			});
		}
	},
	methods:{
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	}
});
});