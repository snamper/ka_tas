require('../../public.js');
require('../../assets/css/scanCardInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:false,
			turn:5,//1,选择卡槽页面;2,继续完成订单页面;3,首页;4,无效卡页面;5,未插卡页面;---显示哪个页面
			slot:'1',//-1,都可用;0,卡槽1;1,卡槽2;---哪张卡槽可用
		},
		defaultSlot:false,//是否为默认卡槽
		iccid:['',''],
		deviceType:1,//1、手机卡；2、手表卡
		iccidsRes:[{
			orderInfo:'',
			status:1,
			hasPriPhone:1,//是否有专营号，1是2否 
		},{
			orderInfo:'',
			status:1,
			hasPriPhone:1,//是否有专营号
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
				title:'开卡方式',
				frontColor:'#000000',
				backgroundColor:'#ffffff',
				left:{
					icon:'back_white',
					value:'',
					callback:''
				},
				right:{
					icon:'',
					value:'开卡指南',
					callback:'headerRightClick'
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			Jsborya.getGuestInfo({
				slot:'-2',
				complete:function(userInfo){
					vm.set('userInfo',userInfo);
					vm.callMethod('getCheckMachine')
				}
			});
			Jsborya.registerMethods('headerRightClick',function(){
				Jsborya.pageJump({
	                url:'https://km.m10027.com/tf/guide.html',
	                stepCode:800,
	                depiction:'开卡指南',
	                destroyed:false,
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
	            });
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
				})
			})
		},
		choiceDeviceType(deviceType){

			if(vm.get('checkMachine').type==1){
				return false;
			}

			vm.set('off.load',true);
			vm.set('deviceType',deviceType);
			Jsborya.setDeviceType({
				deviceType:deviceType,
				complete:function(result){
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
													//alert('iccidsInfo：'+JSON.stringify(iccidsInfo))
													vm.callMethod('multipleIccidCheck',[iccidsInfo]);
												}
											})
										}
									})
								}else{
									vm.set('off.load',false);
									vm.set('off.turn',5);
									Jsborya.pageJump({
						                url:'simInfo.html?turn=5',
						                stepCode:999,
						                depiction:'开卡信息',
						                destroyed:false,
						                header:{
						                    frontColor:'#ffffff',
						                    backgroundColor:'#4b3887',
						                }
						            });
								}
							}else vm.callMethod('filterConnectStatus',[result.status]);
						}
					})
				}
			});
			
			
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
			if([1,2,5].includes(simStatus)&&[1,2,5].includes(simStatus_)){

				vm.set('off.turn',1);
				vm.set('off.slot','-1');

			}else if( ([4].includes(simStatus)&&[2,5].includes(simStatus_)) || ([2,5].includes(simStatus)&&[4].includes(simStatus_)) ){
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
			}else if([4,6].includes(simStatus)&&[4,6].includes(simStatus_)){
				vm.set('off.turn',4);
				Jsborya.pageJump({
	                url:'simInfo.html?turn=4',
	                stepCode:999,
	                depiction:'开卡信息',
	                destroyed:false,
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
	            });
			}
		},
		choiceSlot(slot){//选择卡槽
			let _slot=slot;
			if(!_slot)_slot = vm.get('off').slot;

			_slot=parseInt(_slot);

			let status = vm.get('iccidsRes')[_slot].status,
				hasPriPhone = vm.get('iccidsRes')[_slot].hasPriPhone,
				realSlot = vm.get('defaultSlot') ? '-1' : _slot;//默认卡槽问题

			vm.setStore('CARD_INFO',{
				slot:realSlot,
				iccid:vm.get('iccid')[_slot],
				hasPriPhone:hasPriPhone,
				deviceType:vm.get('deviceType'),
			});

			//alert(`cardInfo：{slot:${_slot}}`)

			if(status==1){
				Jsborya.pageJump({
	                url:'index.html?slot='+realSlot,
	                stepCode:999,
	                depiction:'随心搜',
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
	            });
			}else{
				let orderInfo=vm.get('iccidsRes')[_slot].orderInfo;
				orderInfo.status=status;
				vm.setStore('ORDER_INFO',orderInfo);

				Jsborya.pageJump({
	                url:'scanCardInfo.html',
	                stepCode:999,
	                depiction:'开卡信息',
	                header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
	            });
			}
		},
		filterConnectStatus:function(status){
			let text='';
			if(status==2){
				text='读取SIM卡信息失败';
			}else if(status==3){
				text='未检测到SIM卡插入卡槽';
			}else if(status==4){
				text='设备未连接';
			}else{
				text='异常错误';
			}
			vm.set('off.load',false);
			layer.open({
                content:text,
                btn:['确定'],
                shadeClose:false,
                title:'提示',
            });
		},
	}
});


});