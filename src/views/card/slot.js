require('../../public.js');
require('./css/slot.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:true,
			turn:0,//0,初始化页面;1,选择卡槽页面;4,无效卡页面;5,未插卡页面;
			status:0//只有4,5的处理（0：初始状态；4：无效卡；5：未插卡）
		},
		defaultSlot:false,//是否为默认卡槽
		deviceType:1,//1、手机卡；2、手表卡；3、eSIM手表
		iccidsRes:[{
			orderInfo:'',
			status:1,
		},{
			orderInfo:'',
			status:1,
		}],
		userInfo:'',
		checkMachine:{
			type:0,//0机型无问题;1终止流程;2提示消息但继续流程
			desc:''
		},
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'',
				backgroundColor:'#F8F8F8',
				frontColor:'#000000',
				left:{
					icon:'',
					value:'',
					callback:''
				},
				right:{
					icon:'',
					value:'更多',
					callback:'headerRightClick'
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			Jsborya.pageJump({
				url:'',
				stepCode:'801',
				depiction:'登录',
				data:{
					phone:'17099999999'
				}
			});
			return false;

			Jsborya.getGuestInfo({
				slot:'-2',
				iccid:'',
				complete:function(userInfo){
					vm.set('userInfo',userInfo);
					vm.callMethod('getCheckMachine');
				}
			});
			Jsborya.registerMethods('headerRightClick',function(){
				Jsborya.pageJump({
					url:'',
					stepCode:'807',
					destroyed:false,
				});
			});
		},
	    mounted:function(){
	    	vm.removeStore('ORDER_INFO');
			vm.removeStore('CARD_INFO');
	    }
	},
	methods:{
		getCheckMachine(){//机型适配信息
			const json={
	  			params:{
	  				type:1
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/checkMachine',json,function(data){
				vm.set('checkMachine',{
					type:data.data.dealType,
					desc:data.data.desc
				});
				if(data.data.dealType != 1){
					vm.callMethod('begin');
				}else vm.set('off.load',0);
			},true);
		},
		scanQRcode(){//处理扫码后的逻辑
			Jsborya.callScanQRCode({
				type:'1',
				complete:function(res){
					if(res.status == 1){//成功
						vm.set('off.load',true);

						const json={
				  			params:{
				  				scanIccid:res.result,
				  				imsi:'',
				  				smsp:'',
				  			},
				  			userInfo:vm.get('userInfo')
				  		};
						vm.AJAX('/tas/w/source/iccidCheck',json,function(data){
							vm.set('off.load',false);
							let status = data.data.status, info = {};

							if(status == 2 || status == 3 || status == 5 || status == 6){//有进行中的订单
								if(data.data.orderInfo)info=data.data.orderInfo;
							}else{
								if(data.data.otherInfo)info=data.data.otherInfo;								
							}
							info.iccid=res.result;

							vm.callMethod('dealJump',[status,info]);
							
						},function(){
							vm.set('off.load',false);
						})
					}else if(res.status == 2){//失败

					}else if(res.status == 3){//取消

					}else alert('异常');
				}
			})
		},
		begin(){//开始读取卡槽中的信息

			if(vm.get('checkMachine').type==1){
				return false;
			}

			vm.set('off.load',true);
			Jsborya.readCardICCID({
				slot:'-1',
				complete(result){
					if(result.status==1){
						if(result.iccid.length == 1)vm.set('defaultSlot',true);//默认卡槽（如果只能读取一个iccid则只能使用默认卡槽，slot传-1）

						if(result.iccid[0]||result.iccid[1]){//读出了一个iccid
							Jsborya.readCardIMSI({//获取卡槽1，imsi信息
								slot:'0',
								complete(_result){
									Jsborya.readCardIMSI({//获取卡槽2，imsi信息
										slot:'1',
										complete(__result){
											let iccidsInfo=[];
											iccidsInfo[0]={
												scanIccid:result.iccid[0]||'',
												smsp:_result.smsp||'',
												imsi:_result.imsi
											}
											iccidsInfo[1]={
												scanIccid:result.iccid[1]||'',
												smsp:__result.smsp||'',
												imsi:__result.imsi
											}
											vm.callMethod('multipleIccidCheck',[iccidsInfo]);
										}
									})
								}
							})
						}else{
							vm.set('off.load',false);
						}
					}else{
						vm.set('off.load',false);
						if(result.status==2){
							vm.set('off.status',4);//无效卡
						}else if(result.status==3){
							vm.set('off.status',5);//未插卡
						}else{
							alert('异常错误')
						}
					}
				}
			})
			
			
		},
		multipleIccidCheck(iccidsInfo){//获取卡槽中的sim卡的状态
			const json={
	  			params:{
	  				iccidsInfo:iccidsInfo
	  			},
	  			userInfo:{}
	  		};
			vm.AJAX('/tas/w/source/iccidsCheck',json,function(data){
				vm.set('off.load',false);
				vm.set('iccidsRes',data.data.iccidsRes);
				vm.callMethod('choiceTurnTo',[parseInt(data.data.iccidsRes[0].status), parseInt(data.data.iccidsRes[1].status)]);
			},function(){
				vm.set('off.load',false);
			})
		},
		choiceTurnTo(simStatus,simStatus_){//卡槽1和卡槽2，状态--处理从卡槽中读取卡信息的逻辑
			if([1,2,5,8,9,10].includes(simStatus) && [1,2,5,8,9,10].includes(simStatus_)){
				vm.set('off.turn',1);//去选择卡槽页(本页面)
			}else if([2,3,5,6].includes(simStatus) || [2,3,5,6].includes(simStatus_)){
				//去订单页

				if([2,3,5,6].includes(simStatus)){
					vm.callMethod('choiceSlot',['0']);
				}else vm.callMethod('choiceSlot',['1']);
			}else if([8,9,10].includes(simStatus) || [8,9,10].includes(simStatus_)){
				//去扫码页

				if([8,9,10].includes(simStatus)){
					vm.callMethod('choiceSlot',['0']);
				}else vm.callMethod('choiceSlot',['1']);
			}else if([1].includes(simStatus) || [1].includes(simStatus_)){
				//去随心搜页

				if([1].includes(simStatus)){
					vm.callMethod('choiceSlot',['0']);
				}else vm.callMethod('choiceSlot',['1']);
			}else if([4].includes(simStatus) && [4].includes(simStatus_)){
				vm.set('off.status',4);//无效卡
			}
		},
		choiceSlot(slot){//选择卡槽--处理从卡槽中读取卡信息的逻辑
			if(!slot)alert('插槽类型错误');

			slot=parseInt(slot);

			let orderInfo,
				iccidsRes = vm.get('iccidsRes')[slot],
				realSlot = vm.get('defaultSlot') ? '-1' : slot;//默认卡槽问题

			if(vm.callMethod('isMiCliet')) realSlot = '-1';//小米手机

			if(iccidsRes.status == 8 || iccidsRes.status == 9 || iccidsRes.status == 10){//成卡，白卡
				orderInfo = iccidsRes.otherInfo || {};
			}else orderInfo = iccidsRes.orderInfo || {};
			orderInfo.iccid = iccidsRes.scanIccid;

			vm.callMethod('dealJump',[iccidsRes.status,orderInfo,realSlot]);
			
		},
		dealJump(status,orderInfo = {},slot){//当有slot时为从卡槽中读取
			let bizType;
			if(status == 1){//开空卡
				bizType = '6';
			}else if(status == 8){//开成卡
				bizType = '4';
			}else if(status == 9){//开白卡
				bizType = '4';
			}else if(status == 10){//开远盟成卡
				bizType = '7';
			}else{//有进行中的订单
				bizType = orderInfo.bizType;
			}
			orderInfo.status=status;

			vm.removeStore('SCAN_INFO');
			vm.setStore('CARD_INFO',{
				slot:"undefined" == typeof slot ? '-2' : slot,
				iccid:orderInfo.iccid || '',
				sourceOrder:orderInfo.sourceOrder || '',
				belongType:orderInfo.belongType || '0',
				deviceType:'1',
				bizType:bizType
			});
			
			Jsborya.getGuestInfo({
				slot:"undefined" == typeof slot ? '-2' : slot,
				iccid:orderInfo.iccid,
				complete:function(userInfo){
					vm.setStore("USER_INFO",userInfo);
					
					if(status==1){//开空卡

						if("undefined" != typeof slot){//从卡槽中读取
							vm.removeStore('ORDER_INFO');

							Jsborya.pageJump({
				                url:'index.html',
				                stepCode:'999',
				                depiction:'随心搜',
				                destroyed:false,
				                header:{
				                    frontColor:'#ffffff',
				                    backgroundColor:'#4b3887',
				                }
				            });
						}else{//从扫码进入
							vm.setStore('SCAN_INFO',orderInfo);

							Jsborya.pageJump({
				                url:'scanInfo.html',
				                stepCode:'999',
				                depiction:'卡信息',
				                destroyed:false,
				                header:{
				                    frontColor:'#ffffff',
				                    backgroundColor:'#4b3887',
				                }
				            });
							
						}
					}else if(status==8 || status==9 || status==10){//开成卡，开白卡
						vm.setStore('SCAN_INFO',orderInfo);

						Jsborya.pageJump({
			                url:'scanInfo.html',
			                stepCode:'999',
			                depiction:'卡信息',
			                destroyed:false,
			                header:{
			                    frontColor:'#ffffff',
			                    backgroundColor:'#4b3887',
			                }
			            });
					}else if(status == 4){//无效卡
						if("undefined" != typeof slot){//从卡槽中读取
							vm.set('off.status',4);//无效卡
						}else{
							vm.setStore('SCAN_INFO',orderInfo);

							Jsborya.pageJump({
				                url:'scanInfo.html',
				                stepCode:'999',
				                depiction:'卡信息',
				                destroyed:false,
				                header:{
				                    frontColor:'#ffffff',
				                    backgroundColor:'#4b3887',
				                }
				            });
						}

					}else{//有进行中的订单(2,3,5,6)
						vm.setStore('ORDER_INFO',orderInfo);

						Jsborya.pageJump({
			                url:'slotInfo.html',
			                stepCode:'999',
			                depiction:'开卡信息',
			                destroyed:false,
			                header:{
			                    frontColor:'#ffffff',
			                    backgroundColor:'#4b3887',
			                }
			            });
					}
				}
			});
		},
		isMiCliet(){//判断是否为小米机型
			let e = navigator.userAgent;
			if(e.indexOf('XiaoMi')>-1){
				return true;
			}else{
				return false;
			}
		},
		showInsertCard(){//只能传4,5
			vm.set('off.turn',vm.get('off').status);//读取卡槽--未插卡和无效卡处理逻辑
			Jsborya.registerMethods('headerLeftClick',function(){//点击左上角，触发
				vm.set('off.turn',0);//初始页面
				Jsborya.setHeader({
					title:'',
					backgroundColor:'#F8F8F8',
					frontColor:'#000000',
					left:{
						icon:'',
						value:'',
						callback:''
					},
					right:{
						icon:'',
						value:'更多',
						callback:'headerRightClick'
					}
				});
			});
			//设置app头部
			Jsborya.setHeader({
				title:'读取卡信息',
				backgroundColor:'#4b3887',
				frontColor:'#FFFFFF',
				left:{
					icon:'back_white',
					value:'返回',
					callback:'headerLeftClick'
				},
				right:{
					icon:'',
					value:'更多',
					callback:'headerRightClick'
				}
			});
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:'801',
				depiction:'登录',
				destroyed:false,
				data:{
					phone:''
				}
			});
		},
		jumpToLookArround(){
			vm.removeStore('CARD_INFO');
			vm.removeStore('ORDER_INFO');

			Jsborya.pageJump({
                url:'index.html',
                stepCode:'999',
                depiction:'随心搜',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		}
	}
});


});