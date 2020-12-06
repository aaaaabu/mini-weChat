'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	// XQ0n56XM0gv99DAIpVgvNAZW
	// s3uz8WOVVQoZk1hnfHPubimpZVgP3lhv
	const res = await uniCloud.httpclient.request(
	"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=XQ0n56XM0gv99DAIpVgvNAZW&client_secret=s3uz8WOVVQoZk1hnfHPubimpZVgP3lhv",
	{
		dataType:"json"
	})
	const access_token = res.data.access_token;
	const classify_res = await uniCloud.httpclient.request(
	"https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general",
	{
		headers:{
			"Content-Type":"application/x-www-form-urlencoded"
		},
		method:"POST",
		dataType:"json",
		data:{
			access_token:access_token,
			image:event.image
		}
	})
	//返回数据给客户端
	return classify_res.data;
};
