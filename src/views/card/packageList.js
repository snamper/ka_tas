require('../../public.js');
require('../../assets/css/packageDetails.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			select:0,//选择的套餐
			prestore:0,//选择的预存
		},
		type:'',//套餐列表 - 类型
		packageList: [{
            "init": "1",
            "code": "0",
            "title": "--",
            "packInfo": {
                "standard": "--",
                "feeDescribe": "-",//资费说明
                "code": "0",
                "title": "--",
                "selPackage": [{//可选包
                    "standard": "--",//资费标准
                    "init": "0",
                    "feeDescribe": "--",//资费说明
                    "code": "0",
                    "title": "--"
                }],
                "prestoreMoneyList": [//预存
                    {
                        "init": "0",
                        "prestoreMoney": "0"
                    }
                ],
                "info": {//资费标准
                    "answer": "--",
                    "voiceDialing": "0",
                    "beyondFee": "--",
                    "lowConsumption": "0",
                    "callerID": "--",
                    "message": "0",
                    "flowZero": "--",
                    "monthlyFee": "0",
                    "flow": "0",
                    "remarks": "--",
                    "voiceZero": "--"
                }
            }
        }],
		userInfo:'',//用户信息
		cardInfo:{
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			slot:0,
			deviceType:1,
			iccid:''
		},
	},
	hooks: {
	    init: function() {
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let type=vm.getUrlParam('type'),title='套餐列表';
			
			if(type){
				type=JSON.parse(BASE64.decode(type));
				title=type.name;
				vm.set('type',type.val);

				let cardInfo=this.getStore('CARD_INFO');
				if(cardInfo){
					vm.set('cardInfo',cardInfo);
					Jsborya.getGuestInfo({
					slot:cardInfo.slot||'1',
						complete:function(userInfo){
							vm.set('userInfo',userInfo);
							vm.callMethod('getPackageList');
						}
					});
				}else{
					alert('本地号卡信息丢失');
				}
			}else{
				alert('页面URL参数错误');
			}
			Jsborya.setHeader({
				title:title,
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
	    },
	},
	methods:{
		getPackageList:function(){//
			const json={
	  			params:{
	  				type:vm.get('type'),
	  				cityCode:vm.get('cardInfo').cityCode,
	  				phoneNum:vm.get('cardInfo').phone
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/packageList',json,function(data){
				vm.set('packageList',data.data.titleList);
				for(let i=0,len=data.data.titleList.length;i<len;i++){
					if(data.data.titleList[i].init==1)vm.set('off.select',i);
				}
				vm.callMethod('setSelectPrestore');
				vm.callMethod('renderDom');
			});
		},
		setSelectPrestore:function(){
			let prestoreMoneyList=vm.get('packageList')[vm.get('off').select].packInfo.prestoreMoneyList;
			for(let i=0,len=prestoreMoneyList.length;i<len;i++){
				if(prestoreMoneyList[i].init==1)vm.set('off.prestore',i);
			}
		},
		shiftPackage:function(e){//套餐切换
			vm.set('off.select',parseInt(e.target.title));
			vm.callMethod('setSelectPrestore');
			vm.callMethod('siblingC',[e.target]);
			vm.callMethod('renderDom');
		},
		shiftSelPackage:function(e){//可选包切换
			var btn,index=parseInt(e.title);
			var selPackage=vm.get('packageList')[vm.get('off').select].packInfo.selPackage[index];
			selPackage.init==2 ? btn=['关闭'] : e.className=='active' ? btn=['不选择','关闭'] : btn=['选择','关闭'];

			layer.open({
				content:'<div class="select-info f-scroll"><dl><dt>可选包名称</dt><dd class="b">'+selPackage.title+'</dd></dl><dl><dt>资费标准</dt><dd>'+selPackage.standard+'</dd></dl><dl><dt>资费说明</dt><dd>'+selPackage.feeDescribe+'</dd></dl></div>',
				btn:btn,
				style:'width:95%;max-width:540px;',
				type:1,
				yes:function(){
					selPackage.init!=2&&(e.className=='active' ? e.className='' : e.className='active');
					layer.closeAll();
				},
				no:function(){
					layer.closeAll();
				}
			})
		},
		shiftPrestore:function(e){//预存切换
			vm.set('off.prestore',parseInt(e.title));
			vm.callMethod('siblingC',[e]);
		},
		renderDom:function(){
			var selPackageUl=document.getElementById('selPackageUl'),
				prestoreUl=document.getElementById('prestoreUl'),
				str='',packInfo=vm.get('packageList')[vm.get('off').select].packInfo;
			
			//渲染可选包
			for(let i=0,todo=packInfo.selPackage,len=todo.length;i<len;i++){
				if(todo[i].init==1){str+='<li class="active"';}
				else if(todo[i].init==2){str+='<li class="active active2"';}
				else str+='<li';
				str+=' onclick="shiftSelPackage(this)" title="'+i+'">'+todo[i].title+'</li>';
			}
			selPackageUl.innerHTML=str,str='';

			//渲染预存
			for(let i=0,todo=packInfo.prestoreMoneyList,len=todo.length;i<len;i++){
				if(todo[i].init==1){str+='<li class="active"';}
				else str+='<li';
				str+=' onclick="shiftPrestore(this)" title="'+i+'">'+parseInt(todo[i].prestoreMoney)/100+'元</li>';
			}
			prestoreUl.innerHTML=str,str='';
		},
		makeSure:function(){
			if(vm.get('packageList')[0].code=="0")return false;
			var pack=vm.get('packageList')[vm.get('off').select];

			const getSelPackageCode=function(){//获取选中的可以选包code
				let ret='',selPackage=pack.packInfo.selPackage,selPackageUl=document.getElementById('selPackageUl');
				for(let i=0;i<selPackageUl.childNodes.length;i++){
					if(selPackageUl.childNodes[i].nodeType===1&&selPackageUl.childNodes[i].className!=''){
						ret+=selPackage[selPackageUl.childNodes[i].title].code+'|';
					}
				}
				return ret.substring(0,ret.length-1);
			};
			vm.setStore('selectPackage',{
				name:pack.title,
				packageCode:pack.code,
				selPackCode:getSelPackageCode(),
				prestore:pack.packInfo.prestoreMoneyList[vm.get('off').prestore].prestoreMoney,
			});
			Jsborya.pageBack({
				url:'package.html',
				isLoad:true
			});
		},
		siblingC:function(e){//同级元素，class切换
			var parent=e.parentNode;
			for(var i=0;i<parent.childNodes.length;i++){
				if(parent.childNodes[i].nodeType===1)parent.childNodes[i].className='';
			}
			e.className='active';
		},
		phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
		filterBr:function(str){
			return str?str.split('<br>'):str=[];
		},
	}
});
window.shiftSelPackage=function(e){
	vm.callMethod("shiftSelPackage",[e]);
};
window.shiftPrestore=function(e){
	vm.callMethod("shiftPrestore",[e]);
};

});