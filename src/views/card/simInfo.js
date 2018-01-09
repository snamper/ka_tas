require('../../public.js');
require('../../assets/css/simInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,
		},
		simInfo:{
			iccid:''
		}
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
			Jsborya.getGuestInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				vm.callMethod('readCardICCID');
			});
		}
	},
	methods:{
		readCardICCID:function(){
			var index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
			Jsborya.readCardIMSI(function(data){
				layer.close(index);
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
		iccidCheck:function(imsi,smsp){
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('../../w/source/iccidCheck',json,function(data){
				vm.set('off.status',data.data.status);
			});
		},
		toIndexPage:function(){
			Jsborya.pageJump({
				url:'index.html',
				stepCode:999
			});
		},
		toOrderPage:function(){
			Jsborya.pageJump({
				url:'orderDetails.html',
				stepCode:999
			});
		},
		toLoginPage:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:801
			});
		}
	}
});


});