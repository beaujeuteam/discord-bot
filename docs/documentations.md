## Modules

<dl>
<dt><a href="#module_Command">Command</a></dt>
<dd><p>Command factory</p>
</dd>
<dt><a href="#module_DB">DB</a></dt>
<dd><p>MongoDB database connection service</p>
</dd>
</dl>

<a name="module_Command"></a>

## Command
Command factory

**Example**  
```js
const { Command } = require('beaujeuteam-discord-bot/service/commands');

const cmd = new Command('help [module]', 'Display module help').option('-v', 'verbose', 'Display more info.');

cmd.match(text, ({ module }, { verbose }) => {
 // do stuff
});
```

* [Command](#module_Command)
    * [Command](#exp_module_Command--Command) ⏏
    * [Command#option(pattern, name, [description])](#exp_module_Command--Command+option) ⇒ <code>Command</code> ⏏
    * [Command#match(text, callback)](#exp_module_Command--Command+match) ⏏
    * [Command#cleanMatch(matches)](#exp_module_Command--Command+cleanMatch) ⇒ <code>Array</code> ⏏
    * [Command#toString([displayOptions])](#exp_module_Command--Command+toString) ⇒ <code>string</code> ⏏

<a name="exp_module_Command--Command"></a>

### Command ⏏
**Kind**: Exported class  
<a name="exp_module_Command--Command+option"></a>

### Command#option(pattern, name, [description]) ⇒ <code>Command</code> ⏏
Add option to command

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| pattern | <code>string</code> |  | 
| name | <code>string</code> |  | 
| [description] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | 

<a name="exp_module_Command--Command+match"></a>

### Command#match(text, callback) ⏏
Check if text match command pattern

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 
| callback | <code>Callable</code> | 

<a name="exp_module_Command--Command+cleanMatch"></a>

### Command#cleanMatch(matches) ⇒ <code>Array</code> ⏏
Utile, to clean matches

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| matches | <code>Object</code> | 

<a name="exp_module_Command--Command+toString"></a>

### Command#toString([displayOptions]) ⇒ <code>string</code> ⏏
Display command description with or without options

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| [displayOptions] | <code>boolean</code> | <code>false</code> | 

<a name="module_DB"></a>

## DB
MongoDB database connection service


* [DB](#module_DB)
    * [DB](#exp_module_DB--DB) ⏏
    * [DB#connect(callback)](#exp_module_DB--DB+connect) ⏏

<a name="exp_module_DB--DB"></a>

### DB ⏏
**Kind**: Exported class  
<a name="exp_module_DB--DB+connect"></a>

### DB#connect(callback) ⏏
**Kind**: Exported function  

| Param | Type |
| --- | --- |
| callback | <code>Callable</code> | 

