require('../../public.js');
require('../../assets/css/realTimeCharge.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
    isJichu:true,
    isKexuan:false,
    isQita:false,
    responseDataJichu:{},
    responseDataKexuan:{},
    responseDataQita:{},
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			Jsborya.getUserInfo(function(userInfo){
				vm.set('userInfo',userInfo);

				const json={
		  			params:{
		  				feeDate:vm.getDateTime()[0]+vm.getDateTime()[1]
		  			},
		  			userInfo:userInfo
          };
        json.userInfo.qryType=1;
				vm.AJAX('/tms/w/user/mealInfo',json,function(data){
          if(data.data)data.data&&vm.set('responseDataJichu',data.data.proList);
          
        });
        json.userInfo.qryType=2;
				vm.AJAX('/tms/w/user/mealInfo',json,function(data){
          if(data.data)data.data&&vm.set('responseDataKexuan',data.data.proList);
        });
        json.userInfo.qryType=3;
				vm.AJAX('/tms/w/user/mealInfo',json,function(data){
          if(data.data)data.data&&vm.set('responseDataQita',data.data.proList);
				});
			});
		}
	},
	methods:{
    tabClick(v){
      vm=this;
      if(v==1){
        vm.set("isJichu",true);
        vm.set("isKexuan",false);
        vm.set("isQita",false);
      }else if(v==2){
        vm.set("isJichu",false);
        vm.set("isKexuan",true);
        vm.set("isQita",false);   
      }else if(v===3){
        vm.set("isJichu",false);
        vm.set("isKexuan",false);
        vm.set("isQita",true);
      }
             
    },
    jsonToString(json){
      return JSON.stringify(json);
    }
  }
});
});