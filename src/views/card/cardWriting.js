require('../../public.js');
require('../../assets/css/cardWriting.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			readLoad:false,//读取iccid
			getLoad:false,//获取imsi
			submitLoad:1,
			msg:'',
			isJump:false,
		},
		userInfo:'',
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
	    iccid:'',//iccid
	    imsi:'',//imsi
	    imsiSubstr:'',//imsi
	    smsp:'',//短信中心号
	    deviceStatus:''//设备状态
	},
	hooks:{
		init:function(){
			vm=this;
			
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);
					let deviceIcon='';
					userInfo.iccid==='000000000000' ? deviceIcon='card_red' : deviceIcon='card_green';
					Jsborya.setHeader({
						title:'写卡',
						left:{
							icon:'back_white',
							value:'',
							callback:'headerLeftClick'
						},
						right:{
							icon:deviceIcon,
							value:'',
							callback:'headerRightClick'
						}
					});
					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
					});
					Jsborya.registerMethods('headerRightClick',function(){
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
			vm.set("off.readLoad",true);
			Jsborya.readCardIMSI(function(data){
				vm.set("off.readLoad",false);
				vm.set("deviceStatus",data.status);
				//alert(JSON.stringify(data));
				if(data.status==1){
					vm.set("off.readLoad",true);
					Jsborya.readCardICCID(function(data){
						vm.set("off.readLoad",false);
						vm.set("deviceStatus",data.status);
						//alert(JSON.stringify(data));
						if(data.status==1){
							vm.set("iccid",data.iccid);
							vm.callMethod("getImsi");
						}else{
							vm.callMethod("filterConnectStatus",[data.status]);
						}
					});
				}else{
					vm.callMethod("filterConnectStatus",[data.status]);
				}
			});
			
		},
		getImsi:function(){
			vm.set("off.getLoad",1);
			vm.set("off.submitLoad",false);
			vm.AJAX('../../../tas/w/business/getImsi',{
				userInfo:vm.get("userInfo"),
				params:{
					sysOrderId:vm.get("orderInfo").sysOrderId,
					iccid:vm.get('iccid'),
				}
			},function(data){
				//alert(JSON.stringify(data));
				let imsiSubstr=data.data.imsi,reg = /^(\d{4})(\d*)(\d{4})$/;
				imsiSubstr=imsiSubstr.replace(reg, function(a,b,c,d){
				    return b+c.replace(/\d/g, "*")+d;
				});
				vm.set("off.getLoad",false);
				vm.set("imsi",data.data.imsi);
				vm.set("imsiSubstr",imsiSubstr);
				vm.set("smsp",data.data.smsp);
				//vm.callMethod("callWriteCard");
			},false,function(){
				vm.set("off.getLoad",false);
				vm.set("off.submitLoad",1);
			});
		},
		callWriteCard:function(){//写卡
			vm.set("off.submitLoad",false);
			vm.set("off.getLoad",2);
			// alert(JSON.stringify({
			// 	imsi:vm.get('imsi'),
			// 	smsp:vm.get('smsp'),
			// 	iccid:vm.get('iccid')
			// }));
			Jsborya.callWriteCard({
				imsi:vm.get('imsi'),
				smsp:vm.get('smsp'),
				iccid:vm.get('iccid'),
				complete:function(data){
					//alert(JSON.stringify(data));
					vm.set("off.getLoad",false);
					switch(parseInt(data.status)){
						case 1:
							vm.set("off.submitLoad",1);
							vm.set("off.isJump",true);
							vm.callMethod('submitOrder');
							break;
						case 2:
							vm.set("off.msg","写卡失败");
							break;
						case 3:
							vm.set("off.msg","卡槽未插卡，请将SIM卡插入卡槽");
							vm.set("deviceStatus",2);
							break;
						case 4:
							vm.set("off.msg","当前SIM卡与获取ICCID不一致，请重新插入对应SIM卡");
							vm.set("deviceStatus",3);
							break;
						default:
							alert('异常状态');
							break;
					}
				}
			});
		},
		
		submitOrder:function(){//开卡申请
			vm.set("off.submitLoad",2);
			vm.AJAX('../../../tas/w/business/submitOrder',{
				'userInfo':vm.get("userInfo"),
				'params':{
					'sysOrderId':vm.get("orderInfo").sysOrderId,
					'iccid':vm.get("iccid")
				}
			},function(data){
				vm.set("off.submitLoad",1);
				Jsborya.pageJump({
					url:"cardActive.html",
					stepCode:999,
					depiction:'开卡受理',
					header:{
                        frontColor:'#ffffff',
                        backgroundColor:'#4b3887',
                    }
				});
			},false,function(){
				vm.set("off.submitLoad",1);
			});
		},
		filterConnectStatus:function(status){
			if(status==2){
				alert("读取SIM卡信息失败");
			}else if(status==3){
				layer.open({
	                content:"未检测到SIM卡插入卡槽，请将SIM卡以正确的方式插入卡槽，点击【重新获取】",
	                btn:['已正确插卡'],
	                title:'未检测到插卡'
	            });
			}else{
				alert("异常错误");
				return false;
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