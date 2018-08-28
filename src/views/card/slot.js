require('../../public.js');
require('./css/slot.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:false,
			turn:0,//0,初始化页面;1,选择卡槽页面;2,继续完成订单页面;3,首页;4,无效卡页面;5,未插卡页面;(2在slotInfo.html)
			slot:'1',//-1,都可用;0,卡槽1;1,卡槽2;---哪张卡槽可用
		},
		defaultSlot:false,//是否为默认卡槽
		iccid:['',''],
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

			Jsborya.getGuestInfo({
				slot:'-2',
				complete:function(userInfo){
					vm.set('userInfo',userInfo);
					//vm.callMethod('getCheckMachine');
					vm.callMethod('begin');
				}
			});
			Jsborya.registerMethods('headerRightClick',function(){
				Jsborya.pageJump({
					url:'',
					stepCode:'807',
					destroyed:false,
				})
				// Jsborya.pageJump({
	   //              url:'https://km.m10027.com/tf/guide.html',
	   //              stepCode:'800',
	   //              depiction:'开卡指南',
	   //              destroyed:false,
	   //              header:{
	   //                  frontColor:'#ffffff',
	   //                  backgroundColor:'#4b3887',
	   //              }
	   //          });
			});
		},
	    mounted:function(){
	    	vm.removeStore('ORDER_INFO');
			vm.removeStore('CARD_INFO');
	    }
	},
	methods:{
		getCheckMachine(iccidsInfo){//获取卡槽中的sim卡的状态
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
				vm.callMethod('begin');
			},true);
		},
		scanQRcode(){
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

							if(status == 2 || status == 5 || status == 6){//有进行中的订单
								if(data.data.orderInfo)info=data.data.orderInfo;
							}else{
								if(data.data.otherInfo)info=data.data.otherInfo;								
							}
							info.iccid=res.result;

							vm.callMethod('dealJump',[data.data.status,info]);
							
						},function(){
							vm.set('off.load',false);
						})
					}else if(res.status == 2){//失败

					}else if(res.status == 3){//取消

					}else alert('异常');
				}
			})
		},
		begin(){

			// if(vm.get('checkMachine').type==1){
			// 	return false;
			// }

			vm.set('off.load',true);
			Jsborya.readCardICCID({
				slot:'-1',
				complete(result){
					if(result.status==1){
						if(result.iccid.length == 1)vm.set('defaultSlot',true);//默认卡槽

						if(result.iccid[0]||result.iccid[1]){//读出了一个iccid
							vm.set('iccid',result.iccid);
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
					}else vm.callMethod('filterConnectStatus',[result.status]);
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
		choiceTurnTo(simStatus,simStatus_){//卡槽1和卡槽2，状态
			if([1,2,5,8,9].includes(simStatus)&&[1,2,5,8,9].includes(simStatus_)){

				vm.set('off.turn',1);
				vm.set('off.slot','-1');

			}else if( ([4].includes(simStatus)&&[2,3,5].includes(simStatus_)) || ([2,3,5].includes(simStatus)&&[4].includes(simStatus_)) ){
				vm.set('off.turn',2);

				if([4].includes(simStatus)){
					vm.set('off.slot','1');
				}else vm.set('off.slot','0');
				vm.callMethod('choiceSlot');
			}else if( ([1].includes(simStatus)&&[3,4,6].includes(simStatus_)) || ([3,4,6].includes(simStatus)&&[1].includes(simStatus_)) ){
				vm.set('off.turn',3);

				if([1].includes(simStatus)){
					vm.set('off.slot','0');
				}else vm.set('off.slot','1');
				vm.callMethod('choiceSlot');
			}else if([4].includes(simStatus)&&[4].includes(simStatus_)){
				vm.set('off.turn',4);//两张都为无效卡
			}else if([6].includes(simStatus) || [6].includes(simStatus_)){//有一张为开卡失败的卡
				if([6].includes(simStatus)){
					vm.set('off.slot','0');
				}else vm.set('off.slot','1');
				vm.callMethod('choiceSlot');
			}
			//以上处理开空卡的逻辑
			else{

			}
		},
		choiceSlot(slot){//选择卡槽--处理开空卡的逻辑
			if(!slot)slot = vm.get('off').slot;

			slot=parseInt(slot);

			let status = vm.get('iccidsRes')[slot].status,
				realSlot = vm.get('defaultSlot') ? '-1' : slot;//默认卡槽问题

			if(vm.callMethod('isMiCliet')) realSlot = '-1';//小米手机

			vm.callMethod('dealJump',[status,vm.get('iccidsRes')[slot].orderInfo,realSlot]);	
			
		},
		dealJump(status,orderInfo = {},slot){
			let bizType;
			if(status == 1){//开空卡
				bizType = '6';
			}else if(status == 8){//开成卡
				bizType = '4';
			}else if(status == 9){//开白卡
				bizType = '4';
			}else{//有进行中的订单
				bizType = orderInfo.bizType;
			}

			vm.removeStore('SCAN_INFO');
			vm.setStore('CARD_INFO',{
				slot:slot || '-2',
				iccid:orderInfo.iccid || '',
				sourceOrder:orderInfo.sourceOrder || '',
				belongType:orderInfo.belongType || '0',
				deviceType:'1',
				bizType:bizType
			});

			Jsborya.getGuestInfo({
				slot:realSlot,
				iccid:vm.get('iccid')[slot],
				complete:function(userInfo){
					vm.setStore("USER_INFO",userInfo);
					
					if(status==1){//开空卡

						if(slot){//从卡槽中读取
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
					}else if(status==8 || status==9){//开成卡，开白卡
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
					}else{//有进行中的订单
						orderInfo.status=status;
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
		isMiCliet(){
			let e = navigator.userAgent;
			if(e.indexOf('XiaoMi')>-1){
				return true;
			}else{
				return false;
			}
		},
		filterConnectStatus:function(status){
			vm.set('off.load',false);
			if(status==2){
				vm.set('off.turn',4);//无效卡或者未读取到SIM卡信息
			}else if(status==3){
				m.set('off.turn',0);//未插卡
			}else{
				alert('异常错误')
			}
		},
		showInsertCard(){
			vm.set('off.turn',5);//未插卡
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