(function(undefined){
	"use strict";
	var id = 0;
	var $ = window.webshims && webshims.$ || window.jQuery || window.$;

	function RemoteList(element, options){
		id++;
		this.element = $(element);
		this.options = $.extend({}, RemoteList.defaults, options);
		this.cache = {};
		this.id = 'remotelist-'+id;

		if(!this.options.param){
			this.options.param = this.element.prop('name') || 'q';
		}

		this._createDatalist();
		this._bindEvents(this);
	}

	RemoteList.defaults = {
		minLength: 2,
		maxLength: -1,
		source: '',
		param: '',
		select: $.noop,
		renderItem: null
	};


	RemoteList.createOption = function(option){
		var ret = $(document.createElement('option'));
		if(!option || typeof option == 'string'){
			option = {value: option};
		}
        ret.prop('value', option.value);
		if(option.label){
            ret.prop('label', option.label);
		}
        ret.data('optionData', option);
		return ret[0];
	};

	RemoteList.prototype = {

		selectedData: function(){
			var elem = this.selectedOption();
			return elem && $(elem).data('optionData');
		},
		selectedOption: function(){
			var selectedOption = null;
			var val = this.val();
			if(val){
                selectedOption = $('[value="'+ val +'"]', this.element.prop('list'))[0] || null;
			}
			return selectedOption;
		},
		search: function(val){
			var dataObj, source, response, reset;
			var that = this;
			var o = this.options;
			var cVal = val;

			if(o.maxLength > -1){
				cVal = cVal.substr(o, o.maxLength);
			}


			this.doAjax = false;

			if(this.cache[cVal]){
				this.setList(this.cache[cVal], cVal);
			} else if(!this.currentAjax){
				this.element.addClass('list-search');
				dataObj = {};
				dataObj[o.param] = val;
				this.currentAjax = true;


				reset = function(){
					if(reset.xhr && reset.xhr.abort){
						reset.xhr.abort();
					}
					that.currentAjax = false;

					clearTimeout(reset.timer);

					if(that.doAjax){
						that.search(that.doAjax);
					} else {
						that.element.removeClass('list-search');
					}
				};

				source = $.isFunction(o.source) ?
					o.source :
					function(val, response, fail, dataObj, url){
						return $.ajax({
							dataType: 'json',
							url: url,
							data: dataObj,
							context: this,
							error: fail,
							success: response
						});
					}
				;


				response = function(data){
					that.setList(data, cVal);
					reset();
				};

				reset.timer = setTimeout(reset, 999);
				reset.xhr = source(val, response, reset, dataObj, o.source);

			} else {
				this.doAjax = val;
			}
		},
		setList: function(options, val){
			if(!options){
				options = [];
			}

			if(this.currentOptions != options && this.currentVal !== val){
				this.currentOptions = options;
				this.currentVal = val;
				this.cache[val] = options;
				options = $.map(options, RemoteList.createOption);
				this.datalistSelect.html(options);
				if($.fn.updatePolyfill){
					this.datalistSelect.updatePolyfill();
				}
			}

		},
		_createDatalist: function(){
			this.datalistSelect = this.element.prop('list');

			if(!this.datalistSelect){
				this.datalistSelect = $('<datalist id="'+ this.id +'"><select /></datalist>');
				this.element.attr('list', this.id);
				this.element.after(this.datalistSelect);
			}

			this.datalistSelect = $('select', this.datalistSelect);
		},
		val: function(){
			return window.webshims && webshims.getDataListVal ? webshims.getDataListVal(this.element[0]) : this.element.prop('value');
		},
		_bindEvents: function(inst){
			var searchTimer, selectTimer, character;
			var options = inst.options;


			var detectListselect = (function(){
				var lastValue;
				return function(type){
					var curValue = inst.val();
					
					if(curValue === lastValue){
						return;
					}
					lastValue = curValue;
					if(type != 'change' && character && character.toLowerCase() == curValue.charAt(curValue.length -1).toLowerCase()){
						return;
					}

					if(inst.selectedOption()){
						clearTimeout(searchTimer);
						if(options.select){
							options.select.call(inst.element[0], $.Event('listselect'));
						}
						inst.element.trigger('listselect');
						return true;
					}
				};
			})();

			inst.element.on({
				'input focus': (function(){

					var fn = function(){
						var useVal = inst.val();
						if(useVal.length >= options.minLength){
							inst.search(useVal);
						}
					};
					return function(){
						clearTimeout(searchTimer);
						searchTimer = setTimeout(fn, 99);
					};
				})(),
				/*
					Actually if an option is selected by a user a change event should be dispatched.
					Unfortunatley currently no browser got this right, so we use the input event, which isn't 100% a proof solution
				 */
				'input change': function(e){
					clearTimeout(selectTimer);
					if(e.type == 'change'){
						clearTimeout(searchTimer);
						if(inst.element.is(':focus')){
							detectListselect('change');
						}
					} else {
						selectTimer = setTimeout(detectListselect, 9);
					}
				},
				keypress: (function(){
					var removeChar = function(){
						character = '';
					};
					return function(e){
						character = String.fromCharCode(e.charCode);
						setTimeout(removeChar, 20);
					};
				})(),
				getoptioncontent: function(e, data){
					//renderItem
					if(options.renderItem){
						return options.renderItem('<span class="option-value">'+ data.item.value +'</span>', data.item.label && '<span class="option-label">'+ data.item.label +'</span>', $.data(data.item.elem, 'optionData'));
					}
				}
			})
		}
	};


	$.fn.remoteList = function(opts, args){
		var fn = opts;
		var ret = this;
		this.each(function(){
			var instRet, markupOpts;
			var inst = $(this).data('remoteList');
			if(typeof inst == 'string'){
				markupOpts = {source: inst};
				inst = false;
			}
			if(inst && $.isPlainObject(inst)){
				markupOpts = inst;
				inst = false;
			}
			if(inst && inst[fn]){
				instRet = inst[fn].apply ? inst[fn].apply(inst, args || []) : inst[fn];
				if(instRet !== undefined){
					ret = instRet;
					return false;
				}
			} else {
				$(this).data('remoteList', new RemoteList(this, $.extend({}, opts, markupOpts)))
			}
		});

		return ret;
	};

	$.fn.remoteList.constructorFn = RemoteList;


})();
