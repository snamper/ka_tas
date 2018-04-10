require('../../public.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:2//1,等待中;2,成功;3,失败
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
        selectPackage:{
			name:'',
			packageCode:'',
			selPackCode:'',
			prestore:'',
		},
		password1:'',
		password2:'',
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

			let orderInfo=vm.getStore('ORDER_INFO'),
			selectPackage=vm.getStore('selectPackage');

			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('selectPackage',selectPackage);
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
					//vm.callMethod("intervalGetResult");
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
		setServicePsd:function(){
			let password1=vm.get('password1'),
			    password2=vm.get('password2');;

			if(!password1.match(/^\d{6}$/)){
				layer.open({
                    content:'密码格式错误',
                    skin: "msg",
                    time: 3
                });
                return false;
			}else if(password1!=password2){
				layer.open({
                    content:'两次输入密码不一致',
                    skin: "msg",
                    time: 3
                });
                return false;
			}else{
				vm.AJAX('../../../tas/w/business/setPwd',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId,
						pwd:password2
					}
				},function(data){
					Jsborya.pageJump({
						url:'',
						stepCode:802,
						depiction:'',
						data:{
							password:password2,
							phone:vm.get('orderInfo').phoneNum
						}
					});
				});
			}
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