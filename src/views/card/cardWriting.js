require('../../public.js');
require('../../assets/css/cardWriting.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1读取ICCID中；2获取IMSI中；3写卡中；4,写卡完成
			submitLoad:0,//开卡申请load
		},
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
            "packageName":"--",
            "packageCode":"0"
        },
		deviceType:1,//卡类型
		userInfo:'',
		errorMsg:'',//错误描述
	    iccid:'',//读取到的iccid
	    imsi:'',//imsi
	    imsiSubstr:'',//imsi
	    smsp:'',//短信中心号
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'写卡',
				frontColor:'#ffffff',
                backgroundColor:'#4b3887',
				left:{
					icon:'back_white',
					value:'返回',
					callback:'headerLeftClick'
				},
				right:{
					icon:'card_green',
					value:'',
					callback:'headerRightClick'
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO'),
			deviceType=vm.getStore('CARD_INFO').deviceType;

			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('deviceType',deviceType)
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);
					vm.set("iccid",userInfo.iccid);
					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
					});
					Jsborya.registerMethods('headerRightClick',function(){
						if(deviceType==1){
							Jsborya.pageJump({
								url:"simInfo.html",
								stepCode:999,
								depiction:'SIM卡信息',
								destroyed:false,
								header:{
			                        frontColor:'#ffffff',
			                        backgroundColor:'#4b3887',
			                    }
							});
						}else if(deviceType==2){
							Jsborya.pageJump({
								url:'',
								stepCode:803,
								depiction:'设备管理',
								destroyed:false,
							});
						}
						
					});
					vm.callMethod("readCardICCID");
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		readCardICCID:function(){
			vm.set("off.step",1);
			vm.set("errorMsg",'');
			Jsborya.readCardIMSI(function(data){
				if(data.status==1){
					vm.callMethod("getImsi");
					// Jsborya.readCardICCID(function(data){
					// 	if(data.status==1){
					// 		vm.set("iccid",data.iccid);
					// 		vm.callMethod("getImsi");
					// 	}else{
					// 		vm.callMethod("filterConnectStatus",[data.status]);
					// 	}
					// });
				}else{
					vm.callMethod("filterConnectStatus",[data.status]);
				}
				let deviceType=vm.get('deviceType'),icon='';
				if(deviceType==1){
					if(data.status==1){
						icon='card_green';
					}else icon='card_red';
					
				}else if(deviceType==2){
					if(data.status==1){
						icon='wcard_green';
					}else icon='wcard_red';
					
				}
				Jsborya.setHeader({
					title:'写卡',
					frontColor:'#ffffff',
					backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'',
						callback:''
					},
					right:{
						icon:icon,
						value:'',
						callback:'headerRightClick'
					}
				});
			});
			
		},
		getImsi:function(){
			vm.set("off.step",2);
			vm.AJAX('/ka_tas/w/business/getImsi',{
				userInfo:vm.get("userInfo"),
				params:{
					sysOrderId:vm.get("orderInfo").sysOrderId,
					iccid:vm.get('iccid'),
				}
			},function(data){
				let imsiSubstr=data.data.imsi,reg = /^(\d{4})(\d*)(\d{4})$/;
					imsiSubstr=imsiSubstr.replace(reg, function(a,b,c,d){
					    return b+c.replace(/\d/g, "*")+d;
					});
				vm.set("imsi",data.data.imsi);
				vm.set("imsiSubstr",imsiSubstr);
				vm.set("smsp",data.data.smsp);
				vm.callMethod("callWriteCard");
			},true,function(data){
				if(data.code==671){
					vm.set("errorMsg",'无可用的IMSI');
				}else if(data.code==685){
					vm.set("errorMsg",'该订单已结束');
				}
			});
		},
		callWriteCard:function(){//写卡
			vm.set("off.step",3);
			Jsborya.callWriteCard({
				imsi:vm.get('imsi'),
				smsp:vm.get('smsp'),
				iccid:vm.get('iccid'),
				complete:function(data){
					switch(parseInt(data.status)){
						case 1:
							vm.set("off.step",4);
							break;
						case 2:
							vm.set("errorMsg",'写卡失败');
							break;
						case 3:
							vm.set("errorMsg",'卡槽未插卡，请将SIM卡插入卡槽');
							break;
						case 4:
							vm.set("errorMsg",'当前SIM卡与获取ICCID不一致，请重新插入对应SIM卡');
							break;
						default:
							vm.set("errorMsg",'未知错误');
							break;
					}
				}
			});
		},
		
		submitOrder:function(){//开卡申请
			vm.set("off.submitLoad",1);
			vm.AJAX('/ka_tas/w/business/submitOrder',{
				'userInfo':vm.get("userInfo"),
				'params':{
					'sysOrderId':vm.get("orderInfo").sysOrderId,
					'iccid':vm.get("iccid")
				}
			},function(data){
				Jsborya.pageJump({
					url:"cardActive.html",
					stepCode:999,
					depiction:'开卡受理',
					header:{
                        frontColor:'#ffffff',
                        backgroundColor:'#4b3887',
                    }
				});
			},function(){
				vm.set("off.submitLoad",0);
			});
		},
		filterConnectStatus:function(status){
			if(status==2){
				vm.set("errorMsg",'读取SIM卡信息失败');
			}else if(status==3){
				vm.set("errorMsg",'未检测到SIM卡插入卡槽');
			}else{
				vm.set("errorMsg",'异常错误');
			}
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