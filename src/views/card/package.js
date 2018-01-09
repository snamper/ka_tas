require('../../public.js');
require('../../assets/css/package.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:0
		},
		totalPrice:0,//价格计算
		cardInfo:{
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0
		},
		selectPackage:{
			name:'',
			packageCode:'',
			selPackCode:'',
			prestore:'',
		},
		recommendList:[{name:'流量多',type:'liuliang'},{name:'语音多',type:'yuyin'},{name:'最省钱',type:'price'},{name:'全部套餐',type:'all'}],
		userInfo:'',//用户信息
	},
	hooks: {
	    init: function() {
	    	//this.setStore('CARD_INFO',{});
	    	//this.removeStore('CARD_INFO');
	    	//this.setStore('selectPackage',{name:'联通无限流量套餐',packageCode:'1002',selPackCode:'1254',prestore:'320',});
	    	//this.removeStore('selectPackage');
	    	vm=this;
	    	Jsborya.setHeader({
				title:'选择套餐',
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

			let cardInfo=this.getStore('CARD_INFO'),
				selectPackage=this.getStore('selectPackage');
			if(cardInfo){
				vm.set('cardInfo',cardInfo);
				if(selectPackage){
					vm.set('selectPackage',selectPackage);
					vm.set('totalPrice',(parseFloat(cardInfo.phoneMoney)/100+parseFloat(selectPackage.prestore)/100).toFixed(2));
				}
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);
				});
			}else{
				alert('本地号卡信息错误');
			}
	    },
	},
	methods:{
		changePackage:function(){
			vm.callMethod('jumpToPackageList',['all']);
		},
		readCardICCID:function(){
			vm.set("off.load",1);
			Jsborya.readCardIMSI(function(data){
				if(data.status==1){
					if(data.imsi=='FFFFFFFFFFFFFFF')data.imsi='';
					vm.callMethod("iccidCheck",[data.imsi,data.smsp]);
				}else{
					vm.callMethod("filterConnectStatus",[data.status]);
				}
			});
		},
		filterConnectStatus:function(status){
			if(status==2){
				alert("读取失败");
			}else if(status==3){
				alert("未检测到SIM卡插入卡槽，请将SIM卡以正确的方式插入卡槽");
			}else{
				alert("异常错误");
				return false;
			}
		},
		iccidCheck:function(imsi,smsp){//获取订单信息
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('../../w/source/iccidCheck',json,function(data){
				vm.set("off.load",false);
				if(data.data.status==1){
					vm.callMethod('savePackage');
				}else if(data.data.status==2){
					layer.open({
						title:'提示',
                        content:'您有未完成的订单，请先【完成】或【放弃订单】',
                        btn:['查看订单','放弃订单'],
                        yes:function(){
                        	vm.setStore('ORDER_INFO',data.data.orderInfo);
						    Jsborya.pageJump({
				                url:'orderDetails.html',
				                stepCode:999,
				                header:{
				                    frontColor:'#ffffff',
				                    backgroundColor:'#4b3887',
				                }
				            });
                        },
                        no:function(){
                        	layer.closeAll();
                        	vm.orderCancel(vm.get('userInfo'),data.data.orderInfo.sysOrderId);
                        },
                    });
				}else if(data.data.status==3){
					layer.open({
                        content:'当前卡已开卡成功，不能重复进行开卡操作',
                        btn:['确定'],
                        title:'提示'
                    });
				}else if(data.data.status==4){
					layer.open({
                        content:'当前卡为无效卡，请使用有效的号卡进行操作',
                        btn:['确定'],
                        title:'提示'
                    });
				}
			});
		},
		savePackage:function(){
			vm.set("off.load",2);
			const cardInfo=vm.get('cardInfo');
			const json={
	  			params:{
	  				phoneNum:cardInfo.phone,
	  				packageCode:vm.get('selectPackage').packageCode,
	  				selPackCode:vm.get('selectPackage').selPackCode,
	  				prestoreMoney:vm.get('selectPackage').prestore,
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('../../w/source/orderCreate',json,function(data){
				vm.set("off.load",false);
				vm.setStore('ORDER_INFO',{
		            "phoneNum":cardInfo.phone,
		            "numberLevel":cardInfo.phoneLevel,
		            "cityName":cardInfo.cityName,
		            "createTime":data.data.createTime,
		            "cardMoney":cardInfo.phoneMoney,//号码占用费
		            "orderStatusCode":"PACKAGE_SELECTION",
		            "totalMoney":vm.get('totalPrice'),//总价格
		            "limitSimilarity":0,
		            "validTime":0,
		            "sysOrderId":data.data.sysOrderId,
		            "prestoreMoney":vm.get('selectPackage').prestore,//预存价格
		            "similarity":0,
		        });
				Jsborya.pageJump({
					url:'certification.html',
					stepCode:999,
					header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
				});
			},false,function(){
				vm.set("off.load",2);
			});
		},
		jumpToPackageList:function(type,name){
			Jsborya.pageJump({
				url:'packageList.html?type='+BASE64.encode(JSON.stringify({val:type,name:name})),
				stepCode:999,
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
			});
		},
		jumpToPackageDetails:function(){
			Jsborya.pageJump({
				url:'packageDetails.html?code='+vm.get('selectPackage').packageCode+'&phoneLevel='+vm.get('cardInfo').phoneLevel,
				stepCode:999,
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
			});
		},
		phoneFormat:function(phone){
			return vm.phoneFormat(phone);
		},
		mathCentToYuan:function(money){
			return vm.mathCentToYuan(money);
		}
	}
});


});