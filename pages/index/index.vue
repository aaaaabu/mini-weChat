<template>
	<view class="content">
		<button @click="checkImage" class="checkImage">点击选择图片</button>
		<image class="image" :src="imagePath" mode="widthFix" style="width: 100%;"></image>
		<view style="text-align: center; font-size: 16px;">{{selectedName}}</view>
		<view v-if="category">
			<view v-if="category.matched" style="text-align: center;width: 100%;">{{category.matched.typename}}</view>
			<view v-else style="font-size: 14px;">
				<view v-for="(item,index) in category.similars" v-key="index" style="display: flex;">
					<view style="flex: 1;text-overflow: ellipsis;white-space: normal;overflow: hidden;margin-right: 20px;">{{item.keywords}}</view>
					<view>{{item.typename}}</view>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imagePath: "",
				recResult:null,
				selectedName:"",
				category:""
			}
		},
		onLoad() {

		},
		methods: {
			// 选择图片
			checkImage() {
				// 调用uniapp的选择图片api
				uni.chooseImage({
					// 设置图片可选择的数量
					count: 1,
					success: (res) => {
						// console.log(res);
						this.imagePath = res.tempFilePaths[0];
						this.image2Base64();
					}
				})
			},
			// 转为base64
			image2Base64() {
				// #ifdef APP-PLUS
				// html5+
				plus.io.resolveLocalFileSystemURL(
					this.imagePath,
					(entry)=>{
						entry.file((file)=>{
							let reader = new plus.io.FileReader();
							reader.onloadend = (e)=>{
								console.log(e.target.result);
								const base64 = e.target.result.substr(22);
								this.discernImage(base64);
							}
							reader.readAsDataURL(file);
						})
					}
				)
				// #endif
				// #ifdef MP-WEIXIN
				wx.getFileSystemManager().readFile({
					filePath:this.imagePath,
					encoding:"base64",
					success:(res)=>{
						// console.log(res);
						this.discernImage(res.data);
					}
				})
				// #endif
			},
			// 识别图片内容 --- 调用百度ai的api
			async discernImage(base64){
				// XQ0n56XM0gv99DAIpVgvNAZW
				// s3uz8WOVVQoZk1hnfHPubimpZVgP3lhv
				// var [error,res] = await uni.request({
				// 	url:"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=XQ0n56XM0gv99DAIpVgvNAZW&client_secret=s3uz8WOVVQoZk1hnfHPubimpZVgP3lhv"
				// });
				// var access_token = res.data.access_token;
				// var [error,res] = await uni.request({
				// 	url:"https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general",
				// 	method:"POST",
				// 	header:{
				// 		"Content-Type":"application/x-www-form-urlencoded",
				// 	},
				// 	data:{
				// 		access_token,
				// 		image:base64
				// 	}
				// })
				// console.log(res);
				uniCloud.callFunction({
					name:"waste_sorting",
					data:{
						image:base64
					},
					success: (res) => {
						// console.log(res)
						this.showRes(res.result.result);
					}
				})
			},
			// 识别结果 --- 图片内容属于哪种垃圾
			showRes(result){
				// console.log(result)
				this.recResult = result;
				var itemList = [];
				var abs_result_index;
				for(var i=0;i<result.length;i++){
					if(result[i].score>.7){
						abs_result_index = i;
						break;
					}
					itemList.push(result[i].keyword+""+result[i].score)
				}
				if(abs_result_index>=0){
					this.selectRecResult(abs_result_index);
					return;
				}
				uni.showActionSheet({
					itemList:itemList,
					success: (res) => {
						// console.log(res)
						if(res.tapIndex){
							this.selectRecResult(res.tapIndex);
						}
					}
				})
			},
			// 识别出所属垃圾类别
			selectRecResult(index){
				this.selectedName = this.recResult[index].keyword;
				uniCloud.callFunction({
					name:"TrashClassify",
					data:{
						keyword:this.selectedName
					},
					success: (res) => {
						// console.log(res);
						this.category = res.result;
					}
				})
			}
		}
	}
</script>

<style>
	*{
		box-sizing: border-box;
	}
	view{
		box-sizing: border-box;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.checkImage {
		width: 100%;
		height: 100rpx;
		margin: 30rpx;
		font-size: 36rpx;
	}
</style>
