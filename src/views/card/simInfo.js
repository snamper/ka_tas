require('../../public.js');
require('../../assets/css/simInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,//1、可用卡；2、有未完成订单；3、开卡成功；4、无效卡；
		},
		deviceStatus:3,//1、读取成功；2、读取失败；3、未插卡
		userInfo:{
			iccid:''
		},
		cardInfo:{//卡槽信息
			slot:0,
			deviceType:1,
			iccid:''
		},
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'SIM卡信息',
				frontColor:'#ffffff',
				backgroundColor:'#4b3887',
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
			let cardInfo=vm.getStore('CARD_INFO');
			vm.set('cardInfo',cardInfo);
			Jsborya.getGuestInfo({
				slot:cardInfo.slot,
				complete:function(userInfo){
					vm.set('userInfo',userInfo);
				}
			});
		},
		mounted:function(){
			let turn = vm.getUrlParam('turn');
			if(turn){
				if(turn==4){
					vm.set('deviceStatus',1);
				}else if(turn==5){
					vm.set('deviceStatus',3);
				}
			}else vm.callMethod('readCardICCID');
			
		},
	},
	methods:{
		readCardICCID:function(){
			var index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
			Jsborya.readCardICCID({
				slot:vm.get('cardInfo').slot,
				complete:function(result){
					
					Jsborya.readCardIMSI({
						slot:vm.get('cardInfo').slot,
						complete:function(data){
							layer.close(index);
							if(data.status==1){
								vm.callMethod("iccidCheck",[data.imsi,data.smsp]);
							}
							vm.set('deviceStatus',data.status);
						}
					});
				}
			});
		},
		iccidCheck:function(imsi,smsp){
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  				scanIccid:''
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/iccidCheck',json,function(data){
				vm.set('off.status',data.data.status);
			});
		},
		toIndexPage:function(){
			vm.toIndexPage();
		},
		toOrderPage:function(){
			Jsborya.pageJump({
				url:'orderDetails.html',
				stepCode:999,
				depiction:'订单详情',
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
			});
		},
		toLoginPage:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:801,
				depiction:'登录',
				destroyed:false,
			});
		}
	}
});


});