require('../../public.js');
require('../../assets/css/packageRemainder.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		userInfo:{phone:'00000000000'},
		responseData: [
      
  ]
,
	},
	hooks:{
		init:function(){
      vm=this;
      let res=vm.get('responseData');
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			Jsborya.getUserInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				const json={
          params:{
            feeDate:vm.getDateTime()[0]+vm.getDateTime()[1]
          },
          userInfo:userInfo
        };
				vm.AJAX('/tms/w/user/mealAllowance',json,function(data){
          if(data.data)data.data&&vm.set('responseData',data.data.packageInfoList);
        });
			});
		}, mounted: function() {
      vm=this;      
      let _dom = document.querySelectorAll('.arrow'),
        res=vm.get('responseData'),
        angle=[];
        for(let i in res){
          angle[i]=res[i].userdCount/res[i].totalCount*275;
        }
      for(let i=0;i<_dom.length;i++){
        _dom[i].style.transform=`rotate(${angle[i]}deg)`;
      }
    },
	},
	methods:{
		mathCentToYuan:function(value){
      return this.mathCentToYuan(value);
    },
	  phoneFormat:function(phone){
			return this.phoneFormat(phone);
    },
    packageReaminderPercent:function(restCount,totalCount){
      return Math.ceil(parseInt(restCount/totalCount*100));
    }
	}
});
});