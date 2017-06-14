## Modules

<dl>
<dt><a href="#module_Command">Command</a></dt>
<dd><p>Command factory</p>
</dd>
<dt><a href="#module_DB">DB</a></dt>
<dd><p>MongoDB database connection service</p>
</dd>
<dt><a href="#module_Logger">Logger</a></dt>
<dd><p>Logger interface</p>
</dd>
<dt><a href="#module_Utils">Utils</a></dt>
<dd><p>Utils methods</p>
</dd>
<dt><a href="#module_VoiceClient">VoiceClient</a></dt>
<dd><p>Voice client service for discord</p>
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

<a name="module_Logger"></a>

## Logger
Logger interface


* [Logger](#module_Logger)
    * [Logger#setChannel(channel)](#exp_module_Logger--Logger+setChannel) ⏏
    * [Logger#setClient(client)](#exp_module_Logger--Logger+setClient) ⏏
    * [Logger#isInit()](#exp_module_Logger--Logger+isInit) ⇒ <code>boolean</code> ⏏
    * [Logger#getDate()](#exp_module_Logger--Logger+getDate) ⇒ <code>string</code> ⏏
    * [Logger#info(message)](#exp_module_Logger--Logger+info) ⏏
    * [Logger#debug(message)](#exp_module_Logger--Logger+debug) ⏏
    * [Logger#request(url, res)](#exp_module_Logger--Logger+request) ⏏

<a name="exp_module_Logger--Logger+setChannel"></a>

### Logger#setChannel(channel) ⏏
Set channel where send logs

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| channel | <code>Channel</code> | 

<a name="exp_module_Logger--Logger+setClient"></a>

### Logger#setClient(client) ⏏
Set discord client

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| client | <code>Client</code> | 

<a name="exp_module_Logger--Logger+isInit"></a>

### Logger#isInit() ⇒ <code>boolean</code> ⏏
Check if client and channel is initialize

**Kind**: Exported function  
<a name="exp_module_Logger--Logger+getDate"></a>

### Logger#getDate() ⇒ <code>string</code> ⏏
Format date

**Kind**: Exported function  
<a name="exp_module_Logger--Logger+info"></a>

### Logger#info(message) ⏏
Send log as info message

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 

<a name="exp_module_Logger--Logger+debug"></a>

### Logger#debug(message) ⏏
Send log as debug message

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| message | <code>string</code> | 

<a name="exp_module_Logger--Logger+request"></a>

### Logger#request(url, res) ⏏
Send log of HTTP request

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| res | <code>Response</code> | 

<a name="module_Utils"></a>

## Utils
Utils methods


* [Utils](#module_Utils)
    * [matchEvery(pattern, string)](#exp_module_Utils--matchEvery) ⇒ <code>Object</code> \| <code>null</code> ⏏
    * [matchOne(pattern, string)](#exp_module_Utils--matchOne) ⇒ <code>Object</code> \| <code>null</code> ⏏
    * [matchExactlyEvery(pattern, string)](#exp_module_Utils--matchExactlyEvery) ⇒ <code>Object</code> \| <code>null</code> ⏏
    * [matchExactlyOne(pattern, string)](#exp_module_Utils--matchExactlyOne) ⇒ <code>Object</code> \| <code>null</code> ⏏
    * [matchOneOf(patterns, string)](#exp_module_Utils--matchOneOf) ⇒ <code>boolean</code> ⏏
    * [matchExactlyOneOf(patterns, string)](#exp_module_Utils--matchExactlyOneOf) ⇒ <code>boolean</code> ⏏
    * [getRandomlyOneOf(list)](#exp_module_Utils--getRandomlyOneOf) ⇒ <code>\*</code> ⏏
    * [random(max, [min])](#exp_module_Utils--random) ⇒ <code>number</code> ⏏

<a name="exp_module_Utils--matchEvery"></a>

### matchEvery(pattern, string) ⇒ <code>Object</code> \| <code>null</code> ⏏
Match every pattern into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| pattern | <code>string</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchEvery('toto', 'toto, the must biger TOTO');
```
<a name="exp_module_Utils--matchOne"></a>

### matchOne(pattern, string) ⇒ <code>Object</code> \| <code>null</code> ⏏
Match one time pattern into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| pattern | <code>string</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchOne('tata', 'tata, the must biger toto');
```
<a name="exp_module_Utils--matchExactlyEvery"></a>

### matchExactlyEvery(pattern, string) ⇒ <code>Object</code> \| <code>null</code> ⏏
Match exactly every pattern into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| pattern | <code>string</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchExactlyEvery('toto', 'toto, the must biger toto');
```
<a name="exp_module_Utils--matchExactlyOne"></a>

### matchExactlyOne(pattern, string) ⇒ <code>Object</code> \| <code>null</code> ⏏
Match exactly pattern into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| pattern | <code>string</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchExactlyOne('toto the big', 'toto this big');
```
<a name="exp_module_Utils--matchOneOf"></a>

### matchOneOf(patterns, string) ⇒ <code>boolean</code> ⏏
Match one of patterns into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| patterns | <code>Array.&lt;string&gt;</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchOneOf(['toto', 'tata'], 'TOTO this big');
```
<a name="exp_module_Utils--matchExactlyOneOf"></a>

### matchExactlyOneOf(patterns, string) ⇒ <code>boolean</code> ⏏
Match exactly one of patterns into string

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| patterns | <code>Array.&lt;string&gt;</code> | 
| string | <code>string</code> | 

**Example**  
```js
utils.matchOneOf(['toto', 'tata'], 'toto');
```
<a name="exp_module_Utils--getRandomlyOneOf"></a>

### getRandomlyOneOf(list) ⇒ <code>\*</code> ⏏
Get random on element from list

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| list | <code>Array</code> | 

**Example**  
```js
utils.getRandomlyOneOf(['toto', 'tata']);
```
<a name="exp_module_Utils--random"></a>

### random(max, [min]) ⇒ <code>number</code> ⏏
Get random number between min and max

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| max | <code>number</code> |  | 
| [min] | <code>number</code> | <code>1</code> | 

**Example**  
```js
utils.random(10, 1);
```
<a name="module_VoiceClient"></a>

## VoiceClient
Voice client service for discord


* [VoiceClient](#module_VoiceClient)
    * [VoiceClient#join(channel)](#exp_module_VoiceClient--VoiceClient+join) ⇒ <code>Promise</code> ⏏
    * [VoiceClient#leave()](#exp_module_VoiceClient--VoiceClient+leave) ⏏
    * [VoiceClient#playFile(file, [callback], [options])](#exp_module_VoiceClient--VoiceClient+playFile) ⏏
    * [VoiceClient#playStream(stream, [options])](#exp_module_VoiceClient--VoiceClient+playStream) ⇒ <code>Promise</code> ⏏
    * [VoiceClient#playText(text, [lang])](#exp_module_VoiceClient--VoiceClient+playText) ⏏
    * [VoiceClient#playUrl(url, [options])](#exp_module_VoiceClient--VoiceClient+playUrl) ⇒ <code>Promise</code> ⏏
    * [VoiceClient#stop([reason])](#exp_module_VoiceClient--VoiceClient+stop) ⏏
    * [VoiceClient#pause()](#exp_module_VoiceClient--VoiceClient+pause) ⏏
    * [VoiceClient#setVolume(volume)](#exp_module_VoiceClient--VoiceClient+setVolume) ⏏

<a name="exp_module_VoiceClient--VoiceClient+join"></a>

### VoiceClient#join(channel) ⇒ <code>Promise</code> ⏏
Make bot join channel

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| channel | <code>VoiceChannel</code> | 

<a name="exp_module_VoiceClient--VoiceClient+leave"></a>

### VoiceClient#leave() ⏏
Make bot leave current channel

**Kind**: Exported function  
<a name="exp_module_VoiceClient--VoiceClient+playFile"></a>

### VoiceClient#playFile(file, [callback], [options]) ⏏
Make bot play music file

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| file | <code>string</code> |  | 
| [callback] | <code>Callable</code> |  | 
| [options] | <code>Object</code> | <code>{}</code> | 

<a name="exp_module_VoiceClient--VoiceClient+playStream"></a>

### VoiceClient#playStream(stream, [options]) ⇒ <code>Promise</code> ⏏
Make bot play stream

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| stream | <code>Stream</code> |  | 
| [options] | <code>Object</code> | <code>{}</code> | 

<a name="exp_module_VoiceClient--VoiceClient+playText"></a>

### VoiceClient#playText(text, [lang]) ⏏
Make bot says text

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| text | <code>string</code> |  | 
| [lang] | <code>string</code> | <code>&quot;&#x27;fr&#x27;&quot;</code> | 

<a name="exp_module_VoiceClient--VoiceClient+playUrl"></a>

### VoiceClient#playUrl(url, [options]) ⇒ <code>Promise</code> ⏏
Make bot play music from url

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| url | <code>string</code> |  | 
| [options] | <code>Object</code> | <code>{}</code> | 

<a name="exp_module_VoiceClient--VoiceClient+stop"></a>

### VoiceClient#stop([reason]) ⏏
Stop music

**Kind**: Exported function  

| Param | Type | Default |
| --- | --- | --- |
| [reason] | <code>string</code> | <code>null</code> | 

<a name="exp_module_VoiceClient--VoiceClient+pause"></a>

### VoiceClient#pause() ⏏
Pause or resume music

**Kind**: Exported function  
<a name="exp_module_VoiceClient--VoiceClient+setVolume"></a>

### VoiceClient#setVolume(volume) ⏏
Set volume between 0 and 2

**Kind**: Exported function  

| Param | Type |
| --- | --- |
| volume | <code>number</code> | 

