require('../../public.js');
require('../../assets/css/cardWriting.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1读取ICCID中；2获取IMSI中；3写卡中+提交开卡申请
		},
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "cDiscount":10000,
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
            "pDiscount":10000,
            "similarity":0,
            "packageName":"--",
            "packageCode":"0",
            "iccid":"--",
        },
        cardInfo:{//开卡信息
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			discount:10000,
			slot:0,
			deviceType:1,
			belongType:0,
			iccid:''
		},
		userInfo:'',
		error:{code:1,text:''},//错误描述
	    imsi:'',//imsi
	    imsiSubstr:'',//imsi
	    smsp:'',//短信中心号
	    deviceIccid:'--',//卡槽中的iccid
	    deviceName:'--',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO'),
				cardInfo=vm.getStore('CARD_INFO');

			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('cardInfo',cardInfo);
				alert(cardInfo.deviceType == 3 ? '号码开通' : '写卡')
				Jsborya.setHeader({
					title:cardInfo.deviceType == 3 ? '号码开通' : '写卡',
					frontColor:'#ffffff',
	                backgroundColor:'#4b3887',
					left:{
						icon:'back_white',
						value:'返回',
						callback:'headerLeftClick'
					},
					right:{
						icon:'',
						value:'',
						callback:'headerRightClick'
					}
				});
				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						vm.callMethod('readCardICCID');
					}
				});

				

				Jsborya.registerMethods('headerLeftClick',function(){
					vm.orderCancel(vm.get('userInfo'),orderInfo.sysOrderId);
				});
				Jsborya.registerMethods('headerRightClick',function(){
					Jsborya.pageJump({
						url:'',
						stepCode:803,
						depiction:'设备管理',
						destroyed:false,
					});
					
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		readCardICCID:function(){
			let cardInfo = vm.get('cardInfo');

			vm.set("off.step",1);
			vm.set("error",{code:1,text:''});

			Jsborya.readWatchInfo({//读取手表信息
				deviceType:cardInfo.deviceType,
				complete:function(watchInfo){
					if(watchInfo.status == 1){
						// vm.set("devicePower",watchInfo.power);
						vm.set("deviceName",watchInfo.deviceName);

						Jsborya.readCardICCID({//读取iccid
							slot:cardInfo.slot,
							complete:function(result){
								if(result.status==1){
									vm.set("deviceIccid",result.iccid[0]);

									Jsborya.readCardIMSI({//读取imsi
										slot:cardInfo.slot,
										complete:function(data){
											if(data.status==1){
												vm.callMethod("getImsi");
											}else{
												vm.callMethod("filterConnectStatus",[data.status]);
											}

											let deviceType=cardInfo.deviceType,icon='';
											if(deviceType==2){
												if(data.status==1){
													icon='wcard_green';
												}else icon='wcard_red';
												alert(1);
												Jsborya.setHeader({
													title:'写卡',
													frontColor:'#ffffff',
													backgroundColor:'#4b3887',
													left:{
														icon:'back_white',
														value:'',
														callback:'headerLeftClick'
													},
													right:{
														icon:icon,
														value:'',
														callback:'headerRightClick'
													}
												});
											}
										}
									});
								}else{
									vm.callMethod("filterConnectStatus",[result.status]);
								}
							}
						});
					}else{
						if(watchInfo.status == 3) watchInfo.status = 4;
						vm.callMethod('filterConnectStatus',watchInfo.status);
					}
				}
			});
			
			
		},
		getImsi:function(){
			vm.set("off.step",2);
			vm.AJAX('/tas/w/business/getImsi',{
				userInfo:vm.get("userInfo"),
				params:{
					sysOrderId:vm.get("orderInfo").sysOrderId,
				}
			},function(data){
				let imsiSubstr=data.data.imsi,reg = /^(\d{4})(\d*)(\d{4})$/;
					imsiSubstr=imsiSubstr.replace(reg, function(a,b,c,d){
					    return b+c.replace(/\d/g, "*")+d;
					});
				vm.set("imsi",data.data.imsi);
				vm.set("imsiSubstr",imsiSubstr);
				vm.set("smsp",data.data.smsp);
			},true,function(data){
				if(data.code==671){
					vm.set("error",{code:5,text:'无可用的IMSI'});
				}else if(data.code==685){
					vm.set("error",{code:6,text:'该订单已结束'});
				}else if(data.code==688){
					vm.set("error",{code:4,text:'当前SIM卡与获取ICCID不一致，请重新插入对应SIM卡'});
				}else if(data.code==3000){
					vm.set("error",{code:6,text:'号码已不归属于您，现已将订单关闭，请尝试其他号码'});
				}

			});
		},
		callWriteCard:function(){//写卡
			if(!vm.get('imsi'))return false;
			vm.set("off.step",3);
			Jsborya.callWriteCard({
				slot:vm.get('cardInfo').slot,
				imsi:vm.get('imsi'),
				smsp:vm.get('smsp'),
				iccid:vm.get('deviceIccid'),
				complete:function(data){
					switch(parseInt(data.status)){
						case 1:
							vm.callMethod("submitOrder")
							break;
						case 2:
							vm.set("error",{code:2,text:'写卡失败'});
							break;
						case 3:
							vm.set("error",{code:3,text:'卡槽未插卡，请将SIM卡插入卡槽'});
							break;
						case 4:
							vm.set("error",{code:4,text:'当前SIM卡与获取ICCID不一致，请重新插入对应SIM卡'});
							break;
						default:
							vm.set("error",{code:999,text:'异常错误'});
							break;
					}
				}
			});
		},
		submitOrder:function(){//开卡申请
			vm.AJAX('/tas/w/business/submitOrder',{
				'userInfo':vm.get("userInfo"),
				'params':{
					sysOrderId:vm.get("orderInfo").sysOrderId,
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
				vm.set("error",{code:10,text:'开卡申请失败'});
			});
		},
		filterConnectStatus:function(status){
			if(status==2){
				vm.set("error",{code:7,text:'读取SIM卡信息失败'});
			}else if(status==3){
				vm.set("error",{code:8,text:'未检测到SIM卡插入卡槽'});
			}else if(status==4){
				vm.set("error",{code:9,text:'未连接'});
			}else{
				vm.set("error",{code:999,text:'异常错误'});
			}
		},
		jumpToHome:function(){
			vm.orderCancel(vm.get('userInfo'),vm.get('orderInfo').sysOrderId);
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