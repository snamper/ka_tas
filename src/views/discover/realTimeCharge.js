require('../../public.js');
require('../../assets/css/realTimeCharge.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		userInfo:{userId:'00000000000'},
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
				Jsborya.httpRequest({
					url:'http://192.168.10.117:6088/tms/c/user/logout/monthFee',
					data:request,
					complete:function(data){
						layer.close(index);
						try{
							data=JSON.parse(data);
							if(data.code==200){
								vm.set('responseData',data.data);
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