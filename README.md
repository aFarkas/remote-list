# Remote-List
## A super lightweight autosuggest / autocomplete plugin

A super-lightweight autocomplete / autosuggest plugin with a simple but powerful API. Leverages the HTML5 `datalist` element to build an extreme lightweight autosuggest plugin. Can use webshim to polyfill old browsers or enhance modern ones.

* extreme lightweight (~1.5kb compressed/gzipped)
* simple, intuitive API
* includes powerful caching
* performs server friendly AJAX requests (no multiple requests at once, no requests for older value hints)
* allows customized rich markup content (not only value and label) *
* allows different filtering or other behavior customization *

*In conjunction with [webshims datalist polyfill](http://afarkas.github.io/webshim/demos/demos/cfgs/list-datalist.html)

**[DEMO](http://afarkas.github.io/remote-list/demo/index.html)**

## Simple Usage example

```
<input type="search" data-remote-list="auosuggest-service.json" />

<script>
$('input[data-remote-list]').remoteList();
</script>
```

## API

### Options
The options can be set using the `jQuery.fn.remoteList()` method or by using the data-remote-list attribute on the given element.

The `$.fn.remoteList` plugin has the following options:

* minLength
* maxLength
* param
* source
* select
* renderItem

Examples:

```
$('input.autosuggest').remoteList({
    minLength: 4,
    source: "my-ajax-service.json"
});

//or

<input data-remote-list='{"minLength": 4, "source": "my-ajax-service.json"}' class="autosuggest" type="search" />

//in case the data-remote-list is not a JSON object, but a simple string, it is considered as the `source` option

<input data-remote-list="my-ajax-service.json" class="autosuggest" type="search" />
```

#### `minLength`: (Number default: 2)
The minimum number of characters a user must type before a search is performed. Zero is useful for local data with just a few items, but a higher value should be used when a single character search could match a few thousand items.

Example:

```
$('.autosuggest').remoteList({minLength: 3});

//or
<input data-remote-list='{"minLength": 4}' class="autosuggest" type="search" />
```

#### `maxLength`: (Number default: -1)
The maximum number of characters a new search should be tried. Otherwise the data from cache is used. If the user copies more characters at once into the input field and there is no cached data, the string will be shortened and then requested.

In case of static data this number should be set to 0 so a search is only done once.

```js
$('.autosuggest').remoteList({
	minLength: 0,
	maxLength: 0,
	source: function(value, response){
		response(['Options 1', 'Option 2', {value: "Option 3", label: "This option with a label"}]);
	}
});
```

#### `param`: (String default: name of the input or 'q')
The name of the query parameter used for AJAX service.

```html
<input name="q" data-remote-list='{"source": "get-data.json", "param": "term"}' />
<!-- use the query name 'term' instead of 'q' -->
```

#### `source`: (mixed: String or Function)

The data source for the suggestions. The data will requested with each user input as long as the user input satisfies the `minLength` and the `maxLength` option.

**String**: When a string is used, the plugin expects that string to point to a URL resource that will return JSON (or JSONP) data.

**Function**: The function callback offers much flexibility. It serves as a simple data provider. And should be used, if the request or response has to be modified.

The function receives the following arguments:

* value: The value the suggestions should be based on
* response: A callback function which expects a single argument: the data to suggest to the user.
* reset/fail: A callback function, which should be invoked, if the data couldn't be retrieved
* request: An object with a single property with name of `param` and the `value`.
* source: Either the source url or the function itself.


```js
$('.autosuggest').remoteList({
	minLength: 0,
	maxLength: 0,
	source: function(value, response){
		response(['Options 1', 'Option 2', {value: "Option 3", label: "This option with a label"}]);
	}
});
```

The data provided by the either the `source URL` or the `source function` should be either an array of strings representing the values or an array of objects with the key `value` and an optional `label` key.

#### select: (Function)

A callback function, which is invoked, if the user selects an item of the suggestion list. The selected item can be retrieved with the method `selectedOption` and the selected data can be retrieved with method `selectedData`.

```js
$('.autosuggest').remoteList({
	minLength: 0,
	maxLength: 0,
	source: function(value, response){
		response(['Options 1', 'Option 2', {value: "Option 3", label: "This option with a label"}]);
	},
	select: function(){
		if(window.console){
			console.log('selectedOption:', $(this).remoteList('selectedOption'));
			console.log('selectedData:', $(this).remoteList('selectedData'));
		}
	}
});
```

As a more flexible solution, the `listselect` event can be bound to the input element.

```js
$('.autosuggest').on('listselect', function(){
	if(window.console){
		console.log('selectedOption:', $(this).remoteList('selectedOption'));
		console.log('selectedData:', $(this).remoteList('selectedData'));
	}
});
```

#### renderItem: (Function)

A callback function which can be used to enhance the rendered markup for a suggestion item. This works only in conjunction with [webshims](https://github.com/aFarkas/webshim).

The callback function should return HTML markup for the given option receives the following arguments:

* The value string, which should be used to represent the value for the suggestion
* The label string (can be empty), which should be used to represent the label for the suggestion
* The full data associated with the suggestion item

```js
$('.autosuggest').remoteList({
	minLength: 0,
	maxLength: 0,
	source: function(value, response){
		var source = [
			{
				img: "src/option-1.jpg",
				value: "Option 1"
			},
			{
				img: "src/option-2.jpg",
				value: "Option 2"
			},
			{
				img: "src/option-3.jpg",
				value: "Option 3"
			}
		];
		response(source);
	},
	renderItem: function(value, label, data){
		return '<img src="'+ data.img +'" />'+ value +' '+ label;
	}
});
```

### Methods

All methods can be invoked by passing the method name as a string to the `$.fn.remoteList` plugin. Additional parameters are passed as an array as the second parameter:

```js
$('.autosuggest').remoteList('search', ['new yo']);
```

#### `selectedOption`

Returns the first option element in the datalist, which has the same value, than the associated input element. If no option is found, it will return `null`. Normally this method is used in a `listselect` event listener or the `select` callback function.

```js
var option = $('.autosuggest').remoteList('selectedOption');
```

#### `selectedData`

Returns data associated with the `selectedOption`. If no option/data is found, it will return `null`. Normally this method is used in a `listselect` event listener or the `select` callback function.

```js
var data = $('.autosuggest').remoteList('selectedData');
```

```js
$('.autosuggest').on('listselect', function(){
	if(window.console){
		console.log('selectedOption:', $(this).remoteList('selectedOption'));
		console.log('selectedData:', $(this).remoteList('selectedData'));
	}
});
```

#### `search`: (params: searchValue)

Builds a new suggestion list for the given `searchValue`, if `minLength` and `maxLength` options are met. The `searchValue` parameter has to be wrapped into an array.

```js
$('.autosuggest').remoteList('search', ['new yo']);
```
