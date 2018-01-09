require('../../public.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:1//1,等待中;2,成功;3,失败
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
        }
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'开卡受理',
				left:{
					icon:'back_white',
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

			let orderInfo=this.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
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
				vm.AJAX('../../w/business/getResult',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId
					}
				},function(data){
					var status=data.data.orderStatus;

					if(status!=1){
						clearInterval(window.Timer);
					}

					if(status==2){
						vm.set("off.load",2);
					}else if(status==3){
						vm.set("off.load",3);
					}else if(status==4){
						alert('订单已关闭');
						vm.set("off.load",3);
					}

				});
			},2000);
		},
		jump:function(){
			Jsborya.pageJump({
                url:"index.html",
                stepCode:'2001',
                header:{
                    frontColor:'#000000',
                    backgroundColor:'#fff',
                }
            });
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