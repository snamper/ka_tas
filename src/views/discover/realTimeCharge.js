require('../../../static/config.js');
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
				let request=userInfo;
				Object.assign(userInfo,{
					feeDate:vm.getDateTime()[0]+vm.getDateTime()[1]
				});
				request=JSON.stringify(request);
				var index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
				var httpUrl=_CONFIG.prod_env ? _CONFIG.prod.TMS_URL : _CONFIG.dev.TMS_URL;
				Jsborya.httpRequest({
					url:httpUrl+'c/user/monthFee',
					data:request,
					complete:function(data){
						layer.close(index);
						try{
							if(data.code==200){
								data.data&&vm.set('responseData',data.data);
							}else{
								alert(data.msg);
							}
						}catch(e){
							alert('数据解析错误');
						}
						
					}
				})
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