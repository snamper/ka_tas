require('../../public.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:3//1,等待中;2,成功;3,失败
		},
		userInfo:'',//用户信息
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
            "similarity":0,
        },
        orderStatus:'',
        desc:''//错误描述
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'开卡受理',
				left:{
					icon:'',
					value:'',
					callback:'headerLeftClick'
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('headerLeftClick',function(){
						let load=vm.get('off').load;
						if(load==1){
							layer.open({
								title:'提示',
								content:'还未拿到当前开卡结果，请您稍等~',
								btn:['确定']
							});
						}else{
							layer.open({
								title:'提示',
								content:'是否返回【号码搜索】页面',
								btn:['确定'],
								yes:function(){
									vm.toIndexPage();
								}
							});
						}
					});
					vm.callMethod("intervalGetResult");
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		intervalGetResult:function(){
			var vm=this;
			vm.set("off.load",1);
			window.Timer=setInterval(function(){
				vm.AJAX('../../../tas/w/business/getResult',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId
					}
				},function(data){
					var status=data.data.orderStatus;
					vm.set('orderStatus',status);
					vm.set('desc',data.data.desc);
					if(status!=1){
						clearInterval(window.Timer);
					}

					if(status==2){
						vm.set("off.load",2);
					}else if(status==3){
						vm.set("off.load",3);
					}else if(status==4){
						vm.set("off.load",3);
					}

				});
			},2000);
		},
		jump:function(){
			vm.toIndexPage();
		},
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	    getDateTime:function(timestamp){
	    	return this.getDateTime(timestamp);
	    }
	}
});

});