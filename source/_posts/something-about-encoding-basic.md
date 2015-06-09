title: "编码歪传——基础篇"
date: 2015-03-06 20:23:12
tags:
- 编程
---
子曰：乱码是一种思念，而思念是一种病。相信很多Web人常常纠结于乱码当中，可能是展现、可能是表单提交、可能是数据库、可能是接口、可能是抓取……反正任何一个涉及到输入或者输出字符的地方都有可能被你碰到过乱码。

为了解释和解决乱码问题，并且明确一些常见的误区，我打算写这样一个系列，介绍一些字符编码相关的东西，目前规划了3篇。

基本上内容会比较偏科普性质，希望大神们轻拍，因为我相信这些将会是非常重要的基础知识，如果你能完整的读下去，肯定会在你以后遇到乱码的时候帮助到你的思考方式，快速找到原因。

<!-- more -->

## 字符

我们的语言基本上都围绕着**字符**，就是**character**，常简称**char**，很多时候字符会是文本的最小组成单位（注意只是“很多时候”，因为世界是奇妙的）。

不是一定要文字才叫字符，一些注音字符、数学符号、某些文字里的修饰符号、特殊符号、表格符号、甚至Emoji等等，其实都是字符。

## 字符集
字符要成套才有用，比如“英文字母”就是一个字符集，当然这么说听起来对计算机毫无意义。

一般我们所说的**字符集**（Character Set）就是一个规范，它收录若干字符，并且给这些字符逐一分配了一个**编号**当作索引（为了不过早引入**编码**的概念造成混淆，这里我称其为“编号”）。

### ASCII

ASCII是当今计算机世界最经典的字符集，它收录了英文字母和若干标点，还有一些专门供计算机使用（不是给人看）的控制字符。

### GB系列

**GB2312**是一个常见的中文字符集，其中“GB”就是“国标”（咱们国家很多不同行业的标准代号都是这样命名的）。它收录了大概几千个汉字，以及几百个西文字符。

**GBK**是微软最早在Win95里实现的对GB2312进行的扩展，追加了很多繁体字和西文字符，总计收录的字符数大概有20000多个。K就是拼音“扩展”。

**GB18030**是国标对GB2312的升级（当然中间还有其他升级，但大多被淹没在历史潮流里面了），它一下就收录了70000多个字符，最大的升级部分有繁体中文字符、新字、生僻字、少数民族文字、日韩字符等。

上面三个GB系列的字符集都是为中文设计的，当然也扩充了一些东亚语文的内容（CJK字符，Chinese, Japanese, Korean），因为这些邻居的字符在中国也挺常出现的。

### Big5

又称大五码，是繁体中文地区，例如湾湾、港港、澳澳常用的字符集，大概收录了一万多个字符，其中以繁体中文为主。因为被Windows所接受成为繁中版的默认编码而成为了事实标准。

### UCS

就像中文一样，几乎每种语言都存在一个给自己的语言设计字符集的问题。

ISO意识到这个问题之后，设计了一套**通用字符集UCS**（Universal Character Set），目的是用一套字符集表示全世界（甚至外星人！？）的所有字符！

结果UCS成功了，因为互联网发展的太快了，任何国家的人每天都在互联网上浏览来自全世界的不同语言不同文字的内容，大家当然希望用一套字符集就能收录全世界所有的字符。

## 字符编码

很多人会把**字符集**和**字符编码**的概念搞混，其实不怪，因为这俩东西好多时候都是捆绑定义的。

**字符编码**（Character Encoding）就是按照一定的技术要求（比如以8bit为单位）对字符集中的每一个字符进行编码，以便文本能够在计算机和网络传输上使用。

简单的说，就是把字符集里面的那个每个字符的编号，给弄成计算机能懂的格式。

很多字符集在制定的时候，就已经配套了它的编码方案，比如ASCII、GB系列、Big5。对于这种字符集/编码，称呼上虽然模糊，但结合技术语境而言一般也不会有什么误解。

### ASCII

标准ASCII只收录了128个字符，使用7bit可以完美编码。例如英文字母`A`的ASCII编码就是十六进制`0x41`，然后1字节剩下的一位就没啥用了，可以用来当奇偶校验。

后来ASCII被扩展到了8bit，供256个字符，用8bit也就是1字节可以完美编码，并且低7字节完全兼容。

ASCII是国际标准而扩展ASCII并不是，下文所说到的“兼容ASCII”都是指兼容7bit的标准ASCII。

### GB2312

GB2312使用1/2字节变长编码，单字节部分是兼容ASCII，其他几千个字符都是用双字节编码。

GB2312在编码的时候使用了一个“分区”的概念，小时候家里有一本区位码表，就是配合Windows里古老的“区位输入法”用的。

### GBK

GBK的编码方案是GB2312的超集，它完全兼容GB2312，不过把GB2312里面没定义的那些编码空间都用起来了。

### GB18030

GB18030的编码方案稍微复杂一点，它用的是1/2/4字节变长编码方案。它完全兼容GB2312，基本上兼容GBK。

### Big5

Big5使用固定两字节编码，它的首字节避开了ASCII的范围，因此实际在程序实现上面它可以近似兼容ASCII，由于它的低字节包含了一些ASCII字符，这个兼容也是不完美的，具体情况可以看看维基百科，非常有趣。

### Unicode

Unicode有一个非常高大上的中文名字叫万国码~~，呵呵，这个名字真是散发着一股农业重金属的气息啊~~。其实也是个字符集，它和UCS之间有微妙的高度雷同关系，好在两边的组织都意识到了搞分化是不好的，于是互相之间达成了高度的一致。虽然它们的确是两个不同的标准，但很多时候混淆来看也无妨。

Unicode是定长编码，根据版本不同，它有2字节（对应UCS-2）、4字节（对应UCS-4）的版本。

因为Unicode是定长的，它实在太简单粗暴了。例如如果用4字节的Unicode来传输英文文本就浪费了3倍的体积，而用2字节的版本也不爽，一来容量较小，二来对于英文文本也还是浪费的。于是在实现上对它进行了一定的优化，称为**Unicode转换格式（Unicode Transformation Format）**也就是我们耳熟能详的**UTF**了。

#### UTF-32

UTF-32是UCS-4的最朴素的实现方式，就是简单地用定长4字节。

缺点嘛很明显就是很浪费体积。

优点也是有的，首先就是把它转换到Unicode最简单，而且对于“第[i]个字符”这种随机访问也很好计算，直接`字节数/4`就是了对不？

但因为组合字符（比如越南语，网上用来搞一个超长的流泪图标破坏排版那种）的存在，一个UTF-32码元（4字节）严格上也并非一个文本编辑上的单元，这种情况下对于排版系统而言UTF-32没有太多优势。

#### UTF-16

UTF-16是使用2/4字节实现的UCS-4变长编码。

因为大多数时候用到的字符不超过65536个，所以UTF-16在大多数时候1个字符都只占2字节，这样比起UTF-32省了接近一半体积，同时它的解析也不会太麻烦。

固定长的编码方式对于计算机程序而言有一个非常大的优势就是字符串处理会容易的多，尤其是正则表达式的实现。因此很多现代语言，例如C#/Java的字符串内部实现使用UTF-16，因为它是一种效率和体积比较平衡的编码方式。

#### UTF-8

UTF-8应该是现在互联网上使用最广泛的统一语言编码实现方式了。

它是1-4字节变长编码（原本是1-6字节，但是因为后面那些超出了Unicode定义了，后来就改成1-4字节了）。单字节的情况兼容ASCII，在这个由英文主宰的互联网环境里面这是非常好的特性，因为它在很多时候会非常节省体积，而且这种时候完全不需要编码转换。

但它的缺点也相当明显，将UTF-8转换到Unicode的算法会更加复杂，效率降低。

对于中文环境而言UTF-8也比较吃亏，因为使用UTF-8编码大多数中文字符需要3字节，这就比GB系列和UTF-16浪费空间。

UTF-8并未编码0x10FFFF以上的部分，所以严格的说它只是UCS-4的子集。好在缺失的那部分本身就不受UCS/Unicode的重视，估计实在是太犄角旮旯了。

我觉得UTF-8最终成为互联网主流很大一定程度是因为它的单字节是兼容ASCII的。

## 阶段性小结

### 字符集

收录了很多字符，并且编号，给人看的。

### 编码

实现一个字符集，将它的编号以一定规则用二进制实现，给计算机看的。

### GB系列

中国的国标字符集/编码，GB2312和GBK已经基本上过时了，如果要良好的支持中日韩文，又逃不开GBK的魔爪（比如历史代码束缚），那可以考虑升级到GB18030，这是国标的最新版，也是最先进的一版。

### UCS/Unicode

把全世界上百万个你见过的或者你没见过的字符全部收录进一套字符集，已经被全世界接受成为了国际标准。

### UTF

UCS/Unicode转换格式，就是实用的编码方案，用于计算机实现。

### UTF-16

UCS/Unicode的一种折衷了处理效率和存储空间的编码实现方案，常被各种现代语言当作字符串内部编码使用。

### UTF-8

UCS/Unicode的一种倾向于节省空间的编码实现方案，因为对ASCII兼容，对英文文本非常有利，成为了当今互联网的主流（甚至事实标准）。

**如果你的网站没有任何历史包袱，直接上UTF-8别商量！**

**如果你的网站有一些历史包袱，商量商量还是上UTF-8吧，包袱的接口上转换一下编码。**

## 预报

呵呵呵呵，虽然文章的标题叫做《编码歪传》，但其实上面的内容一点也不歪嘛。

有观众看不下去了：“拜托，你讲这些什么乱七八糟的理论知识我没啥兴趣啊，我想知道的其实只是为什么我的网页会乱码啊老湿！”

对于上面的问题我只想说四个字：~~请联系我~~请看下集：[《编码歪传——Web篇》](/2015/03/07/something-about-encoding-web/)