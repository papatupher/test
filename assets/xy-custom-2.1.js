(function($) {
/**
 * 可多次调用，执行最后一次。
 * 使用方法：
 * 在表单中需要验证的内容上添加如下内容：
 * xy-check="true"  必填验证，为true时必填，否则选填。
 * xy-empty="aa"  配合必填验证使用，当验证内容等于参数值时，等同于值为空。
 * xy-check-type="tel"  验证类型，可选；如必填验证为true时先验证必填项再验证类别，如必填验证为false或为空时当有值时才验证类别。
 * 当xy-check-type的值为func时，可执行在提交表单时需要执行的方法或ajax。
 * xy-func="test()"  可执行的方法名称，不带参数，return返回值为true或false，如要运行ajax可将内容写在方法内，return返回值必须放在ajax外面。
 * xy-msg=""  错误提示语句，当运行如xy-check-type="func"时，由于无法确定需要提示什么错误信息，可通过此参数传入，注意没有中英文之分。
 * xy-error-msg=""  错误提示语句，跟在错误标志后面显示在页面中，当使用错误提示语句时，验证提示信息弹出层将不会出现。
 *
 * placeholder=""  验证提示信息对应表单名称，必需，当通过jquery增减表单内容时可用其他内容替换，但在jquery代码中必须为其赋值。
 * xy-placeholder="" 验证提示信息，等级大于placeholder，当两者同时出现时显示xy-placeholder中的内容
 *
 * min="7"  位数必须大于7，可选。
 * max="12"  位数必须小于12，可选。
 * min和max可同时使用，也可只使用其中之一，或两个都不使用。
 *
 * different="true"  验证当不为空时A、B项必须不同，单个时验证不起作用，多个时第一个分别与其他内容进行比较，一般用于用户名与密码的设置。
 * identical="true"  与different类似，验证当不为空时A、B项必须相同，一般用于密码与确认密码时。
 *
 * 当input的type为file时，参数multiple表示可以上传多张图片；参数max="1"指文件大小，可为小数，单位MB；参数xy-check-type="jpg,doc,docx,xlsx"可以上传的文件类型，基本的格式都已存在。当浏览器不支持HTML5时，普通的file组件只能上传一张图片，且无法验证文件大小。
 * 当input的type为radio或checkbox，且必填验证为true时，验证是否选择选项，同一选项组只需为一个选项添加必填验证功能，添加位置根据实际情况而定，一行添加到最后一项，多行添加到第一行最后一项。
 * checkbox有min和max参数可供增加。
 * 当select中有参数multiple时，表示可以多选，这时可以添加min和max
 *
 * 当提交确认按钮处有xy-check-request="true"参数时，表示表单中有多个相同name的文本域或文本框，并且有要求必须填写一项，按钮处的参数xy-msg=""为此时错误提示语句。
 *** 目前暂时做到一张表单中没有其他需要验证的表单内容，今后发展方向：将name作为参数传值过来再处理参数。
 *
 * 错误标志显示说明：
 * 当父标签有类名append时，在父标签结尾处插入错误标志；
 * 当父标签没有上述类别时，默认在该表单项之后插入错误标志。
 * 当父标签有类名top时，在该表单项加类名top，效果是错误标志垂直顶部对齐。
 *
 *$('form#checkform').xyValidator({'lang':'cn'});
 *$('form#settingform').xyValidator({'lang':'cn','btnSubmit':'#delsubmit','success':function(){$('form#settingform').attr('action','#1').submit();}});
 *$('form#settingform').xyValidator({'lang':'cn','btnSubmit':'#readsubmit','success':function(){$('form#settingform').attr('action','#2').submit();}});
 *同一页面多个表单时由obj来判断是哪个表单，同时提交按钮id要不同，需要设置btnSubmit值
 *同一表单多个提交按钮时根据btnSubmit来判断属于哪个按钮提交，可以设置success,fail两个值来做后续操作，按钮可以是submit，也可以是button，在success中设置提交动作
 *
 * $(function(){
 * 	$(form表单).xyValidator();
 * })
 */
  $.fn.xyValidator = function(o){
    o = $.extend({
        lang: 'en',
				btnSubmit: '#formsubmit[type=submit]',
        btnReset: '#formreset[type=reset]',
        btnOk: null,
        btnCancel: null,
        success: function(){/*验证成功时执行*/},
        fail: function(){/*验证失败时执行*/}
    }, o || {});
		return this.each(function(){
			var form = $(this),
					checkArray = $('input, select, textarea', this),
					html = html_cn = html_en = different = identical = '',
					request_name = new Array(), request_bool = new Array(),
					ExtensionArray = ['evy','fif','spl','hta','acx','hqx','doc','dot','*','bin','class','dms','exe','lha','lzh','oda','axs','pdf','prf','p10','crl','ai','eps','ps','rtf','setpay','setreg','xla','xlc','xlm','xls','xlt','xlw','msg','sst','cat','stl','pot','pps','ppt','mpp','wcm','wdb','wks','wps','hlp','bcpio','cdf','z','tgz','cpio','csh','dcr','dir','dxr','dvi','gtar','gz','hdf','ins','isp','iii','js','latex','mdb','crd','clp','dll','m13','m14','mvb','wmf','mny','pub','scd','trm','wri','cdf','nc','pma','pmc','pml','pmr','pmw','p12','pfx','p7b','spc','p7r','p7c','p7m','p7s','sh','shar','swf','sit','sv4cpio','sv4crc','tar','tcl','tex','texi','texinfo','roff','t','tr','man','me','ms','ustar','src','cer','crt','der','pko','zip','au','snd','mid','rmi','mp3','aif','aifc','aiff','m3u','ra','ram','wav','bmp','cod','gif','ief','jpe','jpeg','jpg','jfif','svg','tif','tiff','ras','cmx','ico','pnm','pbm','pgm','ppm','rgb','xbm','xpm','xwd','mht','mhtml','nws','css','323','htm','html','stm','uls','bas','c','h','txt','rtx','sct','tsv','htt','htc','etx','vcf','mp2','mpa','mpe','mpeg','mpg','mpv2','mov','qt','lsf','lsx','asf','asr','asx','avi','movie','flr','vrml','wrl','wrz','xaf','xof','dotx','docx','xlsx','pptx'],
					TypeArray = ['application/envoy','application/fractals','application/futuresplash','application/hta','application/internet-property-stream','application/mac-binhex40','application/msword','application/msword','application/octet-stream','application/octet-stream','application/octet-stream','application/octet-stream','application/octet-stream','application/octet-stream','application/octet-stream','application/oda','application/olescript','application/pdf','application/pics-rules','application/pkcs10','application/pkix-crl','application/postscript','application/postscript','application/postscript','application/rtf','application/set-payment-initiation','application/set-registration-initiation','application/vnd.ms-excel','application/vnd.ms-excel','application/vnd.ms-excel','application/vnd.ms-excel','application/vnd.ms-excel','application/vnd.ms-excel','application/vnd.ms-outlook','application/vnd.ms-pkicertstore','application/vnd.ms-pkiseccat','application/vnd.ms-pkistl','application/vnd.ms-powerpoint','application/vnd.ms-powerpoint','application/vnd.ms-powerpoint','application/vnd.ms-project','application/vnd.ms-works','application/vnd.ms-works','application/vnd.ms-works','application/vnd.ms-works','application/winhlp','application/x-bcpio','application/x-cdf','application/x-compress','application/x-compressed','application/x-cpio','application/x-csh','application/x-director','application/x-director','application/x-director','application/x-dvi','application/x-gtar','application/x-gzip','application/x-hdf','application/x-internet-signup','application/x-internet-signup','application/x-iphone','application/x-javascript','application/x-latex','application/x-msaccess','application/x-mscardfile','application/x-msclip','application/x-msdownload','application/x-msmediaview','application/x-msmediaview','application/x-msmediaview','application/x-msmetafile','application/x-msmoney','application/x-mspublisher','application/x-msschedule','application/x-msterminal','application/x-mswrite','application/x-netcdf','application/x-netcdf','application/x-perfmon','application/x-perfmon','application/x-perfmon','application/x-perfmon','application/x-perfmon','application/x-pkcs12','application/x-pkcs12','application/x-pkcs7-certificates','application/x-pkcs7-certificates','application/x-pkcs7-certreqresp','application/x-pkcs7-mime','application/x-pkcs7-mime','application/x-pkcs7-signature','application/x-sh','application/x-shar','application/x-shockwave-flash','application/x-stuffit','application/x-sv4cpio','application/x-sv4crc','application/x-tar','application/x-tcl','application/x-tex','application/x-texinfo','application/x-texinfo','application/x-troff','application/x-troff','application/x-troff','application/x-troff-man','application/x-troff-me','application/x-troff-ms','application/x-ustar','application/x-wais-source','application/x-x509-ca-cert','application/x-x509-ca-cert','application/x-x509-ca-cert','application/ynd.ms-pkipko','application/zip','audio/basic','audio/basic','audio/mid','audio/mid','audio/mpeg','audio/x-aiff','audio/x-aiff','audio/x-aiff','audio/x-mpegurl','audio/x-pn-realaudio','audio/x-pn-realaudio','audio/x-wav','image/bmp','image/cis-cod','image/gif','image/ief','image/jpeg','image/jpeg','image/jpeg','image/pipeg','image/svg+xml','image/tiff','image/tiff','image/x-cmu-raster','image/x-cmx','image/x-icon','image/x-portable-anymap','image/x-portable-bitmap','image/x-portable-graymap','image/x-portable-pixmap','image/x-rgb','image/x-xbitmap','image/x-xpixmap','image/x-xwindowdump','message/rfc822','message/rfc822','message/rfc822','text/css','text/h323','text/html','text/html','text/html','text/iuls','text/plain','text/plain','text/plain','text/plain','text/richtext','text/scriptlet','text/tab-separated-values','text/webviewhtml','text/x-component','text/x-setext','text/x-vcard','video/mpeg','video/mpeg','video/mpeg','video/mpeg','video/mpeg','video/mpeg','video/quicktime','video/quicktime','video/x-la-asf','video/x-la-asf','video/x-ms-asf','video/x-ms-asf','video/x-ms-asf','video/x-msvideo','video/x-sgi-movie','x-world/x-vrml','x-world/x-vrml','x-world/x-vrml','x-world/x-vrml','x-world/x-vrml','x-world/x-vrml','application/vnd.openxmlformats-officedocument.wordprocessingml.template','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation'];
			$(o.btnSubmit, $(form)).off('click').on('click', function(){
				$('.errorMessage').remove();
				html = html_cn = html_en = different = identical = errorMsg = '', mod = 0, request_name = new Array(), request_bool = new Array();
				checkArray.each(function(i){checkNotEmpty($(this))})
				if($(this).attr('xy-check-request')){
					for(key in request_bool){
						if(!request_bool[key]){mod++;}
					}
					if(mod){
						html_cn+='<li>'+$(this).attr('xy-msg')+'</li>';
						html_en+='<li>'+$(this).attr('xy-msg')+'</li>';
					}
				}
				if(mod==0){
          o.success();
					return true;
				}else{
          o.fail();
					if(o.lang=='en'){
						html = '<p>Please correct the following mistaken information: </p><ul>'+html_en+'</ul>';
					}else{
						html = '<p>请调整以下错误信息：</p><ul>'+html_cn+'</ul>';
					}
          if(!errorMsg){
            //Boxy.alert(html, o.btnOk);
            layer.msg(html, {icon: 2});
          }
					html = html_cn = html_en = different = identical = '';
					mod = 0;
					request_name = new Array(), request_bool = new Array();
					return false;
				}
			})
			$(o.btnReset).click(function(){$('.errorMessage').remove();})
			checkNotEmpty = function(obj){
				var value = $.trim($(obj).val()), name = $(obj).attr('name').replace(/\[/g, "").replace(/\]/g, ""), placeholder = $(obj).attr('xy-placeholder')?$(obj).attr('xy-placeholder'):$(obj).attr('placeholder'), minLength = $(obj).attr('min'), maxLength = $(obj).attr('max'), maxSize= $(obj).attr('max')*1024*1024;
        errorMsg = $(obj).attr('xy-error-msg')?$(obj).attr('xy-error-msg'):'';
				if($(obj).parent().hasClass('top')){
					addClass = 'top';
				}else{
					addClass = '';
				}
				if($(obj).attr('xy-check')=="true"){
					switch($(obj).attr('type')){
						case 'checkbox':
							if(checkMustSelected()) return checkLength($('[name^='+name+']:checked').length);
							break;
						case 'radio':
							return checkMustSelected();
							break;
						default:
							if(value=='' || value==$(obj).attr('xy-empty')){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}
								}
								html_cn+='<li>'+placeholder+'不能为空</li>';
								html_en+='<li>No blank at '+placeholder+'</li>';
								return false;
							}
							if($(obj).attr('multiple') && $(obj).prop('tagName')=='SELECT'){
								return checkLength($('[name^='+name+']>option:selected').length);
							}
							if($(obj).attr('type')=='file'){
								var extensionArr = $(obj).attr('xy-check-type').split(','), typeArr='';
								for(var fi=0; fi<ExtensionArray.length; fi++){
									for(var fj=0; fj<extensionArr.length; fj++){
										if(ExtensionArray[fi]==extensionArr[fj]){
											if(typeArr==''){
												typeArr = TypeArray[fi];
											}else{
												typeArr += ','+TypeArray[fi];
											}
										}
									}
								}
								var ext,
										extensions = $(obj).attr('xy-check-type')?extensionArr: null,
										types = typeArr ? typeArr.split(',') : null,
										html5 = (window.File && window.FileList && window.FileReader);
								if (html5) {
									var files = $(obj).get(0).files,
											total = files.length;
									for (var i = 0; i < total; i++) {
										ext = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
										if (extensions && extensions.indexOf(ext) == -1) {
											mod++;
											if($(obj).attr('xy-msg-position')){
												$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
											}else{
												if($(obj).parent().hasClass('append')){
													$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}else{
													$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}
											}
											html_cn+='<li>选定的文件是无效的，可上传的文件类型为('+$(obj).attr('xy-check-type')+')。</li>';
											html_en+='<li>The file chosen is invalid, please upload the file in form of ('+$(obj).attr('xy-check-type')+').</li>';
											return false;
										}
										// Check file type
										if (types && types.indexOf(files[i].type) == -1) {
											mod++;
											if($(obj).attr('xy-msg-position')){
												$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
											}else{
												if($(obj).parent().hasClass('append')){
													$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}else{
													$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}
											}
											html_cn+='<li>选定的文件是无效的，可上传的文件类型为('+$(obj).attr('xy-check-type')+')。</li>';
											html_en+='<li>The file chosen is invalid, please upload the file in form of ('+$(obj).attr('xy-check-type')+').</li>';
											return false;
										}
										// Check file size
										if (maxSize && files[i].size > parseInt(maxSize)) {
											mod++;
											if($(obj).attr('xy-msg-position')){
												$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
											}else{
												if($(obj).parent().hasClass('append')){
													$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}else{
													$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
												}
											}
											html_cn+='<li>选定的文件是无效的，文件大小不能超过'+$(obj).attr('max')+'MB。</li>';
											html_en+='<li>The file chosen is invalid; the size of file shall not exceed '+$(obj).attr('max')+'MB.</li>';
											return false;
										}
									}
								} else {
									// Check file extension
									ext = value.substr(value.lastIndexOf('.') + 1);
									if (extensions && extensions.indexOf(ext) == -1) {
										mod++;
										if($(obj).attr('xy-msg-position')){
											$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
										}else{
											if($(obj).parent().hasClass('append')){
												$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
											}else{
												$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
											}
										}
										html_cn+='<li>选定的文件是无效的，可上传的文件类型为('+$(obj).attr('xy-check-type')+')，由于当前浏览器不支持HTML5，文件大小无法验证，上传时请不要超过'+$(obj).attr('max')+'MB。</li>';
										html_en+='<li>The file chosen is invalid; the valid file shall be in form of ('+$(obj).attr('xy-check-type')+'); the browser doesn’t support HTML5, the size of file is failed to be verified, so please upload the file not exceeding '+$(obj).attr('max')+'MB.</li>';
										return false;
									}
								}
							}
							break;
					}
				}
				if(value!='' && $(obj).attr('xy-check-type') && $(obj).attr('type')!='file'){
					switch($(obj).attr('xy-check-type')){
						case 'email':
							var RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
							if(!RegExp.test(value)){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}
								}
								html_cn+='<li>'+placeholder+'格式错误</li>';
								html_en+='<li>'+placeholder+' Format error</li>';
								return false;
							}
							break;
						case 'func':
							if(!eval($(obj).attr('xy-func'))){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}
								}
								html_cn+='<li>'+$(obj).attr('xy-msg')+'</li>';
								html_en+='<li>'+$(obj).attr('xy-msg')+'</li>';
								return false;
							}
							break;
						case 'tel':
							var RegExp = /^[\d\-]+$/;
							if(!RegExp.test(value)){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}
								}
								html_cn+='<li>'+placeholder+'只能由数字和横线组成</li>';
								html_en+='<li>'+placeholder+' only consists of figures and minus</li>';
								return false;
							}
							break;
						case 'mobile':
							var RegExp = /^\d+$/;
							if(!RegExp.test(value)){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
								}else{
									if($(obj).parent().hasClass('append')){

										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
									}
								}
								html_cn+='<li>'+placeholder+'只能包含数字</li>';
								html_en+='<li>'+placeholder+' only consists of figures</li>';
								return false;
							}
							break;
						case 'username':
              var RegExpArr = {
                lc: '[a-z]'
              };
              if(value.length < minLength) {
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}
								}
								html_cn+='<li>'+placeholder+'太短</li>';
								html_en+='<li>'+placeholder+' is too short</li>';
                return false;
              }else if(value.length > maxLength){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}
								}
								html_cn+='<li>'+placeholder+'太长</li>';
								html_en+='<li>'+placeholder+' is too long</li>';
                return false;
              } else {
                var RegArr = {
                  l: Reg(value, RegExpArr.lc)
                };
                var RegExp = /^[a-zA-Z0-9]+$/;
                if(RegArr.l && RegExp.test(value)) {
                  if($(obj).attr('different')){
                    checkDifferent();
                  }
                  if($(obj).attr('identical')){
                    checkIdentical();
                  }
                  return true;
                } else {
                  mod++;
                  if($(obj).attr('xy-msg-position')){
                    $($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
                  }else{
                    if($(obj).parent().hasClass('append')){
                      $(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
                    }else{
                      $(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
                    }
                  }
                  html_cn+='<li>'+placeholder+'只能由“小写字母”、“大写字母”、“数字”组成，且必须含有“小写字母”</li>';
                  html_en+='<li>'+placeholder+' only consists of "lowercase", "capital letters" and "figures", and must contain "lowercase".</li>';
                  return false;
                }
              }
							break;
            case 'password':
              var RegExpArr = {
                lc: '[a-z]',
                uc: '[A-Z]',
                no: '[0-9]',
                sc: '[~!@#$%^&*()_+\.?]'
              };
              if(value.length < minLength) {
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}
								}
								html_cn+='<li>'+placeholder+'太短</li>';
								html_en+='<li>'+placeholder+' is too short</li>';
                return false;
              }else if(value.length > maxLength){
								mod++;
								if($(obj).attr('xy-msg-position')){
									$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
								}else{
									if($(obj).parent().hasClass('append')){
										$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}else{
										$(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
									}
								}
								html_cn+='<li>'+placeholder+'太长</li>';
								html_en+='<li>'+placeholder+' is too long</li>';
                return false;
              } else {
                var RegArr = {
                  l: Reg(value, RegExpArr.lc),
                  u: Reg(value, RegExpArr.uc),
                  n: Reg(value, RegExpArr.no),
                  s: Reg(value, RegExpArr.sc)
                };
                if(RegArr.l && RegArr.u && RegArr.n && RegArr.s) {
                  if($(obj).attr('different')){
                    checkDifferent();
                  }
                  if($(obj).attr('identical')){
                    checkIdentical();
                  }
                  return true;
                } else {
                  mod++;
                  if($(obj).attr('xy-msg-position')){
                    $($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage"></i>');
                  }else{
                    if($(obj).parent().hasClass('append')){
                      $(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'"></i>');
                    }else{
                      $(obj).after('<i class="icon-remove errorMessage '+addClass+'"></i>');
                    }
                  }
                  html_cn+='<li>'+placeholder+'必须含有小写字母、大写字母、数字、特殊符号“~!@#$%^&*()_+.?”</li>';
                  html_en+='<li>'+placeholder+' must contain lowercase, capital letters, figures and characters "~!@#$%^&*()_+.?"</li>';
                  return false;
                }
              }
              break;
					}
					var length = value.length;
					checkLength(length);
				}
				if($(obj).attr('different')){
					checkDifferent();
				}
        function checkDifferent(){
					if(!different){
						different = value;
						differentPlaceholder = placeholder;
					}else{
						if(different==value){
							mod++;
							if($(obj).attr('xy-msg-position')){
								$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
							}else{
								if($(obj).parent().hasClass('append')){
									$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
								}else{
									$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
								}
							}
							html_cn+='<li>'+differentPlaceholder+'不能和'+placeholder+'相同</li>';
							html_en+='<li>'+differentPlaceholder+' shall not be same with '+placeholder+'</li>';
							return false;
						}
					}
        }
				if($(obj).attr('identical')){
          checkIdentical();
				}
        function checkIdentical(){
					if(!identical){
						identical = value;
						identicalPlaceholder = placeholder;
					}else{
						if(identical!=value){
							mod++;
							if($(obj).attr('xy-msg-position')){
								$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
							}else{
								if($(obj).parent().hasClass('append')){
									$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
								}else{
									$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
								}
							}
							html_cn+='<li>'+identicalPlaceholder+'和'+placeholder+'不相同</li>';
							html_en+='<li>'+identicalPlaceholder+' is different with '+placeholder+'</li>';
							return false;
						}
					}
        }
				if($(o.btnSubmit).attr('xy-check-request') && ($(obj).prop('tagName')=='TEXTAREA' || $(obj).attr('type')=='text')){
					if($.inArray(name, request_name)<0){
						request_name.push(name);
						request_bool.push(false);
					}
					if($(obj).val()){
						request_bool[$.inArray(name, request_name)] = true;
					}
				}
				function checkLength(length){
					if ((minLength && length < minLength) || (maxLength && length > maxLength)){
						mod++;
						if($(obj).attr('xy-msg-position')){
							$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
						}else{
							if($(obj).parent().hasClass('append')){
								$(obj).parent().append('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
							}else{
								$(obj).after('<i class="icon-remove errorMessage '+addClass+'">'+errorMsg+'</i>');
							}
						}
						if(minLength && !maxLength){
							html_cn+='<li>'+placeholder+'位数必须大于'+minLength+'（包含）</li>';
							html_en+='<li>'+placeholder+' shall have '+minLength+' digits or more.</li>';
						}
						if(!minLength && maxLength){
							html_cn+='<li>'+placeholder+'位数必须小于'+maxLength+'（包含）</li>';
							html_en+='<li>'+placeholder+' shall have '+maxLength+' digits or less.</li>';
						}
						if(minLength && maxLength){
              if(minLength == maxLength){
                html_cn+='<li>'+placeholder+'位数长度需为'+minLength+'位</li>';
                html_en+='<li>'+placeholder+' shall be in length of '+minLength+' digits.</li>';
              }else{
                html_cn+='<li>'+placeholder+'位数必须介于'+minLength+'和'+maxLength+'之间（包含）</li>';
                html_en+='<li>'+placeholder+' shall be in length between '+minLength+' to '+maxLength+' digits (including '+minLength+' and '+maxLength+')</li>';
              }
						}
						return false;
					}
				}
				function checkMustSelected(){
					if ($('[name^='+name+']:checked').length==0){
						mod++;
						if($(obj).attr('xy-msg-position')){
							$($(obj).attr('xy-msg-position')).append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
						}else{
							if($(obj).parent().hasClass('append')){
								$(obj).parent().append('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
							}else{
								$(obj).after('<i class="icon-remove errorMessage">'+errorMsg+'</i>');
							}
						}
						html_cn+='<li>'+placeholder+'为必选项</li>';
						html_en+='<li>'+placeholder+' is a required choice.</li>';
						return false;
					}else return true;
				}
			}
		});
	}
  function Reg(str, rStr) {
    var reg = new RegExp(rStr);
    if(reg.test(str)) 
      return true;
    else 
      return false;
  }

  /**
   * 去HTML代码，并判断元素类型，当元素是可输入元素（input，textarea）时同时去左右空格
   * 默认可输入元素加类名trim自动加载该功能
   */
   $.fn.xyStripHtml = function(o){
     o = $.extend({}, o || {});
     return this.each(function(){
       switch($(this).prop('tagName')){
         case 'INPUT':
         case 'TEXTAREA':
           $(this).val($.trim($(this).val().replace(/<[^>]+>/g,''))).blur(function(){$(this).val($.trim($(this).val().replace(/<[^>]+>/g,'')))})
           break;
         default:
           $(this).html($(this).html().replace(/<[^>]+>/g,''));
           break;
       }
     })
   }

  /**
   * 屏蔽功能键使用方法：
   * $(function(){
   * 	$(form表单).xyProhibit();  不带参数时默认屏蔽所有功能键
   * 	$(form表单).xyProhibit({'prohibit':['mouseRight','mouseLeft','alt','ctrl','shift']});
   *  参数选择，全部屏蔽等同于不带参数，参数必须以数组形式输入
   * })
   */
	$.fn.xyProhibit = function(o){
    o = $.extend({prohibit:['mouseRight','mouseLeft','alt','ctrl','shift']}, o || {});
		return this.each(function(){
			var obj = $(this);
			if(jQuery.isArray(o.prohibit)){
				for(var i=0; i<o.prohibit.length; i++){
					switch(o.prohibit[i]){
						case 'mouseRight':
							obj.bind("contextmenu",function(){return false;});//屏蔽鼠标右键
							break;
						case 'mouseLeft':
							obj.bind("selectstart",function(){return false;});//屏蔽文字选取
							break;
						case 'alt':
							obj.keydown(function(){return !window.event.altKey;});//屏蔽ALT键
							break;
						case 'ctrl':
							obj.keydown(function(){return !window.event.ctrlKey;});//屏蔽CTRL键
							break;
						case 'shift':
							obj.keydown(function(){return !window.event.shiftKey;});//屏蔽SHIFT键
							break;
					}
				}
			}
		})
	}
})(jQuery);
/**
 * 返回顶部开始
 * 必须放在页面底部
 */
function BackToTop(){
	$backToTopEle = $('<div class="backToTop xy-hide-xs"><i class="icon-angle-up"></i></div>').appendTo($("body")).click(function(){
    $("html, body").animate({scrollTop:0}, 120);
  }),
	$backToTopFun = function() {
		var st = $(document).scrollTop(), winh = $(window).height()
		st > 0 ? $backToTopEle.show() : $backToTopEle.hide()
		//IE6下的定位
		if (!window.XMLHttpRequest) {
			$backToTopEle.css("top", st + winh - 166)
		}
	}
	$(window).bind("scroll", $backToTopFun)
	$(function(){$backToTopFun()})
}

/**
 文本框输入类型
 */
function IsNum(e, o) {
	var k = window.event ? e.keyCode : e.which;
	var val = false;
	switch(o){
		case 'point':  //能输入非负浮点数
			val = (((k >= 48) && (k <= 57)) || k == 8 || k == 0 || k == 46)?true:false;
			break;
		case 'minus':  //能输入正负浮点数
			val = (((k >= 48) && (k <= 57)) || k == 8 || k == 0 || k == 46 || k == 45)?true:false;
			break;
		default:  //只能输入纯数字0-9
			val = (((k >= 48) && (k <= 57)) || k == 8 || k == 0)?true:false;
			break;
	}
	if (!val){
		if (window.event) {
			window.event.returnValue = false;
		}
		else {
			e.preventDefault(); //for firefox 
		}
	}
}
function getRound(number,fractionDigits){ //小数点后四舍五入
	var fD = fractionDigits?fractionDigits:0;
	with(Math){
		if(isNaN(round(number*pow(10,fD))/pow(10,fD))){
			return 0;
		}else{
			return round(number*pow(10,fD))/pow(10,fD);
		}
	}
}
/*
onKeyPress="return IsNum(event)" onBlur="this.value=this.value.replace(/\D/gi,'')"  纯数字
onKeyPress="return IsNum(event,'point')" onBlur="this.value=getRound(parseFloat(this.value.replace(/[^\d|.|-]|(\.)(?=[^\1]*\1)/gi,'')),2)"  金额，非负浮点数，四舍五入，最后一个参数为小数点后个数
$(obj).keypress(function(){return IsNum(event,'point')}).blur(function(){$(this).val(getRound(parseFloat(this.value.replace(/[^\d|.|-]|(\.)(?=[^\1]*\1)/gi,'')),2))})  金额jquery写法
*/

/**
 获取地址栏参数
var myurl=GetQueryString("url");
if(myurl !=null && myurl.toString().length>1)
{
   alert(GetQueryString("url"));
}
 */
function GetQueryString(name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null)return  unescape(r[2]); return null;
}
/**
 修改地址栏参数
 替换指定传入参数的值,paramName为参数,replaceWith为新值
 没有则添加该参数
 replaceParamVal("url","abc")
 ?url=abc
 */
function replaceParamVal(paramName,replaceWith) {
  var myurl=GetQueryString(paramName);
  var oUrl = this.location.href.toString();
  if(myurl !=null && myurl.toString().length>1){
    var re=eval('/('+ paramName+'=)([^&]*)/gi');
    var nUrl = oUrl.replace(re,paramName+'='+replaceWith);
    return nUrl;
  }else{
    if (oUrl.indexOf("?") > 0) {
      oUrl = oUrl + "&" + paramName + "=" + replaceWith;
    }else {
      oUrl = oUrl + "?" + paramName + "=" + replaceWith;
    }
    return oUrl;
  }
}

/**
 * html5动画效果，标注有动画效果的模块（.xySation）是否显示在当前页面的显示区域，当显示时添加.xySationShow
 */
function xySation(){
  $xySationFun = function() {
		var st = $(document).scrollTop();
    var i = 1;
    $('.xySation').each(function(){
      if((st+$(window).height())>$(this).offset().top && (st-$(this).height())<$(this).offset().top && !$(this).is('.xySationShow')){
        var obj = this;
        setTimeout(function(){
          $(obj).addClass('xySationShow')
        }, i * 100);
        i++;
      }
    })
	}
	$(window).bind("scroll", $xySationFun)
	$(function(){$xySationFun()})
}
/**
 * 整屏效果，将需要一屏显示的内容用标签page嵌套  <page></page>
 */
function ScreenScroll(){
  var isScrolling = false;
  var wh = parseInt($(window).height());
  var st = parseInt($(document).scrollTop());
  var pagenum = Math.ceil(st/wh);
  var pagecount = $('div.pageBox').length;
  $('body').append('<ul id="arrow-dots" class="xy-hide-xs"></ul>');
  $('div.pageBox').each(function(i){
    $('#arrow-dots').append('<li'+(i==0?' class="active"':'')+'></li>');
  })
  $('#arrow-dots>li').each(function(i){
    $(this).click(function(){
      isScrolling = true;
      $("html, body").stop().animate({ scrollTop: wh*i }, 400, function(){
        isScrolling = false;
        pagenum = i;
        $('#arrow-dots>li').removeClass('active').eq(i).addClass('active');
        $('div.pageBox:eq('+i+')').addClass('currentPage');
        $('div.pageBox:not(:eq('+i+'))').removeClass('currentPage');
        $('div.pageBox:not(:eq('+i+')) .xySationShow').removeClass('xySationShow');
      });
    })
  })
  if(parseInt($(window).width())>750){ //768-17=751
    $('div.pageBox').height(wh);
    $('body').on('mousewheel', function(e){
      e.preventDefault();
      if(!isScrolling){
        var deltaY = e.deltaY;
        switch(deltaY){
          case 1:
            if((pagenum-1)>=0){
              pagenum--;
              isScrolling = true;
              $("html, body").stop().animate({ scrollTop: wh*pagenum }, 400, function(){
                isScrolling = false;
                $('#arrow-dots>li').removeClass('active').eq(pagenum).addClass('active');
                $('div.pageBox:eq('+pagenum+')').addClass('currentPage');
                $('div.pageBox:not(:eq('+pagenum+'))').removeClass('currentPage');
                $('div.pageBox:not(:eq('+pagenum+')) .xySationShow').removeClass('xySationShow');
              });
            }
          break;
          case -1:
            if((pagenum+1)<pagecount){
              pagenum++;
              isScrolling = true;
              $("html, body").stop().animate({ scrollTop: wh*pagenum }, 400, function(){
                isScrolling = false;
                $('#arrow-dots>li').removeClass('active').eq(pagenum).addClass('active');
                $('div.pageBox:eq('+pagenum+')').addClass('currentPage');
                $('div.pageBox:not(:eq('+pagenum+'))').removeClass('currentPage');
                $('div.pageBox:not(:eq('+pagenum+')) .xySationShow').removeClass('xySationShow');
              });
            }
          break;
          default:
          break;
        }
      }
    });
  }
  window.onload = function(){
    $("html, body").animate({scrollTop:0}, 1, function(){pagenum=0;});
    /*计算屏幕高度与内容高度，并将多余高度按实际情况分配*/
  }
	$backToTopEle = $('<div class="backToTop xy-hide-xs"></div>').appendTo($("body")).click(function(){
    $("html, body").animate({scrollTop:0}, 120, function(){
      pagenum=0;
      $('#arrow-dots>li').removeClass('active').eq(pagenum).addClass('active');
    });
  }),
	$backToTopFun = function() {
		var st = $(document).scrollTop(), winh = $(window).height()
		st > 0 ? $backToTopEle.show() : $backToTopEle.hide()
		//IE6下的定位
		if (!window.XMLHttpRequest) {
			$backToTopEle.css("top", st + winh - 166)
		}
	}
	$(window).bind("scroll", $backToTopFun)
	$(function(){$backToTopFun()})
}

$(function(){
  if($.support.leadingWhitespace){
    xySation();
  }
  $('.trim').xyStripHtml();
})